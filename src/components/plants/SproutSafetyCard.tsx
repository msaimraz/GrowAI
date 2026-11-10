'use client';

import React from 'react';
import { FoodSafetyGuidance } from '@/types/plant';
import { ShieldAlert, Flame, Users, AlertTriangle, Bug, Droplet, Thermometer } from 'lucide-react';

interface SproutSafetyCardProps {
  foodSafety: FoodSafetyGuidance;
  plantName: string;
}

export function SproutSafetyCard({ foodSafety, plantName }: SproutSafetyCardProps) {
  if (!foodSafety.hasMicrobialRisk) return null;

  return (
    <div className="rounded-3xl border-2 border-[#E4775D] bg-[#FBE9E2] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Visual background indicator stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#E4775D]" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1 pb-4 border-b border-[#E4775D/30]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FBE9E2] border-2 border-[#E4775D/30] flex items-center justify-center text-[#963A23] shrink-0 mt-0.5">
            <ShieldAlert size={26} />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#963A23] block">
              Critical Public Health Guidance • FDA / CDC Protocol
            </span>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#963A23] tracking-tight">
              Microbial Food Safety Advisory: Raw {plantName}
            </h4>
            <p className="text-sm sm:text-base text-[#963A23] leading-relaxed">
              Sprouts require warm, humid conditions to germinate—conditions that are biologically optimal for rapid foodborne bacterial growth.
            </p>
          </div>
        </div>

        <span className="shrink-0 self-start px-3.5 py-1.5 rounded-full bg-[#E4775D] text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
          High-Risk Food
        </span>
      </div>

      {/* Four Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Pathogen Concerns */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4775D/30] space-y-2.5">
          <div className="flex items-center gap-2 text-[#963A23]">
            <Bug size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#963A23]">
              Documented Foodborne Pathogens
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
            {foodSafety.pathogenConcerns && foodSafety.pathogenConcerns.length > 0 ? (
              <span>
                Historically responsible for major international outbreaks:{' '}
                <strong className="text-[#963A23]">
                  {foodSafety.pathogenConcerns.join(', ')}
                </strong>
                .
              </span>
            ) : (
              <span>
                Bacterial species such as <strong className="text-[#963A23]">Salmonella enterica</strong>,{' '}
                <strong className="text-[#963A23]">Escherichia coli (STEC)</strong>, and{' '}
                <strong className="text-[#963A23]">Listeria monocytogenes</strong>.
              </span>
            )}
          </p>
          <p className="text-xs sm:text-sm text-[#963A23] bg-[#FBE9E2] p-2.5 rounded-xl border border-[#E4775D/30]">
            Pathogen cells can survive dry dormancy on seed surfaces and multiply exponentially during germination.
          </p>
        </div>

        {/* 2. Washing Limitation */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4775D/30] space-y-2.5">
          <div className="flex items-center gap-2 text-[#963A23]">
            <Droplet size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#963A23]">
              Rinsing & Washing Limitations
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
            {foodSafety.washingAdvisory ||
              'Washing alone does not guarantee safety. Bacteria can become internalized into microscopic seed crevices and inside vascular sprout tissues during germination, where surface rinsing cannot reach them.'}
          </p>
          <p className="text-xs sm:text-sm text-[#963A23] bg-[#FBE9E2] p-2.5 rounded-xl border border-[#E4775D/30]">
            Sanitizing seeds prior to sprouting lowers bacterial load but does not guarantee 100% sterile harvest.
          </p>
        </div>

        {/* 3. Cooking Recommendation */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4775D/30] space-y-2.5">
          <div className="flex items-center gap-2 text-[#963A23]">
            <Flame size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#963A23]">
              Cooking Kills Pathogens
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
            {foodSafety.cookingRecommendation ||
              'Cook sprouts thoroughly by steaming, boiling, or stir-frying until steaming hot throughout (core temperature of at least 74°C / 165°F) before eating. Thorough heat treatment effectively eliminates vegetative foodborne pathogens.'}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#174C35] bg-[#EAF1E4] p-2.5 rounded-xl border border-[#E3DFD2]">
            <Thermometer size={16} className="text-[#174C35]" />
            <span>Target Core Temperature: ≥ 74°C (165°F) throughout</span>
          </div>
        </div>

        {/* 4. High-Risk Vulnerable Populations */}
        <div className="p-5 rounded-2xl bg-[#FBE9E2] border-2 border-[#E4775D] space-y-2.5">
          <div className="flex items-center gap-2 text-[#963A23]">
            <Users size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#963A23]">
              High-Risk Vulnerable Populations
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#963A23] font-medium leading-relaxed">
            {foodSafety.vulnerablePopulationsAdvisory ||
              'Authoritative health bodies (FDA, CDC, Health Canada) strongly advise pregnant individuals, young children, older adults (65+), and people with weakened immune systems to avoid raw or lightly cooked sprouts.'}
          </p>
          <p className="text-xs sm:text-sm text-[#963A23] font-semibold">
            Strict Action: Eat sprouts ONLY when thoroughly cooked throughout.
          </p>
        </div>
      </div>

      {/* Home Garden Safety Disclaimer */}
      <div className="p-4 bg-white rounded-2xl border border-[#E4775D/30] text-xs sm:text-sm text-[#963A23] leading-relaxed flex items-center gap-3">
        <AlertTriangle size={18} className="shrink-0 text-[#963A23]" />
        <span>
          <strong>Home Gardener Notice:</strong> Home-grown sprouts are <em>not</em> immune to microbial contamination. The seed origin and sprouting jar humidity pose identical biological challenges to commercial operations. Always observe clean-handling practices.
        </span>
      </div>
    </div>
  );
}
