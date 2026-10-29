'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Plus, Sparkles, Sprout, Library, Layers, BookOpen, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'My Garden & Tracker', href: '/app/my-garden', icon: Sprout },
    { label: 'Plant Library', href: '/app/plants', icon: Library },
    { label: 'Vertical Planner', href: '/app/planner', icon: Layers },
    { label: 'AI Plant Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Learn & 3Rs', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#e5dfd3] px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title or Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#144229] hover:bg-[#ede7da] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div>
              {title && (
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0f2e1d] tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#4b6151] mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Button */}
          <div className="flex items-center gap-3">
            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#144229] text-white hover:bg-[#0f2e1d] rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-[#0e2a1b] text-[#e3ece5] p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#1b4a30]">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#257a4d] text-white shadow-sm">
                    <Sprout size={18} />
                  </span>
                  <span className="font-serif font-bold text-lg text-white">
                    Grow<span className="text-[#64b584] font-sans">AI</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-[#bed4c5] hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="py-5 space-y-1" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1a472d] text-white font-semibold'
                          : 'text-[#bed4c5] hover:bg-[#143824] hover:text-white'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#64b584]' : 'text-[#86aa91]'} />
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
                className="block text-center py-2 text-[#bed4c5] hover:text-white font-medium"
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
