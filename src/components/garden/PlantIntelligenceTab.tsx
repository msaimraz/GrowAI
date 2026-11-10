'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlant, PlantPhoto } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { GrowPlan } from '@/types/grow-plan';
import { fetchGrowPlans } from '@/lib/grow-plans/storage';
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
import { GrowerCopilot } from '@/components/copilot/GrowerCopilot';
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
  Bot,
  ChevronDown,
  ChevronUp,
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
      return { label: 'Recorded Fact', bg: 'bg-[#EAF1E4] text-[#174C35] border-[#E3DFD2]' };
    case 'calculated':
      return { label: 'Calculated Metric', bg: 'bg-[#E7F2F9] text-[#1B5D88] border-[#65A8D0/30]' };
    case 'observed':
      return { label: 'Visual Observation', bg: 'bg-[#F0ECF7] text-[#594186] border-[#9A83C5/30]' };
    case 'inferred':
      return { label: 'Agronomic Inference', bg: 'bg-[#FFF3D7] text-[#8A6400] border-[#F0C04D/30]' };
    case 'recommended':
      return { label: 'Action Recommendation', bg: 'bg-[#EAF1E4] text-[#174C35] border-[#78A95A/30]' };
    default:
      return { label: 'Status Unknown', bg: 'bg-[#F8F6EE] text-[#68766C] border-[#E3DFD2]' };
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

  const [showCopilot, setShowCopilot] = useState(false);
  const [activePlans, setActivePlans] = useState<GrowPlan[]>([]);

  useEffect(() => {
    fetchGrowPlans().then((res) => {
      const relevant = res.plans.filter(
        (p) => p.plantId === plant.id || (p.plantIds && p.plantIds.includes(plant.id))
      );
      setActivePlans(relevant);
    });
  }, [plant.id]);

  return (
    <div className="space-y-6">
      {/* 1. Scientific Integrity & Provenance Header */}
      <div className="bg-[#F8F6EE] border border-[#E3DFD2] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#EAF1E4] text-[#174C35] shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#203027]">
                Adaptive Grow Intelligence: {plant.nickname}
              </h3>
              <span className="text-[11px] font-medium text-[#68766C] bg-white px-2.5 py-0.5 rounded-full border border-[#E3DFD2]">
                Strict Data Provenance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#68766C] leading-relaxed">
              Synthesizes recorded garden facts into evidence-based recommendations. Unknown parameters
              remain strictly unknown, fertilizer dosages follow product labels, and no diagnoses are
              invented without recorded evidence.
            </p>
          </div>
        </div>

        {/* Provenance Key */}
        <div className="mt-4 pt-4 border-t border-[#E3DFD2]/60 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-semibold text-[#203027] mr-1">Provenance Legend:</span>
          <span className="px-2 py-0.5 rounded-md border bg-[#EAF1E4] text-[#174C35] border-[#E3DFD2]">
            ● Recorded Fact
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#E7F2F9] text-[#1B5D88] border-[#65A8D0/30]">
            ▲ Calculated
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#F0ECF7] text-[#594186] border-[#9A83C5/30]">
            ◈ Observed
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#FFF3D7] text-[#8A6400] border-[#F0C04D/30]">
            ◆ Agronomic Inference
          </span>
          <span className="px-2 py-0.5 rounded-md border bg-[#F8F6EE] text-[#68766C] border-[#E3DFD2]">
            ○ Unknown (Unrecorded)
          </span>
        </div>
      </div>

      {/* Phase 12: Grower Copilot Conversational Assistant */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF1E4] text-[#174C35]">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#203027] flex items-center gap-2">
                <span>Ask Grower Copilot</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#174C35] text-white">
                  Conversational AI
                </span>
              </h4>
              <p className="text-xs text-[#68766C]">
                Natural-language intelligence grounded in {plant.nickname}&apos;s recorded history and evidence.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCopilot(!showCopilot)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] hover:bg-[#EAF1E4] text-xs font-semibold text-[#174C35] transition-colors cursor-pointer"
          >
            <span>{showCopilot ? 'Hide Copilot' : 'Open Copilot'}</span>
            {showCopilot ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {showCopilot && (
          <div className="pt-3 border-t border-[#E3DFD2]/60">
            <GrowerCopilot
              activePlant={plant}
              plants={[plant]}
              diagnoses={diagnoses}
              conditions={conditions}
              feedings={feedings}
              propagations={propagations}
              harvests={harvests}
              reminders={reminders}
              compactMode={true}
            />
          </div>
        )}
      </div>

      {/* Phase 13: Active Grow Plan */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027]">
                Active Grow Plan
              </h4>
              <p className="text-[11px] text-[#68766C]">Structured milestone execution for {plant.nickname}</p>
            </div>
          </div>
          <Link
            href="/app/grow-plans"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {activePlans.length > 0 ? 'Manage Plans →' : '+ Create Plan'}
          </Link>
        </div>

        {activePlans.length > 0 ? (
          <div className="space-y-3 pt-2">
            {activePlans.slice(0, 1).map((p) => {
              const nextStep = p.steps.find((s) => s.status === 'ready' || s.status === 'in_progress');
              const pct = Math.round(p.progress?.taskCompletionPercentage || 0);
              return (
                <div key={p.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900">{p.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full capitalize font-medium text-[10px] bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-500">
                    <span>{pct}% tasks completed</span>
                    <span>{p.steps.filter((s) => s.status === 'completed').length} of {p.steps.length} steps</span>
                  </div>
                  {nextStep && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-stone-700">
                      <span className="font-semibold text-emerald-800 mr-1.5">Next Action:</span>
                      {nextStep.title} ({nextStep.category})
                    </div>
                  )}
                  <div className="pt-1 flex justify-end">
                    <Link href={`/app/grow-plans/${p.id}`} className="text-emerald-700 font-semibold hover:underline">
                      Open Plan Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] text-xs flex justify-between items-center">
            <span className="text-[#68766C]">No active grow plan assigned to this plant yet.</span>
            <Link
              href="/app/grow-plans"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Create Plan
            </Link>
          </div>
        )}
      </div>

      {/* 2. Phase 11 Primary Recommended Next Action (ONE Primary Action) */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
          <h4 className="font-serif font-bold text-base sm:text-lg text-[#203027] flex items-center gap-2">
            <Compass size={18} className="text-[#174C35]" />
            <span>Recommended Next Action</span>
          </h4>
          {primaryAction ? (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                primaryAction.priority === 'critical'
                  ? 'bg-[#FBE9E2] text-[#963A23] border-[#E4775D/30]'
                  : primaryAction.priority === 'high'
                  ? 'bg-[#FFF3D7] text-[#8A6400] border-[#F0C04D/30]'
                  : 'bg-[#EAF1E4] text-[#174C35] border-[#E3DFD2]'
              }`}
            >
              {primaryAction.priority} priority
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full border border-[#E3DFD2]">
              Up to date
            </span>
          )}
        </div>

        {primaryAction ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-sm sm:text-base text-[#203027]">
                    {primaryAction.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-[#68766C] mt-1 leading-relaxed">
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] text-white text-xs font-semibold hover:bg-[#174C35] transition-colors shrink-0 cursor-pointer min-h-[40px]"
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-[#E3DFD2]/60 text-xs text-[#174C35] font-medium bg-[#EAF1E4] p-2.5 rounded-xl">
                <strong>Action Guidance:</strong> {primaryAction.recommendedAction}
              </div>
            </div>

            {/* Supporting Evidence Breakdown (WHY -> ACTION) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#203027] block">
                Supporting Evidence (Why this action is recommended):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {primaryAction.evidence.map((ev: ActionEvidence, i: number) => {
                  const evBadge = getProvenanceBadge(ev.source);
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#E3DFD2] bg-white text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${evBadge.bg}`}>
                          {evBadge.label}
                        </span>
                        {ev.sourceId && (
                          <span className="text-[10px] text-[#68766C] font-mono">
                            Ref: {ev.sourceId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                      <p className="text-[#203027] font-medium pt-0.5">{ev.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
            <CheckCircle2 size={24} className="text-[#174C35] mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-semibold text-[#203027]">
              Nothing requires your immediate attention right now.
            </p>
            <p className="text-xs text-[#68766C]">
              Your health assessments, environmental observations, and care schedules for this plant are up to date.
            </p>
          </div>
        )}
      </div>

      {/* 3. Unified Botanical State Matrix (All 6 Domains) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Stage</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block truncate">
            {intel.currentState.identity.currentStage}
          </strong>
          <span className="text-[10px] text-[#68766C]">{intel.currentState.identity.ageDisplay}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Health Status</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block capitalize truncate">
            {intel.currentState.health.status.replace('_', ' ')}
          </strong>
          <span className="text-[10px] text-[#68766C]">
            {intel.currentState.health.isAiHypothesis ? 'AI Doctor Analysis' : 'Unassessed'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Environment</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block capitalize truncate">
            {intel.currentState.environment.summaryStatus.replace('_', ' ')}
          </strong>
          <span className="text-[10px] text-[#68766C]">
            {intel.currentState.environment.lastObserved || 'Never recorded'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Nutrition & Feed</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block truncate">
            {intel.currentState.feeding.totalFeedings > 0
              ? `${intel.currentState.feeding.totalFeedings} feeds logged`
              : 'No feeds logged'}
          </strong>
          <span className="text-[10px] text-[#68766C]">
            {intel.currentState.feeding.lastFed ? `Last: ${intel.currentState.feeding.lastFed}` : 'Unknown schedule'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Photos & Growth</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block truncate">
            {intel.currentState.growth.photoCount} photos • {intel.currentState.growth.totalNotes} notes
          </strong>
          <span className="text-[10px] text-[#68766C]">
            {intel.currentState.growth.lastNoteDate ? `Note: ${intel.currentState.growth.lastNoteDate}` : 'No notes'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-[11px] font-medium text-[#68766C] block">Harvests & Yield</span>
          <strong className="text-xs sm:text-sm text-[#203027] mt-0.5 block truncate">
            {intel.currentState.production.totalHarvestCount > 0
              ? `${intel.currentState.production.totalHarvestCount} harvest events`
              : '0 harvests'}
          </strong>
          <span className="text-[10px] text-[#68766C]">
            {intel.currentState.production.hasActiveCycle ? 'Active cycle' : 'Individual plant'}
          </span>
        </div>
      </div>

      {/* 4. Evidence-Backed Concerns */}
      {intel.concerns.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#8A6400] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#8A6400]" />
              <span>Evidence-Backed Plant Concerns</span>
            </h4>
            <span className="text-xs font-semibold text-[#8A6400] bg-[#FFF3D7] px-2.5 py-0.5 rounded-full border border-[#F0C04D/30]">
              {intel.concerns.length} flagged
            </span>
          </div>

          <div className="space-y-3">
            {intel.concerns.map((con: IntelligenceConcern, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#F0C04D/30] bg-[#F8F6EE] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs sm:text-sm font-semibold text-[#963A23]">
                    {con.title}
                  </strong>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FFF3D7] text-[#8A6400]">
                    {con.severity} severity
                  </span>
                </div>
                <div className="text-xs text-[#963A23] space-y-1">
                  <div className="font-medium">Observed Evidence:</div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
                    {con.evidence.map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 pt-2 border-t border-[#F0C04D/30]/60 text-xs text-[#963A23] bg-[#F8F6EE] p-2.5 rounded-xl">
                  <strong>Safe Guidance:</strong> {con.safeRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Botanical Information Gaps */}
      {intel.informationGaps.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027] flex items-center gap-2">
              <HelpCircle size={18} className="text-[#174C35]" />
              <span>Information Gaps (Unknowns)</span>
            </h4>
            <span className="text-xs font-semibold text-[#68766C] bg-[#F8F6EE] px-2.5 py-0.5 rounded-full border border-[#E3DFD2]">
              {intel.informationGaps.length} unrecorded
            </span>
          </div>

          <p className="text-xs text-[#68766C]">
            The following parameters have not been recorded yet. Recording them improves predictive
            accuracy without guessing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {intel.informationGaps.map((gap: IntelligenceGap, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#E3DFD2] bg-[#F8F6EE] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#68766C] block mb-1">
                    {gap.area} gap
                  </span>
                  <p className="text-xs text-[#203027] font-medium leading-relaxed">{gap.description}</p>
                </div>
                <p className="text-[11px] text-[#68766C] mt-2 italic">Check: {gap.actionableCheck}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Growth & Harvest Opportunities */}
      {intel.opportunities.length > 0 && (
        <div className="bg-[#EAF1E4] rounded-3xl border border-[#78A95A/30] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#78A95A/30]/60">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#174C35] flex items-center gap-2">
              <Lightbulb size={18} className="text-[#174C35]" />
              <span>Botanical Opportunities</span>
            </h4>
          </div>

          <div className="space-y-3">
            {intel.opportunities.map((opp: IntelligenceOpportunity, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-[#78A95A/30] space-y-1.5"
              >
                <div className="font-bold text-xs sm:text-sm text-[#174C35]">{opp.title}</div>
                <p className="text-xs text-[#174C35]">{opp.description}</p>
                <p className="text-[11px] text-[#174C35] font-medium bg-[#EAF1E4] px-2.5 py-1 rounded-lg">
                  Next Step: {opp.safeNextStep}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Recorded Facts Log */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-3">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027] flex items-center gap-2 pb-2 border-b border-[#E3DFD2]">
          <Info size={18} className="text-[#174C35]" />
          <span>Recorded Botanical Facts for this Plant</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-[#68766C]">
          {intel.evidenceFacts.map((fact: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#174C35] font-bold">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
