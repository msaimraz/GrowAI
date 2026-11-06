'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sun,
  Clock,
  Bug,
  FlaskConical,
  ShieldAlert,
  FileText,
  Check,
} from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  friendlySubtitle: string;
  icon: typeof Compass;
  badge?: string;
}

export const SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Plant Overview',
    friendlySubtitle: 'Meet your plant and discover what makes it special',
    icon: Compass,
  },
  {
    id: 'growing-guide',
    label: 'Growing Guide',
    friendlySubtitle: 'Learn how much sunlight, water and space your plant needs',
    icon: Sun,
  },
  {
    id: 'timeline',
    label: 'Growth Timeline',
    friendlySubtitle: 'See how your plant grows from its earliest stage to harvest',
    icon: Clock,
  },
  {
    id: 'care-problems',
    label: 'Plant Problems & Care',
    friendlySubtitle: 'Spot common problems and learn how to care for your plant',
    icon: Bug,
  },
  {
    id: 'medicinal-profile',
    label: 'Medicinal Properties',
    friendlySubtitle: 'Discover the natural compounds researchers study in this plant',
    icon: FlaskConical,
    badge: 'Science',
  },
  {
    id: 'safety-toxicity',
    label: 'Safety & Toxicity',
    friendlySubtitle: 'Important things to know before handling or consuming this plant',
    icon: ShieldAlert,
  },
  {
    id: 'references',
    label: 'Scientific References',
    friendlySubtitle: 'Explore the research and trusted sources behind this information',
    icon: FileText,
  },
];

interface PlantSectionNavProps {
  exploredCount?: number;
  totalSections?: number;
}

export function PlantSectionNav({
  exploredCount = 0,
  totalSections = SECTIONS.length,
}: PlantSectionNavProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const railRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Active section tracking via scroll
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

  // When active section changes, ensure active tab is visible in the scrollable rail
  useEffect(() => {
    if (activeTabRef.current && railRef.current) {
      const rail = railRef.current;
      const tab = activeTabRef.current;
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      const railScrollLeft = rail.scrollLeft;
      const railWidth = rail.clientWidth;

      if (tabLeft < railScrollLeft) {
        rail.scrollTo({ left: tabLeft - 16, behavior: 'smooth' });
      } else if (tabRight > railScrollLeft + railWidth) {
        rail.scrollTo({ left: tabRight - railWidth + 16, behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // accounts for top header + sticky nav bar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }
  };

  return (
    <nav
      aria-label="Plant profile navigation"
      className="sticky top-[61px] z-20 bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#ded5c5] py-2 px-3 sm:px-6 shadow-2xs w-full max-w-full overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 w-full min-w-0">
        {/* Horizontally scrollable tab rail on mobile/tablet, horizontal flex on desktop */}
        <div
          ref={railRef}
          role="tablist"
          aria-label="Plant Sections"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 w-full min-w-0 flex-nowrap scroll-smooth -mx-1 px-1 lg:flex-wrap"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                ref={isActive ? activeTabRef : null}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-[#144229] text-white shadow-xs font-bold ring-1 ring-[#144229]'
                    : 'bg-white/90 text-[#2e4435] border border-[#ded5c5] hover:bg-white hover:text-[#071c11]'
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-[#86efac]' : 'text-[#3d7a5a]'}
                />
                <span>{sec.label}</span>
                {sec.badge && (
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#205e3b] text-white'
                        : 'bg-[#eef5ee] text-[#144229]'
                    }`}
                  >
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick learning progress indicator on desktop */}
        {exploredCount > 0 && (
          <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-[#144229] bg-[#eef5ee] px-3 py-1.5 rounded-xl border border-[#cfe0cf] shrink-0">
            <Check size={14} />
            <span>
              {exploredCount} of {totalSections} Explored
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
