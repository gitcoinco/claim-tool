'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SignMessage } from '@/components/auth/SignMessage';
import { useSession } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnecting, isConnected } = useAccount();
  const { data: session, isLoading: isSessionLoading } = useSession();

  const showSignaturePrompt = isConnected && !isSessionLoading && !session;

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl">
        {isConnecting || isSessionLoading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : showSignaturePrompt ? (
          <SignMessage />
        ) : (
          children
        )}
      </div>
      <Footer />
    </>
  );
}
