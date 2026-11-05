'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  Library,
  DownloadCloud,
  Compass,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { canInstall, isIos, promptInstall, setShowIosInstructions } = usePwa();

  const navLinks = [
    { label: 'Plant Library', href: '/app/plants', icon: Library },
    { label: 'Grow Intelligence', href: '/app/grow-intelligence', icon: Compass },
    { label: 'Grow Plans', href: '/app/grow-plans', icon: ClipboardList },
    { label: 'AI Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Planner', href: '/app/planner', icon: Layers },
    { label: 'Learn', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#163A2A]/10 bg-[#F6F1E8]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation — Magazine Header Style */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-wider text-[#263028]/80 hover:text-[#163A2A] transition-colors py-2 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {(canInstall || isIos) && (
            <button
              type="button"
              onClick={canInstall ? promptInstall : () => setShowIosInstructions(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wide text-[#163A2A] border border-[#163A2A]/20 hover:border-[#163A2A] rounded-[4px] transition-colors cursor-pointer"
            >
              <DownloadCloud size={13} />
              <span>Install App</span>
            </button>
          )}

          {user ? (
            <Link
              href="/app"
              className="text-xs font-mono text-[#263028] hover:text-[#163A2A] px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4A]" />
              <span className="truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-mono uppercase tracking-wider text-[#263028]/80 hover:text-[#163A2A] px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#163A2A] text-[#F6F1E8] hover:bg-[#1f4e39] px-4 py-2 rounded-[4px] transition-colors"
          >
            <span>Launch App</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-[4px] text-[#263028] hover:bg-[#163A2A]/5 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#163A2A]/10 bg-[#F6F1E8] px-4 pt-4 pb-6 space-y-4">
          {(canInstall || isIos) && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (canInstall) promptInstall();
                else if (isIos) setShowIosInstructions(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[4px] border border-[#163A2A]/20 text-[#163A2A] font-mono text-xs cursor-pointer min-h-[44px]"
            >
              <DownloadCloud size={15} />
              <span>Install GrowAI Web App</span>
            </button>
          )}

          <div className="space-y-0.5 divide-y divide-[#163A2A]/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-medium text-[#263028] hover:text-[#163A2A] min-h-[44px]"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="text-[#687268]" />
                    {link.label}
                  </span>
                  <span className="text-[#687268]/40 text-xs">→</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#163A2A]/10 flex flex-col gap-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center font-medium bg-[#163A2A] text-[#F6F1E8] py-2.5 rounded-[4px] text-xs min-h-[44px]"
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/app/plants"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full text-center font-mono text-xs text-[#263028] py-2.5 rounded-[4px] border border-[#163A2A]/15 bg-transparent min-h-[44px]"
            >
              Browse 16 Curated Plants
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
