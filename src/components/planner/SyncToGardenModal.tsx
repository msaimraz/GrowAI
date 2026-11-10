'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import Link from 'next/link';
import {
  SpaceConfigProfile,
  CircularContainerInput,
} from '@/types/space-optimizer';
import { mapPhysicalTierToGardenTier } from '@/lib/space-optimizer';
import { PLANTS_DATA } from '@/data/plants';
import { UserPlant, GrowthStage } from '@/types/garden';
import { createGardenPlant, fetchUserGarden } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Loader2,
  Layers,
  MapPin,
  Calendar,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface SyncToGardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SpaceConfigProfile;
  onSyncComplete?: (count: number) => void;
}

interface PlannedPlantItem {
  id: string;
  plantSlug: string;
  commonName: string;
  nickname: string;
  tierIndex: number;
  tierName: string;
  tierPosition: 'top' | 'middle' | 'bottom';
  potSizeDescription: string;
  location: UserPlant['location'];
  isDuplicate: boolean;
  duplicatePlantNickname?: string;
}

const SUPPORTED_GROWTH_STAGES: Array<{
  stage: GrowthStage;
  label: string;
  description: string;
}> = [
  {
    stage: 'Seed',
    label: 'Seed (Direct Sow)',
    description: 'Freshly sowed seeds beginning germination',
  },
  {
    stage: 'Seedling',
    label: 'Seedling (Plug/Transplant)',
    description: 'Young starter plant with first true leaves',
  },
  {
    stage: 'Growing',
    label: 'Growing (Established Pot)',
    description: 'Vegetative plant transferred to shelf',
  },
];

