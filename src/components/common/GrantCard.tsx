import { Card, CardContent } from '@/components/ui/card';
import type { Grant } from '@/context/GrantsContext';
import {
  generateBlockExplorerUrl,
  getChainForChainId,
} from '@/lib/getPublicClientForChain';
import { truncate } from '@/lib/truncate';
import { RiArrowRightUpLine } from '@remixicon/react';
import Link from 'next/link';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { CurrencySymbol } from './CurrencySymbol';
import { ProjectImage } from './images/ProjectImage';

const GrantCard = ({ grant }: { grant: Grant }) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  const isCorrectChain = grant.chainId === chainId;
  const chain = getChainForChainId(grant.chainId);

  return (
    <>
      <Card className="shadow-none bg-[#f7f7f7] border-none">
        {grant.currentUserCanClaim && isConnected && (
          <div className="flex items-center justify-between bg-bgClaimcardHeader px-10 py-2 rounded-t-lg">
            <p className="text-sm">
              You are eligible to claim this grant
              {!isCorrectChain && (
                <span>
                  {' '}
                  on <b>{chain.name}</b>
                </span>
              )}
            </p>
            {isCorrectChain ? (
              <Link
                className="text-primaryAction font-semibold hover:no-underline p-0 py-2"
                href={`/grants/${grant.id}`}
              >
                Claim now
              </Link>
            ) : (
              <div>
                <Button
                  onClick={() => {
                    switchChain({ chainId: grant.chainId });
                  }}
                  variant="link"
                  className="text-primaryAction font-semibold hover:no-underline p-0"
                >
                  Switch to {chain.name}
                </Button>
              </div>
            )}
          </div>
        )}
        <CardContent className="py-8 px-10 relative">
          <div className="flex items-center gap-2 absolute top-0 right-0 -translate-x-[8px] -translate-y-1/2 cursor-default">
            {grant.campaign.ended && (
              <Badge className="bg-orange-500">Cancelled</Badge>
            )}
            {grant.proof?.claimed && (
              <Badge className="bg-primaryActionButtonBg">Claimed</Badge>
            )}
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 flex-grow">
              <ProjectImage src={grant.projectImage} />
              <div className="flex flex-col gap-2 max-w-2xl">
                <p className="font-semibold text-xl">{grant.title}</p>
                <p className="text-sm text-gray-500 line-clamp-3 h-[61px]">
                  {grant.description}
                </p>
              </div>
            </div>

            {grant.campaign.token && (
              <div className="flex items-center gap-2 font-semibold">
                <CurrencySymbol token={grant.campaign.token} />
                <span
                  className={
                    grant.currentUserCanClaim ? 'text-black' : 'text-gray-500'
                  }
                >
                  {grant.grantAmount} {grant.campaign.token.ticker}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-8 mt-8">
            <div className="w-20" />
            <div className="flex h-5 items-center space-x-4 text-xs text-gray-500">
              <p>
                Date of award:{' '}
                <span className="font-medium text-black">
                  {grant.date.toLocaleDateString()}
                </span>
              </p>
              {grant.tokenReleasedInDays && (
                <>
                  <Separator orientation="vertical" />
                  <p>
                    Released in:{' '}
                    <span className="font-medium text-black">
                      {grant.tokenReleasedInDays}{' '}
                      {grant.tokenReleasedInDays > 1 ? 'days' : 'day'}
                    </span>
                  </p>
                </>
              )}
              {grant.delegateTo && (
                <>
                  <Separator orientation="vertical" />
                  <div className="flex items-center gap-2">
                    <p>Delegate to: </p>
                    <Link
                      className="group flex items-center font-medium text-black"
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
              {grant.latestClaimHash && (
                <>
                  <Separator orientation="vertical" />
                  <div className="flex items-center gap-2">
                    <p>Latest claim: </p>
                    <a
                      target="_blank"
                      className="group flex items-center font-medium text-black"
                      href={generateBlockExplorerUrl(
                        grant.chainId,
                        grant.latestClaimHash,
                      )}
                      rel="noreferrer"
                    >
                      {truncate(grant.latestClaimHash, 11)}{' '}
                      <RiArrowRightUpLine
                        className="ml-1 text-neutral-500 w-4 h-4 opacity-70 transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GrantCard;
