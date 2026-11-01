'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sprout, Library, Layers, Sparkles, BookOpen } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { label: 'Home', href: '/app', icon: LayoutDashboard, exact: true },
    { label: 'Garden', href: '/app/my-garden', icon: Sprout },
    { label: 'Plants', href: '/app/plants', icon: Library },
    { label: 'Planner', href: '/app/planner', icon: Layers },
    { label: 'AI Doctor', href: '/app/ai-doctor', icon: Sparkles },
    { label: 'Learn', href: '/app/learn', icon: BookOpen },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d2a1b]/95 backdrop-blur-md border-t border-[#1a4b30] text-[#e3ece5] px-1 py-1 shadow-lg select-none"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'text-[#86efac] font-bold'
                  : 'text-[#9dc2a8] hover:text-white'
              }`}
            >
              <span
                className={`p-1 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[#1e663f]/50' : ''
                }`}
              >
                <Icon size={19} className={isActive ? 'text-[#86efac] stroke-[2.3]' : 'stroke-[1.8]'} />
              </span>
              <span className="mt-0.5 tracking-tight text-[10px] sm:text-[11px] leading-tight truncate">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

