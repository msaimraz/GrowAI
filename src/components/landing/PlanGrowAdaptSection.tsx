import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export function PlanGrowAdaptSection() {
  return (
    <section className="py-20 lg:py-32 bg-[#FBF8F2] border-b border-[#163A2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-16 lg:mb-20 space-y-4">
          <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase block">
            THE CULTIVATION ARC
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#163A2A] tracking-tight leading-tight">
            Plan. Grow.{' '}
            <span className="italic font-normal">Adapt.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#263028]/80 leading-relaxed font-normal">
            GrowAI connects the full arc of cultivation. You begin with spatial constraints and structured plans, track reality as it develops, and adapt automatically when weather or plant health shifts.
          </p>
        </div>

        {/* Three Editorial Columns Divided by Thin Vertical Rules — No Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#163A2A]/10 pb-16 lg:pb-20">
          {/* Column 01: PLAN */}
          <div className="py-8 md:py-0 md:pr-10 lg:pr-12 space-y-4">
            <span className="font-serif text-3xl sm:text-4xl text-[#163A2A]/30 block">
              01
            </span>
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
                PLAN
              </h3>
              <p className="font-serif text-xl text-[#163A2A] leading-snug">
                Plan your space and your goals.
              </p>
              <p className="text-sm text-[#263028]/80 leading-relaxed font-sans pt-1">
                Map plant requirements across vertical tiers and define structured, multi-step grow goals before planting a single seed.
              </p>
            </div>
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors pt-2"
            >
              <span>Space Planner</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Column 02: GROW */}
          <div className="py-8 md:py-0 md:px-10 lg:px-12 space-y-4">
            <span className="font-serif text-3xl sm:text-4xl text-[#163A2A]/30 block">
              02
            </span>
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
                GROW
              </h3>
              <p className="font-serif text-xl text-[#163A2A] leading-snug">
                Track what actually happens.
              </p>
              <p className="text-sm text-[#263028]/80 leading-relaxed font-sans pt-1">
                Log growth milestones, base watering schedules, NPK feeding formulations, and longitudinal photo progress over time.
              </p>
            </div>
            <Link
              href="/app/my-garden"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors pt-2"
            >
              <span>Garden Journal</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Column 03: ADAPT */}
          <div className="py-8 md:py-0 md:pl-10 lg:pl-12 space-y-4">
            <span className="font-serif text-3xl sm:text-4xl text-[#C86B4A]/60 block">
              03
            </span>
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#163A2A] font-semibold">
                ADAPT
              </h3>
              <p className="font-serif text-xl text-[#163A2A] leading-snug">
                Respond as your garden changes.
              </p>
              <p className="text-sm text-[#263028]/80 leading-relaxed font-sans pt-1">
                When ambient heat waves spike or foliar symptoms emerge, step dependencies and target dates recalibrate seamlessly.
              </p>
            </div>
            <Link
              href="/app/grow-plans"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors pt-2"
            >
              <span>Adaptive Plans</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ONE Real Product UI — Natural Crop Below Columns */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[6px] bg-white border border-[#163A2A]/12 shadow-[0_8px_30px_rgba(22,58,42,0.06)] p-6 sm:p-8 space-y-5">
            {/* Top Bar of Real UI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#163A2A]/10 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#687268] block">
                  LIVE ADAPTIVE ENGINE
                </span>
                <h4 className="font-serif text-base text-[#163A2A] mt-0.5">
                  Plan Recalibration Triggered: High Microclimate Heat Spike
                </h4>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4A]" />
                <span className="text-xs font-mono text-[#C86B4A] font-medium">
                  Dynamic Adjustment Applied
                </span>
              </div>
            </div>

            {/* Recalibration Event Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-3.5 rounded-[4px] bg-[#F6F1E8]/70 border border-[#163A2A]/8 space-y-1">
                <span className="text-[10px] font-mono text-[#687268] uppercase block">
                  Observed Shift
                </span>
                <p className="font-medium text-[#163A2A]">
                  Balcony Sensor #1 recorded 29.4°C (Threshold 28°C)
                </p>
                <p className="text-[#687268] text-[11px] leading-relaxed">
                  Evapotranspiration acceleration detected for Sweet Basil canopy on Tier 1.
                </p>
              </div>

              <div className="p-3.5 rounded-[4px] bg-white border border-[#163A2A]/10 space-y-1">
                <span className="text-[10px] font-mono text-[#C86B4A] uppercase block font-semibold">
                  Adaptive Response
                </span>
                <p className="font-medium text-[#163A2A]">
                  Shifted Step 4 watering + Inserted Shade Cloth Step
                </p>
                <p className="text-[#687268] text-[11px] leading-relaxed">
                  Next watering window brought forward by 18 hours to prevent midday wilting.
                </p>
              </div>
            </div>

            {/* Provenance Line */}
            <div className="pt-2 border-t border-[#163A2A]/5 flex items-center justify-between text-[11px] font-mono text-[#687268]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#879B78]" />
                Deterministic adjustment without disrupting botanical safety limits
              </span>
              <span className="text-[#163A2A]">Adaptive Version 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
