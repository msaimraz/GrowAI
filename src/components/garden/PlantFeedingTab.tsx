'use client';

import React, { useState } from 'react';
import { UserPlant } from '@/types/garden';
import {
  FeedingRecord,
  FertilizerType,
  FertilizerFormulation,
  FeedingApplicationMethod,
  NutrientObservationType,
} from '@/types/grow-intelligence';
import { saveFeedingRecord } from '@/lib/grow-intelligence/storage';
import {
  Sprout,
  Plus,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  Loader2,
  Package,
  Layers,
} from 'lucide-react';

interface PlantFeedingTabProps {
  plant: UserPlant;
  feedings: FeedingRecord[];
  onFeedingAdded?: () => void;
}

export function PlantFeedingTab({
  plant,
  feedings,
  onFeedingAdded,
}: PlantFeedingTabProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('organic');
  const [formulation, setFormulation] = useState<FertilizerFormulation>('liquid');
  const [applicationMethod, setApplicationMethod] = useState<FeedingApplicationMethod>('soil_drench');
  const [npkRatio, setNpkRatio] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [dosageUnit, setDosageUnit] = useState('ml/L');
  const [dosageUnknown, setDosageUnknown] = useState(false);
  const [nextPlannedDate, setNextPlannedDate] = useState('');
  const [nutrientObservation, setNutrientObservation] = useState<NutrientObservationType>('normal_vigor');
  const [growerObservation, setGrowerObservation] = useState('');

  const plantFeedings = feedings.filter((f) => f.plantId === plant.id || !f.plantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg('Product or fertilizer name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const dosageNum = dosageAmount.trim() ? parseFloat(dosageAmount) : null;

      const res = await saveFeedingRecord({
        plantId: plant.id,
        feedingDate: new Date().toISOString(),
        productName: productName.trim(),
        fertilizerType,
        formulation,
        applicationMethod,
        npkRatio: npkRatio.trim() || null,
        dosageAmount: dosageUnknown ? null : dosageNum,
        dosageUnit: dosageUnknown ? null : dosageUnit.trim() || null,
        dosageUnknown,
        nextPlannedDate: nextPlannedDate.trim() || null,
        nutrientObservation,
        growerObservation: growerObservation.trim() || null,
      });

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      setShowLogModal(false);
      // Reset form
      setProductName('');
      setNpkRatio('');
      setDosageAmount('');
      setDosageUnknown(false);
      setNextPlannedDate('');
      setGrowerObservation('');
      if (onFeedingAdded) onFeedingAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save feeding record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#ded5c5] shadow-xs">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
            <Sprout size={20} className="text-[#144229]" />
            <span>Feeding & Nutrition Tracking</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
            Log organic feeds, mineral nutrients, application methods, and foliar vigor notes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus size={16} />
          <span>Log Feeding</span>
        </button>
      </div>

      {/* Safety Banner */}
      <div className="bg-[#fbf9f4] border border-[#ded5c5] rounded-2xl p-4 text-xs text-[#526a57] flex items-start gap-3">
        <HelpCircle size={16} className="text-[#144229] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#0c2417] block font-medium">Agronomic Safety Note</strong>
          GrowAI never invents fertilizer dosages or pesticide recommendations. Always consult the
          manufacturer product label for proper dilution rates and frequency.
        </div>
      </div>

      {/* Feeding History Cards */}
      {plantFeedings.length > 0 ? (
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#0c2417]">
              Recorded Feeding Events
            </h4>
            <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full">
              {plantFeedings.length} total entries
            </span>
          </div>

          <div className="divide-y divide-[#f0ebe0]">
            {plantFeedings.map((feed) => (
              <div key={feed.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0c2417]">
                      {feed.productName}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-[#eef5ee] text-[#144229] border-[#cfe0cf] capitalize">
                      {feed.fertilizerType.replace(/_/g, ' ')}
                    </span>
                    {feed.npkRatio && (
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#fbf9f4] border border-[#ded5c5] text-[#0c2417]">
                        NPK {feed.npkRatio}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6d8573]">
                    {new Date(feed.feedingDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#526a57] pt-1">
                  <div>
                    <span className="text-[#6d8573] block text-[11px]">Method:</span>
                    <span className="font-medium capitalize">{feed.applicationMethod.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[#6d8573] block text-[11px]">Applied Dosage:</span>
                    <span className="font-medium">
                      {feed.dosageAmount !== null && feed.dosageAmount !== undefined
                        ? `${feed.dosageAmount} ${feed.dosageUnit || ''}`
                        : feed.dosageUnknown
                        ? 'Dosage unrecorded (per label)'
                        : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6d8573] block text-[11px]">Next Planned:</span>
                    <span className="font-medium">
                      {feed.nextPlannedDate || 'None scheduled'}
                    </span>
                  </div>
                </div>

                {feed.nutrientObservation && feed.nutrientObservation !== 'normal_vigor' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <strong>Foliar Observation:</strong> {feed.nutrientObservation.replace(/_/g, ' ')}
                  </div>
                )}

                {feed.growerObservation && (
                  <p className="text-xs text-[#6d8573] italic">{feed.growerObservation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#ded5c5] space-y-3">
          <Package size={32} className="mx-auto text-[#8ba391]" />
          <h4 className="font-serif font-bold text-[#0c2417]">No Feeding Records Logged Yet</h4>
          <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto">
            Log your organic liquid feeds, worm casting top-dressings, or compost applications to
            track nutrient cycles and plant response over time.
          </p>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Record First Feeding</span>
          </button>
        </div>
      )}

      {/* Log Feeding Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ded5c5] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                <Sprout size={20} className="text-[#144229]" />
                <span>Log Plant Feeding</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-2 text-[#526a57] hover:text-[#0c2417] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Product / Fertilizer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fish & Kelp Emulsion, Worm Casting Tea"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Fertilizer Type
                  </label>
                  <select
                    value={fertilizerType}
                    onChange={(e) => setFertilizerType(e.target.value as FertilizerType)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="organic">Organic / Bio</option>
                    <option value="synthetic">Synthetic / Mineral</option>
                    <option value="compost_tea">Compost Tea</option>
                    <option value="slow_release">Slow Release Granules</option>
                    <option value="liquid_feed">Liquid Concentrate</option>
                    <option value="foliar">Foliar Spray</option>
                    <option value="worm_castings">Worm Castings</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Application Method
                  </label>
                  <select
                    value={applicationMethod}
                    onChange={(e) => setApplicationMethod(e.target.value as FeedingApplicationMethod)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="soil_drench">Soil Drench</option>
                    <option value="foliar_spray">Foliar Spray</option>
                    <option value="top_dress">Top Dress</option>
                    <option value="sub_irrigation">Bottom Water / Sub-irrigation</option>
                    <option value="hydroponic_reservoir">Hydroponic Reservoir</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    NPK Ratio (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5-1-1 or 3-2-2"
                    value={npkRatio}
                    onChange={(e) => setNpkRatio(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Next Planned Date
                  </label>
                  <input
                    type="date"
                    value={nextPlannedDate}
                    onChange={(e) => setNextPlannedDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Dosage Block */}
              <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0c2417]">
                    Applied Dosage Amount
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#526a57] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dosageUnknown}
                      onChange={(e) => setDosageUnknown(e.target.checked)}
                      className="rounded text-[#144229] focus:ring-[#144229]"
                    />
                    <span>Dosage unrecorded / per label</span>
                  </label>
                </div>

                {!dosageUnknown && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5"
                      value={dosageAmount}
                      onChange={(e) => setDosageAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-white text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                    />
                    <select
                      value={dosageUnit}
                      onChange={(e) => setDosageUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-white text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                    >
                      <option value="ml/L">ml / Liter</option>
                      <option value="tsp/gal">tsp / Gallon</option>
                      <option value="tbsp/gal">tbsp / Gallon</option>
                      <option value="g">grams</option>
                      <option value="ml">ml total</option>
                      <option value="handfuls">handfuls</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Nutrient Observation */}
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Observed Plant Response / Foliar Appearance
                </label>
                <select
                  value={nutrientObservation}
                  onChange={(e) => setNutrientObservation(e.target.value as NutrientObservationType)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                >
                  <option value="normal_vigor">Normal Healthy Vigor</option>
                  <option value="chlorosis">General Leaf Yellowing (Chlorosis)</option>
                  <option value="interveinal_chlorosis">Interveinal Chlorosis (Veins Green)</option>
                  <option value="leaf_edge_damage">Leaf Edge Browning / Burn</option>
                  <option value="purpling">Purpling Stems or Undersides</option>
                  <option value="stunted_growth">Stunted Vegetative Growth</option>
                  <option value="other">Other Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Grower Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Diluted with rainwater; leaves sprayed before noon."
                  value={growerObservation}
                  onChange={(e) => setGrowerObservation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ded5c5] text-xs font-semibold text-[#526a57] hover:bg-[#fbf9f4] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#1b5535] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Feeding</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

