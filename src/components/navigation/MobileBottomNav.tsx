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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e2a1b] border-t border-[#19402a] text-[#e3ece5] px-2 py-1.5 shadow-lg select-none"
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
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#64b584] font-semibold'
                  : 'text-[#88a992] hover:text-white'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-[#64b584] stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
