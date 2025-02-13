'use client';

import { useDisconnect } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RiFileHistoryLine, RiLogoutBoxRLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
const WalletConnectButton = ({
  text,
  classNames,
}: {
  text?: string;
  classNames?: string;
}) => {
  const { disconnect } = useDisconnect();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const router = useRouter();
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="outline"
                    className={cn(
                      'bg-primaryActionButtonBg text-white rounded-full',
                      classNames,
                    )}
                    onClick={openConnectModal}
                    type="button"
                  >
                    {text || 'Connect Wallet'}
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    variant="outline"
                    className="border-secondary-foreground"
                    onClick={openChainModal}
                    type="button"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    variant="outline"
                    className="border-secondary-foreground"
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-secondary-foreground"
                        type="button"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem
                        className="flex items-center justify-between px-6 font-semibold"
                        onClick={() => router.push('/claim-history')}
                      >
                        Claim History <RiFileHistoryLine />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between px-6 font-semibold"
                        onClick={disconnect}
                      >
                        Disconnect <RiLogoutBoxRLine />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;
