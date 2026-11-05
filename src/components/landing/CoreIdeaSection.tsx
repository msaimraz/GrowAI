import React from 'react';

export function CoreIdeaSection() {
  const stages = [
    { num: '01', title: 'Plant', desc: 'Genetics, variety, container limits' },
    { num: '02', title: 'Observation', desc: 'Photos, height, foliar checks' },
    { num: '03', title: 'Context', desc: 'Temperature, light tier, feeding log' },
    { num: '04', title: 'Intelligence', desc: 'Differential reasoning & alerts', accent: true },
    { num: '05', title: 'Action', desc: 'Verified steps & care updates' },
  ];

  const signals = [
    'Microclimate Drift',
    'Nutrient Balance',
    'Spatial Limits',
    'Health Signals',
    'Lineage Ancestry',
    'Adaptive Execution',
  ];

  return (
    <section id="system" className="py-20 lg:py-32 bg-[#F6F1E8] border-b border-[#163A2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-20 lg:mb-24">
          <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase block">
            THE CONNECTED SYSTEM
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#163A2A] tracking-tight leading-[1.12]">
            Your Garden Is More Connected
            <br />
            <span className="italic font-normal">Than You Think.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#263028]/80 leading-relaxed font-normal pt-2">
            Every plant creates signals — growth stages, foliar anomalies, sunlight shifts, care routines, and physical space limits. GrowAI links those signals together into an intelligent loop.
          </p>
        </div>

        {/* The Open Visual Line — A Design Diagram, Not a SaaS Component */}
        <div className="max-w-5xl mx-auto mb-20">
          {/* Desktop Horizontal Line */}
          <div className="hidden md:block relative">
            {/* The Connecting Rule */}
            <div className="absolute top-5 left-8 right-8 h-[1px] bg-[#163A2A]/15 z-0" />

            <div className="grid grid-cols-5 gap-4 relative z-10">
              {stages.map((stg) => (
                <div key={stg.title} className="text-center space-y-3">
                  {/* Marker Node */}
                  <div className="flex justify-center">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs transition-colors bg-[#F6F1E8] border ${
                        stg.accent
                          ? 'border-[#C86B4A] text-[#C86B4A] shadow-xs'
                          : 'border-[#163A2A]/20 text-[#163A2A]'
                      }`}
                    >
                      {stg.num}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-serif text-lg text-[#163A2A]">
                      {stg.title}
                    </h3>
                    <p className="text-xs text-[#687268] mt-1 leading-snug font-sans max-w-[150px] mx-auto">
                      {stg.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Vertical Flow */}
          <div className="md:hidden relative pl-6 border-l border-[#163A2A]/15 space-y-8 ml-4">
            {stages.map((stg) => (
              <div key={stg.title} className="relative">
                <span
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border bg-[#F6F1E8] flex items-center justify-center ${
                    stg.accent ? 'border-[#C86B4A] bg-[#C86B4A]' : 'border-[#163A2A]'
                  }`}
                />
                <span className="text-[10px] font-mono text-[#687268] uppercase tracking-wider block">
                  Stage {stg.num}
                </span>
                <h3 className="font-serif text-lg text-[#163A2A] mt-0.5">
                  {stg.title}
                </h3>
                <p className="text-xs text-[#263028]/80 mt-1">
                  {stg.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Signals Strip — Clean Text Markers, No Cards */}
        <div className="max-w-4xl mx-auto pt-10 border-t border-[#163A2A]/10">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-mono text-[#687268]">
            <span className="uppercase text-[10px] tracking-widest text-[#163A2A] font-semibold">
              Live Signals:
            </span>
            {signals.map((sig, i) => (
              <React.Fragment key={sig}>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-[#C86B4A]' : 'bg-[#879B78]'}`} />
                  {sig}
                </span>
                {i < signals.length - 1 && (
                  <span className="text-[#163A2A]/15 hidden sm:inline">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
