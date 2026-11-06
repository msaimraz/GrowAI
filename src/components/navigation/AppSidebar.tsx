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
  ClipboardList,
  Compass,
  DownloadCloud,
} from 'lucide-react';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { usePwa } from '@/context/PwaContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { canInstall, isIos, promptInstall, setShowIosInstructions } = usePwa();

  const mainNavItems = [
    {
      label: 'Home',
      href: '/app',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Plant Library',
      href: '/app/plants',
      icon: Library,
      badge: '19 Species',
    },
    {
      label: 'My Garden',
      href: '/app/my-garden',
      icon: Sprout,
    },
    {
      label: 'Grow Plans',
      href: '/app/grow-plans',
      icon: ClipboardList,
    },
  ];

  const toolsNavItems = [
    {
      label: 'Plant Check',
      href: '/app/ai-doctor',
      icon: Sparkles,
      badge: 'Photo Help',
    },
    {
      label: 'Space Planner',
      href: '/app/planner',
      icon: Layers,
    },
    {
      label: 'Grow Intelligence',
      href: '/app/grow-intelligence',
      icon: Compass,
    },
    {
      label: 'Learn & Quiz',
      href: '/app/learn',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#174C35] text-[#FBF9F4] border-r border-[#123E2A] h-[100dvh] max-h-[100dvh] sticky top-0 shrink-0 select-none z-30 p-4 overflow-hidden">
      {/* Brand Header */}
      <div className="pb-4 border-b border-[#235F44] shrink-0">
        <Link href="/" className="inline-block focus:outline-hidden focus:ring-2 focus:ring-[#86efac] rounded-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-[#174C35] shadow-xs font-bold text-base select-none">
              🌱
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-white">
              Grow<span className="text-[#86efac] font-sans font-semibold">AI</span>
            </span>
          </div>
        </Link>
        <p className="text-[11px] text-[#A7C8B6] mt-1 font-mono tracking-wider uppercase">
          Home & Balcony Growing
        </p>
      </div>

      {/* Navigation Group */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-6 scrollbar-none">
        {/* Main Section */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A7C8B6]/70 px-3 block mb-1">
            Grow
          </span>
          <nav className="space-y-1" aria-label="Main Navigation">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-[#1E5C41] text-white shadow-xs font-semibold border border-[#2E7A57]'
                      : 'text-[#D0E2D7] hover:text-white hover:bg-[#1E5C41]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={18} className={isActive ? 'text-[#86efac]' : 'text-[#A7C8B6]'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#123E2A] text-[#A7C8B6] font-normal">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tools Section */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A7C8B6]/70 px-3 block mb-1">
            Tools
          </span>
          <nav className="space-y-1" aria-label="Tools Navigation">
            {toolsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/app'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-[#1E5C41] text-white shadow-xs font-semibold border border-[#2E7A57]'
                      : 'text-[#D0E2D7] hover:text-white hover:bg-[#1E5C41]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={18} className={isActive ? 'text-[#86efac]' : 'text-[#A7C8B6]'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#123E2A] text-[#86efac] font-normal">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & PWA */}
      <div className="pt-3 border-t border-[#235F44] space-y-2 shrink-0">
        {(canInstall || isIos) && (
          <button
            type="button"
            onClick={canInstall ? promptInstall : () => setShowIosInstructions(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#235F44] hover:bg-[#2E7A57] text-white text-xs font-medium transition-colors cursor-pointer min-h-[38px]"
          >
            <DownloadCloud size={14} />
            <span>Install App</span>
          </button>
        )}
        <AuthStatus />
      </div>
    </aside>
  );
}
