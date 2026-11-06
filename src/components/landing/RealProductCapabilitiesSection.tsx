import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  Library,
  ClipboardList,
  Sparkles,
  Layers,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Droplets,
} from 'lucide-react';

export function RealProductCapabilitiesSection() {
  const capabilities = [
    {
      icon: Sprout,
      title: 'My Garden',
      description: 'Track your plants, daily observations, health history, and timelines.',
      href: '/app/my-garden',
    },
    {
      icon: Library,
      title: 'Plant Library',
      description: 'Explore 19 curated botanical species with verified container requirements.',
      href: '/app/plants',
    },
    {
      icon: ClipboardList,
      title: 'Grow Plans',
      description: 'Follow structured, step-by-step growing journeys from seed to harvest.',
      href: '/app/grow-plans',
    },
    {
      icon: Sparkles,
      title: 'Plant Check',
      description: 'Inspect plant symptoms with photo-based guidance and non-toxic remedies.',
      href: '/app/ai-doctor',
    },
    {
      icon: Layers,
      title: 'Space Planner',
      description: 'Design balcony, windowsill, and vertical growing racks with tier light mapping.',
      href: '/app/planner',
    },
    {
      icon: Compass,
      title: 'Grow Intelligence',
      description: 'Understand growing conditions, feeding logs, propagation, and harvests.',
      href: '/app/grow-intelligence',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#ded5c5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Editorial Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
            CORE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0c2417] tracking-tight leading-tight">
            Everything You Need to Grow Well.
          </h2>
          <p className="text-base sm:text-lg text-[#526a57] leading-relaxed pt-1">
            Practical gardening tools built for real home spaces, combined into one calm experience.
          </p>
        </div>

        {/* 6 Capability Area Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-6 rounded-3xl border border-[#ded5c5] bg-[#fbf9f4] hover:bg-white hover:border-[#144229]/30 transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#ded5c5] flex items-center justify-center text-[#144229] shadow-2xs">
                    <Icon size={18} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#526a57] mt-1 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={cap.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144229] hover:underline pt-1"
                >
                  <span>Explore {cap.title}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Editorial Preview Composition: Live UI Preview Snippet */}
        <div className="pt-6">
          <div className="bg-[#fbf9f4] rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Story Note */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-mono tracking-widest text-[#144229] uppercase font-bold block">
                  ADAPTIVE EXECUTION
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#0c2417] leading-snug">
                  Follow step-by-step journeys without information overload.
                </h3>
                <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                  Grow Plans turn botanical goals into simple milestones. Whether starting microgreens or pruning basil for bushier growth, each step tells you what to observe and what to do next.
                </p>
                <div className="pt-2">
                  <Link
                    href="/app/grow-plans"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#144229] text-white hover:bg-[#071c11] px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <span>Browse Grow Plans</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Realistic Step Progression UI */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ded5c5] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center font-bold text-xs">
                      🌱
                    </span>
                    <span className="font-serif font-bold text-sm text-[#0c2417] truncate">
                      Genovese Basil — Seed to First Harvest
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full shrink-0">
                    Step 3 of 5
                  </span>
                </div>

                {/* Steps Mini Rail */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-[10px] font-medium">
                  <div className="p-2 rounded-xl bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]">
                    <CheckCircle2 size={12} className="mx-auto mb-0.5 text-[#257a4d]" />
                    <span>01 Start</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]">
                    <CheckCircle2 size={12} className="mx-auto mb-0.5 text-[#257a4d]" />
                    <span>02 Grow</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#144229] text-white font-bold shadow-2xs">
                    <span className="block text-[10px]">👉</span>
                    <span>03 Pinch</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbf9f4] text-[#6d8573] border border-[#ded5c5]">
                    <span>04 Branch</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbf9f4] text-[#6d8573] border border-[#ded5c5]">
                    <span>05 Harvest</span>
                  </div>
                </div>

                {/* Active Step Card */}
                <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0c2417]">
                      Current Action: Pinch top center node
                    </span>
                    <span className="text-[10px] text-[#257a4d] font-semibold">Recommended Now</span>
                  </div>
                  <p className="text-xs text-[#526a57] leading-relaxed">
                    Snip above the second set of true leaves. This encourages lateral shoots to branch out, doubling your leaf yield.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

