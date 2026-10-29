import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f2e1d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fbf9f4] text-[#1c261e]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
