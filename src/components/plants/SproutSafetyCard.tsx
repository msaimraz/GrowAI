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
    <div className="rounded-3xl border-2 border-[#ef4444] bg-[#fff8f8] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Visual background indicator stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#ef4444]" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1 pb-4 border-b border-[#fecaca]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] border-2 border-[#fca5a5] flex items-center justify-center text-[#b91c1c] shrink-0 mt-0.5">
            <ShieldAlert size={26} />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#b91c1c] block">
              Critical Public Health Guidance • FDA / CDC Protocol
            </span>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#7f1d1d] tracking-tight">
              Microbial Food Safety Advisory: Raw {plantName}
            </h4>
            <p className="text-sm sm:text-base text-[#991b1b] leading-relaxed">
              Sprouts require warm, humid conditions to germinate—conditions that are biologically optimal for rapid foodborne bacterial growth.
            </p>
          </div>
        </div>

        <span className="shrink-0 self-start px-3.5 py-1.5 rounded-full bg-[#ef4444] text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
          High-Risk Food
        </span>
      </div>

      {/* Four Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Pathogen Concerns */}
        <div className="p-5 rounded-2xl bg-white border border-[#fecaca] space-y-2.5">
          <div className="flex items-center gap-2 text-[#991b1b]">
            <Bug size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#7f1d1d]">
              Documented Foodborne Pathogens
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#1c261e] leading-relaxed">
            {foodSafety.pathogenConcerns && foodSafety.pathogenConcerns.length > 0 ? (
              <span>
                Historically responsible for major international outbreaks:{' '}
                <strong className="text-[#991b1b]">
                  {foodSafety.pathogenConcerns.join(', ')}
                </strong>
                .
              </span>
            ) : (
              <span>
                Bacterial species such as <strong className="text-[#991b1b]">Salmonella enterica</strong>,{' '}
                <strong className="text-[#991b1b]">Escherichia coli (STEC)</strong>, and{' '}
                <strong className="text-[#991b1b]">Listeria monocytogenes</strong>.
              </span>
            )}
          </p>
          <p className="text-xs sm:text-sm text-[#7f1d1d] bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca]">
            Pathogen cells can survive dry dormancy on seed surfaces and multiply exponentially during germination.
          </p>
        </div>

        {/* 2. Washing Limitation */}
        <div className="p-5 rounded-2xl bg-white border border-[#fecaca] space-y-2.5">
          <div className="flex items-center gap-2 text-[#991b1b]">
            <Droplet size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#7f1d1d]">
              Rinsing & Washing Limitations
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#1c261e] leading-relaxed">
            {foodSafety.washingAdvisory ||
              'Washing alone does not guarantee safety. Bacteria can become internalized into microscopic seed crevices and inside vascular sprout tissues during germination, where surface rinsing cannot reach them.'}
          </p>
          <p className="text-xs sm:text-sm text-[#7f1d1d] bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca]">
            Sanitizing seeds prior to sprouting lowers bacterial load but does not guarantee 100% sterile harvest.
          </p>
        </div>

        {/* 3. Cooking Recommendation */}
        <div className="p-5 rounded-2xl bg-white border border-[#fecaca] space-y-2.5">
          <div className="flex items-center gap-2 text-[#991b1b]">
            <Flame size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#7f1d1d]">
              Cooking Kills Pathogens
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#1c261e] leading-relaxed">
            {foodSafety.cookingRecommendation ||
              'Cook sprouts thoroughly by steaming, boiling, or stir-frying until steaming hot throughout (core temperature of at least 74°C / 165°F) before eating. Thorough heat treatment effectively eliminates vegetative foodborne pathogens.'}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#144229] bg-[#eef5ee] p-2.5 rounded-xl border border-[#cfe0cf]">
            <Thermometer size={16} className="text-[#144229]" />
            <span>Target Core Temperature: ≥ 74°C (165°F) throughout</span>
          </div>
        </div>

        {/* 4. High-Risk Vulnerable Populations */}
        <div className="p-5 rounded-2xl bg-[#fee2e2] border-2 border-[#f87171] space-y-2.5">
          <div className="flex items-center gap-2 text-[#7f1d1d]">
            <Users size={18} className="shrink-0" />
            <h5 className="font-bold text-base text-[#7f1d1d]">
              High-Risk Vulnerable Populations
            </h5>
          </div>
          <p className="text-sm sm:text-base text-[#991b1b] font-medium leading-relaxed">
            {foodSafety.vulnerablePopulationsAdvisory ||
              'Authoritative health bodies (FDA, CDC, Health Canada) strongly advise pregnant individuals, young children, older adults (65+), and people with weakened immune systems to avoid raw or lightly cooked sprouts.'}
          </p>
          <p className="text-xs sm:text-sm text-[#7f1d1d] font-semibold">
            Strict Action: Eat sprouts ONLY when thoroughly cooked throughout.
          </p>
        </div>
      </div>

      {/* Home Garden Safety Disclaimer */}
      <div className="p-4 bg-white rounded-2xl border border-[#fecaca] text-xs sm:text-sm text-[#7f1d1d] leading-relaxed flex items-center gap-3">
        <AlertTriangle size={18} className="shrink-0 text-[#b91c1c]" />
        <span>
          <strong>Home Gardener Notice:</strong> Home-grown sprouts are <em>not</em> immune to microbial contamination. The seed origin and sprouting jar humidity pose identical biological challenges to commercial operations. Always observe clean-handling practices.
        </span>
      </div>
    </div>
  );
}
