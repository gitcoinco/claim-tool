import type { Claim } from '@/app/api/claims/route';
import type { GrantRow } from '@/app/api/grants/route';
import type { Grant } from '@/context/GrantsContext';
import { getNextTokenReleaseTimestamp } from '@/lib/getNextTokenRelease';
import {
  getChainIdByNetworkName,
  getPublicClientForChain,
} from '@/lib/getPublicClientForChain';
import { useQuery } from '@tanstack/react-query';
import { type ResultOf, graphql } from 'gql.tada';
import { print } from 'graphql';
import { formatUnits, parseEventLogs, toHex } from 'viem';
import { useAccount } from 'wagmi';
import { TokenAbi } from '../../config/contracts/abis/TokenAbi';
import { hedgeyGraphqlApiEndpoint } from '../../config/contracts/endpoints';
import { FEATURES, getChainConfig } from '../../config/features';

const { DELEGATION_ENABLED } = FEATURES;

const supportedChainIds = getChainConfig().chains.map((chain) => chain.id);

type ApiResponse = {
  data: GrantRow[];
};

export interface ClaimHistoryEvent {
  date: Date;
  claimedAmount: string;
  milestone: string;
  transactionHash: string;
  campaignId: string;
  delegatedTo?: string;
}

export type ClaimHistory = {
  grant: Grant;
  events: ClaimHistoryEvent[];
};

const query = graphql(`
  query GetGrants($input: CampaignQueryInput) {
    campaigns(query: $input) {
      _id
      claimLockup {
        _id
        cliff
        period
        periods
        start
        tokenLocker
      }
      contractAddress
      createdAt
      delegating
      end
      ended {
        _id
        timestamp
        transactionHash
      }
      from
      id
      manager
      network
      root
      start
      token {
        _id
        address
        decimals
        name
        ticker
      }
      totalAddresses
      totalAmount
      totalAmountClaimed
      totalClaims
      type
      updatedAt
    }
  }
`);

const claimHistoryQuery = graphql(`
  query GetClaimsForAddress($input: TokenCampaignEventsResolverInput) {
      TokenCampaignEvents(input: $input) {
          events {
              campaign {
                  id
                  product
                  token {
                  address
                  decimals
                  name
                  ticker
                  }
                  type
              }
              campaignId
              chainId
              info {
                  amountClaimed
                  timestamp
                  transactionHash
              }
              network
              nft {
                  currentHolder
              }
              prices {
                  price
              }
          }
      }
  }
`);

const getClaimHistory = async (
  address: string,
  grants: { grantId: string; chainId: number }[],
) => {
  const response = await fetch(hedgeyGraphqlApiEndpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: print(claimHistoryQuery),
      variables: {
        input: {
          includeTestnets: true,
          address: address,
          eventType: 'TokensClaimed',
        },
      },
    }),
  });
  const result = (await response.json()).data as ResultOf<
    typeof claimHistoryQuery
  >;
  const allEvents = result.TokenCampaignEvents?.events
    ?.map((event) => {
      const date = event?.info?.timestamp
        ? new Date(Number(event.info.timestamp) * 1000)
        : undefined;
      const claimedAmount = event?.info?.amountClaimed;
      // TODO: Get the correct milestone
      const milestone = '1';
      const transactionHash = event?.info?.transactionHash;
      const campaignId = event?.campaign?.id;

      if (!date || !claimedAmount || !transactionHash || !campaignId) {
        return null;
      }

      return {
        date,
        claimedAmount,
        milestone,
        transactionHash,
        campaignId,
      } as ClaimHistoryEvent;
    })
    .filter((event) => !!event)
    // Sort in reverse order by timestamp
    .toSorted((a, b) => b.date.getTime() - a.date.getTime());

  if (!allEvents) {
    return {};
  }

  const grantIds = grants.map((grant) => grant.grantId);
  const eventsPerClaimId = grantIds.reduce(
    (acc, grantId) => {
      const events = allEvents.filter((event) => event.campaignId === grantId);

      if (events.length === 0) {
        return acc;
      }

      acc[grantId] = events;
      return acc;
    },
    {} as Record<string, ClaimHistoryEvent[]>,
  );

  if (!DELEGATION_ENABLED) {
    return eventsPerClaimId;
  }

  const chainsByGrantId = grants.reduce(
    (acc, grant) => {
      acc[grant.grantId] = grant.chainId;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get the delegateTo address for each claim
  // TODO: Replace with contract call to Token.delegate(address userAddress) contract, once that works
  return await Promise.all(
    Object.entries(eventsPerClaimId).map(async ([campaignId, events]) => {
      if (events.length === 0) {
        return { campaignId, events: [] };
      }

      const chainId = chainsByGrantId[campaignId];
      const publicClient = getPublicClientForChain(chainId);
      const eventsWithDelegateTo = await Promise.all(
        events.map(async (event) => {
          // Get the transaction receipt
          const receipt = await publicClient.getTransactionReceipt({
            hash: event.transactionHash as `0x${string}`,
          });

          // Parse logs and collect the latest DelegateChanged event for the transaction
          const logs = parseEventLogs({
            abi: TokenAbi,
            logs: receipt.logs,
          });
          const delegateChangedLogs = logs.filter(
            (log) => log.eventName === 'DelegateChanged',
          );
          if (delegateChangedLogs.length === 0) {
            return event;
          }
          const lastDelegateChangedLog =
            delegateChangedLogs[delegateChangedLogs.length - 1];

          // Get the address of the delegate
          const delegateTo = lastDelegateChangedLog?.args?.toDelegate;
          return {
            ...event,
            delegatedTo: delegateTo,
          };
        }),
      );
      return {
        campaignId,
        events: eventsWithDelegateTo,
      };
    }),
  ).then((delegates) =>
    delegates.reduce(
      (acc, { campaignId, events }) => {
        if (!events?.length) {
          return acc;
        }

        acc[campaignId] = events;
        return acc;
      },
      {} as Record<string, ClaimHistoryEvent[]>,
    ),
  );
};

export type HedgeyCampaign = NonNullable<
  ResultOf<typeof query>['campaigns'][number]
> & { chainId: number };

const fetchCampaigns = async (campaignIds: string[]) => {
  const response = await fetch(hedgeyGraphqlApiEndpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: print(query),
      variables: {
        input: {
          id_in: campaignIds,
        },
      },
    }),
  });
  const result = (await response.json()).data as ResultOf<typeof query>;
  return result.campaigns
    .filter((campaign) => campaign !== null)
    .map((campaign) => ({
      ...campaign,
      chainId: getChainIdByNetworkName(campaign.network),
    }));
};