export function SyncToGardenModal({
  isOpen,
  onClose,
  profile,
  onSyncComplete,
}: SyncToGardenModalProps) {
  const modalTitleId = useId();
  const [existingPlants, setExistingPlants] = useState<UserPlant[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Growth Stage Configuration (Finding C)
  const [defaultStage, setDefaultStage] = useState<GrowthStage>('Seed');
  const [stageOverrides, setStageOverrides] = useState<Record<string, GrowthStage>>({});

  // Selection & Idempotency Tracking (Part 3)
  const [selectedSlotIds, setSelectedSlotIds] = useState<Record<string, boolean>>({});
  const [successfulSlotIds, setSuccessfulSlotIds] = useState<Set<string>>(new Set());
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);

  // Map profile spaceType to supported UserPlant location
  const mappedLocation: UserPlant['location'] = useMemo(() => {
    switch (profile.spaceType) {
      case 'balcony_rack':
        return 'Balcony Rack';
      case 'windowsill':
        return 'Window Sill';
      case 'patio_bakers_rack':
        return 'Patio';
      case 'indoor_grow_tent':
        return 'Living Room';
      case 'vertical_hydroponics':
        return 'Kitchen Tier';
      default:
        return 'Balcony Rack';
    }
  }, [profile.spaceType]);

  // Load existing plants when modal opens
  useEffect(() => {
    if (!isOpen) {
      setHasAttemptedSync(false);
      setIsSubmitting(false);
      setSuccessfulSlotIds(new Set());
      setSyncErrors({});
      setStageOverrides({});
      setSelectedSlotIds({});
      return;
    }

    let isMounted = true;
    setIsLoadingExisting(true);

    fetchUserGarden()
      .then((res) => {
        if (isMounted) {
          setExistingPlants(res.plants || []);
          setIsLoadingExisting(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load existing garden plants', err);
          setIsLoadingExisting(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Build planned items list with deterministic tier mapping and duplicate inspection
  const plannedItems: PlannedPlantItem[] = useMemo(() => {
    return profile.placements.map((slot) => {
      const plant = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);
      const tier = profile.tiers.find((t) => t.tierIndex === slot.tierIndex);
      const tierName = tier?.tierName || `Tier ${slot.tierIndex + 1}`;

      // Finding A: Deterministic tier mapping (1-8 tiers to 'top' | 'middle' | 'bottom')
      const tierPos = mapPhysicalTierToGardenTier(slot.tierIndex, profile.tiers.length);

      // Finding B: Standard container pot size description
      let potDesc = 'Standard Pot';
      if (slot.container.shape === 'circular') {
        const circ = slot.container as CircularContainerInput;
        potDesc = `Ø ${circ.topDiameter} cm Pot (${circ.height} cm depth)`;
      } else if (slot.container.shape === 'rectangular') {
        const rect = slot.container as any;
        potDesc = `${rect.length}×${rect.width} cm Planter`;
      } else if (slot.container.shape === 'trough') {
        const trough = slot.container as any;
        potDesc = `${trough.length}×${trough.width} cm Planter Trough`;
      }

      const nickname = slot.customNickname || plant?.commonName || 'Planned Plant';

      // Check if duplicate exists with same slug and matching nickname in this location
      const matchingExisting = existingPlants.find(
        (existing) =>
          existing.plantSlug === slot.plantSlug &&
          existing.nickname.toLowerCase() === nickname.toLowerCase() &&
          existing.location === mappedLocation
      );

      return {
        id: slot.id,
        plantSlug: slot.plantSlug,
        commonName: plant?.commonName || slot.plantSlug,
        nickname,
        tierIndex: slot.tierIndex,
        tierName,
        tierPosition: tierPos,
        potSizeDescription: potDesc,
        location: mappedLocation,
        isDuplicate: Boolean(matchingExisting),
        duplicatePlantNickname: matchingExisting?.nickname,
      };
    });
  }, [profile, existingPlants, mappedLocation]);

  // Initialize selectedSlotIds defaults (unselect suspected duplicates by default, select all others)
  useEffect(() => {
    if (plannedItems.length > 0 && Object.keys(selectedSlotIds).length === 0) {
      const initialMap: Record<string, boolean> = {};
      plannedItems.forEach((item) => {
        initialMap[item.id] = !item.isDuplicate;
      });
      setSelectedSlotIds(initialMap);
    }
  }, [plannedItems, selectedSlotIds]);

  // Items chosen for synchronization that haven't already been created successfully
  const itemsToCreate = useMemo(() => {
    return plannedItems.filter(
      (item) => selectedSlotIds[item.id] !== false && !successfulSlotIds.has(item.id)
    );
  }, [plannedItems, selectedSlotIds, successfulSlotIds]);

  // Toggle individual plant selection
  const handleToggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) => ({
      ...prev,
      [slotId]: prev[slotId] === false ? true : false,
    }));
  };

  // Update stage override for an individual plant
  const handleSetPlantStage = (slotId: string, stage: GrowthStage) => {
    setStageOverrides((prev) => ({ ...prev, [slotId]: stage }));
  };

  // Execute synchronization with honest per-item reporting and safe retry
  const handleConfirmSync = async () => {
    if (itemsToCreate.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setHasAttemptedSync(true);
    const today = new Date().toISOString().split('T')[0];
    const newSuccessful = new Set(successfulSlotIds);
    const newErrors: Record<string, string> = { ...syncErrors };

    for (const item of itemsToCreate) {
      try {
        const assignedStage = stageOverrides[item.id] || defaultStage;

        // Finding B: Clean system-tagged note that distinguishes config records from user notes
        const initialNote = `[Planner System] Initialized from space "${profile.name}" — Shelf: ${item.tierName} (Physical Tier ${item.tierIndex + 1} of ${profile.tiers.length}, mapped to ${item.tierPosition} tier category).`;

        const res = await createGardenPlant({
          plantSlug: item.plantSlug,
          nickname: item.nickname,
          plantedDate: today,
          currentStage: assignedStage,
          location: item.location,
          tier: item.tierPosition,
          potSize: item.potSizeDescription,
          initialNote,
        });

        if (res.error) {
          newErrors[item.id] = res.error;
        } else {
          newSuccessful.add(item.id);
          delete newErrors[item.id];
        }
      } catch (err: any) {
        newErrors[item.id] = err?.message || 'Failed to save plant record';
      }
    }

    setSuccessfulSlotIds(newSuccessful);
    setSyncErrors(newErrors);
    setIsSubmitting(false);

    if (newSuccessful.size > 0 && onSyncComplete) {
      onSyncComplete(newSuccessful.size);
    }
  };

  if (!isOpen) return null;

  const totalSuccess = successfulSlotIds.size;
  const totalFailed = Object.keys(syncErrors).length;
  const isMultiTier = profile.tiers.length > 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-2xl bg-[#F8F6EE] border border-[#E3DFD2] rounded-2xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E3DFD2] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#EAF1E4] text-[#174C35]">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <h2 id={modalTitleId} className="font-serif text-lg sm:text-xl font-bold text-[#174C35]">
                Add Layout to My Garden
              </h2>
              <p className="text-xs text-[#5F6D63]">
                Create active plant tracking records from &quot;{profile.name}&quot;
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 rounded-lg text-[#5F6D63] hover:text-[#174C35] hover:bg-[#F8F6EE] transition-colors"
            aria-label="Close sync modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Post-Sync Status Banner */}
          {hasAttemptedSync && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                totalFailed === 0
                  ? 'bg-[#F8F6EE] border-[#E3DFD2] text-[#174C35]'
                  : totalSuccess > 0
                    ? 'bg-[#F8F6EE] border-[#F0C04D/30] text-[#8A6400]'
                    : 'bg-[#F8F6EE] border-[#E4775D/30] text-[#963A23]'
              }`}
            >
              {totalFailed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-[#174C35] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#F0C04D] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs sm:text-sm">
                <h3 className="font-semibold text-base font-serif">
                  {totalFailed === 0
                    ? `${totalSuccess} Plant${totalSuccess === 1 ? '' : 's'} Synchronized Successfully!`
                    : totalSuccess > 0
                      ? `Partially Synchronized: ${totalSuccess} added, ${totalFailed} failed`
                      : 'Synchronization Failed'}
                </h3>
                <p className="text-xs leading-relaxed opacity-90">
                  {totalFailed === 0
                    ? 'All selected containers are now active in My Garden. Existing plant records and photos remain completely safe.'
                    : 'Some items could not be saved. You can retry the failed items below without creating duplicates.'}
                </p>
              </div>
            </div>
          )}

          {/* Finding A: Multi-Tier Schema Disclosure (> 3 Tiers) */}
          {isMultiTier && (
            <div className="p-3.5 bg-[#F8F6EE] border border-[#E3DFD2] rounded-xl text-xs text-[#174C35] flex items-start gap-2.5 leading-relaxed">
              <Info className="w-4 h-4 text-[#174C35] shrink-0 mt-0.5" />
              <div>
                <strong>Multi-Tier Schema Mapping:</strong> Your space configuration contains{' '}
                <strong>{profile.tiers.length} physical shelves</strong>. Because the garden database schema
                organizes vertical positions into Top, Middle, and Bottom categories, intermediate shelves are
                mapped to their corresponding bracket. Your exact physical shelf number (e.g. Tier 4) is
                permanently documented in the plant&apos;s initial log.
              </div>
            </div>
          )}

          {/* Finding C: Growth Stage Selection */}
          <div className="p-4 bg-white border border-[#E3DFD2] rounded-xl space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F6D63] block">
                Initial Growth Stage
              </label>
              <p className="text-[11px] text-[#5F6D63] mt-0.5">
                Set how your plants are entering the garden. Established plants are not forced to start as seeds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SUPPORTED_GROWTH_STAGES.map((opt) => {
                const isSelected = defaultStage === opt.stage;
                return (
                  <button
                    key={opt.stage}
                    type="button"
                    onClick={() => setDefaultStage(opt.stage)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-[#174C35] bg-[#EAF1E4] ring-1 ring-[#174C35]'
                        : 'border-[#E3DFD2] bg-[#F8F6EE] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-[#203027]">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#174C35]" />}
                    </div>
                    <p className="text-[10px] text-[#5F6D63] mt-1 leading-snug">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plant Containers Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6D63]">
                Planned Containers ({itemsToCreate.length} of {plannedItems.length} selected)
              </span>
              <div className="flex items-center gap-3 text-xs text-[#5F6D63]">
                <button
                  type="button"
                  onClick={() => {
                    const all: Record<string, boolean> = {};
                    plannedItems.forEach((i) => (all[i.id] = true));
                    setSelectedSlotIds(all);
                  }}
                  className="hover:text-[#174C35] font-medium"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSelectedSlotIds({})}
                  className="hover:text-[#174C35] font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {plannedItems.length === 0 ? (
              <div className="p-6 text-center bg-white border border-[#E3DFD2] rounded-xl text-xs text-[#5F6D63]">
                No plant containers found in this space configuration. Assign plants in the visualizer before
                synchronizing.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {plannedItems.map((item, idx) => {
                  const isChecked = selectedSlotIds[item.id] !== false;
                  const isDone = successfulSlotIds.has(item.id);
                  const errorMsg = syncErrors[item.id];
                  const currentStage = stageOverrides[item.id] || defaultStage;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'bg-[#F8F6EE] border-[#E3DFD2]'
                          : errorMsg
                            ? 'bg-[#F8F6EE] border-[#E4775D/30]'
                            : isChecked
                              ? 'bg-white border-[#E3DFD2]'
                              : 'bg-[#F8F6EE] border-[#E3DFD2] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox and Info */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            disabled={isDone || isSubmitting}
                            checked={isDone || isChecked}
                            onChange={() => handleToggleSlot(item.id)}
                            className="mt-0.5 rounded border-[#E3DFD2] text-[#174C35] focus:ring-[#174C35] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-[#203027] truncate">
                                {item.nickname}
                              </span>
                              {isDone && (
                                <Badge variant="sage" size="sm">
                                  ✓ Added to Garden
                                </Badge>
                              )}
                              {item.isDuplicate && !isDone && (
                                <Badge variant="amber" size="sm">
                                  Duplicate in {item.location}
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-[#5F6D63] italic block truncate mt-0.5">
                              {item.commonName} • {item.potSizeDescription}
                            </span>
                          </div>
                        </div>

                        {/* Tier & Stage Controls */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                          <Badge variant="outline" size="sm">
                            <Layers className="w-3 h-3 text-[#174C35]" />
                            {item.tierName} ({item.tierPosition})
                          </Badge>

                          {/* Per-plant Stage Selector */}
                          {!isDone && (
                            <select
                              value={currentStage}
                              onChange={(e) => handleSetPlantStage(item.id, e.target.value as GrowthStage)}
                              className="text-[11px] bg-[#F8F6EE] border border-[#E3DFD2] text-[#174C35] rounded-md px-1.5 py-0.5 focus:ring-1 focus:ring-[#174C35]"
                              aria-label={`Select growth stage for ${item.nickname}`}
                            >
                              <option value="Seed">Seed</option>
                              <option value="Seedling">Seedling</option>
                              <option value="Growing">Growing</option>
                              <option value="Mature">Mature</option>
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Item-level error display */}
                      {errorMsg && (
                        <div className="mt-2 text-[11px] text-[#963A23] bg-[#FBE9E2] p-2 rounded-lg flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Finding B: Preservation Disclosure */}
          <div className="p-3 bg-[#F8F6EE] border border-[#E3DFD2] rounded-xl text-[11px] text-[#5F6D63] leading-relaxed">
            <strong>Data Integrity Assurance:</strong> Records are saved to your current garden log with
            pure container dimensions. Editing or deleting this planner space profile will{' '}
            <strong className="text-[#203027]">never delete or modify</strong> your created garden plants,
            photos, or care tasks.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 px-5 sm:px-6 py-4 border-t border-[#E3DFD2] bg-white sticky bottom-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-[#203027] hover:bg-[#F8F6EE] transition-colors"
          >
            {hasAttemptedSync && totalFailed === 0 ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {totalSuccess > 0 && (
              <Link
                href="/app/my-garden"
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#E3DFD2] text-xs font-semibold text-[#174C35] hover:bg-[#EAF1E4] transition-colors inline-flex items-center justify-center gap-1 min-h-[44px]"
              >
                <span>View Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {itemsToCreate.length > 0 && (
              <button
                type="button"
                disabled={isSubmitting || isLoadingExisting}
                onClick={handleConfirmSync}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#174C35] hover:bg-[#123C2A] disabled:bg-[#E3DFD2] disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm transition-colors shadow-xs active:scale-[0.98] select-none touch-manipulation inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : totalFailed > 0 ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry Failed ({itemsToCreate.length})</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    <span>
                      Confirm & Add {itemsToCreate.length} Plant{itemsToCreate.length === 1 ? '' : 's'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
