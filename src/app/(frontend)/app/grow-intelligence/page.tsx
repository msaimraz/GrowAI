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
} from 'lucide-react';

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
      ] = await Promise.all([
        fetchUserGarden(),
        fetchAllGardenDiagnoses(),
        fetchGrowingConditions(),
        fetchFeedingRecords(),
        fetchPropagationEvents(),
        fetchProductionCycles(),
        fetchHarvestRecords(),
        fetchUserReminders(),
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
      setHarvests(harvRes.records || []);
      setReminders(remRes.reminders || []);
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

  // Aggregate Complete Dashboard
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
        title="Grow Intelligence & Production"
        subtitle="Cross-domain botanical analytics: conditions, feeding, propagation, batches & yield"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* 1. Scientific Integrity & Provenance Banner */}
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

        {/* 2. Today's Botanical Actions & Due Reminders */}
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

        {/* 3. Growing Conditions & Nutrition Grid */}
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

        {/* 4. Production Cycles & Harvest Analytics */}
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

          {/* Cumulative Yields by Unit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {Object.keys(dashboard.productionHighlights.totalYieldByUnit).length > 0 ? (
              Object.entries(dashboard.productionHighlights.totalYieldByUnit).map(([unit, total]) => (
                <div key={unit} className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                  <span className="text-xs font-semibold text-[#6d8573] block mb-1">
                    Total Harvested ({unit})
                  </span>
                  <strong className="text-xl font-bold text-[#0c2417]">
                    {Number(total).toLocaleString()} {unit}
                  </strong>
                </div>
              ))
            ) : (
              <div className="col-span-full p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] text-xs text-[#526a57]">
                No harvests recorded yet. Log cut-and-come-again or full harvests from My Garden.
              </div>
            )}
          </div>

          {/* Active Production Cycles List */}
          {cycles.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                Tracked Crop Cycles ({cycles.length})
              </h4>
              <div className="divide-y divide-[#f0ebe0]">
                {cycles.map((cycle) => (
                  <div key={cycle.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#0c2417]">{cycle.cycleName}</strong>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#eef5ee] text-[#144229] border border-[#cfe0cf] capitalize">
                          {cycle.stage}
                        </span>
                        <span className="text-xs text-[#526a57]">
                          Started: {cycle.startDate}
                        </span>
                      </div>
                      <p className="text-xs text-[#6d8573] mt-0.5">
                        Planted: {cycle.quantityPlanted} • Active: {cycle.quantityActive} • Lost: {cycle.quantityLost} • Harvested: {cycle.quantityHarvested}
                        {cycle.growingArea ? ` • Area: ${cycle.growingArea}` : ''}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-xl self-start sm:self-auto capitalize">
                      {cycle.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Production Space Utilization & Structural Safety Protection */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417] flex items-center gap-2">
              <Layers size={18} className="text-[#144229]" />
              <span>Small-Space & Vertical Utilization</span>
            </h3>
            <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cfe0cf]">
              {spaceMetrics.occupancyRatePercent}% Occupancy
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px]">Total Capacity</span>
              <strong className="text-base text-[#0c2417]">{spaceMetrics.totalSpaceCapacityUnits} slots</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px]">Active Plants</span>
              <strong className="text-base text-[#0c2417]">{spaceMetrics.activePlantsOccupied} occupied</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px]">Free Capacity</span>
              <strong className="text-base text-[#144229]">{spaceMetrics.unusedCapacitySlots} slots open</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#6d8573] block text-[11px]">Tier Distribution</span>
              <span className="text-xs font-medium text-[#0c2417] block mt-0.5">
                Top: {spaceMetrics.tierDistribution.top} • Mid: {spaceMetrics.tierDistribution.middle} • Bot: {spaceMetrics.tierDistribution.bottom}
              </span>
            </div>
          </div>

          {/* Structural Safety Protection Notice */}
          <div className="p-4 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] flex items-start gap-3 text-xs text-[#9a3412]">
            <ShieldAlert size={18} className="text-[#c2410c] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Vertical Structural Safety Advisory</strong>
              <p className="mt-0.5 leading-relaxed">
                Structural capacity must not be assumed safe when unconfirmed. Ensure balcony railings,
                wall brackets, and vertical shelving are rated for wet potting soil weight (approx 1.5–2kg per liter).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* New Crop Cycle Modal */}
      {showCycleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ded5c5] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#144229]" />
                <span>Start New Production Crop Cycle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCycleModal(false)}
                className="p-2 text-[#526a57] hover:text-[#0c2417] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Cycle / Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Basil Succession #1, Microgreen Batch A"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
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
                    <option value="nursery">Nursery / Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="harvesting">Harvesting</option>
                  </select>
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
