import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-[#ded5c5]">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed max-w-sm pt-1">
              A calm botanical workspace connecting plant knowledge, garden planning, health tracking, and growing guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6d8573] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#144229]" />
              <span>Calibrated for small spaces, containers & balconies</span>
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#144229] font-bold">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#526a57]">
              <li>
                <Link href="/app/plants" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Plant Library
                </Link>
              </li>
              <li>
                <Link href="/app/grow-plans" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Grow Plans
                </Link>
              </li>
              <li>
                <Link href="/app/grow-intelligence" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Grow Intelligence
                </Link>
              </li>
              <li>
                <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Learn & Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#144229] font-bold">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#526a57]">
              <li>
                <Link href="/app/my-garden" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  My Garden
                </Link>
              </li>
              <li>
                <Link href="/app/ai-doctor" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Plant Check
                </Link>
              </li>
              <li>
                <Link href="/app/planner" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Space Planner
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Launch App
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#144229] font-bold">
              Standards
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#526a57]">
              <li>
                <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Plant Safety
                </Link>
              </li>
              <li>
                <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Evidence & Sources
                </Link>
              </li>
              <li>
                <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors block py-0.5">
                  Organic Methods
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6d8573]">
          <p>GrowAI © 2026. Built for home and small-space growers.</p>
          <div className="flex items-center gap-5">
            <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors">
              Privacy
            </Link>
            <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors">
              Terms
            </Link>
            <Link href="/app/learn" className="hover:text-[#0c2417] transition-colors">
              Botanical Sources
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
