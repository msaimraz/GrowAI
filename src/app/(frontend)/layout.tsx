import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PwaProvider } from '@/context/PwaContext';
import { GrowToastProvider } from '@/context/GrowToastContext';
import { GrowSuccessToastContainer } from '@/components/ui/GrowSuccessToast';

export const metadata: Metadata = {
  title: 'GrowAI — AI-Assisted Home Gardening & Vertical Farming',
  description:
    'Discover home plants, track accurate growth timelines, plan space-efficient vertical gardens, and cultivate sustainable home agriculture with AI guidance.',
  keywords: [
    'vertical farming',
    'home gardening',
    'plant doctor',
    'growth tracker',
    'vertical garden planner',
    'sustainable gardening',
    'balcony garden',
  ],
  authors: [{ name: 'GrowAI Botanical Systems' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GrowAI',
  },
};

export const viewport: Viewport = {
  themeColor: '#174C35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-[#F8F6EE] text-[#203027]">
        <PwaProvider>
          <AuthProvider>
            <GrowToastProvider>
              {children}
              <GrowSuccessToastContainer />
            </GrowToastProvider>
          </AuthProvider>
        </PwaProvider>
      </body>
    </html>
  );
}

