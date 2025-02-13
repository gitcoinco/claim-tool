'use client';

import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { SpinningLoader } from '@/components/common/SpinningLoader';
import { TransactionCard } from '@/components/common/TransactionCard';
import { GrantHistoryItemSkeleton } from '@/components/common/skeletons/ClaimHistorySkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGrants } from '@/context/GrantsContext';
import { generateBlockExplorerUrl } from '@/lib/getPublicClientForChain';
import { truncate } from '@/lib/truncate';
import { RiArrowRightUpLine } from '@remixicon/react';
import { Hexagon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Smile from '../../../public/smile.svg';

const ClaimHistory = () => {
  const { grants, isFetched, isLoading } = useGrants();
  return (
    <>
      <div className="flex flex-col gap-6 items-start">
        <h1 className="text-4xl font-bold">Claim History</h1>
        {!isFetched ? (
          <>
            <GrantHistoryItemSkeleton />
            <GrantHistoryItemSkeleton />
            <GrantHistoryItemSkeleton />
          </>
        ) : (
          grants
            ?.filter((grant) => !!grant.claimEvents?.length)
            .map((grant) => (
              <div
                key={grant.id}
                className="flex items-start gap-14 w-full bg-white rounded-lg p-6"
              >
                <div className="space-y-6 grow">
                  <div key={grant.id}>
                    <div className="flex items-center gap-4 mb-4">
                      <Hexagon className="w-10 h-10" />
                      <div className="flex flex-col gap-2 max-w-2xl">
                        <p className="font-semibold text-xl">{grant.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <p className="flex items-center gap-2">
                            Date of award:{' '}
                            <span className="font-semibold text-black">
                              {/* TODO: This is formatting to the wrong date depending on time zone */}
                              {grant.date.toLocaleDateString()}
                            </span>
                          </p>
                          {grant.delegateTo && (
                            <>
                              <Separator orientation="vertical" />
                              <div className="flex items-center gap-2">
                                <p>Delegate to: </p>
                                <Link
                                  className="group flex items-center font-semibold text-black"
                                  href={generateBlockExplorerUrl(
                                    grant.chainId,
                                    grant.delegateTo,
                                  )}
                                  target="_blank"
                                >
                                  {truncate(grant.delegateTo, 11)}{' '}
                                  <RiArrowRightUpLine
                                    className="ml-1 text-neutral-500 w-4 h-4 opacity-70 transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </div>
                            </>
                          )}
                          <Separator orientation="vertical" />
                          <div className="flex items-center gap-2">
                            <p>Remaining: </p>
                            <CurrencySymbol token={grant.campaign.token} />
                            <p className="font-semibold text-black">
                              {Math.round(grant.grantAmount - grant.claimed) ||
                                0}{' '}
                              {grant.campaign.token?.ticker}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {grant.claimEvents?.length === 0 && (
                        <Card className="shadow-none border-none">
                          <CardContent className="py-8 px-10 space-y-6 flex flex-col items-center justify-center">
                            <Image
                              className="w-10 h-10"
                              alt="Smile"
                              src={Smile}
                              width={82}
                              height={81}
                            />
                            <p className="text-sm text-neutral-500">
                              You haven&apos;t claimed anything yet...
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {grant.claimEvents?.map((transaction) => (
                        <TransactionCard
                          key={transaction.transactionHash}
                          chainId={grant.chainId}
                          token={grant.campaign.token}
                          {...transaction}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
};

export default ClaimHistory;
