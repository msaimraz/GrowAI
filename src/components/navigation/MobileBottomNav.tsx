'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sprout, Library, Layers, Sparkles } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard, exact: true },
    { label: 'My Garden', href: '/app/my-garden', icon: Sprout },
    { label: 'Plants', href: '/app/plants', icon: Library },
    { label: 'Planner', href: '/app/planner', icon: Layers },
    { label: 'AI Doctor', href: '/app/ai-doctor', icon: Sparkles },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e2a1b] border-t border-[#19402a] text-[#e3ece5] px-2 py-1 shadow-lg select-none"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-h-[48px] px-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#72cf95] font-semibold'
                  : 'text-[#a3c4ad] hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#72cf95] stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="mt-1 tracking-tight text-[11px] sm:text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
