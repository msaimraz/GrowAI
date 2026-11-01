'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sun,
  Clock,
  Bug,
  FlaskConical,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: typeof Compass;
  badge?: string;
}

const SECTIONS: NavSection[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'growing-guide', label: 'Growing Guide', icon: Sun },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'care-problems', label: 'Care & Problems', icon: Bug },
  { id: 'medicinal-profile', label: 'Medicinal Profile', icon: FlaskConical, badge: 'Evidence' },
  { id: 'safety-toxicity', label: 'Safety & Toxicology', icon: ShieldAlert },
  { id: 'references', label: 'References', icon: FileText },
];

export function PlantSectionNav() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(SECTIONS[i].id);
        if (sectionEl && sectionEl.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      aria-label="Plant profile sections"
      className="sticky top-[61px] z-10 bg-[#fbf9f4]/90 backdrop-blur-md border-b border-[#ded5c5] py-2.5 px-4 sm:px-6 transition-all shadow-2xs"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 w-full sm:w-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'bg-white/80 text-[#2e4435] border border-[#ded5c5] hover:bg-white hover:text-[#071c11]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#86efac]' : 'text-[#3d7a5a]'} />
                <span>{sec.label}</span>
                {sec.badge && (
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#205e3b] text-white' : 'bg-[#eef5ee] text-[#144229]'
                    }`}
                  >
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
