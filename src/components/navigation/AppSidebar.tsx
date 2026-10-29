'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Sprout,
  Library,
  Layers,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Database,
  Info,
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

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
      badge: '16 Species',
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
      badge: 'Demo',
    },
    {
      label: 'Learn & Sustainability',
      href: '/app/learn',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0e2a1b] text-[#e3ece5] border-r border-[#19402a] min-h-screen p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="pb-6 border-b border-[#1b4a30]">
        <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#58855e] rounded-lg">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#257a4d] text-white shadow-sm">
              <Sprout size={20} className="stroke-[2.5]" />
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-white">
              Grow<span className="text-[#64b584] font-sans font-semibold">AI</span>
            </span>
          </div>
        </Link>
        <p className="text-[11px] text-[#86aa91] mt-1.5 font-medium tracking-wide uppercase">
          Vertical Agriculture OS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1.5" aria-label="App Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1a472d] text-white shadow-sm font-semibold border border-[#2a6844]'
                  : 'text-[#bed4c5] hover:text-white hover:bg-[#143824]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-[#64b584]' : 'text-[#86aa91]'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
      <div className="pt-4 border-t border-[#1b4a30] space-y-3">
        {/* Storage State Indicator */}
        <div className="bg-[#143a25] p-3 rounded-xl border border-[#1e5235] text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#9dc2a8] font-semibold text-[11px]">
            <Database size={13} className="text-[#64b584]" />
            <span>Local Demo Storage</span>
          </div>
          <p className="text-[11px] text-[#84a990] leading-relaxed">
            Data is stored safely in your browser. Supabase cloud sync connects in Phase 2.
          </p>
        </div>

        {/* Public Site Link */}
        <Link
          href="/"
          className="flex items-center justify-between text-xs font-medium text-[#9dc2a8] hover:text-white px-3 py-2 rounded-lg hover:bg-[#143824] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info size={14} />
            Landing Page
          </span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
