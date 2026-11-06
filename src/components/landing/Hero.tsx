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
    <section className="relative overflow-hidden bg-[#fbf9f4] pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28 border-b border-[#ded5c5]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Statement & Direct CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
                INTELLIGENT GROWING SYSTEM
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#0c2417] tracking-tight leading-[1.1]">
                Grow Smarter.
                <br />
                <span className="italic font-normal text-[#174c35]">
                  Grow With Intelligence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#526a57] leading-relaxed max-w-xl font-normal pt-1">
                GrowAI brings plant knowledge, garden planning, health tracking, and growing guidance together in one calm, practical workspace.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-[#144229] hover:bg-[#071c11] text-white px-6 py-3.5 rounded-2xl shadow-xs transition-all cursor-pointer min-h-[48px]"
              >
                <span>Explore GrowAI</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#what-growai-does"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#144229] bg-transparent hover:bg-[#eef5ee] border border-[#cfdfcf] px-6 py-3.5 rounded-2xl transition-colors cursor-pointer min-h-[48px]"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Supporting Metadata */}
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6d8573] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#144229]" />
                Plant knowledge
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#257a4d]" />
                Garden tracking
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c77712]" />
                Smart planning
              </span>
            </div>
          </div>

          {/* Right Column: Real GrowAI Application Interface Visual */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-lg lg:max-w-none bg-white rounded-3xl border border-[#ded5c5] shadow-md p-5 sm:p-7 space-y-5 text-[#0c2417] relative">
              {/* Product Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#f0ebe0]">
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]">
                      My Garden
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f4f8f4] text-[#257a4d] border border-[#cfe0cf] flex items-center gap-1">
                      <Sprout size={11} /> Day 27
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2417] truncate">
                    Genovese Basil
                  </h3>
                  <p className="text-xs text-[#526a57] italic">
                    Ocimum basilicum · Vegetative Growth Stage
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy
                </span>
              </div>

              {/* Quick Care Snapshot */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#526a57]">
                    <Sun size={13} className="text-[#c77712]" />
                    <span className="text-[11px] font-medium">Sunlight</span>
                  </div>
                  <strong className="block text-xs text-[#0c2417]">6h Direct Light</strong>
                  <span className="text-[10px] text-[#6d8573] block">Morning balcony tier</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#526a57]">
                    <Droplets size={13} className="text-teal-700" />
                    <span className="text-[11px] font-medium">Moisture</span>
                  </div>
                  <strong className="block text-xs text-[#0c2417]">Top 2 cm Dry</strong>
                  <span className="text-[10px] text-[#6d8573] block">Water this evening</span>
                </div>
              </div>

              {/* Today's Care Tasks */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#526a57] block">
                  Today’s Care Routine
                </span>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl border border-[#cfe0cf] bg-[#f4f8f4] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#144229] text-white flex items-center justify-center shrink-0">
                        <Droplets size={13} />
                      </div>
                      <span className="font-semibold text-[#0c2417] truncate">
                        Water surface soil gently
                      </span>
                    </div>
                    <span className="text-[10px] text-[#144229] font-bold shrink-0">Due Today</span>
                  </div>

                  <div className="p-3 rounded-2xl border border-[#ded5c5] bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} />
                      </div>
                      <span className="font-medium text-[#526a57] truncate">
                        Inspect new node growth
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6d8573] shrink-0">Completed</span>
                  </div>
                </div>
              </div>

              {/* Mini Daily Check Interaction */}
              <div className="p-3.5 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#144229]">
                    Daily Plant Check
                  </span>
                  <span className="text-[10px] text-[#526a57]">How does it look today?</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
                  <span className="py-1.5 px-2 rounded-xl bg-[#144229] text-white shadow-2xs">
                    🙂 Great
                  </span>
                  <span className="py-1.5 px-2 rounded-xl bg-white text-[#526a57] border border-[#ded5c5]">
                    👀 Changed
                  </span>
                  <span className="py-1.5 px-2 rounded-xl bg-white text-[#526a57] border border-[#ded5c5]">
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
