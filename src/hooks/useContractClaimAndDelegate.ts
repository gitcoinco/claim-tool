import type { Claim } from '@/app/api/claims/route';
import { handleTransactionError } from '@/lib/errorHandler';
import { getPublicClientForChain } from '@/lib/getPublicClientForChain';
import { useMutation } from '@tanstack/react-query';
import { parse as uuidParse } from 'uuid';
import { BaseError, parseSignature, toHex } from 'viem';
import { useWalletClient } from 'wagmi';
import { ClaimCampaignsAbi } from '../../config/contracts/abis/ClaimCampaignsAbi';
import { hedgeyContractAddresses } from '../../config/contracts/addresses';
import { FEATURES } from '../../config/features';
import { useToast } from './useToast';

const { DELEGATION_ENABLED } = FEATURES;

const getClaimDomain = (name: string, chainId: number) => ({
  name,
  version: '1',
  chainId,
  verifyingContract: hedgeyContractAddresses[chainId],
});

const getTokenDomain = (
  tokenName: string,
  tokenAddress: `0x${string}`,
  chainId: number,
) => ({
  name: tokenName,
  version: '1',
  chainId,
  verifyingContract: tokenAddress,
});

const delegationTypes = {
  Delegation: [
    { name: 'delegatee', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
} as const;

const delegatingClaimType = {
  DelegatingClaim: [
    { name: 'campaignId', type: 'bytes16' },
    { name: 'claimer', type: 'address' },
    { name: 'claimAmount', type: 'uint256' },
    { name: 'delegatee', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
} as const;

export const useContractClaimAndDelegate = () => {
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  return useMutation({
    throwOnError: true,
    mutationKey: ['contract-claim-and-delegate'],
    mutationFn: async ({
      delegateeAddress: delegatee,
      claim,
      tokenAddress,
      tokenName,
    }: {
      delegateeAddress?: `0x${string}`;
      claim: Claim;
      tokenAddress: `0x${string}`;
      tokenName: string;
    }) => {
      if (!claim.proof) {
        throw new Error('Proof is required');
      }

      if (!DELEGATION_ENABLED && delegatee) {
        throw new Error(
          'Delegation is not enabled, but delegatee address is provided',
        );
      }

      if (!walletClient) {
        throw new Error('Wallet client is required');
      }

      const chainId = await walletClient.getChainId();
      const address = walletClient.account.address;

      if (!address) {
        throw new Error('Address is required');
      }

      const publicClient = getPublicClientForChain(chainId);
      // Prepare contract call variables
      const parsedClaimId = toHex(uuidParse(claim.uuid));

      let value = BigInt(0);
      if (FEATURES.CLAIM_FEE) {
        value = BigInt(claim.claimFee);
      }

      let txHash: `0x${string}` | undefined;
      if (delegatee) {
        // Get nonce for the currrent address
        const nonce = await publicClient.readContract({
          address: hedgeyContractAddresses[chainId],
          abi: ClaimCampaignsAbi,
          functionName: 'nonces',
          args: [address],
        });
        // Obtain signature for the delegation according to
        // https://github.com/hedgey-finance/DelegatedTokenClaims/blob/master/test/tests/unlockedDelegatingTests.js#L98
        const expiry =
          BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7);
        try {
          const txSig = await walletClient.signTypedData({
            domain: getClaimDomain('ClaimCampaigns', chainId),
            types: delegatingClaimType,
            message: {
              campaignId: parsedClaimId,
              claimer: address,
              claimAmount: BigInt(claim.amount),
              delegatee: delegatee,
              nonce,
              expiry,
            },
            primaryType: 'DelegatingClaim',
          });
          const { r: r2, v: v2, s: s2 } = parseSignature(txSig);
          const txSigFormatted = {
            nonce,
            expiry,
            v: Number(v2),
            r: r2,
            s: s2,
          };

          const delegationSig = await walletClient.signTypedData({
            domain: getTokenDomain(tokenName, tokenAddress, chainId),
            types: delegationTypes,
            message: {
              delegatee,
              expiry,
              nonce,
            },
            primaryType: 'Delegation',
          });
          const { r, v, s } = parseSignature(delegationSig);
          const delegationSigFormatted = {
            nonce,
            expiry,
            v: Number(v),
            r,
            s,
          };
          const { request } = await publicClient.simulateContract({
            address: hedgeyContractAddresses[chainId],
            abi: ClaimCampaignsAbi,
            functionName: 'claimAndDelegateWithSig',
            value,
            account: walletClient.account,
            args: [
              parsedClaimId,
              claim.proof,
              address,
              BigInt(claim.amount),
              txSigFormatted,
              delegatee,
              delegationSigFormatted,
            ],
          });
          txHash = await walletClient.writeContract(request);
        } catch (err) {
          if (err instanceof BaseError) {
            handleTransactionError(err, toast);
          }
          return;
        }
      } else {
        try {
          const data = await publicClient.simulateContract({
            address: hedgeyContractAddresses[chainId],
            abi: ClaimCampaignsAbi,
            functionName: 'claim',
            value,
            account: walletClient.account,
            args: [parsedClaimId, claim.proof, BigInt(claim.amount)],
          });
          txHash = await walletClient.writeContract(data.request);
        } catch (err) {
          if (err instanceof BaseError) {
            handleTransactionError(err, toast);
          }
          return;
        }
      }

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      return receipt;
    },
  });
};

export default useContractClaimAndDelegate;
