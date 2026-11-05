import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export function BotanicalTrustSection() {
  const lifecycleStages = [
    { name: 'Propagation', detail: 'Stem cuttings & seed germination' },
    { name: 'Growing', detail: 'Vegetative branching & node tracking' },
    { name: 'Feeding', detail: 'Targeted NPK formulation schedules' },
    { name: 'Production', detail: 'Canopy flowering & fruit set' },
    { name: 'Harvest', detail: 'Yield logging & seed saving', accent: true },
  ];

  return (
    <section className="py-20 lg:py-32 bg-[#FBF8F2] border-b border-[#163A2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-16 lg:mb-20 space-y-4">
          <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase block">
            BOTANICAL RIGOR
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#163A2A] tracking-tight leading-tight">
            Grounded in Real{' '}
            <span className="italic font-normal">Plant Knowledge.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#263028]/80 leading-relaxed font-normal">
            GrowAI is grounded in agronomic science and verified horticultural research. Every recommendation reflects actual container volume, microclimate thresholds, and biological reality.
          </p>
        </div>

        {/* ONE Large Botanical Profile Specimen Plate — Editorial Design, Not a Dashboard Card */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="border border-[#163A2A]/15 bg-[#F6F1E8] rounded-[4px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(22,58,42,0.03)] space-y-8">
            {/* Specimen Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-[#163A2A]/10 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C86B4A] block">
                  SPECIMEN PROFILE · NO. 08
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#163A2A] mt-1">
                  Solanum lycopersicum{' '}
                  <span className="text-lg font-sans font-normal text-[#687268]">
                    (Bush Roma Tomato)
                  </span>
                </h3>
              </div>
              <span className="text-xs font-mono text-[#687268]">
                Solanaceae Family · Small-Space Cultivar
              </span>
            </div>

            {/* The Four Surrounding Editorial Facets: Plant · Growth · Health · History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {/* Facet 1: Plant */}
              <div className="space-y-2 border-l border-[#163A2A]/15 pl-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold block">
                  01 / PLANT
                </span>
                <h4 className="font-serif text-base text-[#163A2A]">
                  Morphology & Limits
                </h4>
                <p className="text-xs text-[#263028]/80 leading-relaxed">
                  15–20L root volume minimum. Optimal daytime ambient 21–26°C. Requires aerated perlite/compost mix to prevent compaction.
                </p>
              </div>

              {/* Facet 2: Growth */}
              <div className="space-y-2 border-l border-[#163A2A]/15 pl-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold block">
                  02 / GROWTH
                </span>
                <h4 className="font-serif text-base text-[#163A2A]">
                  Canopy Architecture
                </h4>
                <p className="text-xs text-[#263028]/80 leading-relaxed">
                  Determinate bush habit. 60–80 cm mature height. Internodal truss spacing monitored for early flower-set timing.
                </p>
              </div>

              {/* Facet 3: Health */}
              <div className="space-y-2 border-l border-[#C86B4A]/50 pl-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C86B4A] font-semibold block">
                  03 / HEALTH
                </span>
                <h4 className="font-serif text-base text-[#163A2A]">
                  Differential Signals
                </h4>
                <p className="text-xs text-[#263028]/80 leading-relaxed">
                  AI Doctor cross-references foliar yellowing against calcium deficiency and moisture stress. Zero synthetic dosage guesswork.
                </p>
              </div>

              {/* Facet 4: History */}
              <div className="space-y-2 border-l border-[#163A2A]/15 pl-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#163A2A] font-semibold block">
                  04 / HISTORY
                </span>
                <h4 className="font-serif text-base text-[#163A2A]">
                  Longitudinal Record
                </h4>
                <p className="text-xs text-[#263028]/80 leading-relaxed">
                  Permanent chronological timeline linking seed lineage, feeding logs, temperature events, and photographic progression.
                </p>
              </div>
            </div>

            {/* Specimen Footer */}
            <div className="pt-4 border-t border-[#163A2A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#687268] font-mono text-[11px]">
                Cross-referenced against verified agricultural extension standards
              </span>
              <Link
                href="/app/plants"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors"
              >
                <span>Browse Botanical Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* PRODUCTION STRIP — Simple Horizontal Editorial Timeline, No Cards, No Boxes */}
        <div className="max-w-5xl mx-auto pt-6 pb-16 border-t border-[#163A2A]/10">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#687268]">
              COMPLETE PRODUCTION TIMELINE
            </span>
            <span className="text-xs font-mono text-[#687268]">
              Seedling to Harvest
            </span>
          </div>

          {/* Desktop Horizontal Line */}
          <div className="hidden md:block relative">
            <div className="absolute top-2 left-3 right-3 h-[1px] bg-[#163A2A]/15 z-0" />

            <div className="grid grid-cols-5 gap-4 relative z-10">
              {lifecycleStages.map((stage) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center bg-[#FBF8F2] ${
                        stage.accent
                          ? 'border-[#C86B4A] bg-[#C86B4A]'
                          : 'border-[#163A2A]/30'
                      }`}
                    >
                      {stage.accent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="font-serif text-sm text-[#163A2A]">
                      {stage.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#687268] font-mono pl-5 leading-snug">
                    {stage.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Vertical Flow */}
          <div className="md:hidden space-y-4 pl-4 border-l border-[#163A2A]/15">
            {lifecycleStages.map((stage) => (
              <div key={stage.name} className="space-y-0.5">
                <span className="font-serif text-sm text-[#163A2A] block">
                  {stage.name}
                </span>
                <span className="text-xs text-[#687268] font-mono block">
                  {stage.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Trust Principles — Three Clean Editorial Text Columns Without Cards */}
        <div className="max-w-5xl mx-auto pt-10 border-t border-[#163A2A]/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-1.5">
            <h5 className="font-serif text-sm text-[#163A2A]">
              Agronomic Science
            </h5>
            <p className="text-[#263028]/80 leading-relaxed font-sans">
              All plant thresholds, light targets, and disease symptoms are verified against agronomic publications and university extension guidelines.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-serif text-sm text-[#163A2A]">
              Container Reality
            </h5>
            <p className="text-[#263028]/80 leading-relaxed font-sans">
              Algorithms adjust expectations for container soil volumes, drainage aeration, and restricted roots rather than open-field estimates.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-serif text-sm text-[#163A2A]">
              No Artificial Guarantees
            </h5>
            <p className="text-[#263028]/80 leading-relaxed font-sans">
              We never fabricate yield amounts, invent synthetic pesticide dosages, or guarantee survival. Intelligence aids observation; it does not replace it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
