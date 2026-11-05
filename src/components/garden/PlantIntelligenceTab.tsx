'use client';

import React, { useMemo } from 'react';
import { UserPlant, PlantPhoto } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  HarvestRecord,
  ProvenanceCategory,
  IntelligenceConfidence,
  IntelligenceAction,
  IntelligenceConcern,
  IntelligenceGap,
  IntelligenceOpportunity,
} from '@/types/grow-intelligence';
import { Reminder } from '@/types/reminder';
import { generateUnifiedIntelligence } from '@/lib/grow-intelligence/intelligence-engine';
import { prioritizeGardenActions } from '@/lib/adaptive-grow/action-prioritizer';
import { synthesizeGardenState } from '@/lib/adaptive-grow/garden-state-engine';
import { getNextBestAction } from '@/lib/adaptive-grow/next-best-action';
import { ActionEvidence } from '@/types/adaptive-grow';
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Droplets,
  Thermometer,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

interface PlantIntelligenceTabProps {
  plant: UserPlant;
  diagnoses?: SavedDiagnosisRecord[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  harvests?: HarvestRecord[];
  photos?: PlantPhoto[];
  reminders?: Reminder[];
  onNavigateTab?: (tab: string) => void;
}

function getProvenanceBadge(provenance: ProvenanceCategory) {
  switch (provenance) {
    case 'recorded':
      return { label: 'Recorded Fact', bg: 'bg-[#eef5ee] text-[#144229] border-[#cfe0cf]' };
    case 'calculated':
      return { label: 'Calculated Metric', bg: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]' };
    case 'observed':
      return { label: 'Visual Observation', bg: 'bg-[#f5f3ff] text-[#5b21b6] border-[#ddd6fe]' };
    case 'inferred':
      return { label: 'Agronomic Inference', bg: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]' };
    case 'recommended':
      return { label: 'Action Recommendation', bg: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]' };
    default:
      return { label: 'Status Unknown', bg: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]' };
  }
}

export function PlantIntelligenceTab({
  plant,
  diagnoses = [],
  conditions = [],
  feedings = [],
  propagations = [],
  harvests = [],
  photos = [],
  reminders = [],
  onNavigateTab,
}: PlantIntelligenceTabProps) {
  const intel = useMemo(() => {
    return generateUnifiedIntelligence({
      plant,
      diagnoses,
      conditions,
      feedings,
      propagations,
      harvests,
      photos,
    });
  }, [plant, diagnoses, conditions, feedings, propagations, harvests, photos]);

  // Phase 11 Adaptive Prioritization for this plant
  const plantActions = useMemo(() => {
    return prioritizeGardenActions({
      plants: [plant],
      conditions: conditions.filter((c) => !c.plantId || c.plantId === plant.id),
      feedings: feedings.filter((f) => !f.plantId || f.plantId === plant.id),
      propagations: propagations.filter(
        (p) => p.parentPlantId === plant.id || p.offspringPlantId === plant.id
      ),
      harvests: harvests.filter((h) => h.plantId === plant.id),
      diagnoses,
      reminders,
    });
  }, [plant, conditions, feedings, propagations, harvests, diagnoses, reminders]);

  const primaryAction = useMemo(() => {
    if (plantActions.length === 0) return null;
    const gardenState = synthesizeGardenState({
      plants: [plant],
      conditions,
      feedings,
      propagations,
      harvests,
      diagnoses,
      reminders,
    });
    return getNextBestAction(gardenState, plantActions);
  }, [plantActions, plant, conditions, feedings, propagations, harvests, diagnoses, reminders]);

  return (
    <div className="space-y-6">
      {/* 1. Scientific Integrity & Provenance Header */}
      <div className="bg-[#fbf9f4] border border-[#ded5c5] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#eef5ee] text-[#144229] shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417]">
                Adaptive Grow Intelligence: {plant.nickname}
              </h3>
              <span className="text-[11px] font-medium text-[#526a57] bg-white px-2.5 py-0.5 rounded-full border border-[#ded5c5]">
                Strict Data Provenance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
              Synthesizes recorded garden facts into evidence-based recommendations. Unknown parameters
              remain strictly unknown, fertilizer dosages follow product labels, and no diagnoses are
              invented without recorded evidence.
            </p>
          </div>
        </div>

        {/* Provenance Key */}
        <div className="mt-4 pt-4 border-t border-[#ded5c5]/60 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-semibold text-[#0c2417] mr-1">Provenance Legend:</span>
          <span className="px-2 py-0.5 rounded-md border bg-[#eef5ee] text-[#144229] border-[#cfe0cf]">
            ● Recorded Fact
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]">
            ▲ Calculated
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#f5f3ff] text-[#5b21b6] border-[#ddd6fe]">
            ◈ Observed
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#fffbeb] text-[#92400e] border-[#fde68a]">
            ◆ Agronomic Inference
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]">
            ○ Unknown (Unrecorded)
          </span>
        </div>
      </div>

