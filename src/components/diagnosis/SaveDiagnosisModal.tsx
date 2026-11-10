'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DiagnosisResponse } from '@/types/diagnosis';
import { UserPlant, PlantPhoto } from '@/types/garden';
import { fetchUserGarden } from '@/lib/storage';
import { fetchPlantPhotos } from '@/lib/photo-storage';
import { saveDiagnosisToHistory } from '@/lib/ai-doctor/persistence';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  X,
  BookmarkCheck,
  Sprout,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

interface SaveDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: DiagnosisResponse;
  defaultPlantId?: string;
  onSaved?: (diagnosisId: string) => void;
}

export function SaveDiagnosisModal({
  isOpen,
  onClose,
  diagnosis,
  defaultPlantId,
  onSaved,
}: SaveDiagnosisModalProps) {
  const { user } = useAuth();
  const { isOffline } = usePwa();
  const { showSuccess } = useGrowToast();

  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(defaultPlantId || '');
  const [plantPhotos, setPlantPhotos] = useState<PlantPhoto[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');
  const [isCloud, setIsCloud] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user plants on open
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoadingPlants(true);
    setError(null);
    setSavedDiagnosisId(null);

    fetchUserGarden()
      .then(({ plants: userPlants, isCloud: cloudMode }) => {
        if (!mounted) return;
        setPlants(userPlants);
        setIsCloud(cloudMode);

        if (defaultPlantId && userPlants.some((p) => p.id === defaultPlantId)) {
          setSelectedPlantId(defaultPlantId);
        } else if (diagnosis.userContextProvided?.plantName) {
          const match = userPlants.find(
            (p) =>
              p.plantSlug === diagnosis.userContextProvided.plantName ||
              p.nickname.toLowerCase() === diagnosis.userContextProvided.plantName?.toLowerCase()
          );
          if (match) {
            setSelectedPlantId(match.id);
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load user plants for diagnosis link:', err);
      })
      .finally(() => {
        if (mounted) setLoadingPlants(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, diagnosis]);

  // Load photos when a plant is selected
  useEffect(() => {
    if (!selectedPlantId) {
      setPlantPhotos([]);
      setSelectedPhotoId('');
      return;
    }

    let mounted = true;
    fetchPlantPhotos(selectedPlantId, isCloud).then(({ photos }) => {
      if (!mounted) return;
      setPlantPhotos(photos || []);
    });

    return () => {
      mounted = false;
    };
  }, [selectedPlantId, isCloud]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isOffline) {
      setError('You are currently offline. Cloud persistence requires an active internet connection.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await saveDiagnosisToHistory({
        diagnosis,
        userPlantId: selectedPlantId || null,
        plantPhotoId: selectedPhotoId || null,
      });

      if (!res.success || !res.diagnosisId) {
        console.error('Failed to save diagnosis:', res.error);
        throw new Error("We couldn't save this plant check. Please try again.");
      }

      setSavedDiagnosisId(res.diagnosisId);
      showSuccess('📖 Saved!', 'Your plant check is now in your history.', '📖');
      if (onSaved) {
        onSaved(res.diagnosisId);
      }
    } catch (err: any) {
      console.error('Save error details:', err);
      setError("We couldn't save this plant check. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E3DFD2] max-w-[calc(100vw-24px)] sm:max-w-lg w-full p-5 sm:p-8 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#68766C] hover:bg-[#F8F6EE] hover:text-[#203027] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
            <BookmarkCheck size={22} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#203027]">
              Save Diagnosis to History
            </h3>
            <p className="text-xs text-[#68766C]">
              Keep a permanent record to monitor plant recovery and log treatments
            </p>
          </div>
        </div>

        {/* Success State */}
        {savedDiagnosisId ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-start gap-3">
              <CheckCircle2 size={22} className="text-[#174C35] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#203027]">
                  Diagnosis Saved Successfully!
                </h4>
                <p className="text-xs text-[#203027] leading-relaxed">
                  Your diagnostic assessment and differential candidates are now securely stored. You can track actions taken and record follow-up recovery notes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/app/ai-doctor/history/${savedDiagnosisId}`}
                className="flex-1 py-3 px-4 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                onClick={onClose}
              >
                <span>View Historical Record & Treatments</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#F8F6EE] text-xs sm:text-sm font-semibold text-[#203027] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-5">
            {/* Offline Advisory */}
            {isOffline && (
              <div className="p-3.5 rounded-xl bg-[#FFF3D7] border border-[#F0C04D/30] text-xs text-[#8A6400] flex items-center gap-2.5">
                <WifiOff size={18} className="shrink-0 text-[#8A6400]" />
                <span>
                  You are offline. Cloud diagnosis persistence requires an active network connection.
                </span>
              </div>
            )}

            {/* Friendly Error Message with Try Again */}
            {error && (
              <div className="p-4 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] space-y-2 text-xs text-[#963A23]">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>We couldn’t save this plant check.</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#963A23]">
                  Please try again.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#963A23] hover:bg-[#963A23] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Diagnosis Summary Preview */}
            <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#68766C]">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#203027]">
                  Assessment Snapshot
                </span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-white border border-[#E3DFD2] text-[11px] text-[#174C35] font-medium">
                  {diagnosis.primaryClassification || 'Biotic/Abiotic'}
                </span>
              </div>
              <p className="font-medium text-[#203027] text-sm">
                {diagnosis.plantIdentification}
              </p>
              {diagnosis.possibleConditions?.[0] && (
                <p className="text-[#203027]">
                  <span className="font-semibold">Top Candidate:</span>{' '}
                  {diagnosis.possibleConditions[0].name} (
                  {diagnosis.possibleConditions[0].confidenceCategory} confidence)
                </p>
              )}
            </div>

            {/* Plant Linking Selector */}
            <div className="space-y-2">
              <label
                htmlFor="user-plant-select"
                className="text-xs font-bold uppercase tracking-wider text-[#203027] flex items-center gap-1.5"
              >
                <Sprout size={16} className="text-[#174C35]" />
                Link to Garden Plant (Optional)
              </label>

              {loadingPlants ? (
                <div className="flex items-center gap-2 text-xs text-[#68766C] py-2">
                  <Loader2 size={16} className="animate-spin text-[#174C35]" />
                  <span>Loading your garden plants...</span>
                </div>
              ) : plants.length > 0 ? (
                <select
                  id="user-plant-select"
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-xs sm:text-sm text-[#203027] focus:outline-none focus:ring-2 focus:ring-[#174C35]"
                >
                  <option value="">Standalone / Unlinked Assessment</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.nickname} ({plant.plantSlug.replace(/-/g, ' ')})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-[#68766C] italic">
                  No garden plants found. Diagnosis will be saved as a standalone assessment.
                </p>
              )}
            </div>

            {/* Plant Photo Linking (Only if selected plant has photos) */}
            {selectedPlantId && plantPhotos.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="plant-photo-select"
                  className="text-xs font-bold uppercase tracking-wider text-[#203027] flex items-center gap-1.5"
                >
                  <Camera size={16} className="text-[#174C35]" />
                  Link Existing Plant Photo (Optional)
                </label>
                <select
                  id="plant-photo-select"
                  value={selectedPhotoId}
                  onChange={(e) => setSelectedPhotoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-xs sm:text-sm text-[#203027] focus:outline-none focus:ring-2 focus:ring-[#174C35]"
                >
                  <option value="">No linked gallery photo</option>
                  {plantPhotos.map((photo) => (
                    <option key={photo.id} value={photo.id}>
                      Photo taken on {new Date(photo.takenAt).toLocaleDateString()}
                      {photo.caption ? ` — ${photo.caption}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3DFD2]">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#F8F6EE] text-xs sm:text-sm font-semibold text-[#203027] transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || isOffline}
                className="px-6 py-2.5 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck size={16} />
                    <span>Confirm Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

