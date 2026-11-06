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
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fbf9f4] border-b border-[#ded5c5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
        {/* ================================================================= */}
        {/* SUBSECTION 1: REALISTIC PLANT RECORD & TRUST GROUNDING           */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Explanation & Grounding in Plant Knowledge */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
              EVIDENCE-GROUNDED BOTANY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0c2417] tracking-tight leading-tight">
              Know Your Plants Better.
            </h2>

            <p className="text-base sm:text-lg text-[#526a57] leading-relaxed">
              GrowAI combines curated botanical knowledge with your garden’s own observations, conditions, history, and progress.
            </p>

            {/* Safety & Trust Language Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ded5c5] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#144229] font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Grounded in plant knowledge</span>
              </div>
              <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                GrowAI separates observed plant information from interpretation and keeps uncertain information clearly marked. We prioritize non-toxic cultural practices and evidence-grounded parameters.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#526a57]">
              <span className="px-3 py-1 rounded-full bg-white border border-[#ded5c5]">
                Plant knowledge
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ded5c5]">
                Health history
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ded5c5]">
                Growing conditions
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ded5c5]">
                Garden observations
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Plant Information Record Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Plant Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#f0ebe0]">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#144229] font-bold block mb-1">
                    Botanical Specimen Record
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0c2417]">
                    Genovese Basil
                  </h3>
                  <p className="text-xs text-[#526a57] italic">
                    Ocimum basilicum · Lamiaceae family
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]">
                    Growing
                  </span>
                  <span className="block text-[11px] text-[#257a4d] font-bold">
                    Healthy 🌿
                  </span>
                </div>
              </div>

              {/* Verified Care Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <span className="text-[#6d8573] flex items-center gap-1.5 font-medium text-[11px]">
                    <Sun size={13} className="text-[#c77712]" /> Sun Exposure
                  </span>
                  <strong className="text-sm font-serif text-[#0c2417] block">
                    Bright Direct
                  </strong>
                  <span className="text-[10px] text-[#526a57] block">6+ hours daily</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <span className="text-[#6d8573] flex items-center gap-1.5 font-medium text-[11px]">
                    <Droplets size={13} className="text-teal-700" /> Watering
                  </span>
                  <strong className="text-sm font-serif text-[#0c2417] block">
                    Moderate
                  </strong>
                  <span className="text-[10px] text-[#526a57] block">When top 2 cm is dry</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <span className="text-[#6d8573] flex items-center gap-1.5 font-medium text-[11px]">
                    <Sprout size={13} className="text-[#257a4d]" /> Growth Timeline
                  </span>
                  <strong className="text-sm font-serif text-[#0c2417] block">
                    Day 27
                  </strong>
                  <span className="text-[10px] text-[#526a57] block">Vegetative foliage stage</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <span className="text-[#6d8573] flex items-center gap-1.5 font-medium text-[11px]">
                    <Layers size={13} className="text-[#144229]" /> Shelf Placement
                  </span>
                  <strong className="text-sm font-serif text-[#0c2417] block">
                    Top / Middle Tier
                  </strong>
                  <span className="text-[10px] text-[#526a57] block">Unobstructed sun</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs border-t border-[#f0ebe0]">
                <span className="text-[#526a57]">Verified container minimum: 20 cm depth</span>
                <Link
                  href="/app/plants/genovese-basil"
                  className="font-semibold text-[#144229] hover:underline"
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
        <div className="pt-8 border-t border-[#ded5c5]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: Small Space & Vertical Elevation Preview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
                  SPACE & VERTICAL INTELLIGENCE
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#0c2417]">
                  Small Space. Big Possibilities.
                </h3>
                <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                  Plan balconies, windowsills, and vertical growing spaces around the plants you actually want to grow. Match crops to the light each tier receives.
                </p>
              </div>

              {/* 3-Tier Rack Visual (Clean & Minimal) */}
              <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f0ebe0]">
                  <span className="text-xs font-serif font-bold text-[#0c2417]">
                    Balcony 3-Tier Vertical Rack Layout
                  </span>
                  <span className="text-[11px] font-semibold text-[#144229] bg-[#eef5ee] px-2 py-0.5 rounded-full">
                    SWL Load Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Tier 1 */}
                  <div className="p-3 rounded-2xl bg-[#fffbeb] border border-[#fde68a] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#92400e]">Tier 1 (Top) · Sun-Loving Plants</strong>
                      <span className="text-[11px] text-[#b45309]">Genovese Basil, French Radish, Dwarf Marigold</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#92400e] bg-white px-2 py-0.5 rounded-md border border-[#fde68a]">
                      6h+ Sun
                    </span>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#065f46]">Tier 2 (Middle) · Moderate-Light Crops</strong>
                      <span className="text-[11px] text-[#047857]">Butterhead Lettuce, Holy Basil, Lemongrass</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#065f46] bg-white px-2 py-0.5 rounded-md border border-[#a7f3d0]">
                      3–5h Sun
                    </span>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-[#334155]">Tier 3 (Bottom) · Shade-Tolerant Greens</strong>
                      <span className="text-[11px] text-[#475569]">Mung Bean Sprouts, Radish Microgreens</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#334155] bg-white px-2 py-0.5 rounded-md border border-[#cbd5e1]">
                      Ambient
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Daily Guidance Experience (Today's Care + Daily Check) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
                  DAILY GROWING EXPERIENCE
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#0c2417]">
                  A Little Guidance, Every Day.
                </h3>
                <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                  Friendly check-ins keep growing enjoyable. Simple questions confirm your plants are thriving or flag changes early.
                </p>
              </div>

              {/* Today's Care & Daily Plant Check Card */}
              <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-2xs space-y-5">
                {/* Today's Care */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#0c2417]">
                      Today’s Care
                    </span>
                    <span className="text-[10px] text-[#6d8573]">2 tasks pending</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center text-xs">
                        💧
                      </span>
                      <span className="text-[#0c2417] font-medium">Water Genovese Basil</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center text-xs">
                        🌱
                      </span>
                      <span className="text-[#0c2417] font-medium">Check new lettuce leaf growth</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center text-xs">
                        🔎
                      </span>
                      <span className="text-[#0c2417] font-medium">Inspect underside of radish leaves</span>
                    </div>
                  </div>
                </div>

                {/* Daily Plant Check */}
                <div className="pt-2 border-t border-[#f0ebe0] space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-xs font-serif font-bold text-[#144229] block">
                      Daily Plant Check
                    </span>
                    <p className="text-xs text-[#0c2417] font-medium">
                      How does your plant look today?
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] text-[#144229] font-bold shadow-2xs hover:bg-[#dfeadf] transition-colors"
                    >
                      <span className="block text-base mb-0.5">🙂</span>
                      <span>Looks good</span>
                    </button>
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-white border border-[#ded5c5] text-[#526a57] hover:bg-[#fbf9f4] transition-colors"
                    >
                      <span className="block text-base mb-0.5">👀</span>
                      <span>Different</span>
                    </button>
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-white border border-[#ded5c5] text-[#526a57] hover:bg-[#fbf9f4] transition-colors"
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
