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
  ChevronDown,
  ChevronUp,
  Check,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard navigation: Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Click outside listener for mobile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
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

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const CurrentIcon = currentSection.icon;

  return (
    <nav
      aria-label="Plant profile navigation"
      className="sticky top-[61px] z-20 bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#ded5c5] py-2 px-4 sm:px-6 transition-all shadow-2xs"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* =========================================================
            MOBILE CONTROL: "Explore this Plant" Dropdown (< md)
        ========================================================= */}
        <div className="md:hidden w-full relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-haspopup="true"
            aria-controls="mobile-section-menu"
            className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs flex items-center justify-between gap-2.5 text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-center text-[#144229] shrink-0">
                <CurrentIcon size={17} />
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#144229] block">
                  Explore this Plant
                </span>
                <span className="text-sm font-serif font-bold text-[#071c11] block truncate">
                  {currentSection.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[#144229]">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f4f8f4] border border-[#cfdfcf]">
                7 Sections
              </span>
              {isMobileMenuOpen ? (
                <X size={18} className="text-[#144229]" />
              ) : (
                <ChevronDown size={18} className="text-[#144229] transition-transform duration-200" />
              )}
            </div>
          </button>

          {/* Mobile Vertical Dropdown Menu */}
          {isMobileMenuOpen && (
            <>
              {/* Subtle backdrop to close when tapping outside */}
              <div
                className="fixed inset-0 bg-black/25 z-30"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              <div
                ref={menuRef}
                id="mobile-section-menu"
                role="menu"
                aria-label="Plant profile sections"
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border-2 border-[#144229]/20 shadow-xl p-2.5 z-40 space-y-1 max-h-[75vh] overflow-y-auto animate-fadeIn"
              >
                <div className="px-3 py-2 border-b border-[#f0ebe0] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#144229]">
                    Jump to Section
                  </span>
                  <span className="text-xs text-[#5a7662]">
                    Tap any topic below
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  {SECTIONS.map((sec, index) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;

                    return (
                      <button
                        key={sec.id}
                        role="menuitem"
                        type="button"
                        onClick={() => scrollTo(sec.id)}
                        className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#144229] text-white shadow-xs font-semibold'
                            : 'hover:bg-[#f7f5ed] text-[#1c261e]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#f4f8f4] text-[#144229] border border-[#cfe0cf]'
                            }`}
                          >
                            <Icon size={17} />
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold truncate">
                                {index + 1}. {sec.label}
                              </span>
                              {sec.badge && (
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                                    isActive
                                      ? 'bg-[#205e3b] text-white'
                                      : 'bg-[#eef5ee] text-[#144229]'
                                  }`}
                                >
                                  {sec.badge}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-xs block truncate ${
                                isActive ? 'text-[#cce4cc]' : 'text-[#5a7662]'
                              }`}
                            >
                              {sec.friendlySubtitle}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* =========================================================
            DESKTOP CONTROL: Horizontal Sticky Pill Bar (≥ md)
        ========================================================= */}
        <div className="hidden md:flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollTo(sec.id)}
                  className={`min-h-[44px] px-3.5 lg:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#144229] text-white shadow-xs'
                      : 'bg-white/80 text-[#2e4435] border border-[#ded5c5] hover:bg-white hover:text-[#071c11]'
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

          {/* Quick learning progress indicator */}
          {exploredCount > 0 && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#144229] bg-[#eef5ee] px-3 py-1.5 rounded-xl border border-[#cfe0cf] shrink-0">
              <Check size={14} />
              <span>
                {exploredCount} of {totalSections} Explored
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
