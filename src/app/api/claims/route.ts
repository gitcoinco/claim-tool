import type { NextRequest } from 'next/server';
import { parse as uuidParse } from 'uuid';
import { toHex } from 'viem';

import { getPublicClientForChain } from '@/lib/getPublicClientForChain';
import { ClaimCampaignsAbi } from '../../../../config/contracts/abis/ClaimCampaignsAbi';
import { hedgeyContractAddresses } from '../../../../config/contracts/addresses';

export type Claim = {
  uuid: string;
  address: string;
  canClaim: boolean;
  startDate: string;
  endDate: string;
  proof?: `0x${string}`[];
  amount: string;
  claimFee: string;
  claimed: boolean;
};

export type ResponseData = {
  data: Claim;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { grants } = body as {
    grants: { id: string; address: string; chainId: number }[];
  };

  if (!grants?.length) {
    return Response.json({ error: 'grants are required' }, { status: 400 });
  }

  const results = await Promise.all(
    grants.map(async (grant) => {
      const [claim, claimInfo] = await Promise.all([
        fetch(
          `https://api.hedgey.finance/token-claims/proof/${grant.id}/${grant.address}`,
        ).then((res) => res.json()),
        fetch(`https://api.hedgey.finance/token-claims/info/${grant.id}`).then(
          (res) => res.json(),
        ),
      ]);

      if (!claim) return null;

      let claimed = false;
      if (claim.canClaim) {
        // Verify if it was already claimed from the contract
        const publicClient = getPublicClientForChain(grant.chainId);
        const parsedClaimId = toHex(uuidParse(grant.id));
        claimed = await publicClient.readContract({
          address: hedgeyContractAddresses[grant.chainId],
          abi: ClaimCampaignsAbi,
          functionName: 'claimed',
          args: [parsedClaimId, grant.address as `0x${string}`],
        });
      }

      const result: Claim = {
        ...claim,
        startDate: claimInfo.startDate,
        endDate: claimInfo.endDate,
        claimFee: claimInfo.claimFee,
        claimed,
      };

      return result;
    }),
  );

  return new Response(JSON.stringify({ data: results.filter((x) => !!x) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
