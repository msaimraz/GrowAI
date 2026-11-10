'use client';

import React, { useState } from 'react';
import {
  SpaceConfigProfile,
  SavedPlacementSlot,
  ContainerInput,
  CircularContainerInput,
  RackTierConfig,
} from '@/types/space-optimizer';
import {
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  evaluateLinearPacking,
  evaluateVerticalClearance,
  evaluateLightSuitability,
  evaluateBotanicalCompatibility,
  estimateContainerWetWeight,
  evaluateStructuralLoad,
} from '@/lib/space-optimizer';
import { PLANTS_DATA } from '@/data/plants';
import { Plant } from '@/types/plant';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Trash2,
  Settings2,
  ArrowUpDown,
  Sun,
  Ruler,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Info,
  X,
  Search,
  Layers,
  CircleDot,
  Square,
  HelpCircle,
} from 'lucide-react';

export interface TierVisualizerProps {
  profile: SpaceConfigProfile;
  onProfileChange: (updated: SpaceConfigProfile) => void;
}

export function TierVisualizer({ profile, onProfileChange }: TierVisualizerProps) {
  // Modal states
  const [addingToTierIndex, setAddingToTierIndex] = useState<number | null>(null);
  const [editingSlot, setEditingSlot] = useState<SavedPlacementSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Container configuration state for the Add Modal
  const [addShape, setAddShape] = useState<'circular' | 'rectangular' | 'trough'>('circular');
  const [addDiameter, setAddDiameter] = useState(20);
  const [addDepth, setAddDepth] = useState(20);
  const [addLength, setAddLength] = useState(40);
  const [addWidth, setAddWidth] = useState(20);

  // Remove a placement slot
  const handleRemoveSlot = (slotId: string) => {
    const updatedPlacements = profile.placements.filter((p) => p.id !== slotId);
    onProfileChange({ ...profile, placements: updatedPlacements });
  };

  // Change tier for a placement
  const handleChangeTier = (slotId: string, targetTierIndex: number) => {
    const updatedPlacements = profile.placements.map((p) => {
      if (p.id === slotId) {
        return { ...p, tierIndex: targetTierIndex };
      }
      return p;
    });
    onProfileChange({ ...profile, placements: updatedPlacements });
  };

  // Save edited container geometry
  const handleSaveContainerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const updatedPlacements = profile.placements.map((p) => {
      if (p.id === editingSlot.id) {
        return editingSlot;
      }
      return p;
    });

    onProfileChange({ ...profile, placements: updatedPlacements });
    setEditingSlot(null);
  };

  // Confirm adding plant to tier
  const handleConfirmAddPlant = (plant: Plant) => {
    if (addingToTierIndex === null) return;

    let container: ContainerInput;
    if (addShape === 'circular') {
      container = {
        shape: 'circular',
        topDiameter: addDiameter || plant.potting.minDepthCm || 20,
        height: addDepth || plant.potting.minDepthCm || 20,
        unit: 'cm',
      };
    } else {
      container = {
        shape: addShape,
        width: addWidth || 20,
        length: addLength || 40,
        height: addDepth || plant.potting.minDepthCm || 20,
        unit: 'cm',
      };
    }

    const newSlot: SavedPlacementSlot = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `slot-${Date.now()}`,
      tierIndex: addingToTierIndex,
      slotIndex: profile.placements.filter((p) => p.tierIndex === addingToTierIndex).length,
      plantSlug: plant.slug,
      customNickname: plant.commonName,
      container,
    };

    onProfileChange({
      ...profile,
      placements: [...profile.placements, newSlot],
    });

    setAddingToTierIndex(null);
    setSearchQuery('');
  };

  // Filter species for add dialog
  const filteredCatalog = PLANTS_DATA.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.commonName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {profile.tiers.map((tier, idx) => {
        const usable = calculateUsableShelfDimensions(tier.shelfDimensions, profile.dimensions);
        const tierPlacements = profile.placements.filter((p) => p.tierIndex === tier.tierIndex);

        // Compute items and packing metrics
        const items = tierPlacements.map((p) => {
          const containerMetrics = calculateContainerMetrics(p.container);
          const catalogPlant = PLANTS_DATA.find((plant) => plant.slug === p.plantSlug);
          return {
            id: p.id,
            plantSlug: p.plantSlug,
            commonName: catalogPlant?.commonName || p.plantSlug,
            container: containerMetrics,
            botanicalSpacingCm: catalogPlant?.potting.spacingCm,
          };
        });

        const packing = evaluateLinearPacking(items, usable);

        // Light level estimation for this tier
        const tierMultiplier = tier.lightAttenuationMultiplier ?? (idx === 0 ? 1.0 : idx === 1 ? 0.7 : 0.45);
        const estimatedLightHours = Number((profile.sunlightHours * tierMultiplier).toFixed(1));

        // Structural load
        let tierWeightKg = 0;
        items.forEach((item) => {
          const wet = estimateContainerWetWeight(item.container);
          tierWeightKg += wet.totalEstimatedWeightKg || 0;
        });
        const structural = evaluateStructuralLoad(
          tierWeightKg,
          tier.confirmedShelfLoadRatingKg,
          tier.tierIndex
        );

        // Compatibility check
        const compatibility = evaluateBotanicalCompatibility(
          items,
          tierPlacements.some((p) => p.container.shape === 'trough')
        );
        const mintConflict = compatibility.find((c) => c.status === 'invasive_isolation_required');

        return (
          <div
            key={tier.tierIndex}
            className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-7 shadow-xs space-y-5"
          >
            {/* Shelf Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E3DFD2]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-serif font-bold text-xl text-[#203027]">
                    {tier.tierName || `Tier ${idx + 1}`}
                  </span>
                  <Badge
                    variant={idx === 0 ? 'amber' : idx === 1 ? 'sage' : 'neutral'}
                    size="md"
                  >
                    ~{estimatedLightHours}h Daylight
                  </Badge>
                  <span className="text-[11px] font-mono text-[#5F6D63] bg-[#F8F6EE] px-2.5 py-0.5 rounded-lg border border-[#E3DFD2]">
                    Clearance: {tier.shelfDimensions.verticalClearance ? `${tier.shelfDimensions.verticalClearance} cm` : 'Open'}
                  </span>
                </div>
                <p className="text-xs text-[#5F6D63]">
                  Shelf: {tier.shelfDimensions.width} × {tier.shelfDimensions.depth} cm • Usable Span:{' '}
                  {usable.isValid ? `${usable.usableWidthCm} cm` : 'Invalid'}
                  {tier.confirmedShelfLoadRatingKg
                    ? ` • SWL Rating: ${tier.confirmedShelfLoadRatingKg} kg`
                    : ' • Unconfirmed Load Rating'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-semibold text-[#174C35] bg-[#EAF1E4] px-3 py-1.5 rounded-xl border border-[#E3DFD2]">
                  {packing.occupiedWidthCm} / {usable.isValid ? usable.usableWidthCm : 0} cm ({tierPlacements.length} Pots)
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setAddingToTierIndex(tier.tierIndex);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  <Plus size={16} />
                  <span>Add Plant</span>
                </button>
              </div>
            </div>

            {/* Placed Plant Containers & Empty Zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierPlacements.map((slot) => {
                const catalogPlant = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);
                const containerMetrics = calculateContainerMetrics(slot.container);

                // Photobiology suitability
                const lightSuitability = catalogPlant
                  ? evaluateLightSuitability(
                      catalogPlant.sunlight,
                      profile.environment === 'indoor' ? 'indoor_natural' : 'outdoor',
                      profile.sunlightHours,
                      tierMultiplier,
                      true
                    )
                  : undefined;

                // Vertical clearance check
                const clearance = evaluateVerticalClearance(
                  tier.shelfDimensions.verticalClearance,
                  containerMetrics.heightCm,
                  undefined // Botanical catalog does not invent mature height
                );

                // Determine placement health status
                const isSpearmintConflict = slot.plantSlug === 'spearmint' && Boolean(mintConflict);
                const isOverload = structural.status === 'exceeds_confirmed_limit';
                const hasLightDeficit = lightSuitability?.status === 'insufficient_light';
                const hasSolarRisk = lightSuitability?.status === 'excessive_light_risk';

                let statusBadge = (
                  <Badge variant="sage" size="sm" className="gap-1">
                    <CheckCircle2 size={12} />
                    <span>Compatible</span>
                  </Badge>
                );

                if (isSpearmintConflict) {
                  statusBadge = (
                    <Badge variant="terracotta" size="sm" className="gap-1">
                      <ShieldAlert size={12} />
                      <span>Invasive Rhizomes</span>
                    </Badge>
                  );
                } else if (isOverload) {
                  statusBadge = (
                    <Badge variant="terracotta" size="sm" className="gap-1">
                      <AlertTriangle size={12} />
                      <span>Shelf Overload</span>
                    </Badge>
                  );
                } else if (hasLightDeficit) {
                  statusBadge = (
                    <Badge variant="amber" size="sm" className="gap-1">
                      <Sun size={12} />
                      <span>Low Light</span>
                    </Badge>
                  );
                } else if (hasSolarRisk) {
                  statusBadge = (
                    <Badge variant="amber" size="sm" className="gap-1">
                      <Sun size={12} />
                      <span>Scorch Risk</span>
                    </Badge>
                  );
                } else if (clearance.status === 'insufficient_clearance_data') {
                  statusBadge = (
                    <span title="Mature plant height is not in catalog">
                      <Badge variant="neutral" size="sm" className="gap-1">
                        <HelpCircle size={12} />
                        <span>Clearance Unverified</span>
                      </Badge>
                    </span>
                  );
                }

                return (
                  <div
                    key={slot.id}
                    className="p-5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex flex-col justify-between space-y-4 hover:border-[#174C35] transition-all min-h-[260px]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full capitalize">
                          {catalogPlant?.category.replace('-', ' ') || 'Botanical'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingSlot(slot)}
                            className="text-[#5F6D63] hover:text-[#203027] p-2 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Edit container dimensions"
                            aria-label={`Edit container for ${catalogPlant?.commonName || slot.plantSlug}`}
                          >
                            <Settings2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="text-[#963A23] hover:bg-[#FBE9E2] p-2 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Remove from shelf"
                            aria-label={`Remove ${catalogPlant?.commonName || slot.plantSlug}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#203027]">
                          {catalogPlant?.commonName || slot.plantSlug}
                        </h4>
                        <p className="text-xs text-[#5F6D63] italic">
                          {catalogPlant?.scientificName || 'Botanical Species'}
                        </p>
                      </div>

                      {/* Health & Diagnostic Pill */}
                      <div>{statusBadge}</div>

                      {/* Container Metrics */}
                      <div className="space-y-1.5 text-xs text-[#203027] pt-1 border-t border-[#E3DFD2]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#5F6D63] flex items-center gap-1">
                            {slot.container.shape === 'circular' ? (
                              <CircleDot size={12} />
                            ) : (
                              <Square size={12} />
                            )}
                            Container:
                          </span>
                          <strong className="text-[#203027] capitalize">
                            {slot.container.shape === 'circular'
                              ? `Ø ${slot.container.topDiameter} × ${slot.container.height} cm`
                              : `${(slot.container as any).length}×${(slot.container as any).width}×${slot.container.height} cm`}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#5F6D63]">Soil Volume:</span>
                          <strong className="text-[#203027]">
                            ~{containerMetrics.soilVolumeLiters.toFixed(1)} Liters
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Change Tier Selector */}
                    <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-between">
                      <label className="text-[11px] text-[#5F6D63] flex items-center gap-1">
                        <ArrowUpDown size={12} />
                        <span>Move Tier:</span>
                      </label>
                      <select
                        value={slot.tierIndex}
                        onChange={(e) => handleChangeTier(slot.id, parseInt(e.target.value, 10))}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#E3DFD2] bg-white min-h-[36px]"
                        aria-label="Move plant to different tier"
                      >
                        {profile.tiers.map((t) => (
                          <option key={t.tierIndex} value={t.tierIndex}>
                            {t.tierName || `Tier ${t.tierIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

              {/* Empty Space Drop Target Card */}
              <div
                onClick={() => {
                  setAddingToTierIndex(tier.tierIndex);
                  setSearchQuery('');
                }}
                className="border-2 border-dashed border-[#E3DFD2] hover:border-[#174C35] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#F8F6EE] hover:bg-[#EAF1E4] min-h-[260px] group"
              >
                <div className="w-12 h-12 rounded-full bg-[#F8F6EE] group-hover:bg-white text-[#5F6D63] group-hover:text-[#174C35] flex items-center justify-center mb-2.5 transition-colors shadow-2xs">
                  <Plus size={24} />
                </div>
                <span className="text-sm font-serif font-bold text-[#5F6D63] group-hover:text-[#203027]">
                  Assign Plant
                </span>
                <span className="text-xs text-[#5F6D63] mt-1 max-w-[200px]">
                  {packing.remainingWidthCm > 0
                    ? `${packing.remainingWidthCm} cm free space available`
                    : 'Shelf at linear capacity'}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* -----------------------------------------------------------------------
          MODAL 1: ADD PLANT DIALOG
      ------------------------------------------------------------------------ */}
      {addingToTierIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E3DFD2] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3DFD2]">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#203027]">
                  Assign Species to Tier {addingToTierIndex + 1}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6D63] mt-0.5">
                  Select from our 19 verified botanical catalog profiles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddingToTierIndex(null)}
                className="p-2 rounded-xl text-[#5F6D63] hover:text-[#203027] hover:bg-[#EAF1E4] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Container Geometry Preset */}
            <div className="p-4 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6D63] block">
                Container Type & Dimensions
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-[#E3DFD2] p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setAddShape('circular')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                      addShape === 'circular' ? 'bg-[#174C35] text-white' : 'text-[#5F6D63]'
                    }`}
                  >
                    Circular Pot
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddShape('trough')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                      addShape === 'trough' ? 'bg-[#174C35] text-white' : 'text-[#5F6D63]'
                    }`}
                  >
                    Planter Trough
                  </button>
                </div>

                {addShape === 'circular' ? (
                  <div className="flex items-center gap-2 text-xs">
                    <label>Ø Diam:</label>
                    <input
                      type="number"
                      value={addDiameter}
                      onChange={(e) => setAddDiameter(parseInt(e.target.value, 10) || 20)}
                      className="w-16 px-2 py-1 rounded-lg border border-[#E3DFD2] bg-white text-center"
                    />
                    <span>cm</span>
                    <label className="ml-2">Depth:</label>
                    <input
                      type="number"
                      value={addDepth}
                      onChange={(e) => setAddDepth(parseInt(e.target.value, 10) || 20)}
                      className="w-16 px-2 py-1 rounded-lg border border-[#E3DFD2] bg-white text-center"
                    />
                    <span>cm</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <label>Length:</label>
                    <input
                      type="number"
                      value={addLength}
                      onChange={(e) => setAddLength(parseInt(e.target.value, 10) || 40)}
                      className="w-16 px-2 py-1 rounded-lg border border-[#E3DFD2] bg-white text-center"
                    />
                    <span>cm</span>
                    <label className="ml-2">Width:</label>
                    <input
                      type="number"
                      value={addWidth}
                      onChange={(e) => setAddWidth(parseInt(e.target.value, 10) || 20)}
                      className="w-16 px-2 py-1 rounded-lg border border-[#E3DFD2] bg-white text-center"
                    />
                    <span>cm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5F6D63]" />
              <input
                type="text"
                placeholder="Search botanical catalog (e.g. Basil, Tomato, Spinach)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
              />
            </div>

            {/* Species List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredCatalog.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => handleConfirmAddPlant(plant)}
                  className="p-4 rounded-2xl border border-[#E3DFD2] hover:border-[#174C35] hover:bg-[#EAF1E4] bg-white flex items-center justify-between gap-4 cursor-pointer transition-all min-h-[64px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-base text-[#203027]">
                        {plant.commonName}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#174C35] bg-[#EAF1E4] px-2 py-0.5 rounded-full border border-[#E3DFD2]">
                        {plant.sunlight}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6D63] truncate mt-0.5">
                      <em>{plant.scientificName}</em> • Min Depth: {plant.potting.minDepthCm} cm • In-Row: {plant.potting.spacingCm} cm
                    </p>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-white bg-[#174C35] hover:bg-[#203027] px-4 py-2.5 rounded-xl shadow-xs min-h-[44px] flex items-center justify-center cursor-pointer"
                  >
                    Place
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E3DFD2] flex justify-end">
              <button
                type="button"
                onClick={() => setAddingToTierIndex(null)}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#5F6D63] hover:bg-[#EAF1E4] rounded-xl border border-[#E3DFD2] min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL 2: EDIT CONTAINER GEOMETRY
      ------------------------------------------------------------------------ */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E3DFD2] max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
              <h3 className="font-serif font-bold text-lg text-[#203027]">
                Edit Container Dimensions
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="p-1.5 rounded-lg text-[#5F6D63] hover:text-[#203027] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContainerEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Container Shape
                </label>
                <select
                  value={editingSlot.container.shape}
                  onChange={(e) => {
                    const newShape = e.target.value as any;
                    if (newShape === 'circular') {
                      setEditingSlot({
                        ...editingSlot,
                        container: { shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' },
                      });
                    } else {
                      setEditingSlot({
                        ...editingSlot,
                        container: { shape: newShape, width: 20, length: 40, height: 20, unit: 'cm' },
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-sm text-[#203027] min-h-[44px]"
                >
                  <option value="circular">Circular Pot</option>
                  <option value="rectangular">Rectangular Planter</option>
                  <option value="trough">Planter Trough</option>
                </select>
              </div>

              {editingSlot.container.shape === 'circular' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#203027] mb-1">
                      Diameter (cm)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={(editingSlot.container as CircularContainerInput).topDiameter}
                      onChange={(e) =>
                        setEditingSlot({
                          ...editingSlot,
                          container: {
                            ...(editingSlot.container as CircularContainerInput),
                            shape: 'circular',
                            topDiameter: parseFloat(e.target.value) || 20,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E3DFD2] text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203027] mb-1">
                      Depth (cm)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={editingSlot.container.height}
                      onChange={(e) =>
                        setEditingSlot({
                          ...editingSlot,
                          container: {
                            ...editingSlot.container,
                            height: parseFloat(e.target.value) || 20,
                          } as ContainerInput,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E3DFD2] text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#203027] mb-1">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={(editingSlot.container as any).length}
                      onChange={(e) =>
                        setEditingSlot({
                          ...editingSlot,
                          container: {
                            ...editingSlot.container,
                            length: parseFloat(e.target.value) || 40,
                          } as any,
                        })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-[#E3DFD2] text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203027] mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={(editingSlot.container as any).width}
                      onChange={(e) =>
                        setEditingSlot({
                          ...editingSlot,
                          container: {
                            ...editingSlot.container,
                            width: parseFloat(e.target.value) || 20,
                          } as any,
                        })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-[#E3DFD2] text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203027] mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={editingSlot.container.height}
                      onChange={(e) =>
                        setEditingSlot({
                          ...editingSlot,
                          container: {
                            ...editingSlot.container,
                            height: parseFloat(e.target.value) || 20,
                          },
                        })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-[#E3DFD2] text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#E3DFD2] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5F6D63] hover:bg-[#EAF1E4] rounded-xl border border-[#E3DFD2] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#174C35] hover:bg-[#203027] rounded-xl min-h-[44px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
