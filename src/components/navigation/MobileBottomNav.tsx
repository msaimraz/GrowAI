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

  React.useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMoreOpen(false);
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
  }, [moreOpen]);

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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6EE]/95 backdrop-blur-md border-t border-[#E3DFD2] text-[#203027] px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-lg select-none"
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
                className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl text-xs font-medium transition-all duration-75 active:scale-95 active:opacity-75 select-none touch-manipulation cursor-pointer ${
                  isActive
                    ? 'text-[#174C35] font-bold'
                    : 'text-[#5F6D63] hover:text-[#203027]'
                }`}
              >
                <span
                  className={`p-1 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#EAF1E4]' : ''
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
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl text-xs font-medium transition-all duration-75 active:scale-95 active:opacity-75 select-none touch-manipulation cursor-pointer ${
              isMoreActive || moreOpen
                ? 'text-[#174C35] font-bold'
                : 'text-[#5F6D63] hover:text-[#203027]'
            }`}
            aria-label="Open more navigation options"
          >
            <span
              className={`p-1 rounded-lg flex items-center justify-center transition-colors ${
                isMoreActive || moreOpen ? 'bg-[#EAF1E4]' : ''
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
          <div role="dialog"
            aria-modal="true"
            aria-label="More Features"
            className="relative bg-[#F8F6EE] rounded-t-3xl border-t border-[#E3DFD2] p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 ease-out">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
              <span className="font-serif text-lg font-bold text-[#203027]">
                More Features
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-xl text-[#5F6D63] hover:text-[#203027] hover:bg-[#E3DFD2]/50 active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer select-none touch-manipulation transition-all duration-75"
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
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-75 active:scale-[0.98] active:bg-[#EAF1E4]/70 select-none touch-manipulation cursor-pointer ${
                      isActive
                        ? 'bg-[#EAF1E4] border-[#78A95A]/35 text-[#174C35]'
                        : 'bg-white border-[#E3DFD2] hover:bg-[#EAF1E4] text-[#203027]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#EAF1E4] flex items-center justify-center text-[#174C35]">
                        <Icon size={20} />
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-sm leading-tight">
                          {item.label}
                        </h4>
                        <p className="text-xs text-[#5F6D63] mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#5F6D63]/60 text-xs">→</span>
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
