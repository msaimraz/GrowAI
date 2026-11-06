'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
  Menu,
  X,
  ArrowRight,
  Library,
  Compass,
  ClipboardList,
  BookOpen,
  DownloadCloud,
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
    { label: 'Learn', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ded5c5] bg-[#fbf9f4]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: GrowAI Logo */}
        <div className="shrink-0">
          <Logo size="md" />
        </div>

        {/* Center/Left: Editorial Product Navigation */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8"
          aria-label="Main product navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-medium text-[#526a57] hover:text-[#0c2417] transition-colors py-2 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {(canInstall || isIos) && (
            <button
              type="button"
              onClick={canInstall ? promptInstall : () => setShowIosInstructions(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#144229] hover:bg-[#eef5ee] border border-[#cfdfcf] rounded-xl transition-colors cursor-pointer min-h-[36px]"
              aria-label="Install GrowAI App"
            >
              <DownloadCloud size={13} />
              <span>Install App</span>
            </button>
          )}

          {user ? (
            <Link
              href="/app"
              className="text-xs font-medium text-[#526a57] hover:text-[#0c2417] px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#257a4d]" />
              <span className="truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-medium text-[#526a57] hover:text-[#0c2417] px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-[#144229] text-white hover:bg-[#071c11] px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer min-h-[38px]"
          >
            <span>Launch App</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-xs font-semibold bg-[#144229] text-white px-3 py-1.5 rounded-xl min-h-[38px]"
          >
            <span>Launch</span>
            <ArrowRight size={12} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#0c2417] hover:bg-[#eef5ee] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ded5c5] bg-[#fbf9f4] px-4 pt-3 pb-5 space-y-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium text-[#0c2417] hover:bg-[#eef5ee] min-h-[44px]"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="text-[#144229]" />
                    {link.label}
                  </span>
                  <span className="text-[#6d8573] text-xs">→</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#ded5c5] space-y-2">
            {(canInstall || isIos) && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (canInstall) promptInstall();
                  else if (isIos) setShowIosInstructions(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#cfe0cf] bg-white text-[#144229] text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                <DownloadCloud size={14} />
                <span>Install GrowAI App</span>
              </button>
            )}

            {!user && (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs font-semibold py-2 text-[#526a57] hover:text-[#0c2417] min-h-[40px] flex items-center justify-center"
              >
                Sign In to Your Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
