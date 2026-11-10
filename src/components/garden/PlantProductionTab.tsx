'use client';

import React, { useState, useMemo } from 'react';
import { UserPlant } from '@/types/garden';
import {
  PropagationEvent,
  HarvestRecord,
  HarvestUnit,
  HarvestType,
  HarvestQualityObservation,
  PropagationMethod,
} from '@/types/grow-intelligence';
import { buildPlantLineage } from '@/lib/grow-intelligence/propagation-engine';
import { calculateYieldMetrics } from '@/lib/grow-intelligence/production-engine';
import {
  savePropagationEvent,
  updatePropagationOutcome,
  saveHarvestRecord,
} from '@/lib/grow-intelligence/storage';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  Scissors,
  ShoppingBag,
  Plus,
  GitBranch,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Loader2,
  Scale,
  Sparkles,
} from 'lucide-react';

interface PlantProductionTabProps {
  plant: UserPlant;
  allPlants: UserPlant[];
  propagations: PropagationEvent[];
  harvests: HarvestRecord[];
  onDataChanged?: () => void;
  onSelectPlant?: (plantId: string) => void;
}

export function PlantProductionTab({
  plant,
  allPlants,
  propagations,
  harvests,
  onDataChanged,
  onSelectPlant,
}: PlantProductionTabProps) {
  const { showSuccess } = useGrowToast();
  const [showPropModal, setShowPropModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Propagation Form State
  const [propMethod, setPropMethod] = useState<PropagationMethod>('cutting');
  const [propMedium, setPropMedium] = useState('Water');
  const [propNotes, setPropNotes] = useState('');
  const [propFollowupDays, setPropFollowupDays] = useState('7');

  // Harvest Form State
  const [harvestQty, setHarvestQty] = useState('');
  const [harvestUnit, setHarvestUnit] = useState<HarvestUnit>('g');
  const [harvestType, setHarvestType] = useState<HarvestType>('cut_and_come_again');
  const [harvestQuality, setHarvestQuality] = useState<HarvestQualityObservation>('prime');
  const [harvestNotes, setHarvestNotes] = useState('');

  // Lineage calculation
  const lineage = useMemo(() => {
    return buildPlantLineage(plant, allPlants, propagations);
  }, [plant, allPlants, propagations]);

  // Plant harvests & yield metrics
  const plantHarvests = useMemo(() => {
    return harvests.filter((h) => h.plantId === plant.id);
  }, [harvests, plant.id]);

  const yieldMetrics = useMemo(() => {
    return calculateYieldMetrics(plantHarvests);
  }, [plantHarvests]);

  // Active propagations from this plant
  const activeProps = useMemo(() => {
    return propagations.filter(
      (p) => p.parentPlantId === plant.id && p.status === 'in_progress'
    );
  }, [propagations, plant.id]);

  const handleCreatePropagation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const days = parseInt(propFollowupDays, 10) || 7;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + days);

      const res = await savePropagationEvent({
        parentPlantId: plant.id,
        parentPlantNickname: plant.nickname,
        propagationMethod: propMethod,
        startedDate: new Date().toISOString().split('T')[0],
        medium: propMedium.trim() || null,
        expectedFollowupDate: expectedDate.toISOString().split('T')[0],
        notes: propNotes.trim() || null,
        status: 'in_progress',
      });

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      showSuccess('🌱 Propagation recorded!', 'Your new growing journey has been added.', '🌱');
      setShowPropModal(false);
      setPropNotes('');
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start propagation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPropagationOutcome = async (
    propId: string,
    status: 'success' | 'failure'
  ) => {
    setSubmitting(true);
    try {
      await updatePropagationOutcome(propId, {
        status,
        outcomeDate: new Date().toISOString().split('T')[0],
      });
      if (status === 'success') {
        showSuccess('🌱 Propagation rooted!', 'Rooting confirmed! Ready for potting.', '🌱');
      }
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update propagation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(harvestQty);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid positive harvest quantity.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await saveHarvestRecord({
        plantId: plant.id,
        harvestDate: new Date().toISOString(),
        quantity: qty,
        unit: harvestUnit,
        harvestType,
        qualityObservation: harvestQuality,
        notes: harvestNotes.trim() || null,
      });

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      showSuccess('🌿 Harvest recorded!', 'Nice work growing your food.', '🌿');
      setShowHarvestModal(false);
      setHarvestQty('');
      setHarvestNotes('');
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E3DFD2] shadow-xs">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#203027] flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#174C35]" />
            <span>Propagation, Production & Harvest Log</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#68766C] mt-0.5">
            Track lineage, cuttings in progress, harvest frequency, and measured yields.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPropModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E3DFD2] text-[#174C35] hover:bg-[#EAF1E4] text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <Scissors size={15} />
            <span>Propagate Plant</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHarvestModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#174C35] text-white hover:bg-[#174C35] text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Log Harvest</span>
          </button>
        </div>
      </div>

      {/* Yield Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-xs font-semibold text-[#68766C] block mb-1">Total Harvest Events</span>
          <strong className="text-xl font-bold text-[#203027]">
            {yieldMetrics.totalHarvestCount}
          </strong>
          <span className="text-[11px] text-[#68766C] block mt-0.5">
            {yieldMetrics.latestHarvestDate
              ? `Latest: ${new Date(yieldMetrics.latestHarvestDate).toLocaleDateString()}`
              : 'No harvests recorded yet'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-xs font-semibold text-[#68766C] block mb-1">Cumulative Recorded Yield</span>
          <div className="text-sm font-bold text-[#203027] space-y-0.5">
            {Object.keys(yieldMetrics.totalsByUnit).length > 0 ? (
              Object.entries(yieldMetrics.totalsByUnit).map(([unit, total]) => (
                <div key={unit}>
                  {total.toLocaleString()} {unit}
                </div>
              ))
            ) : (
              <span className="text-xs font-normal text-[#68766C]">0 units</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E3DFD2]">
          <span className="text-xs font-semibold text-[#68766C] block mb-1">Lineage & Descendants</span>
          <strong className="text-xl font-bold text-[#203027]">
            {lineage.offspringCount} offspring
          </strong>
          <span className="text-[11px] text-[#68766C] block mt-0.5">
            {lineage.parentNickname ? `Propagated from ${lineage.parentNickname}` : 'Primary seed/specimen'}
          </span>
        </div>
      </div>

      {/* Active Propagations Card */}
      {activeProps.length > 0 && (
        <div className="bg-[#F8F6EE] border border-[#E3DFD2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]/60">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027] flex items-center gap-2">
              <Scissors size={18} className="text-[#174C35]" />
              <span>Propagations In Progress ({activeProps.length})</span>
            </h4>
            <span className="text-xs bg-[#EAF1E4] text-[#174C35] px-2.5 py-0.5 rounded-full border border-[#E3DFD2] font-semibold">
              Rooting / Callusing
            </span>
          </div>

          <div className="space-y-3">
            {activeProps.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-2xl bg-white border border-[#E3DFD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-[#203027] capitalize">
                      {prop.propagationMethod} Cutting
                    </strong>
                    <span className="text-xs text-[#68766C]">in {prop.medium || 'water'}</span>
                  </div>
                  <p className="text-xs text-[#68766C] mt-1">
                    Started: {prop.startedDate} • Next check: {prop.expectedFollowupDate || 'Pending'}
                  </p>
                  {prop.notes && <p className="text-xs text-[#68766C] mt-1 italic">{prop.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMarkPropagationOutcome(prop.id, 'success')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2] text-xs font-semibold hover:bg-[#EAF1E4] cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="text-[#174C35]" />
                    <span>Rooted (Success)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkPropagationOutcome(prop.id, 'failure')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#963A23] border border-[#F0C04D/30] text-xs font-semibold hover:bg-orange-50 cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Failed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harvest History Log */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027] flex items-center gap-2">
            <Scale size={18} className="text-[#174C35]" />
            <span>Harvest History Log</span>
          </h4>
          <span className="text-xs font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full">
            {plantHarvests.length} entries
          </span>
        </div>

        {plantHarvests.length > 0 ? (
          <div className="divide-y divide-[#E3DFD2]">
            {plantHarvests.map((h) => (
              <div key={h.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#203027]">
                      {h.quantity} {h.unit}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#EAF1E4] text-[#174C35] font-medium border border-[#E3DFD2]">
                      {h.harvestType === 'cut_and_come_again' ? 'Cut & Come Again' : 'Full Harvest'}
                    </span>
                    {h.qualityObservation && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200 capitalize">
                        {h.qualityObservation}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#68766C]">
                    {new Date(h.harvestDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {h.notes && <p className="text-xs text-[#68766C] italic">{h.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs sm:text-sm text-[#68766C] italic">
            No harvests recorded for this plant yet. Log your first harvest or pruning yield above.
          </div>
        )}
      </div>

      {/* Propagate Modal */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E3DFD2] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
              <h3 className="font-serif font-bold text-lg text-[#203027] flex items-center gap-2">
                <Scissors size={20} className="text-[#174C35]" />
                <span>Propagate {plant.nickname}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPropModal(false)}
                className="p-2 text-[#68766C] hover:text-[#203027] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreatePropagation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Propagation Method
                  </label>
                  <select
                    value={propMethod}
                    onChange={(e) => setPropMethod(e.target.value as PropagationMethod)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  >
                    <option value="cutting">Stem / Leaf Cutting</option>
                    <option value="division">Root Division</option>
                    <option value="runner">Runner / Stolon</option>
                    <option value="layering">Layering</option>
                    <option value="seed">Seed Saved</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Medium
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Water, Perlite, Seed Starting Mix"
                    value={propMedium}
                    onChange={(e) => setPropMedium(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Follow-up Check (Days from now)
                </label>
                <select
                  value={propFollowupDays}
                  onChange={(e) => setPropFollowupDays(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                >
                  <option value="3">In 3 days (Check water / mist)</option>
                  <option value="5">In 5 days</option>
                  <option value="7">In 1 week (Check callusing/nubs)</option>
                  <option value="14">In 2 weeks (Check root length)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4-inch node cut below third leaf set; lower leaves stripped."
                  value={propNotes}
                  onChange={(e) => setPropNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPropModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E3DFD2] text-xs font-semibold text-[#68766C] hover:bg-[#F8F6EE] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#174C35] text-white text-xs font-semibold hover:bg-[#174C35] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Start Propagation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Harvest Modal */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E3DFD2] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
              <h3 className="font-serif font-bold text-lg text-[#203027] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#174C35]" />
                <span>Log Harvest for {plant.nickname}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHarvestModal(false)}
                className="p-2 text-[#68766C] hover:text-[#203027] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateHarvest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 150"
                    value={harvestQty}
                    onChange={(e) => setHarvestQty(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Unit
                  </label>
                  <select
                    value={harvestUnit}
                    onChange={(e) => setHarvestUnit(e.target.value as HarvestUnit)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  >
                    <option value="g">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="oz">ounces (oz)</option>
                    <option value="lb">pounds (lb)</option>
                    <option value="pieces">pieces / fruits</option>
                    <option value="bunches">bunches</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Harvest Type
                  </label>
                  <select
                    value={harvestType}
                    onChange={(e) => setHarvestType(e.target.value as HarvestType)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  >
                    <option value="cut_and_come_again">Cut and Come Again</option>
                    <option value="full_harvest">Full Final Harvest</option>
                    <option value="pruning_yield">Pruning Yield</option>
                    <option value="thinning">Thinning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Quality Observation
                  </label>
                  <select
                    value={harvestQuality}
                    onChange={(e) => setHarvestQuality(e.target.value as HarvestQualityObservation)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                  >
                    <option value="prime">Prime (Excellent flavor & color)</option>
                    <option value="good">Good standard</option>
                    <option value="acceptable">Acceptable</option>
                    <option value="substandard">Substandard</option>
                    <option value="blemished">Blemished</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Notes (Flavor, aroma, maturity)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Crisp leaves, highly fragrant, harvested in early morning."
                  value={harvestNotes}
                  onChange={(e) => setHarvestNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E3DFD2] text-xs font-semibold text-[#68766C] hover:bg-[#F8F6EE] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#174C35] text-white text-xs font-semibold hover:bg-[#174C35] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Harvest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