      {/* 2. Phase 11 Primary Recommended Next Action (ONE Primary Action) */}
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
          <h4 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
            <Compass size={18} className="text-[#144229]" />
            <span>Recommended Next Action</span>
          </h4>
          {primaryAction ? (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                primaryAction.priority === 'critical'
                  ? 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
                  : primaryAction.priority === 'high'
                  ? 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]'
                  : 'bg-[#eef5ee] text-[#144229] border-[#cfe0cf]'
              }`}
            >
              {primaryAction.priority} priority
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cfe0cf]">
              Up to date
            </span>
          )}
        </div>

        {primaryAction ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-sm sm:text-base text-[#0c2417]">
                    {primaryAction.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-[#526a57] mt-1 leading-relaxed">
                    {primaryAction.explanation}
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (primaryAction.category === 'feeding') onNavigateTab('feeding');
                      else if (primaryAction.category === 'environment') onNavigateTab('conditions');
                      else if (primaryAction.category === 'health') onNavigateTab('health');
                      else if (
                        primaryAction.category === 'production' ||
                        primaryAction.category === 'propagation'
                      )
                        onNavigateTab('production');
                      else if (primaryAction.category === 'care') onNavigateTab('reminders');
                      else onNavigateTab('journal');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#1b5535] transition-colors shrink-0 cursor-pointer min-h-[40px]"
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-[#ded5c5]/60 text-xs text-[#144229] font-medium bg-[#eef5ee] p-2.5 rounded-xl">
                <strong>Action Guidance:</strong> {primaryAction.recommendedAction}
              </div>
            </div>

            {/* Supporting Evidence Breakdown (WHY -> ACTION) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#0c2417] block">
                Supporting Evidence (Why this action is recommended):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {primaryAction.evidence.map((ev: ActionEvidence, i: number) => {
                  const evBadge = getProvenanceBadge(ev.source);
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#ded5c5] bg-white text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${evBadge.bg}`}>
                          {evBadge.label}
                        </span>
                        {ev.sourceId && (
                          <span className="text-[10px] text-[#8aa390] font-mono">
                            Ref: {ev.sourceId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                      <p className="text-[#0c2417] font-medium pt-0.5">{ev.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
            <CheckCircle2 size={24} className="text-[#144229] mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-semibold text-[#0c2417]">
              Nothing requires your immediate attention right now.
            </p>
            <p className="text-xs text-[#526a57]">
              Your health assessments, environmental observations, and care schedules for this plant are up to date.
            </p>
          </div>
        )}
      </div>

      {/* 3. Unified Botanical State Matrix (All 6 Domains) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Stage</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block truncate">
            {intel.currentState.identity.currentStage}
          </strong>
          <span className="text-[10px] text-[#526a57]">{intel.currentState.identity.ageDisplay}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Health Status</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block capitalize truncate">
            {intel.currentState.health.status.replace('_', ' ')}
          </strong>
          <span className="text-[10px] text-[#526a57]">
            {intel.currentState.health.isAiHypothesis ? 'AI Doctor Analysis' : 'Unassessed'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Environment</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block capitalize truncate">
            {intel.currentState.environment.summaryStatus.replace('_', ' ')}
          </strong>
          <span className="text-[10px] text-[#526a57]">
            {intel.currentState.environment.lastObserved || 'Never recorded'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Nutrition & Feed</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block truncate">
            {intel.currentState.feeding.totalFeedings > 0
              ? `${intel.currentState.feeding.totalFeedings} feeds logged`
              : 'No feeds logged'}
          </strong>
          <span className="text-[10px] text-[#526a57]">
            {intel.currentState.feeding.lastFed ? `Last: ${intel.currentState.feeding.lastFed}` : 'Unknown schedule'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Photos & Growth</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block truncate">
            {intel.currentState.growth.photoCount} photos • {intel.currentState.growth.totalNotes} notes
          </strong>
          <span className="text-[10px] text-[#526a57]">
            {intel.currentState.growth.lastNoteDate ? `Note: ${intel.currentState.growth.lastNoteDate}` : 'No notes'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5]">
          <span className="text-[11px] font-medium text-[#6d8573] block">Harvests & Yield</span>
          <strong className="text-xs sm:text-sm text-[#0c2417] mt-0.5 block truncate">
            {intel.currentState.production.totalHarvestCount > 0
              ? `${intel.currentState.production.totalHarvestCount} harvest events`
              : '0 harvests'}
          </strong>
          <span className="text-[10px] text-[#526a57]">
            {intel.currentState.production.hasActiveCycle ? 'Active cycle' : 'Individual plant'}
          </span>
        </div>
      </div>

      {/* 4. Evidence-Backed Concerns */}
      {intel.concerns.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0ebe0]">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#92400e] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#b45309]" />
              <span>Evidence-Backed Plant Concerns</span>
            </h4>
            <span className="text-xs font-semibold text-[#92400e] bg-[#fffbeb] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
              {intel.concerns.length} flagged
            </span>
          </div>

          <div className="space-y-3">
            {intel.concerns.map((con: IntelligenceConcern, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#fed7aa] bg-[#fffaf5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs sm:text-sm font-semibold text-[#9a3412]">
                    {con.title}
                  </strong>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#ffedd5] text-[#c2410c]">
                    {con.severity} severity
                  </span>
                </div>
                <div className="text-xs text-[#7c2d12] space-y-1">
                  <div className="font-medium">Observed Evidence:</div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
                    {con.evidence.map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 pt-2 border-t border-[#fed7aa]/60 text-xs text-[#9a3412] bg-[#fff5ea] p-2.5 rounded-xl">
                  <strong>Safe Guidance:</strong> {con.safeRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Botanical Information Gaps */}
      {intel.informationGaps.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0ebe0]">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#0c2417] flex items-center gap-2">
              <HelpCircle size={18} className="text-[#144229]" />
              <span>Information Gaps (Unknowns)</span>
            </h4>
            <span className="text-xs font-semibold text-[#526a57] bg-[#fbf9f4] px-2.5 py-0.5 rounded-full border border-[#ded5c5]">
              {intel.informationGaps.length} unrecorded
            </span>
          </div>

          <p className="text-xs text-[#526a57]">
            The following parameters have not been recorded yet. Recording them improves predictive
            accuracy without guessing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {intel.informationGaps.map((gap: IntelligenceGap, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d8573] block mb-1">
                    {gap.area} gap
                  </span>
                  <p className="text-xs text-[#0c2417] font-medium leading-relaxed">{gap.description}</p>
                </div>
                <p className="text-[11px] text-[#526a57] mt-2 italic">Check: {gap.actionableCheck}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Growth & Harvest Opportunities */}
      {intel.opportunities.length > 0 && (
        <div className="bg-[#f0fdf4] rounded-3xl border border-[#bbf7d0] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#bbf7d0]/60">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#166534] flex items-center gap-2">
              <Lightbulb size={18} className="text-[#15803d]" />
              <span>Botanical Opportunities</span>
            </h4>
          </div>

          <div className="space-y-3">
            {intel.opportunities.map((opp: IntelligenceOpportunity, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-[#bbf7d0] space-y-1.5"
              >
                <div className="font-bold text-xs sm:text-sm text-[#14532d]">{opp.title}</div>
                <p className="text-xs text-[#166534]">{opp.description}</p>
                <p className="text-[11px] text-[#15803d] font-medium bg-[#f0fdf4] px-2.5 py-1 rounded-lg">
                  Next Step: {opp.safeNextStep}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Recorded Facts Log */}
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-3">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#0c2417] flex items-center gap-2 pb-2 border-b border-[#f0ebe0]">
          <Info size={18} className="text-[#144229]" />
          <span>Recorded Botanical Facts for this Plant</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-[#526a57]">
          {intel.evidenceFacts.map((fact: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#144229] font-bold">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
