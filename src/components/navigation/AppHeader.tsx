'use client';

import React, { useState, useEffect } from 'react';
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
  LineChart,
  WifiOff,
  DownloadCloud,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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

  // Prevent background scrolling while mobile drawer is open & handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'Grow Intelligence', href: '/app/grow-intelligence', icon: LineChart },
    { label: 'My Garden & Tracker', href: '/app/my-garden', icon: Sprout },
    { label: 'Plant Library', href: '/app/plants', icon: Library },
    { label: 'Vertical Planner', href: '/app/planner', icon: Layers },
    { label: 'AI Plant Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Learn & Sustainability', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#F8F6EE]/95 backdrop-blur-md border-b border-[#E3DFD2] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
          {/* Left: Hamburger menu toggle + Controlled Page Title */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#174C35] hover:bg-[#EAF1E4] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all duration-75 select-none touch-manipulation shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0 flex-1 pr-2 sm:pr-4">
              {title && (
                <h1 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-[#203027] tracking-tight leading-snug sm:leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="hidden md:block text-xs sm:text-sm text-[#5F6D63] mt-0.5 font-medium leading-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions, Connection Status & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Offline Status Indicator Pill */}
            {isOffline && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35 shadow-2xs shrink-0"
                role="status"
                aria-live="polite"
              >
                <WifiOff size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            {/* PWA Install Button (tablet prompt only; desktop sidebar already has install action) */}
            {/* {canInstall && (
              <button
                type="button"
                onClick={promptInstall}
                className="hidden sm:inline-flex lg:hidden items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold bg-[#eef5ee] text-[#174C35] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl shadow-2xs transition-all cursor-pointer min-h-[40px]"
                aria-label="Install GrowAI Progressive Web App"
              >
                <DownloadCloud size={15} />
                <span>Install</span>
              </button>
            )}

            {isIos && (
              <button
                type="button"
                onClick={() => setShowIosInstructions(true)}
                className="hidden sm:inline-flex lg:hidden items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold bg-[#eef5ee] text-[#174C35] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl shadow-2xs transition-all cursor-pointer min-h-[40px]"
                aria-label="How to install GrowAI on iOS"
              >
                <DownloadCloud size={15} />
                <span>Install</span>
              </button>
            )} */}

            {/* Notifications & Reminders Bell */}
            <NotificationBell />

            {/* Header AuthStatus shown on tablet & desktop */}
            <div className="hidden sm:block">
              <AuthStatus variant="header" />
            </div>

            {/* Primary Action Button */}
            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#174C35] text-white hover:bg-[#123E2A] active:scale-95 rounded-xl shadow-xs transition-all duration-75 select-none touch-manipulation hover:shadow focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[40px] shrink-0"
                aria-label={actionLabel}
              >
                {actionIcon === 'plus' && <Plus size={15} className="shrink-0" />}
                {actionIcon === 'sparkles' && <Sparkles size={15} className="shrink-0" />}
                <span className="hidden sm:inline">{actionLabel}</span>
                <span className="sm:hidden font-medium">
                  {actionLabel === 'Add from Library' ? 'Add' : actionLabel === 'Explore Plants' ? 'Plants' : actionLabel}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Modal */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop with transition */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="relative w-80 max-w-[85vw] bg-[#0e2a1b] text-[#e3ece5] p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200 ease-out">
            <div className="space-y-4">
              {/* Drawer Brand & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1b4a30]">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#257a4d] text-white shadow-sm">
                    <Sprout size={19} className="stroke-[2.5]" />
                  </span>
                  <span className="font-serif font-bold text-lg text-white">
                    Grow<span className="text-[#64b584] font-sans font-semibold">AI</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[#bed4c5] hover:text-white hover:bg-[#153e27] active:scale-90 active:bg-[#1a472d] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-all duration-75 select-none touch-manipulation"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Install button in mobile drawer if installable */}
              {(canInstall || isIos) && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (canInstall) promptInstall();
                      else if (isIos) setShowIosInstructions(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#257a4d] text-white font-semibold text-xs shadow-sm hover:bg-[#1e663f] active:scale-95 transition-all duration-75 cursor-pointer min-h-[44px] select-none touch-manipulation"
                  >
                    <DownloadCloud size={16} />
                    <span>Install GrowAI PWA</span>
                  </button>
                </div>
              )}

              {/* Mobile Quick Action Link */}
              {actionLabel && actionHref && (
                <div>
                  <Link
                    href={actionHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1e663f] text-white font-semibold text-xs shadow-sm hover:bg-[#257a4d] active:scale-95 transition-all duration-75 min-h-[44px] select-none touch-manipulation"
                  >
                    {actionIcon === 'plus' && <Plus size={16} />}
                    {actionIcon === 'sparkles' && <Sparkles size={16} />}
                    <span>{actionLabel}</span>
                  </Link>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="py-2 space-y-1.5" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-75 active:scale-[0.98] select-none touch-manipulation min-h-[44px] ${
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

              {/* Full Auth Status inside mobile drawer */}
              <div className="pt-2 border-t border-[#1b4a30]">
                <AuthStatus variant="sidebar" />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[#1b4a30] text-xs text-[#86aa91]">
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-[#bed4c5] hover:text-white font-medium min-h-[44px] flex items-center justify-center"
              >
                GrowAI Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

