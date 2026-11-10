'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Reminder } from '@/types/reminder';
import { ReminderStatusBadge } from './ReminderStatusBadge';
import { getReminderStatus, isReminderActive } from '@/lib/reminders/reminder-status';
import {
  X,
  Calendar,
  Clock,
  Repeat,
  Sprout,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CloudOff,
} from 'lucide-react';

interface ReminderDetailModalProps {
  reminder: Reminder | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
  onComplete: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ReminderDetailModal({
  reminder,
  isOpen,
  onClose,
  onNavigate,
  onComplete,
  onDismiss,
  onDelete,
}: ReminderDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !reminder) return null;

  const currentStatus = getReminderStatus(reminder);
  const active = isReminderActive(reminder);

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return 'Not recorded';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleAction = async (action: 'complete' | 'dismiss' | 'delete') => {
    setIsProcessing(true);
    try {
      if (action === 'complete') {
        await onComplete(reminder.id);
        onClose();
      } else if (action === 'dismiss') {
        await onDismiss(reminder.id);
        onClose();
      } else if (action === 'delete') {
        await onDelete(reminder.id);
        onClose();
      }
    } finally {
      setIsProcessing(false);
      setConfirmDelete(false);
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[calc(100vw-24px)] sm:max-w-lg bg-[#F8F6EE] rounded-3xl border border-[#E3DFD2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E3DFD2] bg-white">
          <div className="flex items-center gap-2">
            <ReminderStatusBadge status={currentStatus} size="md" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#5F6D63]">
              {reminder.reminderType} reminder
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#203027] leading-tight mb-2">
              {reminder.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed whitespace-pre-wrap">
              {reminder.body}
            </p>
          </div>

          {/* Plant Card Link if attached */}
          {reminder.plantNickname && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#E3DFD2] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
                  <Sprout size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#5F6D63] block">
                    Associated Garden Plant
                  </span>
                  <span className="font-semibold text-xs text-[#203027]">
                    {reminder.plantNickname}
                  </span>
                </div>
              </div>

              {reminder.plantId && (
                <Link
                  href={`/app/my-garden?plantId=${reminder.plantId}`}
                  onClick={handleNavigate}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#174C35] hover:underline"
                >
                  <span>View Plant</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          )}

          {/* Grow Plan Link if attached */}
          {reminder.metadata?.growPlanId && (
            <div className="p-3.5 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#174C35] text-white flex items-center justify-center">
                  <Sprout size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#174C35] block">
                    Associated Grow Plan
                  </span>
                  <span className="font-semibold text-xs text-[#203027]">
                    {reminder.body?.split('—')[0]?.trim() || 'Active Grow Plan'}
                  </span>
                </div>
              </div>

              <Link
                href={reminder.metadata?.actionUrl || `/app/grow-plans/${reminder.metadata.growPlanId}`}
                onClick={handleNavigate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#174C35] text-white text-xs font-semibold hover:bg-[#203027] transition"
              >
                <span>Open Plan</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E3DFD2]">
              <span className="text-[#5F6D63] block text-[11px] mb-0.5 flex items-center gap-1">
                <Clock size={12} /> Due Date & Time
              </span>
              <strong className="text-[#203027] font-semibold">
                {formatDateTime(reminder.dueAt)}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E3DFD2]">
              <span className="text-[#5F6D63] block text-[11px] mb-0.5 flex items-center gap-1">
                <Repeat size={12} /> Recurrence
              </span>
              <strong className="text-[#203027] font-semibold capitalize">
                {reminder.recurrence && reminder.recurrence.type !== 'none'
                  ? reminder.recurrence.type.replace(/_/g, ' ')
                  : 'One-time reminder'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E3DFD2]">
              <span className="text-[#5F6D63] block text-[11px] mb-0.5">Priority</span>
              <strong className="text-[#203027] font-semibold capitalize">
                {reminder.priority}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E3DFD2]">
              <span className="text-[#5F6D63] block text-[11px] mb-0.5">Source</span>
              <strong className="text-[#203027] font-semibold capitalize">
                {reminder.sourceType.replace(/_/g, ' ')}
              </strong>
            </div>
          </div>

          {/* Historical timestamps if completed/dismissed */}
          {reminder.metadata?.syncPending && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <CloudOff size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Pending server synchronization</strong>
                <span>This record was saved locally while offline. It will automatically synchronize with your cloud account when reconnected.</span>
              </div>
            </div>
          )}
          {reminder.completedAt && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Completed on {formatDateTime(reminder.completedAt)}</span>
            </div>
          )}
          {reminder.dismissedAt && (
            <div className="p-3 rounded-xl bg-[#E3DFD2] border border-[#E3DFD2] text-xs text-[#5F6D63] flex items-center gap-2">
              <XCircle size={15} className="text-[#5F6D63] shrink-0" />
              <span>Dismissed on {formatDateTime(reminder.dismissedAt)}</span>
            </div>
          )}

          {/* Optional Action URL Link from source */}
          {reminder.metadata?.actionUrl && (
            <div className="pt-2">
              <Link
                href={reminder.metadata.actionUrl}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174C35] hover:underline"
              >
                <span>Navigate to source record</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          )}

          {/* Delete confirmation banner */}
          {confirmDelete && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-semibold">
                <AlertTriangle size={15} />
                <span>Permanently delete this reminder?</span>
              </div>
              <p className="text-rose-700">
                This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction('delete')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E3DFD2] text-[#5F6D63] hover:bg-[#EAF1E4] font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E3DFD2] bg-white flex flex-wrap items-center justify-between gap-3">
          <div>
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete reminder"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {active && (
              <>
                <button
                  type="button"
                  onClick={() => handleAction('dismiss')}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E3DFD2] text-[#5F6D63] hover:bg-[#EAF1E4] transition-all cursor-pointer min-h-[38px]"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('complete')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#174C35] text-white hover:bg-[#203027] shadow-xs transition-all cursor-pointer min-h-[38px]"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Complete</span>
                </button>
              </>
            )}
            {!active && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#174C35] text-white hover:bg-[#203027] transition-all cursor-pointer min-h-[38px]"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

