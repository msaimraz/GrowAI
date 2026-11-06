'use client';

import React, { useState, useRef } from 'react';
import {
  FollowUpOutcome,
  SavedDiagnosisRecord,
  SavedDiagnosisFollowUp,
} from '@/types/diagnosis';
import { recordFollowUpOutcome } from '@/lib/ai-doctor/persistence';
import { saveFollowUpPhoto } from '@/lib/photo-storage';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  FileText,
  Trash2,
  Activity,
  Sparkles,
} from 'lucide-react';

interface RecordFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: SavedDiagnosisRecord;
  isCloud?: boolean;
  onFollowUpSaved: (followUp: SavedDiagnosisFollowUp) => void;
}

const OUTCOME_OPTIONS: Array<{
  value: FollowUpOutcome;
  label: string;
  description: string;
  badgeClass: string;
  dotClass: string;
}> = [
  {
    value: 'improving',
    label: 'Improving',
    description: 'Foliage is recovering, discoloration is subsiding, or new growth is healthy.',
    badgeClass: 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]',
    dotClass: 'bg-[#0284c7]',
  },
  {
    value: 'unchanged',
    label: 'Unchanged',
    description: 'Symptoms persist without obvious progression or regression.',
    badgeClass: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    dotClass: 'bg-[#d97706]',
  },
  {
    value: 'worsening',
    label: 'Worsening',
    description: 'Spots spreading, yellowing expanding, pests multiplying, or wilting deepening.',
    badgeClass: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
    dotClass: 'bg-[#dc2626]',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    description: 'Condition is cleared, plant has stabilized, and normal growth has resumed.',
    badgeClass: 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]',
    dotClass: 'bg-[#059669]',
  },
  {
    value: 'uncertain',
    label: 'Uncertain',
    description: 'Not enough clear visual evidence yet to confirm direction of recovery.',
    badgeClass: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]',
    dotClass: 'bg-[#94a3b8]',
  },
];

export function RecordFollowUpModal({
  isOpen,
  onClose,
  diagnosis,
  isCloud = false,
  onFollowUpSaved,
}: RecordFollowUpModalProps) {
  const [outcome, setOutcome] = useState<FollowUpOutcome>('improving');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Selected photo exceeds 10 MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let plantPhotoId: string | null = null;

      // 1. If photo attached and plant linked, upload/save photo
      if (selectedFile && diagnosis.userPlantId) {
        const photoRes = await saveFollowUpPhoto({
          plantId: diagnosis.userPlantId,
          file: selectedFile,
          caption: `Health follow-up (${outcome}): ${notes.trim().slice(0, 100)}`,
          isCloud,
        });

        if (photoRes.error) {
          setError(`Photo upload failed: ${photoRes.error}`);
          setSaving(false);
          return;
        }

        if (photoRes.photo) {
          plantPhotoId = photoRes.photo.id;
        }
      }

      // 2. Record Follow-Up in database/local storage
      const res = await recordFollowUpOutcome({
        diagnosisId: diagnosis.id,
        outcomeStatus: outcome,
        observationNotes: notes.trim() || undefined,
        followUpDate,
        plantPhotoId,
      });

      if (!res.success || !res.followUp) {
        setError(res.error || 'Failed to record follow-up outcome.');
        setSaving(false);
        return;
      }

      // If photo was saved in demo mode, assign preview URL
      if (res.followUp && previewUrl) {
        res.followUp.photoUrl = previewUrl;
      }

      onFollowUpSaved(res.followUp);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving the follow-up.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-[calc(100vw-24px)] sm:max-w-lg w-full p-5 sm:p-8 shadow-xl border border-[#ded5c5] my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#f0ebe0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-1.5">
              <Activity size={12} />
              Health Monitoring
            </span>
            <h3 className="font-serif font-bold text-xl text-[#0c2417]">
              Record Follow-Up Observation
            </h3>
            <p className="text-xs text-[#526a57] mt-1">
              Document how {diagnosis.plantIdentification} is responding to care and environmental adjustments.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#526a57] hover:text-[#0c2417] hover:bg-[#f4efe6] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {/* 1. Outcome Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#144229] mb-2.5">
              Observed Direction of Health:
            </label>
            <div className="space-y-2">
              {OUTCOME_OPTIONS.map((opt) => {
                const isSelected = outcome === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setOutcome(opt.value)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 min-h-[52px] ${
                      isSelected
                        ? `${opt.badgeClass} ring-2 ring-[#144229]/20 shadow-xs font-semibold`
                        : 'bg-[#fbf9f4] border-[#ded5c5] hover:bg-white text-[#3d5242]'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border ${
                        isSelected ? `${opt.dotClass} border-transparent ring-2 ring-white` : 'border-[#9ab8a3] bg-white'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-[#0c2417] font-semibold">{opt.label}</strong>
                        {isSelected && <CheckCircle2 size={15} className="shrink-0 text-[#144229]" />}
                      </div>
                      <p className="text-[11px] opacity-85 mt-0.5 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Observation Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#144229] mb-1.5">
              Observation Date:
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#526a57]" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] focus:bg-white focus:outline-none focus:border-[#144229] text-xs sm:text-sm text-[#0c2417] min-h-[44px]"
                required
              />
            </div>
          </div>

          {/* 3. Observation Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#144229] mb-1.5">
              Foliage & Care Notes (Optional):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Watered deeply from bottom; leaf yellowing has stabilized. No new mite webbing spotted on leaf undersides."
              className="w-full p-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] focus:bg-white focus:outline-none focus:border-[#144229] text-xs sm:text-sm text-[#0c2417] resize-none"
            />
          </div>

          {/* 4. Optional Photo Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#144229] mb-1.5">
              Attach Follow-Up Photo (Optional):
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#ded5c5] bg-[#fbf9f4] p-2 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Follow-up preview"
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-[#0c2417] truncate">{selectedFile?.name}</p>
                  <p className="text-[11px] text-[#526a57]">
                    {((selectedFile?.size || 0) / 1024).toFixed(1)} KB • WebP compressed on save
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-[#b95835] hover:bg-[#fbeee9] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Remove attached photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-[#ded5c5] hover:border-[#144229] bg-[#fbf9f4] hover:bg-white text-xs text-[#526a57] hover:text-[#144229] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Camera size={16} />
                <span>Snap or Upload Progress Photo</span>
              </button>
            )}
            {!diagnosis.userPlantId && selectedFile && (
              <p className="text-[11px] text-[#92400e] mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>This diagnosis is not linked to a garden plant; photo will be linked to this diagnosis entry.</span>
              </p>
            )}
          </div>

          {/* Educational Disclaimer */}
          <div className="p-3 bg-[#eef5ee] border border-[#cfe0cf] rounded-xl text-[11px] text-[#2c5237] leading-relaxed flex items-start gap-2">
            <Sparkles size={14} className="shrink-0 mt-0.5 text-[#144229]" />
            <span>
              Follow-up tracking is observational. Recording recovery tracks symptom progression but does not guarantee complete botanical eradication.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ebe0]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs font-semibold text-[#526a57] hover:bg-[#f4efe6] transition-colors min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Observation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Save Follow-Up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

