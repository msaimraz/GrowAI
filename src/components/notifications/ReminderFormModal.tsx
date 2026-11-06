'use client';

import React, { useState, useEffect } from 'react';
import {
  CreateReminderInput,
  RecurrenceType,
  ReminderPriority,
  ReminderRecurrence,
} from '@/types/reminder';
import { UserPlant } from '@/types/garden';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { X, Calendar, Clock, Repeat, Sprout, AlertCircle, Plus, Loader2 } from 'lucide-react';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReminderInput) => Promise<{ success: boolean; error?: string }>;
  plants?: UserPlant[];
  defaultPlantId?: string | null;
}

export function ReminderFormModal({
  isOpen,
  onClose,
  onSubmit,
  plants = [],
  defaultPlantId = null,
}: ReminderFormModalProps) {
  const { showSuccess } = useGrowToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<string>(defaultPlantId || '');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [priority, setPriority] = useState<ReminderPriority>('normal');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [interval, setInterval] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      if (defaultPlantId) {
        setSelectedPlantId(defaultPlantId);
      }
      setErrorMessage(null);
    }
  }, [isOpen, defaultPlantId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please enter a reminder title.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    // Build ISO timestamp from date + time
    const timeVal = dueTime || '09:00';
    const dateStr = `${dueDate}T${timeVal}:00.000Z`;
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      setErrorMessage('Invalid date or time selected.');
      return;
    }

    // Build recurrence
    let recurrence: ReminderRecurrence | null = null;
    if (recurrenceType !== 'none') {
      if (
        (recurrenceType === 'every_n_days' || recurrenceType === 'every_n_weeks') &&
        (!interval || interval < 1)
      ) {
        setErrorMessage('Recurrence interval must be at least 1.');
        return;
      }
      recurrence = {
        type: recurrenceType,
        interval: interval > 0 ? interval : 1,
      };
    }

    const selectedPlant = plants.find((p) => p.id === selectedPlantId);

    setSubmitting(true);
    try {
      const res = await onSubmit({
        plantId: selectedPlant?.id || null,
        plantNickname: selectedPlant?.nickname || null,
        plantSlug: selectedPlant?.plantSlug || null,
        sourceType: 'manual',
        reminderType: 'custom',
        title: trimmedTitle,
        body: body.trim(),
        scheduledFor: parsedDate.toISOString(),
        dueAt: parsedDate.toISOString(),
        recurrence,
        priority,
      });

      if (res.success) {
        showSuccess('🔔 Reminder set!', 'We’ll remind you when it’s time.', '🔔');
        onClose();
        setTitle('');
        setBody('');
        setRecurrenceType('none');
      } else {
        setErrorMessage(res.error || 'Failed to create reminder.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[calc(100vw-24px)] sm:max-w-lg bg-[#fbf9f4] rounded-3xl border border-[#ded5c5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#ded5c5] bg-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#eef5ee] text-[#144229] flex items-center justify-center">
              <Plus size={16} />
            </span>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              New Garden Reminder
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inspect balcony tomatoes for pests"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] placeholder:text-[#a89f91] focus:outline-none focus:ring-2 focus:ring-[#144229]"
            />
          </div>

          {/* Associate Plant */}
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1 flex items-center gap-1">
              <Sprout size={13} className="text-[#144229]" />
              <span>Associated Plant (Optional)</span>
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229]"
            >
              <option value="">None (General Garden Reminder)</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname} ({p.plantSlug})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-[#144229]" />
                <span>Due Date *</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1 flex items-center gap-1">
                <Clock size={13} className="text-[#144229]" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229]"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1 flex items-center gap-1">
                <Repeat size={13} className="text-[#144229]" />
                <span>Repeat Schedule</span>
              </label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-xs text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229]"
              >
                <option value="none">Does not repeat (One-time)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="every_n_days">Every N Days</option>
                <option value="every_n_weeks">Every N Weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {(recurrenceType === 'every_n_days' || recurrenceType === 'every_n_weeks') && (
              <div>
                <label className="block text-[11px] font-semibold text-[#526a57] mb-1">
                  Interval ({recurrenceType === 'every_n_days' ? 'Days' : 'Weeks'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-1.5 rounded-xl bg-white border border-[#ded5c5] text-xs text-[#0c2417]"
                />
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'normal', 'high', 'urgent'] as const).map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setPriority(pr)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                    priority === pr
                      ? 'bg-[#144229] text-white border-[#144229]'
                      : 'bg-white text-[#526a57] border-[#ded5c5] hover:bg-[#eef5ee]'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Body */}
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Observation Details or Notes
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Add optional notes, observations, or special instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] placeholder:text-[#a89f91] focus:outline-none focus:ring-2 focus:ring-[#144229]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ded5c5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#ded5c5] text-[#526a57] hover:bg-[#eef5ee] transition-all cursor-pointer min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition-all cursor-pointer min-h-[40px]"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Reminder</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

