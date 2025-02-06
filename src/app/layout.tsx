import BackgroundImage from '@/components/common/images/BgImage';
import { Toaster } from '@/components/ui/toaster';
import ContextProvider from '@/context';
import type { Metadata } from 'next';
import ClientLayout from './client-layout';
import { inter, sora } from './fonts';
import './globals.css';
import { FEATURES, WHITELABEL_ENV } from '../../config/features';

const getIcon = () => {
  if (WHITELABEL_ENV === 'ZK_SYNC') {
    return '/currency_symbols/zk_sync.png';
  }

  if (WHITELABEL_ENV === 'OPTIMISM') {
    return '/currency_symbols/op.png';
  }
};

export const metadata: Metadata = {
  title: FEATURES.APP_NAME,
  description: 'Powered by WalletConnect',
  icons: {
    icon: getIcon(),
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <ContextProvider>
          <ClientLayout>{children}</ClientLayout>
        </ContextProvider>
        {FEATURES.BG_IMAGE && (
          <div className="fixed inset-0 w-full h-full -z-10 flex items-center justify-center">
            <BackgroundImage src={FEATURES.BG_IMAGE.src} />
          </div>
        )}
        <Toaster />
      </body>
    </html>
  );
}
