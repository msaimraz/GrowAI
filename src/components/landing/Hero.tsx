import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Sprout, Layers, ShieldCheck, Sun, Droplets, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbf9f4] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#e5dfd3]">
      {/* Subtle Botanical Pattern */}
      <div className="absolute inset-0 bg-botanical-pattern opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="sage" size="md">
                <Sparkles size={13} className="text-[#1b5837]" />
                Next-Gen Home Horticulture
              </Badge>
              <span className="text-xs font-medium text-[#4a6b52]">
                16 Curated Balcony & Vertical Species
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#0c2417] tracking-tight leading-[1.12]">
              Grow Smarter.{' '}
              <span className="italic font-normal text-[#1e613b] underline decoration-[#9ac4a6] decoration-wavy decoration-1 underline-offset-8">
                Grow Greener.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#394f3f] leading-relaxed max-w-2xl font-normal">
              Empowering home growers, balcony farmers, and indoor enthusiasts with precision botanical guidance, tiered vertical rack planning, and sustainable 3R practices.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold bg-[#144229] text-[#f4f8f4] hover:bg-[#0c2417] px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore GrowAI</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/app/plants"
                className="inline-flex items-center justify-center gap-2 text-base font-medium text-[#1b5837] hover:text-[#0c2417] bg-white hover:bg-[#f3eee4] px-6 py-3.5 rounded-xl border border-[#cfdfcf] shadow-xs transition-colors"
              >
                <Sprout size={18} />
                <span>Discover Your First Plant</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="pt-6 border-t border-[#e5dfd3]/80 grid grid-cols-3 gap-4 text-xs text-[#4b6652]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#1e613b] shrink-0" />
                <span className="font-medium">Evidence-Based Botany</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#1e613b] shrink-0" />
                <span className="font-medium">Space-Efficient Racks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#1e613b] shrink-0" />
                <span className="font-medium">Zero Waste 3Rs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Vertical Garden Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-white p-6 shadow-xl border border-[#ded5c5]">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#1b5837]" />
                  <span className="font-serif font-bold text-sm text-[#0f2e1d]">
                    Balcony Vertical Tier 01
                  </span>
                </div>
                <Badge variant="sage" size="sm">Optimal Exposure</Badge>
              </div>

              {/* Tier Visual Representation */}
              <div className="py-4 space-y-3">
                {/* Top Tier */}
                <div className="bg-[#f7f5ed] p-3.5 rounded-xl border border-[#e2dbce] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0f2e1d] flex items-center gap-1.5">
                      <Sun size={13} className="text-[#c77712]" />
                      Top Tier: High Light (6+ hrs)
                    </span>
                    <span className="text-[11px] font-medium text-[#1b5837]">Warmest</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#324536]">
                    <div className="bg-white p-2 rounded-lg border border-[#e2dcce]">
                      <p className="font-medium text-[#0f2e1d]">Bush Roma Tomato</p>
                      <p className="text-[11px] text-[#698570]">Day 42 • Flowering</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#e2dcce]">
                      <p className="font-medium text-[#0f2e1d]">Genovese Basil</p>
                      <p className="text-[11px] text-[#698570]">Day 24 • Bushy</p>
                    </div>
                  </div>
                </div>

                {/* Middle Tier */}
                <div className="bg-[#eef5ee] p-3.5 rounded-xl border border-[#cfe0cf] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0f2e1d] flex items-center gap-1.5">
                      <Layers size={13} className="text-[#1b5837]" />
                      Middle Tier: Filtered Sunlight (4 hrs)
                    </span>
                    <span className="text-[11px] font-medium text-[#1b5837]">Ideal Greens</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#324536]">
                    <div className="bg-white p-2 rounded-lg border border-[#cfe0cf]">
                      <p className="font-medium text-[#0f2e1d]">Butterhead Lettuce</p>
                      <p className="text-[11px] text-[#257a4d]">Ready for harvest</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#cfe0cf]">
                      <p className="font-medium text-[#0f2e1d]">Spearmint</p>
                      <p className="text-[11px] text-[#257a4d]">Vigorous growth</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Tier */}
                <div className="bg-[#f3efe6] p-3.5 rounded-xl border border-[#ded4c3] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0f2e1d] flex items-center gap-1.5">
                      <Droplets size={13} className="text-[#3b82f6]" />
                      Bottom Tier: Runoff Capture & Shade
                    </span>
                    <span className="text-[11px] font-medium text-[#6c5940]">Root Stability</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#324536]">
                    <div className="bg-white p-2 rounded-lg border border-[#ded4c3]">
                      <p className="font-medium text-[#0f2e1d]">French Radish</p>
                      <p className="text-[11px] text-[#715c44]">Day 18 of 25</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#ded4c3]">
                      <p className="font-medium text-[#0f2e1d]">Snake Plant</p>
                      <p className="text-[11px] text-[#715c44]">Low maintenance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Badge */}
              <div className="pt-3 border-t border-[#f0ebe0] flex items-center justify-between text-xs text-[#526a57]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-[#1e613b]" />
                  Calculated Rack Balance: 100% Stable
                </span>
                <Link
                  href="/app/planner"
                  className="font-semibold text-[#144229] hover:underline"
                >
                  Configure Rack →
                </Link>
              </div>
            </div>

            {/* Floating Decorative Pill */}
            <div className="absolute -bottom-4 -left-4 bg-[#0e2a1b] text-white p-3 rounded-xl shadow-lg border border-[#1e5235] hidden sm:flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#257a4d] flex items-center justify-center text-white">
                <Sprout size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold">Track Real Growth</p>
                <p className="text-[11px] text-[#9fc2aa]">Seed to harvest timelines</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
