'use client';

import React, { useState } from 'react';
import { GrowPlanStep } from '@/types/grow-plan';
import { PlanStatusBadge } from './PlanStatusBadge';
import { CheckCircle2, Eye, FastForward, Clock, Loader2, AlertCircle } from 'lucide-react';

interface PlanStepItemProps {
  step: GrowPlanStep;
  allSteps?: GrowPlanStep[];
  onStart?: (stepId: string) => void;
  onComplete?: (stepId: string, notes?: string) => void;
  onSkip?: (stepId: string, reason?: string) => void;
  onRecordObservation?: (stepId: string, notes: string) => void;
  isExecuting?: boolean;
  disabled?: boolean;
}

export function PlanStepItem({
  step,
  allSteps = [],
  onStart,
  onComplete,
  onSkip,
  onRecordObservation,
  isExecuting = false,
  disabled = false,
}: PlanStepItemProps) {
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'skip' | 'observe' | null>(null);
  const [notes, setNotes] = useState('');

  // Find prerequisite titles if blocked
  const prerequisiteTitles = (step.prerequisites || step.prerequisiteStepIds || [])
    .map((prereqId) => allSteps.find((s) => s.id === prereqId)?.title)
    .filter(Boolean);

  const isBlocked = step.status === 'blocked';
  const isCompleted = step.status === 'completed';
  const isSkipped = step.status === 'skipped';
  const isReady = step.status === 'ready';
  const isInProgress = step.status === 'in_progress';

  // Observation check
  const hasRecordedObservation = Boolean(
    step.metadata?.observationRecorded || (step.category === 'observation' && (step.notes || isCompleted))
  );

  const handleConfirmAction = () => {
    if (actionType === 'complete' && onComplete) {
      onComplete(step.id, notes.trim() || undefined);
    } else if (actionType === 'skip' && onSkip) {
      onSkip(step.id, notes.trim() || undefined);
    } else if (actionType === 'observe') {
      if (onRecordObservation) {
        onRecordObservation(step.id, notes.trim());
      } else if (onComplete) {
        // Fallback to completing with observation
        onComplete(step.id, notes.trim() || undefined);
      }
    }
    setShowNotesInput(false);
    setActionType(null);
    setNotes('');
  };

  const handleOpenComplete = () => {
    if (step.requiresObservation && !hasRecordedObservation) {
      // Prompt explicitly for observation before closing
      setActionType('complete');
      setShowNotesInput(true);
      return;
    }
    // If no observation required or already recorded, open quick completion note dialog or complete directly
    setActionType('complete');
    setShowNotesInput(true);
  };

  const handleOpenObserve = () => {
    setActionType('observe');
    setShowNotesInput(true);
  };

  const handleOpenSkip = () => {
    setActionType('skip');
    setShowNotesInput(true);
  };

  const quickObservations = [
    'Healthy, vibrant foliage verified',
    'Adequate moisture, well drained',
    'New tender growth visible',
    'No pests or chlorosis detected',
  ];

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isCompleted
          ? 'bg-[#f4f7f4] border-[#c2d9c6] opacity-90'
          : isBlocked
          ? 'bg-[#faf7f2] border-[#ded5c5]'
          : isInProgress
          ? 'bg-[#eef5ee] border-[#144229]/40 shadow-xs ring-1 ring-[#144229]/20'
          : 'bg-white border-[#ded5c5] shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#f4efe6] text-[#526a57] border border-[#ded5c5]/50">
              Step {step.stepOrder || 1}
            </span>
            <PlanStatusBadge stepStatus={step.status} />
            <span className="text-xs px-2 py-0.5 rounded-lg capitalize bg-[#f4efe6] text-[#526a57] font-medium border border-[#ded5c5]/50">
              {step.category.replace(/_/g, ' ')}
            </span>
            {step.priority === 'critical' && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Critical Priority
              </span>
            )}
          </div>

          <h4
            className={`text-sm sm:text-base font-serif font-bold text-[#0c2417] leading-snug ${
              isCompleted ? 'line-through text-[#6d8573]' : ''
            }`}
          >
            {step.title}
          </h4>

          {step.description && (
            <p className="text-xs sm:text-sm text-[#526a57] mt-1 leading-relaxed">
              {step.description}
            </p>
          )}

          {/* Blocked by dependencies */}
          {isBlocked && (
            <div className="mt-3 text-xs text-[#8c501e] bg-[#fbf4eb] border border-[#f0d8c2] p-3 rounded-2xl flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#8c501e] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Prerequisite steps required:</strong>
                <span>
                  {prerequisiteTitles.length > 0
                    ? prerequisiteTitles.join(', ')
                    : 'Previous milestone steps must be completed first.'}
                </span>
              </div>
            </div>
          )}

          {/* Observational requirements */}
          {step.requiresObservation && !isCompleted && !isSkipped && (
            <div
              className={`mt-3 text-xs p-3 rounded-2xl flex items-start justify-between gap-2 border ${
                hasRecordedObservation
                  ? 'bg-[#eef5ee] text-[#144229] border-[#c2d9c6]'
                  : 'bg-[#edf4fb] text-[#1e4d75] border-[#cbe1f5]'
              }`}
            >
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">
                    {hasRecordedObservation ? 'Visual Observation Verified' : 'Visual Observation Required'}
                  </strong>
                  <span className="leading-relaxed">
                    {hasRecordedObservation
                      ? (step.metadata?.observationText || step.notes || 'Observation noted.')
                      : (step.observationPrompt || 'Visual verification of plant vigor or condition needed before completing this step.')}
                  </span>
                </div>
              </div>
              {!hasRecordedObservation && !disabled && (
                <button
                  type="button"
                  onClick={handleOpenObserve}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#1e4d75] border border-[#cbe1f5] hover:bg-[#edf4fb] font-semibold text-xs shrink-0 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  Record Observation
                </button>
              )}
            </div>
          )}

          {/* Grower notes recorded */}
          {step.notes && (
            <p className="text-xs italic text-[#526a57] mt-2.5 bg-[#fbf9f4] border border-[#ded5c5]/70 p-2.5 rounded-xl leading-relaxed">
              <strong>Grower Notes:</strong> &ldquo;{step.notes}&rdquo;
            </p>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-3 text-[11px] text-[#6d8573] mt-2.5 flex-wrap">
            {step.dueAt && (
              <span>Target date: {new Date(step.dueAt).toLocaleDateString()}</span>
            )}
            {step.completedAt && (
              <span className="text-[#144229] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed on {new Date(step.completedAt).toLocaleDateString()}
              </span>
            )}
            {step.status === 'skipped' && (
              <span className="text-[#8c7e6c] font-medium">
                Skipped by grower
              </span>
            )}
          </div>
        </div>

        {/* Step Action Buttons */}
        {!disabled && !isCompleted && !isSkipped && (
          <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ded5c5]/50">
            {isReady && onStart && (
              <button
                type="button"
                onClick={() => onStart(step.id)}
                disabled={isExecuting}
                className="px-4 py-2 min-h-[44px] text-xs sm:text-sm font-semibold rounded-xl bg-white border border-[#144229]/30 text-[#144229] hover:bg-[#eef5ee] transition active:scale-95 select-none touch-manipulation cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Start
              </button>
            )}

            {(isReady || isInProgress) && onComplete && (
              <button
                type="button"
                onClick={handleOpenComplete}
                disabled={isExecuting}
                className="px-4 py-2 min-h-[44px] text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white shadow-xs transition active:scale-95 select-none touch-manipulation cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete</span>
                  </>
                )}
              </button>
            )}

            {!isBlocked && onSkip && (
              <button
                type="button"
                onClick={handleOpenSkip}
                disabled={isExecuting}
                className="px-3 py-2 min-h-[44px] text-xs font-medium rounded-xl text-[#526a57] hover:text-[#0c2417] hover:bg-[#f4efe6] transition active:scale-95 select-none touch-manipulation cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Observation / Notes Input Form Inline */}
      {showNotesInput && (
        <div className="mt-4 pt-3.5 border-t border-[#ded5c5] bg-[#fbf9f4] p-3.5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#0c2417] uppercase tracking-wider">
              {actionType === 'observe'
                ? 'Record Visual / Growth Observation'
                : actionType === 'complete'
                ? step.requiresObservation && !hasRecordedObservation
                  ? 'Observation Required for Completion'
                  : 'Completion Notes (Optional)'
                : 'Reason for Skipping Step'}
            </label>
            <span className="text-[11px] text-[#526a57]">
              {actionType === 'complete' && step.requiresObservation && !hasRecordedObservation
                ? 'Evidence Grounded'
                : 'Saved to Plan History'}
            </span>
          </div>

          {/* Quick selection chips for observations */}
          {(actionType === 'observe' || (actionType === 'complete' && step.requiresObservation)) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickObservations.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNotes(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#ded5c5] text-[#526a57] hover:text-[#144229] hover:border-[#144229]/40 hover:bg-[#eef5ee] transition cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              actionType === 'observe'
                ? 'e.g. Visual foliage check: 4 pairs of true leaves, rich green color, no pests.'
                : actionType === 'complete'
                ? step.requiresObservation && !hasRecordedObservation
                  ? 'Describe your visual verification before marking this step completed...'
                  : 'Add optional notes, observations, or container adjustments...'
                : 'e.g. Step skipped due to weather, container size, or prior pruning.'
            }
            rows={2}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#ded5c5] bg-white text-[#0c2417] placeholder:text-[#8c7e6c] focus:outline-none focus:ring-2 focus:ring-[#144229]/20 focus:border-[#144229] transition"
          />

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowNotesInput(false);
                setActionType(null);
                setNotes('');
              }}
              className="px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-xl border border-[#ded5c5] text-[#526a57] hover:text-[#0c2417] hover:bg-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={isExecuting}
              className={`px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-xl text-white transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs ${
                actionType === 'complete'
                  ? 'bg-[#144229] hover:bg-[#0c2417]'
                  : actionType === 'observe'
                  ? 'bg-[#1e4d75] hover:bg-[#153754]'
                  : 'bg-[#8c501e] hover:bg-[#6e3e15]'
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {actionType === 'complete'
                    ? 'Confirm Completion'
                    : actionType === 'observe'
                    ? 'Save Observation'
                    : 'Confirm Skip'}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
