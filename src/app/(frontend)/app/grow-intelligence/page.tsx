'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchUserGarden } from '@/lib/storage';
import { fetchAllGardenDiagnoses } from '@/lib/ai-doctor/persistence';
import {
  fetchGrowingConditions,
  fetchFeedingRecords,
  fetchPropagationEvents,
  fetchProductionCycles,
  fetchHarvestRecords,
  saveProductionCycle,
} from '@/lib/grow-intelligence/storage';
import { aggregateGrowIntelligenceDashboard } from '@/lib/grow-intelligence/dashboard-aggregator';
import { calculateSpaceMetrics } from '@/lib/grow-intelligence/space-production-advisory';
import { fetchUserReminders, completeReminder } from '@/lib/reminders/reminder-storage';
import {
  synthesizeGardenState,
  prioritizeGardenActions,
  getNextBestAction,
  generateDailyGrowCheck,
  calculateDataQuality,
  answerGardenQuery,
  GrowAction,
  GardenState,
  DailyGrowCheck,
  GardenQueryResponse,
  DataQualityReport,
  ActionCategory,
  ActionPriority,
  ActionEvidence,
} from '@/lib/adaptive-grow';
import { UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  ProductionStage,
} from '@/types/grow-intelligence';
import { Reminder } from '@/types/reminder';
import { GrowPlan } from '@/types/grow-plan';
import { fetchGrowPlans } from '@/lib/grow-plans/storage';
import {
  Sparkles,
  Sprout,
  Thermometer,
  Droplets,
  Scissors,
  ShoppingBag,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Plus,
  Scale,
  Activity,
  Bell,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Loader2,
  X,
  Compass,
  Search,
  MessageSquare,
  Check,
  ShieldCheck,
  Filter,
  Bot,
} from 'lucide-react';
import { GrowerCopilot } from '@/components/copilot/GrowerCopilot';

export default function GrowIntelligencePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#526a57] bg-[#fbf9f4]">
          Loading Grow Intelligence...
        </div>
      }
    >
      <GrowIntelligenceContent />
    </React.Suspense>
  );
}

