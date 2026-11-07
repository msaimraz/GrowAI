'use client';

import React, { useState } from 'react';
import { UserPlant } from '@/types/garden';
import { GrowPlanTemplateId, GrowPlan } from '@/types/grow-plan';
import { generatePlanFromTemplate, getTemplateDefinitions } from '@/lib/grow-plans/plan-generator';
import { createGrowPlan } from '@/lib/grow-plans/storage';

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
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Create Adaptive Grow Plan
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Structured, evidence-grounded care plans that adapt to actual plant observations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Select Plan Objective & Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id as GrowPlanTemplateId)}
                  className={`p-3 text-left rounded-xl border text-xs transition ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                    {tpl.name}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                    {tpl.description}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                    {tpl.defaultStepCount} standard steps
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Plant Selection */}
          {plants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Target Plant
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.nickname} ({plant.currentStage})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plan Name & Description Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={preview.name}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Plan Description
              </label>
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder={preview.description}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Steps Preview */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Generated Steps Sequence ({preview.steps.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {preview.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-stone-400 mr-2">#{idx + 1}</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">{st.title}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 capitalize">
                      {st.category}
                    </span>
                  </div>
                  {st.requiresObservation && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      Observation Req.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consequential action confirmation note */}
          <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-xs text-stone-600 dark:text-stone-400">
            <strong>Note:</strong> Creating a grow plan initializes structured milestone steps and syncs reminders to your garden timeline.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all duration-75 select-none touch-manipulation cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Plan...' : 'Create Grow Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
