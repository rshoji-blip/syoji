import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import PwaRegistrar from '@/components/PwaRegistrar';

export const metadata: Metadata = {
  title: 'おさるのジョージ エピソード検索',
  description: 'おさるのジョージのエピソードをキャラクターやジャンルで検索！',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'ジョージ検索',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFB300',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        {/* PWA: Apple touch icon for iOS home screen */}
        <link rel="apple-touch-icon" href="/pwa/icon192" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <PwaRegistrar />
      </body>
    </html>
  );
}