function GrowIntelligenceContent() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Raw entities
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosisRecord[]>([]);
  const [conditions, setConditions] = useState<GrowingConditionObservation[]>([]);
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [propagations, setPropagations] = useState<PropagationEvent[]>([]);
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [growPlans, setGrowPlans] = useState<GrowPlan[]>([]);

  // Phase 11 UI state
  const [actionCategoryFilter, setActionCategoryFilter] = useState<string>('all');
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState<GardenQueryResponse | null>(null);

  // Production Cycle Modal State
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleSpecies, setCycleSpecies] = useState('sweet-basil');
  const [cycleArea, setCycleArea] = useState('');
  const [cyclePlantedQty, setCyclePlantedQty] = useState('10');
  const [cycleStage, setCycleStage] = useState<ProductionStage>('vegetative');
  const [cycleSubmitting, setCycleSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [
        gardenRes,
        healthRes,
        condRes,
        feedRes,
        propRes,
        cycleRes,
        harvRes,
        remRes,
        plansRes,
      ] = await Promise.all([
        fetchUserGarden(),
        fetchAllGardenDiagnoses(),
        fetchGrowingConditions(),
        fetchFeedingRecords(),
        fetchPropagationEvents(),
        fetchProductionCycles(),
        fetchHarvestRecords(),
        fetchUserReminders(),
        fetchGrowPlans(),
      ]);

      setPlants(gardenRes.plants || []);

      const allDiags: SavedDiagnosisRecord[] = [];
      if (healthRes.diagnosesByPlantId) {
        Object.values(healthRes.diagnosesByPlantId).forEach((list) => {
          allDiags.push(...list);
        });
      }
      setDiagnoses(allDiags);
      setConditions(condRes.observations || []);
      setFeedings(feedRes.records || []);
      setPropagations(propRes.events || []);
      setCycles(cycleRes.cycles || []);
      setHarvests(harvRes.harvests || []);
      setReminders(remRes.reminders || []);
      setGrowPlans(plansRes.plans || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Aggregate Space Metrics
  const spaceMetrics = useMemo(() => {
    return calculateSpaceMetrics(plants, cycles, 24);
  }, [plants, cycles]);

  // Phase 10 Dashboard Summary
  const dashboard = useMemo(() => {
    return aggregateGrowIntelligenceDashboard({
      plants,
      diagnoses,
      conditions,
      feedings,
      propagations,
      cycles,
      harvests,
      reminders,
      space: spaceMetrics,
      referenceDate: isMounted ? undefined : new Date('2026-11-05T00:00:00.000Z'),
    });
  }, [
    plants,
    diagnoses,
    conditions,
    feedings,
    propagations,
    cycles,
    harvests,
    reminders,
    spaceMetrics,
    isMounted,
  ]);

  // Phase 11 Adaptive Garden State & Engines
  const adaptiveInput = useMemo(() => {
    return {
      plants,
      conditions,
      feedings,
      propagations,
      cycles,
      harvests,
      diagnoses,
      reminders,
      spaceMetrics,
      referenceDate: isMounted ? undefined : new Date('2026-11-05T00:00:00.000Z'),
    };
  }, [
    plants,
    conditions,
    feedings,
    propagations,
    cycles,
    harvests,
    diagnoses,
    reminders,
    spaceMetrics,
    isMounted,
  ]);

  const gardenState = useMemo(() => {
    return synthesizeGardenState(adaptiveInput);
  }, [adaptiveInput]);

  const prioritizedActions = useMemo(() => {
    return prioritizeGardenActions(adaptiveInput);
  }, [adaptiveInput]);

  const nextBestAction = useMemo(() => {
    return getNextBestAction(gardenState, prioritizedActions);
  }, [gardenState, prioritizedActions]);

  const dailyGrowCheck = useMemo(() => {
    return generateDailyGrowCheck({
      gardenState,
      actions: prioritizedActions,
      referenceDate: isMounted ? undefined : new Date('2026-11-05T00:00:00.000Z'),
      growPlans,
    });
  }, [gardenState, prioritizedActions, isMounted, growPlans]);

  const dataQualityReport = useMemo(() => {
    return calculateDataQuality(adaptiveInput);
  }, [adaptiveInput]);

  const filteredActions = useMemo(() => {
    if (actionCategoryFilter === 'all') return prioritizedActions;
    return prioritizedActions.filter((a) => a.category === actionCategoryFilter);
  }, [prioritizedActions, actionCategoryFilter]);

  const handleAskQuery = (qText: string) => {
    if (!qText.trim()) return;
    const res = answerGardenQuery(qText, {
      gardenState,
      actions: prioritizedActions,
      input: adaptiveInput,
    });
    setQueryResult(res);
  };

  const handleCompleteReminder = async (id: string) => {
    await completeReminder(id);
    await loadData();
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim()) return;
    setCycleSubmitting(true);
    try {
      const qty = parseInt(cyclePlantedQty, 10) || 1;
      await saveProductionCycle({
        cycleName: cycleName.trim(),
        plantSlug: cycleSpecies,
        growingArea: cycleArea.trim() || null,
        startDate: new Date().toISOString().split('T')[0],
        stage: cycleStage,
        quantityPlanted: qty,
        quantityActive: qty,
        quantityLost: 0,
        quantityHarvested: 0,
        status: 'active',
      });
      setShowCycleModal(false);
      setCycleName('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create production cycle.');
    } finally {
      setCycleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0c2417] pb-20">
      <AppHeader
        title="Adaptive Grow Intelligence"
        subtitle="Adaptive decision system: daily grow checks, prioritized next actions, and data-grounded garden queries"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* ==================================================================== */}
        {/* PHASE 11: TODAY & NEXT ACTIONS HERO SECTION                          */}
        {/* ==================================================================== */}

        {/* 1. Daily Grow Check Card */}
        <div className="bg-gradient-to-br from-[#144229] to-[#0a2818] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Compass size={22} className="text-emerald-300" />
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-200">
                  Daily Grow Check • {dailyGrowCheck.date}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                {dailyGrowCheck.headline}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-emerald-100">
                {prioritizedActions.length} prioritized item{prioritizedActions.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Daily signals & observation gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Positive Signals */}
            {dailyGrowCheck.positiveSignals.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Positive Signals</span>
                </span>
                <ul className="space-y-1 text-xs text-white/90">
                  {dailyGrowCheck.positiveSignals.map((sig, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Observations to Record */}
            {dailyGrowCheck.observationsToRecord.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>Observations to Record</span>
                </span>
                <ul className="space-y-1 text-xs text-white/90">
                  {dailyGrowCheck.observationsToRecord.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-300 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 2. Next Best Action Callout Card */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#144229]" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417]">
                What Should I Do Now?
              </h3>
            </div>
            {nextBestAction && (
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  nextBestAction.priority === 'critical'
                    ? 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
                    : nextBestAction.priority === 'high'
                    ? 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]'
                    : 'bg-[#eef5ee] text-[#144229] border-[#cfe0cf]'
                }`}
              >
                {nextBestAction.priority} priority
              </span>
            )}
          </div>

          {nextBestAction ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white border border-[#ded5c5] text-[#526a57]">
                      {nextBestAction.category.replace('_', ' ')}
                    </span>
                    {nextBestAction.plantName && (
                      <span className="text-xs font-semibold text-[#144229]">
                        {nextBestAction.plantName}
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#0c2417]">
                    {nextBestAction.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                    {nextBestAction.explanation}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-[#144229] bg-[#eef5ee] p-2.5 rounded-xl border border-[#cfe0cf]">
                    <strong>Recommended Action:</strong> {nextBestAction.recommendedAction}
                  </div>
                </div>

                {nextBestAction.route && (
                  <Link
                    href={nextBestAction.route}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors shrink-0 cursor-pointer min-h-[44px]"
                  >
                    <span>Take Action</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>

              {/* Supporting Evidence Breakdown */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[#0c2417] block">
                  Supporting Evidence (Why this action was chosen):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {nextBestAction.evidence.map((ev: ActionEvidence, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs space-y-1"
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d8573] block">
                        Source: {ev.source.replace('_', ' ')}
                      </span>
                      <p className="text-[#0c2417] font-medium">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5">
              <CheckCircle2 size={28} className="text-[#144229] mx-auto mb-1" />
              <p className="text-sm sm:text-base font-serif font-bold text-[#0c2417]">
                Nothing requires your attention right now.
              </p>
              <p className="text-xs text-[#526a57]">
                All care tasks, observations, health follow-ups, and schedules across your garden are completely up to date.
              </p>
            </div>
          )}
        </div>

        {/* Phase 13: Active Grow Plans Overview */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <Calendar size={18} className="text-[#144229]" />
                <span>Active Grow Plans</span>
              </h3>
              <p className="text-xs text-[#526a57] mt-0.5">
                Structured execution milestone tracking adapting to actual observations.
              </p>
            </div>
            <Link
              href="/app/grow-plans"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Manage All Plans ({growPlans.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {growPlans.filter((p) => p.status === 'active').length === 0 ? (
            <div className="p-5 text-center rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-[#526a57]">No active grow plans running right now.</span>
              <Link
                href="/app/grow-plans"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Create Grow Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {growPlans
                .filter((p) => p.status === 'active')
                .slice(0, 3)
                .map((p) => {
                  const nextStep = p.steps.find((s) => s.status === 'ready' || s.status === 'in_progress');
                  const taskPct = Math.round(p.progress?.taskCompletionPercentage || 0);
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-stone-900 dark:text-stone-100">{p.name}</h4>
                          <span className="px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                            {p.healthStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden my-2">
                          <div className="bg-emerald-600 h-full" style={{ width: `${taskPct}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-stone-500 mb-2">
                          <span>{taskPct}% tasks complete</span>
                          <span>{p.steps.filter((s) => s.status === 'completed').length}/{p.steps.length} steps</span>
                        </div>
                        {nextStep && (
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-stone-700 dark:text-stone-300">
                            <strong>Next:</strong> {nextStep.title}
                          </div>
                        )}
                      </div>
                      <div className="pt-2 text-right">
                        <Link
                          href={`/app/grow-plans/${p.id}`}
                          className="font-semibold text-emerald-600 hover:underline"
                        >
                          View Plan →
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 3. Prioritized Action Cards with Category Filter */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#144229]" />
                <span>Prioritized Garden Action Queue</span>
              </h3>
              <p className="text-xs text-[#526a57] mt-0.5">
                Deterministic priority ranking across health, care, environment, nutrition, and production.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {['all', 'health', 'care', 'environment', 'growth', 'feeding', 'production'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActionCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                    actionCategoryFilter === cat
                      ? 'bg-[#144229] text-white shadow-xs'
                      : 'bg-[#fbf9f4] text-[#526a57] hover:bg-[#eef5ee] border border-[#ded5c5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredActions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActions.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#ded5c5] text-[#526a57]">
                          {act.category}
                        </span>
                        {act.plantName && (
                          <span className="text-xs font-semibold text-[#144229]">
                            {act.plantName}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          act.priority === 'critical'
                            ? 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
                            : act.priority === 'high'
                            ? 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]'
                            : 'bg-white text-[#526a57] border-[#ded5c5]'
                        }`}
                      >
                        {act.priority}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs sm:text-sm text-[#0c2417]">
                      {act.title}
                    </h5>
                    <p className="text-xs text-[#526a57] leading-relaxed">
                      {act.explanation}
                    </p>

                    <div className="text-[11px] text-[#144229] bg-white p-2 rounded-xl border border-[#ded5c5]">
                      <strong>Guidance:</strong> {act.recommendedAction}
                    </div>
                  </div>

                  {act.route && (
                    <div className="pt-2 border-t border-[#ded5c5]/60 flex justify-end">
                      <Link
                        href={act.route}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#144229] hover:underline"
                      >
                        <span>Open Action</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs sm:text-sm text-[#526a57] italic">
              No actions pending for category: {actionCategoryFilter}.
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* PHASE 12: GROWER COPILOT — CONVERSATIONAL INTELLIGENCE               */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#144229] text-white">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0c2417] flex items-center gap-2">
                  <span>Grower Copilot</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]">
                    Conversational Intelligence
                  </span>
                </h3>
                <p className="text-xs text-[#526a57]">
                  Natural-language reasoning over your garden facts, health history, conditions, and schedules.
                </p>
              </div>
            </div>
          </div>

          <GrowerCopilot
            plants={plants}
            diagnoses={diagnoses}
            conditions={conditions}
            feedings={feedings}
            propagations={propagations}
            cycles={cycles}
            harvests={harvests}
            reminders={reminders}
            spaceMetrics={spaceMetrics}
            onRefreshNeeded={loadData}
          />
        </div>

        {/* 4. Natural-Language Query Widget: "Ask Your Garden Records" */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <MessageSquare size={18} className="text-[#144229]" />
                <span>Ask Your Garden Records</span>
              </h3>
              <p className="text-xs text-[#526a57] mt-0.5">
                Answers are strictly grounded in your recorded garden facts, health history, and measurements.
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-full border border-[#cfe0cf]">
              Fact-Grounded
            </span>
          </div>

          {/* Query Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuery(queryInput);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. What should I do today? or Which plants need attention?"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-[#6d8573]" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px] shrink-0"
            >
              Ask Garden
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-[11px] font-semibold text-[#6d8573]">Sample inquiries:</span>
            {[
              'What should I do today?',
              'Which plants need attention?',
              'What information am I missing?',
              'Which crops produced the most historically?',
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryInput(prompt);
                  handleAskQuery(prompt);
                }}
                className="px-3 py-1 rounded-full bg-[#fbf9f4] border border-[#ded5c5] text-[#144229] hover:bg-[#eef5ee] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Query Response Display */}
          {queryResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-3 mt-3">
              <div className="flex items-center justify-between text-xs">
                <strong className="text-[#0c2417]">Query Result</strong>
                <span className="text-[11px] text-[#526a57] bg-white px-2 py-0.5 rounded-md border border-[#ded5c5]">
                  Confidence: {queryResult.confidence}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#0c2417] leading-relaxed font-medium">
                {queryResult.answer}
              </p>

              {queryResult.groundedFacts.length > 0 && (
                <div className="pt-2 border-t border-[#ded5c5]/60 text-xs text-[#526a57] space-y-1">
                  <span className="font-semibold text-[#0c2417] block">Grounded Evidence Facts:</span>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {queryResult.groundedFacts.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Data Quality Intelligence Card */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#144229]" />
                <span>Garden Record Completeness</span>
              </h3>
              <p className="text-xs text-[#526a57] mt-0.5">
                Measures data completeness across basics, growth, environment, nutrition, and health.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6d8573]">Completeness Score:</span>
              <strong className="text-lg font-bold text-[#144229]">
                {dataQualityReport.score}%
              </strong>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#fbf9f4] border border-[#ded5c5] rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#144229] h-full rounded-full transition-all duration-500"
              style={{ width: `${dataQualityReport.score}%` }}
            />
          </div>

          {/* Category score pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {dataQualityReport.categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs space-y-1"
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d8573] block truncate">
                  {cat.category}
                </span>
                <strong className="text-sm font-bold text-[#0c2417] block">
                  {cat.score}%
                </strong>
                {cat.missing.length > 0 ? (
                  <span className="text-[10px] text-[#92400e] block truncate" title={cat.missing[0]}>
                    Missing: {cat.missing[0]}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#144229] block">Complete</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#6d8573] italic pt-1">
            Note: Data completeness is strictly a measure of logged records, never a judgment of plant health.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* EXISTING PHASE 10 SYSTEM SECTIONS (PRESERVED & INTEGRATED)           */}
        {/* ==================================================================== */}

        {/* 6. Scientific Integrity & Provenance Banner */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={22} className="text-[#144229]" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0c2417]">
                  Garden Intelligence Synthesis
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#526a57] max-w-3xl leading-relaxed">
                GrowAI unifies plant state across growing conditions, nutrition, health, propagation,
                and measured harvests. Strict agronomic rules prevent guessing: unknown values remain
                unknown, fertilizer dosage follows labels, and yield per area is only computed when
                square footage is recorded.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCycleModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px]"
              >
                <Plus size={16} />
                <span>New Crop Cycle</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Total Plants</span>
              <strong className="text-lg font-bold text-[#0c2417]">
                {dashboard.gardenOverview.totalPlants}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Today's Tasks</span>
              <strong className="text-lg font-bold text-[#144229]">
                {dashboard.todayActionCount}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Condition Observations</span>
              <strong className="text-lg font-bold text-[#0c2417]">
                {conditions.length}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Feedings Logged</span>
              <strong className="text-lg font-bold text-[#0c2417]">
                {feedings.length}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Active Cuttings</span>
              <strong className="text-lg font-bold text-[#144229]">
                {dashboard.propagationHighlights.activeEventsCount}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[11px] font-semibold text-[#6d8573] block">Harvest Events</span>
              <strong className="text-lg font-bold text-[#0c2417]">
                {dashboard.productionHighlights.totalHarvestsRecorded}
              </strong>
            </div>
          </div>
        </div>

        {/* 7. Today's Botanical Actions & Due Reminders */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
              <Bell size={18} className="text-[#144229]" />
              <span>Today's Actions & Due Reminders</span>
            </h3>
            <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cfe0cf]">
              {dashboard.activeReminders.length} pending
            </span>
          </div>

          {dashboard.activeReminders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dashboard.activeReminders.slice(0, 6).map((rem: Reminder) => (
                <div
                  key={rem.id}
                  className="p-4 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#0c2417] truncate">
                        {rem.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#ded5c5] capitalize text-[#526a57]">
                        {rem.reminderType}
                      </span>
                    </div>
                    <p className="text-xs text-[#526a57] line-clamp-2">{rem.body}</p>
                    <span className="text-[11px] text-[#6d8573] block">
                      Due: {new Date(rem.dueAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteReminder(rem.id)}
                    className="p-2 rounded-xl text-[#144229] hover:bg-[#eef5ee] border border-[#cfdfcf] bg-white cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Mark completed"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs sm:text-sm text-[#526a57] italic">
              All scheduled care tasks, health follow-ups, and feeding observations are up to date!
            </div>
          )}
        </div>

        {/* 8. Growing Conditions & Nutrition Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conditions Card */}
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <Thermometer size={18} className="text-[#144229]" />
                <span>Growing Conditions Intelligence</span>
              </h3>
              <Link
                href="/app/my-garden?tab=conditions"
                className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                <span className="text-[#6d8573] block text-[11px] font-medium">Observed Recently</span>
                <strong className="text-base text-[#0c2417]">
                  {dashboard.conditionsHighlights.recentlyObservedCount} plants
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                <span className="text-[#6d8573] block text-[11px] font-medium">Missing Condition Logs</span>
                <strong className="text-base text-[#92400e]">
                  {dashboard.conditionsHighlights.plantsMissingConditionsCount} plants
                </strong>
              </div>
            </div>

            <p className="text-xs text-[#526a57] leading-relaxed">
              Recording temperature, ambient humidity, and soil moisture ensures plants stay within
              their expected botanical ranges and informs diagnosis hypotheses.
            </p>
          </div>

          {/* Feeding & Nutrition Card */}
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <Droplets size={18} className="text-[#144229]" />
                <span>Feeding & Nutrition Highlights</span>
              </h3>
              <Link
                href="/app/my-garden?tab=feeding"
                className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                <span className="text-[#6d8573] block text-[11px] font-medium">Recently Fed (14d)</span>
                <strong className="text-base text-[#144229]">
                  {dashboard.feedingHighlights.recentlyFedCount} plants
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                <span className="text-[#6d8573] block text-[11px] font-medium">Scheduled Upcoming</span>
                <strong className="text-base text-[#0c2417]">
                  {dashboard.feedingHighlights.upcomingFeedingCount} events
                </strong>
              </div>
            </div>

            <p className="text-xs text-[#526a57] leading-relaxed">
              GrowAI preserves NPK ratios and manufacturer label guidance. Foliar observations
              track whether plants exhibit chlorosis, vigor, or edge browning over time.
            </p>
          </div>
        </div>

        {/* 9. Production Cycles & Harvest Analytics */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#144229]" />
                <span>Crop Cycles & Cumulative Harvest Yield</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
                Batch production cycles, cut-and-come-again yields, and verified weight metrics.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCycleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#ded5c5] text-[#144229] hover:bg-[#eef5ee] text-xs font-semibold transition-colors cursor-pointer min-h-[40px] self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>Add Production Cycle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-xs text-[#6d8573] block font-medium">Active Production Cycles</span>
              <strong className="text-xl font-bold text-[#0c2417] mt-1 block">
                {dashboard.productionHighlights.activeCyclesCount}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-xs text-[#6d8573] block font-medium">Total Harvest Events</span>
              <strong className="text-xl font-bold text-[#144229] mt-1 block">
                {dashboard.productionHighlights.totalHarvestsRecorded}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-xs text-[#6d8573] block font-medium">Cumulative Yield Logged</span>
              <div className="mt-1 space-y-0.5">
                {Object.keys(dashboard.productionHighlights.totalYieldByUnit).length > 0 ? (
                  Object.entries(dashboard.productionHighlights.totalYieldByUnit).map(
                    ([unit, total]) => (
                      <strong key={unit} className="text-lg font-bold text-[#0c2417] block">
                        {Number(total).toLocaleString()} {unit}
                      </strong>
                    )
                  )
                ) : (
                  <span className="text-sm text-[#526a57] italic">0 g recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Active Cycles Table / List */}
          {cycles.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-xs text-[#6d8573] uppercase tracking-wider">
                Logged Production Cycles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cycles.map((cyc) => (
                  <div
                    key={cyc.id}
                    className="p-4 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm text-[#0c2417]">
                          {cyc.cycleName}
                        </strong>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#ded5c5] capitalize text-[#526a57]">
                          {cyc.stage}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#526a57] block mt-0.5">
                        Planted: {cyc.quantityPlanted} • Active: {cyc.quantityActive} • Harvested: {cyc.quantityHarvested}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-full border border-[#cfe0cf]">
                      {cyc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 10. Space Highlights & Structural Safety Advisory */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
              <Layers size={18} className="text-[#144229]" />
              <span>Small-Space Production & Utilization</span>
            </h3>
            <Link
              href="/app/planner"
              className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
            >
              <span>Planner</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px] font-medium">Total Capacity</span>
              <strong className="text-base text-[#0c2417]">
                {dashboard.spaceHighlights.totalSpaceCapacityUnits} slots
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px] font-medium">Active Occupancy</span>
              <strong className="text-base text-[#144229]">
                {dashboard.spaceHighlights.occupancyRatePercent}%
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px] font-medium">Unused Slots</span>
              <strong className="text-base text-[#0c2417]">
                {dashboard.spaceHighlights.unusedCapacitySlots} slots
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px] font-medium">Structural Safety</span>
              <strong className="text-base text-[#92400e]">
                Mandatory Check
              </strong>
            </div>
          </div>

          {/* Mandatory Structural Advisory Banner */}
          <div className="p-4 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] flex items-start gap-3">
            <ShieldAlert size={18} className="text-[#c2410c] shrink-0 mt-0.5" />
            <div className="text-xs text-[#9a3412] leading-relaxed">
              <strong>Mandatory Balcony & Structural Safety:</strong> Verify structural load capacity
              and shelf weight limits before adding heavy damp planters or additional tier racks.
            </div>
          </div>
        </div>
      </main>

      {/* Production Cycle Modal */}
      {showCycleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ded5c5] max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#144229]" />
                <span>Create Production Cycle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCycleModal(false)}
                className="p-1 rounded-lg text-[#526a57] hover:bg-[#fbf9f4] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Cycle / Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Basil Batch A"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={cycleStage}
                    onChange={(e) => setCycleStage(e.target.value as ProductionStage)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="planned">Planned</option>
                    <option value="nursery">Nursery</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="harvesting">Harvesting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Planted Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cyclePlantedQty}
                    onChange={(e) => setCyclePlantedQty(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Growing Area / Rack Slot (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tier 2 Shelf A (0.5 m²)"
                  value={cycleArea}
                  onChange={(e) => setCycleArea(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCycleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ded5c5] text-xs font-semibold text-[#526a57] hover:bg-[#fbf9f4] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cycleSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#1b5535] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {cycleSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Create Cycle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
