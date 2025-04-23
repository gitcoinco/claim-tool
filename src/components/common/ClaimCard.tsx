import type { Grant } from '@/context/GrantsContext';
import useContractClaimAndDelegate from '@/hooks/useContractClaimAndDelegate';
import { useToast } from '@/hooks/useToast';

import {
  generateBlockExplorerUrl,
  getChainForChainId,
} from '@/lib/getPublicClientForChain';
import { Icon, IconType } from '@gitcoin/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiArrowRightUpLine } from '@remixicon/react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useChainId } from 'wagmi';
import { z } from 'zod';
import { FEATURES, WHITELABEL_ENV } from '../../../config/features';
import SuccessCheckmark from '../common/images/SuccessCheckmark';
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
const {
  DELEGATION_REQUIRED,
  DELEGATES_URL,
  CONFIRMATION_CHECKMARK_BG_COLOR,
  DELEGATION_ENABLED,
} = FEATURES;

const FormSchema = z
  .object({
    delegateAddress: z.string().optional(),
    isDelegationRequired: z.boolean(),
    isDelegateEnabled: z.boolean(),
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

  const isBase = WHITELABEL_ENV === 'BASE';

  const {
    mutateAsync: claimAndDelegate,
    isPending,
    isError,
  } = useContractClaimAndDelegate();

  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [txHash, setTxHash] = useState<string>();

  // TODO: Enable ENS
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      delegateAddress: '',
      isDelegationRequired: DELEGATION_REQUIRED,
      isDelegateEnabled: DELEGATION_ENABLED,
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
          : isBase && data.isDelegateEnabled
            ? (data.delegateAddress as `0x${string}`)
            : undefined,
        claim: grant.proof,
        tokenAddress: grant.campaign.token.address as `0x${string}`,
        tokenName: grant.campaign.token.name,
      });
      if (!receipt || isError) {
        return;
      }
      setTxHash(receipt?.transactionHash);
      toast({
        title: 'Success',
        description: 'Rewards claimed successfully',
      });
      setStep('confirmation');
    } catch (error) {
      // @ts-expect-error this error is spreadable
      console.error('Error claiming rewards:', { ...error });
    }
  }

  const isDelegationRequired = form.watch('isDelegationRequired');
  const isDelegateEnabled = form.watch('isDelegateEnabled');
  const delegateAddress = form.watch('delegateAddress');
  const buttonContent = useMemo(() => {
    const isStarted = new Date(grant.proof?.startDate || 0) < new Date();
    const isEnded = new Date(grant.proof?.endDate || 0) < new Date();
    if (!isStarted) {
      return `Claim starts in ${Math.ceil(
        (new Date(grant.proof?.startDate || 0).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )} days`;
    }
    if (isEnded) {
      return 'Claim period ended';
    }
    if (isPending && !isError) {
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

    if (isBase && isDelegateEnabled && delegateAddress) {
      return 'Delegate and claim';
    }

    if (isDelegationRequired) {
      return 'Delegate and claim';
    }

    return 'Claim';
  }, [
    isPending,
    isCorrectChain,
    grant.chainId,
    isDelegationRequired,
    isBase,
    isDelegateEnabled,
    delegateAddress,
    isError,
    grant.proof?.startDate,
    grant.proof?.endDate,
  ]);

  const isActive =
    new Date(grant.proof?.startDate || 0) < new Date() &&
    new Date(grant.proof?.endDate || 0) > new Date();

  return (
    <Card
      className={
        !isBase
          ? 'bg-transparent border border-neutral-300 shadow-none py-10 px-4'
          : 'border-none'
      }
    >
      {step === 'form' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {!isBase ? (
              <>
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
                                Enter the delegate's address {<span>*</span>}
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
                        <p className="text-sm">
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
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-bold">Claim the token.</p>
                      <p className="text-sm">Ready to claim your rewards?</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="py-0">
                  <Button
                    type="submit"
                    className="bg-primaryActionButtonBg hover:bg-initial"
                    disabled={
                      !form.formState.isValid ||
                      isPending ||
                      !isCorrectChain ||
                      !isActive
                    }
                  >
                    {buttonContent}
                  </Button>
                </CardFooter>
              </>
            ) : (
              <div className="w-full p-10 rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#bcbfcd] inline-flex flex-col justify-start items-start gap-14">
                {FEATURES.DELEGATION_ENABLED ? (
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
                        Choose your delegate
                      </div>
                      <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
                        Appoint a delegate to review your milestone and approve
                        your token claim. You can choose from the list of
                        approved delegates or delegate to yourself.
                      </div>
                    </div>
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
                        View all the delegate profiles
                      </div>
                      <Icon
                        type={IconType.ARROW_RIGHT}
                        className="size-5 -rotate-45 cursor-pointer"
                        onClick={() => {
                          window.open(DELEGATES_URL, '_blank');
                        }}
                      />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <FormField
                        control={form.control}
                        name="delegateAddress"
                        render={({ field }) => (
                          <FormItem className="w-full flex flex-col gap-4 space-y-0">
                            <FormLabel className="self-stretch justify-start text-Black text-lg font-normal font-ui-sans leading-[25.20px]">
                              Enter the delegate’s wallet address{' '}
                              {DELEGATION_REQUIRED ? (
                                <span>*</span>
                              ) : (
                                <span>
                                  <span className="text-Black text-lg font-normal font-ui-sans leading-[25.20px]">
                                    (optional)
                                  </span>
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="w-full text-lg font-normal leading-[25.20px] p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-grey-300"
                                placeholder="0x..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
                      Claim the token.
                    </div>
                    <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
                      Ready to claim your rewards?
                    </div>
                  </div>
                )}
                <Button
                  className="h-14 px-8 bg-[#0d5af9] rounded-[32px] text-base font-medium  leading-normal"
                  type="submit"
                  disabled={
                    !form.formState.isValid ||
                    isPending ||
                    !isCorrectChain ||
                    !isActive
                  }
                >
                  {buttonContent}
                </Button>
              </div>
            )}
          </form>
        </Form>
      )}
      {step === 'confirmation' && (
        <CardContent className="p-0 space-y-6 flex flex-col items-center">
          <p className="text-lg">All done!</p>
          <SuccessCheckmark color={CONFIRMATION_CHECKMARK_BG_COLOR} />
          <div
            className={`flex items-center justify-center gap-2 ${isBase ? 'flex-row-reverse' : ''}`}
          >
            {txHash && (
              <Link
                target="_blank"
                href={generateBlockExplorerUrl(grant.chainId, txHash)}
              >
                <Button
                  className={`w-full group ${isBase ? 'bg-[#eff0f3] text-black rounded-3xl hover:bg-[#eff0f3]' : ''}`}
                >
                  View on block explorer{' '}
                  <RiArrowRightUpLine
                    className={`ml-1 ${isBase ? 'text-black' : 'text-white'} w-4 h-4 transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100`}
                    aria-hidden="true"
                  />
                </Button>
              </Link>
            )}

            {FEATURES.CONFIRMATION_SECOND_BUTTON_TEXT.length > 0 && (
              <Link
                target="_blank"
                href={FEATURES.CONFIRMATION_SECOND_BUTTON_LINK}
              >
                <Button
                  className={`w-full group ${
                    FEATURES.CONFIRMATION_SECOND_BUTTON_CLASSNAME
                  }`}
                >
                  {FEATURES.CONFIRMATION_SECOND_BUTTON_TEXT}
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
