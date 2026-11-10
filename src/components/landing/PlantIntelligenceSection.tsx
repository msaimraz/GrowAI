import React from 'react';
import Link from 'next/link';
import {
  Sun,
  Droplets,
  Sprout,
  ShieldCheck,
  Layers,
  CheckCircle2,
  HelpCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';

export function PlantIntelligenceSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8F6EE] border-b border-[#E3DFD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
        {/* ================================================================= */}
        {/* SUBSECTION 1: REALISTIC PLANT RECORD & TRUST GROUNDING           */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Explanation & Grounding in Plant Knowledge */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] font-mono tracking-widest text-[#5F6D63] uppercase font-bold block">
              EVIDENCE-GROUNDED BOTANY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#203027] tracking-tight leading-tight">
              Know Your Plants Better.
            </h2>

            <p className="text-base sm:text-lg text-[#5F6D63] leading-relaxed">
              GrowAI combines curated botanical knowledge with your garden’s own observations, conditions, history, and progress.
            </p>

            {/* Safety & Trust Language Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DFD2] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#174C35] font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Grounded in plant knowledge</span>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed">
                GrowAI separates observed plant information from interpretation and keeps uncertain information clearly marked. We prioritize non-toxic cultural practices and evidence-grounded parameters.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#5F6D63]">
              <span className="px-3 py-1 rounded-full bg-white border border-[#E3DFD2]">
                Plant knowledge
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#E3DFD2]">
                Health history
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#E3DFD2]">
                Growing conditions
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#E3DFD2]">
                Garden observations
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Plant Information Record Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Plant Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E3DFD2]">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#174C35] font-bold block mb-1">
                    Botanical Specimen Record
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#203027]">
                    Genovese Basil
                  </h3>
                  <p className="text-xs text-[#5F6D63] italic">
                    Ocimum basilicum · Lamiaceae family
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2]">
                    Growing
                  </span>
                  <span className="block text-[11px] text-[#174C35] font-bold">
                    Healthy 🌿
                  </span>
                </div>
              </div>

              {/* Verified Care Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <span className="text-[#5F6D63] flex items-center gap-1.5 font-medium text-[11px]">
                    <Sun size={13} className="text-[#F0C04D]" /> Sun Exposure
                  </span>
                  <strong className="text-sm font-serif text-[#203027] block">
                    Bright Direct
                  </strong>
                  <span className="text-[10px] text-[#5F6D63] block">6+ hours daily</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <span className="text-[#5F6D63] flex items-center gap-1.5 font-medium text-[11px]">
                    <Droplets size={13} className="text-teal-700" /> Watering
                  </span>
                  <strong className="text-sm font-serif text-[#203027] block">
                    Moderate
                  </strong>
                  <span className="text-[10px] text-[#5F6D63] block">When top 2 cm is dry</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <span className="text-[#5F6D63] flex items-center gap-1.5 font-medium text-[11px]">
                    <Sprout size={13} className="text-[#174C35]" /> Growth Timeline
                  </span>
                  <strong className="text-sm font-serif text-[#203027] block">
                    Day 27
                  </strong>
                  <span className="text-[10px] text-[#5F6D63] block">Vegetative foliage stage</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <span className="text-[#5F6D63] flex items-center gap-1.5 font-medium text-[11px]">
                    <Layers size={13} className="text-[#174C35]" /> Shelf Placement
                  </span>
                  <strong className="text-sm font-serif text-[#203027] block">
                    Top / Middle Tier
                  </strong>
                  <span className="text-[10px] text-[#5F6D63] block">Unobstructed sun</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs border-t border-[#E3DFD2]">
                <span className="text-[#5F6D63]">Verified container minimum: 20 cm depth</span>
                <Link
                  href="/app/plants/genovese-basil"
                  className="font-semibold text-[#174C35] hover:underline active:scale-95 transition-all select-none touch-manipulation min-h-[36px] inline-flex items-center"
                >
                  View Botanical Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SUBSECTION 2: SMALL SPACE OPTIMIZER & DAILY GROWING EXPERIENCE   */}
        {/* ================================================================= */}
        <div className="pt-8 border-t border-[#E3DFD2]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: Small Space & Vertical Elevation Preview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono tracking-widest text-[#5F6D63] uppercase font-bold block">
                  SPACE & VERTICAL INTELLIGENCE
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#203027]">
                  Small Space. Big Possibilities.
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed">
                  Plan balconies, windowsills, and vertical growing spaces around the plants you actually want to grow. Match crops to the light each tier receives.
                </p>
              </div>

              {/* 3-Tier Rack Visual (Clean & Minimal) */}
              <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]">
                  <span className="text-xs font-serif font-bold text-[#203027]">
                    Balcony 3-Tier Vertical Rack Layout
                  </span>
                  <span className="text-[11px] font-semibold text-[#174C35] bg-[#EAF1E4] px-2 py-0.5 rounded-full">
                    SWL Load Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Tier 1 */}
                  <div className="p-3 rounded-2xl bg-[#FFF3D7] border border-[#F0C04D/30] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#8A6400]">Tier 1 (Top) · Sun-Loving Plants</strong>
                      <span className="text-[11px] text-[#8A6400]">Genovese Basil, French Radish, Dwarf Marigold</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8A6400] bg-white px-2 py-0.5 rounded-md border border-[#F0C04D/30]">
                      6h+ Sun
                    </span>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-3 rounded-2xl bg-[#EAF1E4] border border-[#78A95A/30] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#174C35]">Tier 2 (Middle) · Moderate-Light Crops</strong>
                      <span className="text-[11px] text-[#174C35]">Butterhead Lettuce, Holy Basil, Lemongrass</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#174C35] bg-white px-2 py-0.5 rounded-md border border-[#78A95A/30]">
                      3–5h Sun
                    </span>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-3 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#203027]">Tier 3 (Bottom) · Shade-Tolerant Greens</strong>
                      <span className="text-[11px] text-[#5F6D63]">Mung Bean Sprouts, Radish Microgreens</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#203027] bg-white px-2 py-0.5 rounded-md border border-[#E3DFD2]">
                      Ambient
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Daily Guidance Experience (Today's Care + Daily Check) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono tracking-widest text-[#5F6D63] uppercase font-bold block">
                  DAILY GROWING EXPERIENCE
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#203027]">
                  A Little Guidance, Every Day.
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed">
                  Friendly check-ins keep growing enjoyable. Simple questions confirm your plants are thriving or flag changes early.
                </p>
              </div>

              {/* Today's Care & Daily Plant Check Card */}
              <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-2xs space-y-5">
                {/* Today's Care */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#203027]">
                      Today’s Care
                    </span>
                    <span className="text-[10px] text-[#5F6D63]">2 tasks pending</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#EAF1E4] text-[#174C35] flex items-center justify-center text-xs">
                        💧
                      </span>
                      <span className="text-[#203027] font-medium">Water Genovese Basil</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#EAF1E4] text-[#174C35] flex items-center justify-center text-xs">
                        🌱
                      </span>
                      <span className="text-[#203027] font-medium">Check new lettuce leaf growth</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#EAF1E4] text-[#174C35] flex items-center justify-center text-xs">
                        🔎
                      </span>
                      <span className="text-[#203027] font-medium">Inspect underside of radish leaves</span>
                    </div>
                  </div>
                </div>

                {/* Daily Plant Check */}
                <div className="pt-2 border-t border-[#E3DFD2] space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-xs font-serif font-bold text-[#174C35] block">
                      Daily Plant Check
                    </span>
                    <p className="text-xs text-[#203027] font-medium">
                      How does your plant look today?
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] font-bold shadow-2xs hover:bg-[#EAF1E4] transition-colors"
                    >
                      <span className="block text-base mb-0.5">🙂</span>
                      <span>Looks good</span>
                    </button>
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-white border border-[#E3DFD2] text-[#5F6D63] hover:bg-[#F8F6EE] transition-colors"
                    >
                      <span className="block text-base mb-0.5">👀</span>
                      <span>Different</span>
                    </button>
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-white border border-[#E3DFD2] text-[#5F6D63] hover:bg-[#F8F6EE] transition-colors"
                    >
                      <span className="block text-base mb-0.5">🤔</span>
                      <span>Not sure</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
