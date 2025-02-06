import type { Grant } from '@/context/GrantsContext';
import useContractClaimAndDelegate from '@/hooks/useContractClaimAndDelegate';
import { useToast } from '@/hooks/useToast';
import {
  generateBlockExplorerUrl,
  getChainForChainId,
} from '@/lib/getPublicClientForChain';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiArrowRightUpLine } from '@remixicon/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from 'viem';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import SuccessCheckmark from './images/SuccessCheckmark';

import { Loader2 } from 'lucide-react';
import { useChainId } from 'wagmi';
import { FEATURES } from '../../../config/features';

const { DELEGATION_REQUIRED, DELEGATES_URL, CONFIRMATION_CHECKMARK_BG_COLOR } =
  FEATURES;

const FormSchema = z
  .object({
    delegateAddress: z.string().optional(),
    isDelegationRequired: z.boolean(),
  })
  .superRefine(({ isDelegationRequired, delegateAddress }, refinementCtx) => {
    if (
      isDelegationRequired &&
      !/^0x[a-fA-F0-9]{40}$/.test(delegateAddress || '')
    ) {
      return refinementCtx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Ethereum address',
        path: ['delegateAddress'],
      });
    }
  });

export default function ClaimCard({ grant }: { grant: Grant }) {
  const { toast } = useToast();
  const chainId = useChainId();
  const isCorrectChain = chainId === grant.chainId;

  const { mutateAsync: claimAndDelegate, isPending } =
    useContractClaimAndDelegate();

  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [txHash, setTxHash] = useState<string>();

  // TODO: Enable ENS
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      delegateAddress: '',
      isDelegationRequired: DELEGATION_REQUIRED,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!grant.proof) {
      toast({
        title: 'Error',
        description: 'Claim not found',
        variant: 'destructive',
      });
      return;
    }

    if (
      !grant.campaign.token ||
      !grant.campaign.token.address ||
      !grant.campaign.token.name
    ) {
      toast({
        title: 'Error',
        description: 'Token not found',
        variant: 'destructive',
      });
      return;
    }
    try {
      const receipt = await claimAndDelegate({
        delegateeAddress: data.isDelegationRequired
          ? (data.delegateAddress as `0x${string}`)
          : undefined,
        claim: grant.proof,
        tokenAddress: grant.campaign.token.address as `0x${string}`,
        tokenName: grant.campaign.token.name,
      });
      setTxHash(receipt.transactionHash);
      toast({
        title: 'Success',
        description: 'Rewards claimed successfully',
      });
      setStep('confirmation');
    } catch (error) {
      // @ts-expect-error this error is spreadable
      console.error('Error claiming rewards:', { ...error });
      if (error instanceof ContractFunctionExecutionError) {
        if (error.cause instanceof ContractFunctionRevertedError) {
          toast({
            title: 'Contract error',
            description: error.cause.reason,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Contract error',
          description: 'An error occurred while claiming rewards',
          variant: 'destructive',
        });
      }
    }
  }

  const isDelegationRequired = form.watch('isDelegationRequired');

  const buttonContent = useMemo(() => {
    if (isPending) {
      return (
        <>
          <div className="flex pr-2 justify-center items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          Claiming...
        </>
      );
    }

    if (!isCorrectChain) {
      const correctChain = getChainForChainId(grant.chainId);
      return `Switch to ${correctChain.name} to claim`;
    }

    if (isDelegationRequired) {
      return 'Delegate and claim';
    }
    return 'Claim';
  }, [isPending, isCorrectChain, grant.chainId, isDelegationRequired]);

  return (
    <Card className="bg-transparent border border-neutral-300 shadow-none py-10 px-4">
      {step === 'form' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {DELEGATION_REQUIRED ? (
                <>
                  <div className="grid w-full max-w-sm items-center gap-3">
                    <FormField
                      control={form.control}
                      name="delegateAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-normal">
                            Enter the delegate's address
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-transparent border-neutral-300"
                              placeholder="0x..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {DELEGATES_URL && (
                    <p className="text-sm mb-8">
                      You can visit{' '}
                      <a
                        className="font-semibold text-black"
                        href={DELEGATES_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        this page
                      </a>{' '}
                      to find the delegate who should represent for you, or
                      delegate the token to yourself.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm mb-8">
                  Excellent. You are now ready to claim your rewards.
                </p>
              )}
            </CardContent>
            <CardFooter className="py-0">
              <Button
                type="submit"
                className="bg-primaryActionButtonBg hover:bg-initial rounded-full py-4 px-14"
                disabled={
                  !form.formState.isValid || isPending || !isCorrectChain
                }
              >
                {buttonContent}
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}
      {step === 'confirmation' && (
        <CardContent className="p-0 space-y-6 flex flex-col items-center">
          <p className="text-lg">All done!</p>
          <SuccessCheckmark color={CONFIRMATION_CHECKMARK_BG_COLOR} />
          <div className="flex space-x-2">
            {txHash && (
              <Link
                target="_blank"
                href={generateBlockExplorerUrl(grant.chainId, txHash)}
              >
                <Button className="w-full group">
                  View on block explorer{' '}
                  <RiArrowRightUpLine
                    className="ml-1 text-white w-4 h-4 transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
