'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Plus,
  Sparkles,
  Sprout,
  Library,
  Layers,
  BookOpen,
  LayoutDashboard,
  WifiOff,
  DownloadCloud,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { usePwa } from '@/context/PwaContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: 'plus' | 'sparkles' | 'none';
}

export function AppHeader({
  title,
  subtitle,
  actionHref = '/app/plants',
  actionLabel = 'Explore Plants',
  actionIcon = 'plus',
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isOffline, canInstall, isIos, promptInstall, setShowIosInstructions } = usePwa();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'My Garden & Tracker', href: '/app/my-garden', icon: Sprout },
    { label: 'Plant Library', href: '/app/plants', icon: Library },
    { label: 'Vertical Planner', href: '/app/planner', icon: Layers },
    { label: 'AI Plant Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Learn & Sustainability', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#ded5c5] px-4 sm:px-8 py-3 sm:py-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title or Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#144229] hover:bg-[#ede7da] focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div>
              {title && (
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11] tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#2e4435] mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Button, PWA status & Auth Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Status Indicator Pill */}
            {isOffline && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff3cd] text-[#855302] border border-[#ffeeba] shadow-2xs"
                role="status"
                aria-live="polite"
              >
                <WifiOff size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline">Offline Mode</span>
              </span>
            )}

            {/* PWA Install Button (desktop / mobile prompt) */}
            {canInstall && (
              <button
                type="button"
                onClick={promptInstall}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold bg-[#eef5ee] text-[#144229] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl shadow-2xs transition-all cursor-pointer"
                aria-label="Install GrowAI Progressive Web App"
              >
                <DownloadCloud size={16} />
                <span>Install App</span>
              </button>
            )}

            {isIos && (
              <button
                type="button"
                onClick={() => setShowIosInstructions(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold bg-[#eef5ee] text-[#144229] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl shadow-2xs transition-all cursor-pointer"
                aria-label="How to install GrowAI on iOS"
              >
                <DownloadCloud size={16} />
                <span>Install</span>
              </button>
            )}

            <AuthStatus variant="header" />

            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#144229] text-white hover:bg-[#071c11] rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
              >
                {actionIcon === 'plus' && <Plus size={16} />}
                {actionIcon === 'sparkles' && <Sparkles size={16} />}
                <span>{actionLabel}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Modal */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#0e2a1b] text-[#e3ece5] p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1b4a30]">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#257a4d] text-white shadow-sm">
                    <Sprout size={19} className="stroke-[2.5]" />
                  </span>
                  <span className="font-serif font-bold text-lg text-white">
                    Grow<span className="text-[#64b584] font-sans">AI</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[#bed4c5] hover:text-white hover:bg-[#153e27] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Install button in mobile drawer if installable */}
              {(canInstall || isIos) && (
                <div className="pt-3 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (canInstall) promptInstall();
                      else if (isIos) setShowIosInstructions(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#257a4d] text-white font-semibold text-xs shadow-sm hover:bg-[#1e663f] transition-colors cursor-pointer"
                  >
                    <DownloadCloud size={16} />
                    <span>Install GrowAI PWA</span>
                  </button>
                </div>
              )}

              <nav className="py-4 space-y-1.5" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-[#1a472d] text-white font-semibold border border-[#2a6844]'
                          : 'text-[#bed4c5] hover:bg-[#143824] hover:text-white'
                      }`}
                    >
                      <Icon size={19} className={isActive ? 'text-[#64b584]' : 'text-[#86aa91]'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1b4a30] text-xs text-[#86aa91]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-[#bed4c5] hover:text-white font-medium min-h-[44px] flex items-center justify-center"
              >
                ← Return to Landing Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

