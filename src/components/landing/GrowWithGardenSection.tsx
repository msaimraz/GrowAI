import React from 'react';
import { Sprout, Eye, Sun, Sparkles, CheckCircle2 } from 'lucide-react';

export function GrowWithGardenSection() {
  const steps = [
    {
      num: '01',
      title: 'Plant',
      subtitle: 'Specimen variety & container limits',
      icon: Sprout,
    },
    {
      num: '02',
      title: 'Observation',
      subtitle: 'Daily checks & foliar changes',
      icon: Eye,
    },
    {
      num: '03',
      title: 'Condition',
      subtitle: 'Sunlight, moisture & tier climate',
      icon: Sun,
    },
    {
      num: '04',
      title: 'Intelligence',
      subtitle: 'Evidence-grounded guidance & alerts',
      icon: Sparkles,
      highlight: true,
    },
    {
      num: '05',
      title: 'Action',
      subtitle: 'Clear steps & harvest schedules',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fbf9f4] border-b border-[#ded5c5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Editorial Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
            ADAPTIVE INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0c2417] tracking-tight leading-tight">
            Your Garden Changes.
            <br />
            <span className="italic font-normal text-[#174c35]">
              GrowAI Changes With It.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#526a57] leading-relaxed pt-1">
            Every garden starts differently. GrowAI keeps your growing information connected so your next decision is based on what is actually happening in your garden.
          </p>
        </div>

        {/* Connected Flow: Plant → Observation → Condition → Intelligence → Action */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop Connected Line */}
          <div className="hidden md:block relative">
            {/* Thin Connecting Line */}
            <div className="absolute top-6 left-12 right-12 h-px bg-[#ded5c5] z-0" />

            <div className="grid grid-cols-5 gap-4 relative z-10">
              {steps.map((st) => {
                const Icon = st.icon;
                return (
                  <div key={st.title} className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          st.highlight
                            ? 'bg-[#144229] text-white shadow-xs ring-4 ring-[#eef5ee]'
                            : 'bg-white text-[#144229] border border-[#ded5c5] shadow-2xs'
                        }`}
                      >
                        <Icon size={20} className="stroke-[2.2]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#6d8573] uppercase block">
                        Step {st.num}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#0c2417]">
                        {st.title}
                      </h3>
                      <p className="text-xs text-[#526a57] leading-relaxed max-w-[140px] mx-auto">
                        {st.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Flow */}
          <div className="md:hidden space-y-4 pl-4 border-l-2 border-[#cfe0cf] ml-4">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.title} className="flex items-start gap-3.5 relative">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 -ml-[23px] ${
                      st.highlight
                        ? 'bg-[#144229] text-white shadow-xs'
                        : 'bg-white text-[#144229] border border-[#ded5c5]'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="space-y-0.5 pt-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#6d8573]">
                        {st.num}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#0c2417]">
                        {st.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#526a57] leading-relaxed">
                      {st.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

