import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sun, Droplets, Maximize2 } from 'lucide-react';

export function SmallSpacePlannerSection() {
  return (
    <section className="py-20 lg:py-32 bg-[#F6F1E8] border-b border-[#163A2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 lg:mb-20">
          <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase block">
            SPATIAL ARCHITECTURE
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#163A2A] tracking-tight leading-tight">
            Every Square Foot{' '}
            <span className="italic font-normal">Has a Job.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#263028]/80 leading-relaxed font-normal">
            Vertical growing turns tight balconies and windowsills into productive micro-farms. By mapping light exposure, root depth, and water runoff across vertical tiers, every inch is intentional.
          </p>
        </div>

        {/* The Architectural Botanical Composition — Magazine Page Elevation */}
        <div className="max-w-4xl mx-auto">
          <div className="relative border border-[#163A2A]/15 bg-[#FBF8F2] rounded-[4px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(22,58,42,0.04)]">
            {/* Elevation Blueprint Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#163A2A]/10 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#687268] block">
                  VERTICAL PROFILE ELEVATION · FIG. 03
                </span>
                <h3 className="font-serif text-lg text-[#163A2A] mt-0.5">
                  3-Tier Balcony Column · 0.6 m² Footprint
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#687268]">
                <span>12 Plant Positions</span>
                <span className="text-[#C86B4A]">·</span>
                <span className="text-[#163A2A]">2.4 m² Productive Canopy</span>
              </div>
            </div>

            {/* The 3-Tier Elevation Diagram */}
            <div className="py-8 space-y-8 relative">
              {/* Vertical Plumbing Guideline (Left Rule) */}
              <div className="hidden sm:block absolute top-4 bottom-4 left-10 w-[1px] bg-[#163A2A]/15" />

              {/* TIER 1: Upper Canopy (1.6m Elevation) */}
              <div className="relative sm:pl-16 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C86B4A]" />
                    <span className="font-serif text-base text-[#163A2A]">
                      Tier 1: Upper Canopy (1.6m Elevation)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#687268]">
                    <Sun size={12} className="text-[#C86B4A]" />
                    <span>Full Direct Sun · 6–8+ hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[#163A2A] font-serif text-sm">Bush Roma Tomato</strong>
                      <span className="text-[10px] font-mono text-[#C86B4A]">15L Pot</span>
                    </div>
                    <p className="text-[11px] text-[#687268]">
                      Solanum lycopersicum · High irradiance & deep taproot volume
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[#163A2A] font-serif text-sm">Jalapeño Pepper</strong>
                      <span className="text-[10px] font-mono text-[#C86B4A]">10L Pot</span>
                    </div>
                    <p className="text-[11px] text-[#687268]">
                      Capsicum annuum · Heat tolerance & heavy fruiting requirement
                    </p>
                  </div>
                </div>
              </div>

              {/* Structural Shelf Divider Line 1 */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#687268]/60">
                <span className="hidden sm:inline">1.1m</span>
                <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
                <span>MID-LEVEL IRRIGATION PASS-THROUGH</span>
                <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
              </div>

              {/* TIER 2: Mid Canopy (1.0m Elevation) */}
              <div className="relative sm:pl-16 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#879B78]" />
                    <span className="font-serif text-base text-[#163A2A]">
                      Tier 2: Mid Canopy (1.0m Elevation)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#687268]">
                    <span>Partial Sun · 4–6 hrs diffuse</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-0.5">
                    <strong className="text-[#163A2A] font-serif block">Sweet Genovese Basil</strong>
                    <span className="text-[10px] font-mono text-[#879B78] block">3L Volume · Branching</span>
                    <p className="text-[10px] text-[#687268]">Filtered sun, regular pinch harvest</p>
                  </div>

                  <div className="p-3 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-0.5">
                    <strong className="text-[#163A2A] font-serif block">Peppermint</strong>
                    <span className="text-[10px] font-mono text-[#879B78] block">Isolated Planter</span>
                    <p className="text-[10px] text-[#687268]">Rhizome control container</p>
                  </div>

                  <div className="p-3 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-0.5">
                    <strong className="text-[#163A2A] font-serif block">Tuscan Rosemary</strong>
                    <span className="text-[10px] font-mono text-[#879B78] block">5L Well-Drained</span>
                    <p className="text-[10px] text-[#687268]">Low moisture, aerated perlite mix</p>
                  </div>
                </div>
              </div>

              {/* Structural Shelf Divider Line 2 */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#687268]/60">
                <span className="hidden sm:inline">0.5m</span>
                <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
                <span>GRAVITY DRAINAGE CATCHMENT</span>
                <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
              </div>

              {/* TIER 3: Understory (0.4m Elevation) */}
              <div className="relative sm:pl-16 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#163A2A]" />
                    <span className="font-serif text-base text-[#163A2A]">
                      Tier 3: Understory (0.4m Elevation)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#687268]">
                    <Droplets size={12} className="text-[#163A2A]" />
                    <span>Cool Shading & Catchment · 2–4 hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[#163A2A] font-serif text-sm">Butterhead Lettuce</strong>
                      <span className="text-[10px] font-mono text-[#163A2A]">Shallow 2L</span>
                    </div>
                    <p className="text-[11px] text-[#687268]">
                      Lactuca sativa · Low thermal tolerance, protected by upper canopy
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-white border border-[#163A2A]/10 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[#163A2A] font-serif text-sm">Baby Leaf Spinach</strong>
                      <span className="text-[10px] font-mono text-[#163A2A]">Moisture Tray</span>
                    </div>
                    <p className="text-[11px] text-[#687268]">
                      Spinacia oleracea · Recycles drainage leachate from Tier 2
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Planner CTA Link */}
            <div className="pt-6 border-t border-[#163A2A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#687268] font-mono">
                Optimized for balconies, windowsills, vertical hydroponics & indoor grow racks
              </span>
              <Link
                href="/app/planner"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors font-medium self-start sm:self-auto"
              >
                <span>Launch Space Planner</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
