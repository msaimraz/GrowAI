import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#163A2A]/10 bg-[#F6F1E8] text-[#263028] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-[#163A2A]/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#687268] leading-relaxed max-w-sm font-sans">
              An intelligent cultivation platform combining botanical rigor, small-space vertical planning, longitudinal growth tracking, and adaptive execution.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#687268] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4A]" />
              <span>Evidence-grounded agronomic parameters</span>
            </div>
          </div>

          {/* Growing Platform */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
              Growing Platform
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#687268]">
              <li>
                <Link href="/app" className="hover:text-[#163A2A] transition-colors block">
                  Grower Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/plants" className="hover:text-[#163A2A] transition-colors block">
                  Botanical Catalog
                </Link>
              </li>
              <li>
                <Link href="/app/planner" className="hover:text-[#163A2A] transition-colors block">
                  Space & Rack Planner
                </Link>
              </li>
              <li>
                <Link href="/app/grow-plans" className="hover:text-[#163A2A] transition-colors block">
                  Adaptive Grow Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Intelligence Systems */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#687268]">
              <li>
                <Link href="/app/grow-intelligence" className="hover:text-[#163A2A] transition-colors block">
                  Grower Copilot
                </Link>
              </li>
              <li>
                <Link href="/app/ai-doctor" className="hover:text-[#163A2A] transition-colors block">
                  AI Plant Doctor
                </Link>
              </li>
              <li>
                <Link href="/app/my-garden" className="hover:text-[#163A2A] transition-colors block">
                  Plant Timelines & Health
                </Link>
              </li>
              <li>
                <Link href="/app/grow-intelligence" className="hover:text-[#163A2A] transition-colors block">
                  Harvests & Lineage
                </Link>
              </li>
            </ul>
          </div>

          {/* Philosophy & Botanical Science */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
              Botanical Standard
            </h4>
            <p className="text-xs text-[#687268] leading-relaxed">
              Every parameter is calibrated for containers, balconies, and vertical systems. We believe in observation-first growing without synthetic shortcuts.
            </p>
            <div className="pt-1 text-[11px] font-mono text-[#879B78]">
              Closed-Loop 3Rs · Zero Fabricated Yields
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#687268]/70">
          <p>© 2026 GrowAI Botanical Systems. Built for small-space growers.</p>
          <div className="flex items-center gap-6">
            <Link href="/app/learn" className="hover:text-[#163A2A] transition-colors">
              Agronomic Index
            </Link>
            <Link href="/app/plants" className="hover:text-[#163A2A] transition-colors">
              Species Index
            </Link>
            <span>v2.4 Editorial</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
