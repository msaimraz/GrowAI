'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Menu, X, ArrowRight, Sparkles, BookOpen, Layers, Library, DownloadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { canInstall, isIos, promptInstall, setShowIosInstructions } = usePwa();

  const navLinks = [
    { label: 'Plant Library', href: '/app/plants', icon: Library },
    { label: 'AI Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Vertical Planner', href: '/app/planner', icon: Layers },
    { label: 'Sustainability & Learn', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e6ded2] bg-[#fbf9f4]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#2d4032] hover:text-[#144229] transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-[#eef5ee] text-[#144229] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl transition-all cursor-pointer min-h-[40px]"
            >
              <DownloadCloud size={16} />
              <span>Install App</span>
            </button>
          )}

          {isIos && (
            <button
              type="button"
              onClick={() => setShowIosInstructions(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-[#eef5ee] text-[#144229] hover:bg-[#dfeadf] border border-[#cfe0cf] rounded-xl transition-all cursor-pointer min-h-[40px]"
            >
              <DownloadCloud size={16} />
              <span>Install App</span>
            </button>
          )}

          {user ? (
            <Link
              href="/app"
              className="text-sm font-medium text-[#1b5837] hover:text-[#0f2e1d] px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <span className="w-2 h-2 rounded-full bg-[#1b5837]" />
              <span>{user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#1b5837] hover:text-[#0f2e1d] px-3.5 py-2 rounded-lg transition-colors min-h-[40px] flex items-center"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] text-[#f4f8f4] hover:bg-[#0f2e1d] px-5 py-2.5 rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
          >
            Launch App
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl text-[#1c261e] hover:bg-[#eee8dc] focus:outline-none focus:ring-2 focus:ring-[#1b5837] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e6ded2] bg-[#fbf9f4] px-4 pt-3 pb-6 space-y-4">
          {(canInstall || isIos) && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (canInstall) promptInstall();
                else if (isIos) setShowIosInstructions(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#257a4d] text-white font-semibold text-sm shadow-xs cursor-pointer min-h-[44px]"
            >
              <DownloadCloud size={18} />
              <span>Install GrowAI Web App</span>
            </button>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-medium text-[#1c261e] hover:bg-[#eee8dc] min-h-[44px]"
                >
                  <Icon size={19} className="text-[#1b5837]" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[#e6ded2] flex flex-col gap-2.5">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center font-semibold bg-[#144229] text-[#f4f8f4] py-3 rounded-xl shadow-xs min-h-[44px]"
            >
              Launch Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/app/plants"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full text-center font-medium text-[#1b5837] py-3 rounded-xl border border-[#cfdfcf] bg-white min-h-[44px]"
            >
              Browse 16 Curated Plants
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
