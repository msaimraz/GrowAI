import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Sprout, ShieldCheck, HeartHandshake, BookOpen, Layers, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#e2dcce] bg-[#f4f1e6] text-[#2c3d30] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#4b6151] leading-relaxed">
              Empowering home gardeners and urban vertical farming enthusiasts with accurate agronomic guidance, growth tracking, and sustainable 3R practices.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#526a57] pt-2">
              <span className="w-2 h-2 rounded-full bg-[#1b5837] animate-pulse" />
              <span>Independent botanical knowledge engine</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229] mb-4">
              Gardening Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/app" className="hover:text-[#144229] transition-colors flex items-center gap-2">
                  <Sprout size={14} className="text-[#1b5837]" />
                  Grower Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/plants" className="hover:text-[#144229] transition-colors flex items-center gap-2">
                  <BookOpen size={14} className="text-[#1b5837]" />
                  Curated Plant Library
                </Link>
              </li>
              <li>
                <Link href="/app/my-garden" className="hover:text-[#144229] transition-colors flex items-center gap-2">
                  <HeartHandshake size={14} className="text-[#1b5837]" />
                  Growth Tracker & Log
                </Link>
              </li>
              <li>
                <Link href="/app/planner" className="hover:text-[#144229] transition-colors flex items-center gap-2">
                  <Layers size={14} className="text-[#1b5837]" />
                  Vertical Rack Planner
                </Link>
              </li>
              <li>
                <Link href="/app/ai-doctor" className="hover:text-[#144229] transition-colors flex items-center gap-2">
                  <Sparkles size={14} className="text-[#1b5837]" />
                  AI Plant Doctor (Demo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Education & Sustainability */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229] mb-4">
              Sustainability & 3Rs
            </h4>
            <ul className="space-y-2.5 text-sm text-[#3d5242]">
              <li>
                <Link href="/app/learn#lifecycle" className="hover:text-[#144229] transition-colors">
                  Plant Life Cycle Essentials
                </Link>
              </li>
              <li>
                <Link href="/app/learn#reduce" className="hover:text-[#144229] transition-colors">
                  Reduce: Precision Water Use
                </Link>
              </li>
              <li>
                <Link href="/app/learn#reuse" className="hover:text-[#144229] transition-colors">
                  Reuse: Upcycled Container Planters
                </Link>
              </li>
              <li>
                <Link href="/app/learn#recycle" className="hover:text-[#144229] transition-colors">
                  Recycle: Home Balcony Composting
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Scientific Integrity */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229] mb-4">
              Editorial Standards
            </h4>
            <div className="bg-[#e8e2d4] p-4 rounded-xl border border-[#ded5c4] space-y-2.5 text-xs text-[#3a4d3e]">
              <div className="flex items-center gap-1.5 font-semibold text-[#144229]">
                <ShieldCheck size={16} />
                <span>Evidence-Based Botany</span>
              </div>
              <p className="leading-relaxed">
                Timelines, temperature zones, and care requirements are cross-referenced with university agricultural extension research and peer-reviewed horticulture.
              </p>
              <div className="pt-1 text-[11px] text-[#556d5b]">
                PWA installation and offline caching will become available in Phase 2.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#ded5c4] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#526a57]">
          <p>© 2026 GrowAI. All rights reserved. Built for home and vertical farming growers.</p>
          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-[#144229] transition-colors">
              Privacy Policy (Placeholder)
            </span>
            <span className="cursor-pointer hover:text-[#144229] transition-colors">
              Terms of Service (Placeholder)
            </span>
            <span className="cursor-pointer hover:text-[#144229] transition-colors">
              Botany Data Sources
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
