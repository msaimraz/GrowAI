'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sprout,
  Library,
  ClipboardList,
  MoreHorizontal,
  Sparkles,
  Layers,
  Compass,
  BookOpen,
  X,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks = [
    { label: 'Home', href: '/app', icon: LayoutDashboard, exact: true },
    { label: 'Plants', href: '/app/plants', icon: Library },
    { label: 'Garden', href: '/app/my-garden', icon: Sprout },
    { label: 'Plans', href: '/app/grow-plans', icon: ClipboardList },
  ];

  const moreLinks = [
    { label: 'Plant Check', href: '/app/ai-doctor', icon: Sparkles, desc: 'Photo symptoms & advice' },
    { label: 'Space Planner', href: '/app/planner', icon: Layers, desc: 'Design vertical tiers' },
    { label: 'Grow Intelligence', href: '/app/grow-intelligence', icon: Compass, desc: 'Ask Copilot' },
    { label: 'Learn & Botanical Guide', href: '/app/learn', icon: BookOpen, desc: 'Growing guides & quiz' },
  ];

  const isMoreActive = moreLinks.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`)
  );

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F4]/95 backdrop-blur-md border-t border-[#E8E4DA] text-[#1F2A23] px-2 py-1 shadow-lg select-none"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-[#174C35] font-bold'
                    : 'text-[#68736B] hover:text-[#1F2A23]'
                }`}
              >
                <span
                  className={`p-1 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#E6F0E3]' : ''
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-[#174C35] stroke-[2.4]' : 'stroke-[1.8]'}
                  />
                </span>
                <span className="mt-0.5 tracking-tight text-[11px] leading-tight truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Tab: More Button */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isMoreActive || moreOpen
                ? 'text-[#174C35] font-bold'
                : 'text-[#68736B] hover:text-[#1F2A23]'
            }`}
            aria-label="Open more navigation options"
          >
            <span
              className={`p-1 rounded-lg flex items-center justify-center transition-colors ${
                isMoreActive || moreOpen ? 'bg-[#E6F0E3]' : ''
              }`}
            >
              <MoreHorizontal
                size={20}
                className={isMoreActive || moreOpen ? 'text-[#174C35] stroke-[2.4]' : 'stroke-[1.8]'}
              />
            </span>
            <span className="mt-0.5 tracking-tight text-[11px] leading-tight truncate">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up 'More' Sheet */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-[#FBF9F4] rounded-t-3xl border-t border-[#E8E4DA] p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <span className="font-serif text-lg font-bold text-[#1F2A23]">
                More Features
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#E8E4DA]/50 text-[#68736B] hover:text-[#1F2A23] cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                      isActive
                        ? 'bg-[#E6F0E3] border-[#CEE4C9] text-[#174C35]'
                        : 'bg-white border-[#E8E4DA] hover:bg-[#F3F6EC] text-[#1F2A23]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#F3F6EC] flex items-center justify-center text-[#174C35]">
                        <Icon size={20} />
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-sm leading-tight">
                          {item.label}
                        </h4>
                        <p className="text-xs text-[#68736B] mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#68736B]/60 text-xs">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
