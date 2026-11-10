import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Droplets,
  Sun,
  CheckCircle2,
  Calendar,
  Sparkles,
  Sprout,
  Activity,
} from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6EE] pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28 border-b border-[#E3DFD2]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Statement & Direct CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <span className="text-[11px] font-mono tracking-widest text-[#5F6D63] uppercase font-bold block">
                INTELLIGENT GROWING SYSTEM
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#203027] tracking-tight leading-[1.1]">
                Grow Smarter.
                <br />
                <span className="italic font-normal text-[#174c35]">
                  Grow With Intelligence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5F6D63] leading-relaxed max-w-xl font-normal pt-1">
                GrowAI brings plant knowledge, garden planning, health tracking, and growing guidance together in one calm, practical workspace.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-[#174C35] hover:bg-[#203027] active:scale-95 text-white px-6 py-3.5 rounded-2xl shadow-xs transition-all duration-75 cursor-pointer min-h-[48px] select-none touch-manipulation"
              >
                <span>Explore GrowAI</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#what-growai-does"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#174C35] bg-transparent hover:bg-[#EAF1E4] active:scale-95 border border-[#E3DFD2] px-6 py-3.5 rounded-2xl transition-all duration-75 cursor-pointer min-h-[48px] select-none touch-manipulation"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Supporting Metadata */}
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5F6D63] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#174C35]" />
                Plant knowledge
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#174C35]" />
                Garden tracking
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0C04D]" />
                Smart planning
              </span>
            </div>
          </div>

          {/* Right Column: Real GrowAI Application Interface Visual */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-lg lg:max-w-none bg-white rounded-3xl border border-[#E3DFD2] shadow-md p-5 sm:p-7 space-y-5 text-[#203027] relative">
              {/* Product Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E3DFD2]">
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2]">
                      My Garden
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2] flex items-center gap-1">
                      <Sprout size={11} /> Day 27
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#203027] truncate">
                    Genovese Basil
                  </h3>
                  <p className="text-xs text-[#5F6D63] italic">
                    Ocimum basilicum · Vegetative Growth Stage
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF1E4] text-[#174C35] border border-[#78A95A/30] shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy
                </span>
              </div>

              {/* Quick Care Snapshot */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#5F6D63]">
                    <Sun size={13} className="text-[#F0C04D]" />
                    <span className="text-[11px] font-medium">Sunlight</span>
                  </div>
                  <strong className="block text-xs text-[#203027]">6h Direct Light</strong>
                  <span className="text-[10px] text-[#5F6D63] block">Morning balcony tier</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#5F6D63]">
                    <Droplets size={13} className="text-teal-700" />
                    <span className="text-[11px] font-medium">Moisture</span>
                  </div>
                  <strong className="block text-xs text-[#203027]">Top 2 cm Dry</strong>
                  <span className="text-[10px] text-[#5F6D63] block">Water this evening</span>
                </div>
              </div>

              {/* Today's Care Tasks */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6D63] block">
                  Today’s Care Routine
                </span>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl border border-[#E3DFD2] bg-[#EAF1E4] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#174C35] text-white flex items-center justify-center shrink-0">
                        <Droplets size={13} />
                      </div>
                      <span className="font-semibold text-[#203027] truncate">
                        Water surface soil gently
                      </span>
                    </div>
                    <span className="text-[10px] text-[#174C35] font-bold shrink-0">Due Today</span>
                  </div>

                  <div className="p-3 rounded-2xl border border-[#E3DFD2] bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} />
                      </div>
                      <span className="font-medium text-[#5F6D63] truncate">
                        Inspect new node growth
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5F6D63] shrink-0">Completed</span>
                  </div>
                </div>
              </div>

              {/* Mini Daily Check Interaction */}
              <div className="p-3.5 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#174C35]">
                    Daily Plant Check
                  </span>
                  <span className="text-[10px] text-[#5F6D63]">How does it look today?</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
                  <span className="py-1.5 px-2 rounded-xl bg-[#174C35] text-white shadow-2xs">
                    🙂 Great
                  </span>
                  <span className="py-1.5 px-2 rounded-xl bg-white text-[#5F6D63] border border-[#E3DFD2]">
                    👀 Changed
                  </span>
                  <span className="py-1.5 px-2 rounded-xl bg-white text-[#5F6D63] border border-[#E3DFD2]">
                    🤔 Not sure
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