const getProofs = async (
  grants: {
    id: string;
    address: string;
    chainId: number;
  }[],
) => {
  if (!grants.length) return [];
  const response = await fetch('/api/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grants: grants.map((grant) => ({
        id: grant.id,
        address: grant.address,
        chainId: grant.chainId,
      })),
    }),
  });
  const claims = await response.json().then((data) => data.data as Claim[]);
  return claims;
};

export const useGetGrants = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ['grants', address || 'unknown'],
    queryFn: async () => {
      // Fetch grants from google sheet
      const response = await fetch('/api/grants');
      const grants: ApiResponse = await response.json();
      const campaignIds = grants.data.map((grant) => grant.uuid);

      // Fetch hedgey campaigns from their graphql api
      const hedgeyCampaigns = await fetchCampaigns(campaignIds);

      const [proofs, claimHistory] = await Promise.all([
        // Fetch proofs from their rest api
        getProofs(
          grants.data
            .map((grant) => {
              const campaign = hedgeyCampaigns.find(
                (campaign) => campaign.id === grant.uuid,
              );
              if (!campaign) return null;
              return {
                id: grant.uuid,
                address: grant.address,
                chainId: getChainIdByNetworkName(campaign.network),
              };
            })
            .filter((x) => !!x),
        ),
        // Fetch claim history from their graphql api
        getClaimHistory(
          address,
          hedgeyCampaigns.map((campaign) => ({
            grantId: campaign.id as string,
            chainId: campaign.chainId,
          })),
        ),
      ]);

      // Combine the data
      const mappedGrants = grants.data
        .map((grant) => {
          const campaign = hedgeyCampaigns?.find(
            (campaign) => campaign.id === grant.uuid,
          );
          const proof = proofs?.find(
            (proof) =>
              proof?.uuid === grant.uuid && proof.address === grant.address,
          );

          if (!campaign) return null;

          const grantAmount = Number(
            formatUnits(
              BigInt(proof?.amount || 0),
              campaign.token?.decimals || 0,
            ),
          );

          const currentUserCanClaim = proof
            ? proof.address === address && proof.canClaim && !proof.claimed
            : false;
          const date = new Date(campaign.createdAt as string);
          const chainId = getChainIdByNetworkName(campaign.network);
          const claimEvents = claimHistory[grant.uuid];
          const latestDelegateTo = claimEvents?.find(
            (x) => !!x.delegatedTo,
          )?.delegatedTo;

          const latestClaimHash =
            grant.address === address
              ? claimEvents?.[0]?.transactionHash
              : null;

          const tokenReleasedInDays = getNextTokenReleaseTimestamp(
            campaign.claimLockup,
          )?.daysUntilNextRelease;

          return {
            id: grant.uuid,
            title: grant.title,
            projectImage: grant.projectImage,
            description: grant.description,
            proof,
            campaign,
            claimEvents,

            // Calculated fields
            grantAmount,
            currentUserCanClaim,
            date,
            chainId,
            latestClaimHash,
            tokenReleasedInDays,
            delegateTo: latestDelegateTo,
            address: grant.address,
          } as Grant | null;
        })
        .filter((grant) => grant !== null)
        .filter((grant) => {
          const chainId = getChainIdByNetworkName(grant.campaign.network);
          return supportedChainIds.includes(chainId);
        })
        .filter((grant) =>
          FEATURES.ONLY_SHOW_CLAIMABLE ? grant.currentUserCanClaim : grant,
        )
        .toSorted((a, b) => (a.address === address ? -1 : 1))
        .toSorted(
          (a, b) =>
            Number(b.currentUserCanClaim) - Number(a.currentUserCanClaim),
        );
      return mappedGrants;
    },
  });
};
