import React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F6F1E8] pt-16 pb-20 lg:pt-28 lg:pb-32 border-b border-[#163A2A]/10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Large Editorial Statement */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-6">
              <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase block">
                INTELLIGENT GROWING
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#163A2A] tracking-tight leading-[1.08]">
                Grow Smarter.
                <br />
                Grow With
                <br />
                <span className="italic font-normal">Intelligence.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#263028]/85 leading-relaxed max-w-xl font-normal">
                GrowAI brings plant knowledge, health intelligence, space planning, growth tracking, and adaptive growing plans into one system.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#163A2A] text-[#F6F1E8] hover:bg-[#1f4e39] px-6 py-3 rounded-[4px] transition-colors"
              >
                <span>Explore GrowAI</span>
                <ArrowRight size={15} />
              </Link>
              <a
                href="#system"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#163A2A] bg-transparent hover:bg-[#163A2A]/5 border border-[#163A2A]/25 px-6 py-3 rounded-[4px] transition-colors"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Understated Metadata Line with Terracotta Accents */}
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#687268] font-mono">
              <span>plant health</span>
              <span className="text-[#C86B4A]">·</span>
              <span>small-space growing</span>
              <span className="text-[#C86B4A]">·</span>
              <span>adaptive plans</span>
            </div>
          </div>

          {/* Right Column: ONE Real Product Interface — Framed Like An Object on a Desk */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-lg lg:max-w-none rounded-[6px] bg-[#FBF8F2] border border-[#163A2A]/12 shadow-[0_8px_30px_rgba(22,58,42,0.06)] p-6 sm:p-7 space-y-5">
              {/* Header Bar */}
              <div className="flex items-start justify-between pb-4 border-b border-[#163A2A]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4A]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#687268]">
                      ADAPTIVE GROW PLAN
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-[#163A2A] leading-snug">
                    Sweet Genovese Basil — Seed to Canopy
                  </h3>
                  <p className="text-xs text-[#687268] font-mono">
                    Ocimum basilicum · 3-Tier Balcony Rack · Day 18
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#163A2A] px-2 py-0.5 rounded-[2px] border border-[#163A2A]/15 bg-white">
                  Step 4 of 6
                </span>
              </div>

              {/* Step Sequence Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#687268]">
                  <span>Execution Progress</span>
                  <span className="text-[#163A2A] font-medium">66% Completed</span>
                </div>
                <div className="grid grid-cols-6 gap-1 h-1.5">
                  <div className="bg-[#163A2A] rounded-[1px]" />
                  <div className="bg-[#163A2A] rounded-[1px]" />
                  <div className="bg-[#163A2A] rounded-[1px]" />
                  <div className="bg-[#C86B4A] rounded-[1px]" />
                  <div className="bg-[#163A2A]/15 rounded-[1px]" />
                  <div className="bg-[#163A2A]/15 rounded-[1px]" />
                </div>
              </div>

              {/* Active Step Panel */}
              <div className="p-4 rounded-[4px] bg-white border border-[#163A2A]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C86B4A] font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#C86B4A]" />
                    Actionable Today
                  </span>
                  <span className="text-[10px] font-mono text-[#687268]">
                    Requires Observation
                  </span>
                </div>

                <h4 className="text-sm font-medium text-[#163A2A]">
                  Inspect Drainage Emergence & Root Health
                </h4>

                <p className="text-xs text-[#263028]/80 leading-relaxed">
                  Examine container base perforations for white root tip emergence before your scheduled afternoon bottom-watering cycle.
                </p>

                <div className="pt-2 border-t border-[#163A2A]/5 flex items-center justify-between text-[11px] font-mono text-[#687268]">
                  <span className="flex items-center gap-1 text-[#163A2A]/80">
                    <CheckCircle2 size={12} className="text-[#879B78]" />
                    Prerequisite verified
                  </span>
                  <span>Observation: Pending</span>
                </div>
              </div>

              {/* Blocked Downstream Step */}
              <div className="p-3 rounded-[4px] border border-[#163A2A]/8 bg-[#F6F1E8]/60 flex items-center justify-between text-xs text-[#687268]">
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-[#687268]/70" />
                  <span>Step 5: Secondary Foliar Branching Audit</span>
                </div>
                <span className="text-[10px] font-mono">Blocked</span>
              </div>

              {/* Card Footer Provenance */}
              <div className="pt-2 border-t border-[#163A2A]/10 flex items-center justify-between text-xs">
                <span className="text-[#687268] font-mono text-[11px]">
                  Cross-referenced with microclimate sensor #2
                </span>
                <Link
                  href="/app/grow-plans"
                  className="text-xs font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors"
                >
                  View Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
