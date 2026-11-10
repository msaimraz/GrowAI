'use client';

import React, { useState } from 'react';
import { UserPlant } from '@/types/garden';
import { GrowPlanTemplateId, GrowPlan } from '@/types/grow-plan';
import { generatePlanFromTemplate, getTemplateDefinitions } from '@/lib/grow-plans/plan-generator';
import { createGrowPlan } from '@/lib/grow-plans/storage';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { Loader2, X, Check, Sprout, Sparkles } from 'lucide-react';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: GrowPlan) => void;
  plants: UserPlant[];
  preselectedPlantId?: string;
}

export function CreatePlanModal({
  isOpen,
  onClose,
  onPlanCreated,
  plants,
  preselectedPlantId,
}: CreatePlanModalProps) {
  const { showSuccess } = useGrowToast();
  const templates = getTemplateDefinitions();

  const [selectedTemplateId, setSelectedTemplateId] = useState<GrowPlanTemplateId>('plant_establishment');
  const [selectedPlantId, setSelectedPlantId] = useState<string>(preselectedPlantId || (plants[0]?.id || ''));
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlant = plants.find((p) => p.id === selectedPlantId);

  // Generate preview
  const preview = generatePlanFromTemplate(selectedTemplateId, {
    plant: selectedPlant,
    plantId: selectedPlant?.id,
    plantSlug: selectedPlant?.plantSlug,
    name: customName.trim() || undefined,
    description: customDescription.trim() || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createGrowPlan({
        userId: 'user-local',
        name: customName.trim() || preview.name,
        description: customDescription.trim() || preview.description,
        objective: preview.objective,
        scope: preview.scope,
        plantId: preview.plantId,
        plantIds: preview.plantIds,
        steps: preview.steps,
        evidenceBasis: preview.evidenceBasis,
      });

      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.plan) {
        onPlanCreated(res.plan);
        showSuccess('🌱 Grow Plan Created!', `"${res.plan.name}" is now active and ready.`, '🌱');
        onClose();
        setCustomName('');
        setCustomDescription('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F6EE] border border-[#E3DFD2] rounded-3xl w-full max-w-[calc(100vw-24px)] sm:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E3DFD2] bg-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#203027]">
                Create Adaptive Grow Plan
              </h2>
              <p className="text-xs text-[#5F6D63] mt-0.5">
                Structured, evidence-grounded care plans that adapt to actual plant observations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#5F6D63] hover:text-[#203027] p-1.5 rounded-xl hover:bg-[#F8F6EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#F8F6EE]">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#203027] mb-2 uppercase tracking-wider">
              Select Plan Objective & Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id as GrowPlanTemplateId)}
                    className={`p-3.5 text-left rounded-2xl border text-xs transition active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? 'border-[#174C35] bg-[#EAF1E4] shadow-xs ring-1 ring-[#174C35]'
                        : 'border-[#E3DFD2] bg-white hover:bg-[#F8F6EE]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-[#203027] text-sm">
                        {tpl.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#174C35] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#5F6D63] line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-[#174C35] font-semibold">
                      {tpl.defaultStepCount} standard steps
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Plant Selection */}
          {plants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1.5 uppercase tracking-wider">
                Target Specimen
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-[#E3DFD2] bg-white text-[#203027] focus:outline-none focus:ring-2 focus:ring-[#174C35]/20 focus:border-[#174C35] transition"
              >
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.nickname} ({plant.plantSlug || 'Specimen'}) • Stage: {plant.currentStage || 'Growing'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plan Name & Description Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1.5 uppercase tracking-wider">
                Plan Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={preview.name}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-[#E3DFD2] bg-white text-[#203027] focus:outline-none focus:ring-2 focus:ring-[#174C35]/20 focus:border-[#174C35] placeholder:text-[#5F6D63] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1.5 uppercase tracking-wider">
                Plan Description
              </label>
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder={preview.description}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-[#E3DFD2] bg-white text-[#203027] focus:outline-none focus:ring-2 focus:ring-[#174C35]/20 focus:border-[#174C35] placeholder:text-[#5F6D63] transition"
              />
            </div>
          </div>

          {/* Steps Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#203027] uppercase tracking-wider">
                Generated Steps Sequence ({preview.steps.length})
              </label>
              <span className="text-[11px] text-[#5F6D63]">Prerequisites strictly enforced</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {preview.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-[#E3DFD2]/70 bg-white text-xs flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-mono text-[#5F6D63] shrink-0 text-[11px]">#{idx + 1}</span>
                    <span className="font-semibold text-[#203027] truncate">{st.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F8F6EE] text-[#5F6D63] border border-[#E3DFD2]/50 capitalize shrink-0 font-medium">
                      {st.category}
                    </span>
                  </div>
                  {st.requiresObservation && (
                    <span className="text-[10px] font-semibold text-[#1B5D88] bg-[#E7F2F9] border border-[#65A8D0/30] px-2 py-0.5 rounded-lg shrink-0">
                      🔍 Observation
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consequential action confirmation note */}
          <div className="p-3.5 bg-[#EAF1E4] border border-[#E3DFD2] rounded-2xl text-xs text-[#174C35] flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#174C35]" />
            <p className="leading-relaxed">
              <strong>Botanical Note:</strong> Creating a grow plan initializes structured milestone steps and syncs reminders to your garden timeline.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E3DFD2] flex justify-end gap-3 bg-[#F8F6EE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[#E3DFD2] text-[#5F6D63] hover:text-[#203027] hover:bg-[#F8F6EE] transition min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#174C35] hover:bg-[#203027] active:scale-95 text-white transition-all duration-75 select-none touch-manipulation cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Plan...</span>
                </>
              ) : (
                <span>Create Grow Plan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
