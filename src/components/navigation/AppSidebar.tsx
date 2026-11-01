'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sprout,
  Library,
  Layers,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Info,
  DownloadCloud,
} from 'lucide-react';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { usePwa } from '@/context/PwaContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { canInstall, isIos, promptInstall, setShowIosInstructions } = usePwa();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'My Garden & Tracker',
      href: '/app/my-garden',
      icon: Sprout,
      badge: 'Active Log',
    },
    {
      label: 'Plant Library',
      href: '/app/plants',
      icon: Library,
      badge: '19 Species',
    },
    {
      label: 'Vertical Planner',
      href: '/app/planner',
      icon: Layers,
    },
    {
      label: 'AI Plant Doctor',
      href: '/app/ai-doctor',
      icon: Sparkles,
      badge: 'Vision AI',
    },
    {
      label: 'Learn & Sustainability',
      href: '/app/learn',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0d2a1b] text-[#e3ece5] border-r border-[#1a4b30] min-h-screen p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="pb-5 border-b border-[#1a4b30]">
        <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#64b584] rounded-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#1e663f] text-white shadow-xs">
              <Sprout size={20} className="stroke-[2.5]" />
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-white">
              Grow<span className="text-[#86efac] font-sans font-semibold">AI</span>
            </span>
          </div>
        </Link>
        <p className="text-xs text-[#86aa91] mt-1.5 font-medium tracking-wider uppercase">
          Vertical Agriculture OS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 space-y-1.5" aria-label="App Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                isActive
                  ? 'bg-[#1b5837] text-white shadow-xs font-semibold border border-[#348b56]'
                  : 'text-[#bed4c5] hover:text-white hover:bg-[#143d26]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={isActive ? 'text-[#86efac]' : 'text-[#86aa91]'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-[#257a4d] text-white'
                      : 'bg-[#183d27] text-[#9dc2a8]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status & Info */}
      <div className="pt-4 border-t border-[#1a4b30] space-y-3">
        {/* PWA Install Button if available */}
        {canInstall && (
          <button
            type="button"
            onClick={promptInstall}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1e663f] hover:bg-[#257a4d] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <DownloadCloud size={16} />
            <span>Install GrowAI App</span>
          </button>
        )}

        {isIos && (
          <button
            type="button"
            onClick={() => setShowIosInstructions(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1e663f] hover:bg-[#257a4d] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <DownloadCloud size={16} />
            <span>Install on iOS</span>
          </button>
        )}

        {/* Dynamic Auth & Storage State Indicator */}
        <AuthStatus variant="sidebar" />

        {/* Public Site Link */}
        <Link
          href="/"
          className="flex items-center justify-between text-xs font-medium text-[#9dc2a8] hover:text-white px-3 py-2.5 rounded-xl hover:bg-[#143d26] transition-colors min-h-[44px]"
        >
          <span className="flex items-center gap-1.5">
            <Info size={15} />
            Landing Page
          </span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </aside>
  );
}
