'use client';

import React, { useState } from 'react';
import { GrowPlanStep } from '@/types/grow-plan';
import { PlanStatusBadge } from './PlanStatusBadge';

interface PlanStepItemProps {
  step: GrowPlanStep;
  allSteps?: GrowPlanStep[];
  onStart?: (stepId: string) => void;
  onComplete?: (stepId: string, notes?: string) => void;
  onSkip?: (stepId: string, reason?: string) => void;
  disabled?: boolean;
}

export function PlanStepItem({
  step,
  allSteps = [],
  onStart,
  onComplete,
  onSkip,
  disabled = false,
}: PlanStepItemProps) {
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'skip' | null>(null);
  const [notes, setNotes] = useState('');

  // Find prerequisite titles if blocked
  const prerequisiteTitles = (step.prerequisites || [])
    .map((prereqId) => allSteps.find((s) => s.id === prereqId)?.title)
    .filter(Boolean);

  const handleConfirmAction = () => {
    if (actionType === 'complete' && onComplete) {
      onComplete(step.id, notes);
    } else if (actionType === 'skip' && onSkip) {
      onSkip(step.id, notes);
    }
    setShowNotesInput(false);
    setActionType(null);
    setNotes('');
  };

  const isBlocked = step.status === 'blocked';
  const isCompleted = step.status === 'completed';
  const isSkipped = step.status === 'skipped';
  const isReady = step.status === 'ready';
  const isInProgress = step.status === 'in_progress';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 opacity-85'
          : isBlocked
          ? 'bg-amber-50/30 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40'
          : isInProgress
          ? 'bg-blue-50/40 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700/60 shadow-sm'
          : 'bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              Step {step.stepOrder}
            </span>
            <PlanStatusBadge stepStatus={step.status} />
            <span className="text-xs px-2 py-0.5 rounded capitalize bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {step.category.replace(/_/g, ' ')}
            </span>
            {step.priority === 'critical' && (
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                Critical
              </span>
            )}
          </div>

          <h4
            className={`text-sm font-semibold text-stone-900 dark:text-stone-100 ${
              isCompleted ? 'line-through text-stone-500 dark:text-stone-400' : ''
            }`}
          >
            {step.title}
          </h4>

          {step.description && (
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              {step.description}
            </p>
          )}

          {/* Blocked by dependencies */}
          {isBlocked && prerequisiteTitles.length > 0 && (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/50 p-2 rounded-lg flex items-center gap-1.5">
              <span>⏳</span>
              <span>
                <strong>Prerequisites required:</strong> {prerequisiteTitles.join(', ')}
              </span>
            </div>
          )}

          {/* Observational requirements */}
          {step.requiresObservation && (
            <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg flex items-center gap-1.5">
              <span>🔍</span>
              <span>
                <strong>Observation required:</strong> {step.observationPrompt || 'Visual verification needed before closing this step.'}
              </span>
            </div>
          )}

          {/* Notes recorded */}
          {step.notes && (
            <p className="text-xs italic text-stone-500 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800/40 p-2 rounded">
              Grower notes: &ldquo;{step.notes}&rdquo;
            </p>
          )}

          {/* Due date or completed timestamp */}
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-2">
            {step.dueAt && (
              <span>Due: {new Date(step.dueAt).toLocaleDateString()}</span>
            )}
            {step.completedAt && (
              <span className="text-emerald-600 dark:text-emerald-400">
                Completed {new Date(step.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Step Action Buttons */}
        {!disabled && !isCompleted && !isSkipped && (
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isReady && onStart && (
              <button
                type="button"
                onClick={() => onStart(step.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Start
              </button>
            )}

            {(isReady || isInProgress) && onComplete && (
              <button
                type="button"
                onClick={() => {
                  setActionType('complete');
                  setShowNotesInput(true);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Complete
              </button>
            )}

            {!isBlocked && onSkip && (
              <button
                type="button"
                onClick={() => {
                  setActionType('skip');
                  setShowNotesInput(true);
                }}
                className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Skip
              </button>
            )}
          </div>
        )}
      </div>

      {/* Observation / Notes Confirmation Modal Inline */}
      {showNotesInput && (
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            {actionType === 'complete' ? 'Observation / Completion Notes' : 'Reason for Skipping'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              actionType === 'complete'
                ? 'e.g. Visual foliage verified green, no pests detected.'
                : 'e.g. Step skipped due to weather or container constraints.'
            }
            rows={2}
            className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowNotesInput(false);
                setActionType(null);
                setNotes('');
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              className={`px-3 py-1 text-xs font-medium rounded-lg text-white ${
                actionType === 'complete'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Confirm {actionType === 'complete' ? 'Completion' : 'Skip'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

