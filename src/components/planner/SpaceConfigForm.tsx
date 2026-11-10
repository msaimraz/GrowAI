'use client';

import React, { useState } from 'react';
import {
  SpaceConfigProfile,
  SpaceType,
  SpaceEnvironment,
  SpaceOrientation,
  LengthUnit,
  RackTierConfig,
} from '@/types/space-optimizer';
import {
  cmToInches,
  inchesToCm,
  validateSpaceDimensions,
} from '@/lib/space-optimizer';
import {
  getSavedSpaceConfigs,
  saveSpaceConfig,
  deleteSpaceConfig,
  setActiveSpaceConfigId,
} from '@/lib/space-storage';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  Layers,
  Sun,
  Compass,
  Ruler,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface SpaceConfigFormProps {
  currentProfile: SpaceConfigProfile;
  onProfileChange: (updated: SpaceConfigProfile) => void;
  savedProfiles: SpaceConfigProfile[];
  onProfilesListChange: (profiles: SpaceConfigProfile[]) => void;
}

// Horticultural Space Presets
const SPACE_PRESETS: Array<{
  id: SpaceType;
  label: string;
  description: string;
  defaults: {
    dimensions: { width: number; depth: number; height: number; unit: LengthUnit };
    sunlightHours: number;
    environment: SpaceEnvironment;
    orientation: SpaceOrientation;
    tiersCount: number;
  };
}> = [
  {
    id: 'balcony_rack',
    label: 'Balcony Railing / Multi-Tier Stand',
    description: '3-shelf outdoor powder-coated stand with direct sun and cascading drainage.',
    defaults: {
      dimensions: { width: 90, depth: 35, height: 160, unit: 'cm' },
      sunlightHours: 6.0,
      environment: 'outdoor_sheltered',
      orientation: 'south',
      tiersCount: 3,
    },
  },
  {
    id: 'windowsill',
    label: 'Kitchen Windowsill Shelf',
    description: 'Single-tier narrow indoor sill designed for shallow culinary herb pots.',
    defaults: {
      dimensions: { width: 75, depth: 20, height: 50, unit: 'cm' },
      sunlightHours: 4.5,
      environment: 'indoor',
      orientation: 'east',
      tiersCount: 1,
    },
  },
  {
    id: 'indoor_grow_tent',
    label: 'Indoor Grow Tent / Hydro Station',
    description: 'Enclosed indoor environment with dedicated full-spectrum grow lights.',
    defaults: {
      dimensions: { width: 120, depth: 60, height: 180, unit: 'cm' },
      sunlightHours: 12.0,
      environment: 'indoor',
      orientation: 'unspecified',
      tiersCount: 2,
    },
  },
  {
    id: 'patio_bakers_rack',
    label: "Patio Baker's Rack",
    description: '4-tier metal or wood wire rack for outdoor container collections.',
    defaults: {
      dimensions: { width: 85, depth: 40, height: 170, unit: 'cm' },
      sunlightHours: 6.5,
      environment: 'outdoor_exposed',
      orientation: 'west',
      tiersCount: 4,
    },
  },
  {
    id: 'vertical_hydroponics',
    label: 'Vertical Column / Tower',
    description: 'Stacked vertical planting column with recirculating nutrient reservoir.',
    defaults: {
      dimensions: { width: 50, depth: 50, height: 160, unit: 'cm' },
      sunlightHours: 5.0,
      environment: 'outdoor_sheltered',
      orientation: 'south',
      tiersCount: 4,
    },
  },
  {
    id: 'custom',
    label: 'Custom Space Dimensions',
    description: 'User-specified dimensions and bespoke tier configurations.',
    defaults: {
      dimensions: { width: 90, depth: 35, height: 160, unit: 'cm' },
      sunlightHours: 6.0,
      environment: 'outdoor_sheltered',
      orientation: 'unspecified',
      tiersCount: 3,
    },
  },
];

export function SpaceConfigForm({
  currentProfile,
  onProfileChange,
  savedProfiles,
  onProfilesListChange,
}: SpaceConfigFormProps) {
  const { showSuccess } = useGrowToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeUnit, setActiveUnit] = useState<LengthUnit>(currentProfile.dimensions.unit || 'cm');

  // Handle preset application
  const handleApplyPreset = (presetId: SpaceType) => {
    const preset = SPACE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newTiers: RackTierConfig[] = [];
    for (let i = 0; i < preset.defaults.tiersCount; i++) {
      const position = i === 0 ? 'top' : i === preset.defaults.tiersCount - 1 ? 'bottom' : 'middle';
      const tierName = i === 0 ? 'Top Tier' : i === preset.defaults.tiersCount - 1 ? 'Bottom Tier' : `Tier ${i + 1}`;
      newTiers.push({
        tierIndex: i,
        position,
        tierName,
        shelfDimensions: {
          width: preset.defaults.dimensions.width,
          depth: preset.defaults.dimensions.depth,
          verticalClearance: Math.round(preset.defaults.dimensions.height / preset.defaults.tiersCount),
          unit: preset.defaults.dimensions.unit,
        },
      });
    }

    const updated: SpaceConfigProfile = {
      ...currentProfile,
      name: currentProfile.name || preset.label,
      spaceType: preset.id,
      environment: preset.defaults.environment,
      orientation: preset.defaults.orientation,
      sunlightHours: preset.defaults.sunlightHours,
      dimensions: {
        ...preset.defaults.dimensions,
        unit: activeUnit,
        width: activeUnit === 'in' ? cmToInches(preset.defaults.dimensions.width) : preset.defaults.dimensions.width,
        depth: activeUnit === 'in' ? cmToInches(preset.defaults.dimensions.depth) : preset.defaults.dimensions.depth,
        height: activeUnit === 'in' ? cmToInches(preset.defaults.dimensions.height) : preset.defaults.dimensions.height,
      },
      tiers: newTiers,
    };

    onProfileChange(updated);
  };

  // Unit toggle (converts input values in place)
  const handleUnitToggle = (newUnit: LengthUnit) => {
    if (newUnit === activeUnit) return;
    setActiveUnit(newUnit);

    const convert = (val: number) => (newUnit === 'in' ? cmToInches(val) : inchesToCm(val));

    const updated: SpaceConfigProfile = {
      ...currentProfile,
      dimensions: {
        unit: newUnit,
        width: Number(convert(currentProfile.dimensions.width).toFixed(1)),
        depth: Number(convert(currentProfile.dimensions.depth).toFixed(1)),
        height: Number(convert(currentProfile.dimensions.height).toFixed(1)),
      },
      tiers: currentProfile.tiers.map((t) => ({
        ...t,
        shelfDimensions: {
          unit: newUnit,
          width: Number(convert(t.shelfDimensions.width).toFixed(1)),
          depth: Number(convert(t.shelfDimensions.depth).toFixed(1)),
          verticalClearance: t.shelfDimensions.verticalClearance
            ? Number(convert(t.shelfDimensions.verticalClearance).toFixed(1))
            : undefined,
          edgeMargin: t.shelfDimensions.edgeMargin
            ? Number(convert(t.shelfDimensions.edgeMargin).toFixed(1))
            : undefined,
        },
      })),
    };

    onProfileChange(updated);
  };

  // Add / Remove Tier
  const handleAddTier = () => {
    if (currentProfile.tiers.length >= 8) {
      alert('Maximum of 8 tiers supported per space profile.');
      return;
    }

    const newIndex = currentProfile.tiers.length;
    const newTier: RackTierConfig = {
      tierIndex: newIndex,
      tierName: `Tier ${newIndex + 1}`,
      position: 'middle',
      shelfDimensions: {
        width: currentProfile.dimensions.width,
        depth: currentProfile.dimensions.depth,
        verticalClearance: Math.round(currentProfile.dimensions.height / (newIndex + 1)),
        unit: activeUnit,
      },
    };

    onProfileChange({
      ...currentProfile,
      tiers: [...currentProfile.tiers, newTier],
    });
  };

  const handleRemoveTier = (tierIndex: number) => {
    if (currentProfile.tiers.length <= 1) {
      alert('A growing space must have at least one shelf tier.');
      return;
    }

    const updatedTiers = currentProfile.tiers
      .filter((t) => t.tierIndex !== tierIndex)
      .map((t, idx) => ({ ...t, tierIndex: idx }));

    // Remove placements on deleted tier and decrement tierIndex for subsequent tiers
    const updatedPlacements = currentProfile.placements
      .filter((p) => p.tierIndex !== tierIndex)
      .map((p) => (p.tierIndex > tierIndex ? { ...p, tierIndex: p.tierIndex - 1 } : p));

    onProfileChange({
      ...currentProfile,
      tiers: updatedTiers,
      placements: updatedPlacements,
    });
  };

  const handleMoveTier = (tierIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? tierIndex - 1 : tierIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentProfile.tiers.length) return;

    const newTiers = [...currentProfile.tiers];
    const [moved] = newTiers.splice(tierIndex, 1);
    newTiers.splice(targetIndex, 0, moved);

    // Re-index tiers sequentially
    const reindexedTiers = newTiers.map((t, idx) => ({ ...t, tierIndex: idx }));

    // Preserve physical meaning of placements by swapping tier references
    const updatedPlacements = currentProfile.placements.map((p) => {
      if (p.tierIndex === tierIndex) {
        return { ...p, tierIndex: targetIndex };
      }
      if (p.tierIndex === targetIndex) {
        return { ...p, tierIndex };
      }
      return p;
    });

    onProfileChange({
      ...currentProfile,
      tiers: reindexedTiers,
      placements: updatedPlacements,
    });
  };

  // Save active configuration to local storage
  const handleSaveProfile = () => {
    setValidationErrors([]);
    const dimVal = validateSpaceDimensions(currentProfile.dimensions);
    if (!dimVal.isValid) {
      setValidationErrors(dimVal.errors);
      return;
    }

    const res = saveSpaceConfig(currentProfile);
    if (res.error) {
      setValidationErrors([res.error]);
      return;
    }

    if (res.space) {
      onProfileChange(res.space);
      const all = getSavedSpaceConfigs();
      onProfilesListChange(all);
      setActiveSpaceConfigId(res.space.id);
      setSaveStatus('Space profile saved successfully.');
      setTimeout(() => setSaveStatus(null), 3000);
      showSuccess('🪴 Space saved!', 'Your growing space is ready to use.', '🪴');
    }
  };

  // Create a brand new space profile
  const handleCreateNewProfile = () => {
    const defaultPreset = SPACE_PRESETS[0];
    const newProfile: SpaceConfigProfile = {
      schemaVersion: 1,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`,
      name: 'New Garden Space',
      spaceType: 'balcony_rack',
      environment: 'outdoor_sheltered',
      orientation: 'south',
      sunlightHours: 6.0,
      dimensions: { width: 90, depth: 35, height: 160, unit: activeUnit },
      tiers: [
        {
          tierIndex: 0,
          tierName: 'Top Tier',
          position: 'top',
          shelfDimensions: { width: 90, depth: 35, verticalClearance: 60, unit: activeUnit },
        },
        {
          tierIndex: 1,
          tierName: 'Middle Tier',
          position: 'middle',
          shelfDimensions: { width: 90, depth: 35, verticalClearance: 45, unit: activeUnit },
        },
        {
          tierIndex: 2,
          tierName: 'Bottom Tier',
          position: 'bottom',
          shelfDimensions: { width: 90, depth: 35, verticalClearance: 50, unit: activeUnit },
        },
      ],
      placements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onProfileChange(newProfile);
    saveSpaceConfig(newProfile);
    onProfilesListChange(getSavedSpaceConfigs());
    setActiveSpaceConfigId(newProfile.id);
  };

  // Delete current profile
  const handleDeleteCurrent = () => {
    if (savedProfiles.length <= 1) {
      alert('You must retain at least one space configuration.');
      return;
    }

    if (confirm(`Delete space profile '${currentProfile.name}'?`)) {
      deleteSpaceConfig(currentProfile.id);
      const remaining = getSavedSpaceConfigs();
      onProfilesListChange(remaining);
      if (remaining.length > 0) {
        onProfileChange(remaining[0]);
        setActiveSpaceConfigId(remaining[0].id);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-7 shadow-xs space-y-6">
      {/* Profile Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DFD2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentProfile.name}
                onChange={(e) => onProfileChange({ ...currentProfile, name: e.target.value })}
                className="font-serif font-bold text-lg sm:text-xl text-[#203027] bg-transparent border-b border-dashed border-[#E3DFD2] hover:border-[#174C35] focus:outline-none focus:border-[#174C35] pb-0.5"
                placeholder="Name your growing space..."
              />
            </div>
            <p className="text-xs text-[#68766C] mt-0.5">
              {currentProfile.dimensions.width} × {currentProfile.dimensions.depth} × {currentProfile.dimensions.height} {activeUnit} • {currentProfile.tiers.length} Tiers
            </p>
          </div>
        </div>

        {/* Profile Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {savedProfiles.length > 1 && (
            <select
              value={currentProfile.id}
              onChange={(e) => {
                const found = savedProfiles.find((p) => p.id === e.target.value);
                if (found) {
                  onProfileChange(found);
                  setActiveSpaceConfigId(found.id);
                }
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] min-h-[44px]"
            >
              {savedProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleCreateNewProfile}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#EAF1E4] text-xs font-semibold text-[#174C35] min-h-[44px] cursor-pointer"
          >
            <Plus size={15} />
            <span>New Space</span>
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs font-semibold shadow-xs min-h-[44px] cursor-pointer"
          >
            <Save size={15} />
            <span>Save Profile</span>
          </button>

          {savedProfiles.length > 1 && (
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="p-2.5 rounded-xl text-[#963A23] hover:bg-[#FBE9E2] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Delete this space profile"
              aria-label="Delete this space profile"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-xl text-[#68766C] hover:bg-[#EAF1E4] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle configuration panel"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-3 bg-[#FBE9E2] border border-[#E4775D/30] text-[#963A23] text-xs rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle size={15} />
            <span>Configuration Issues Detected</span>
          </div>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Form Body */}
      {isExpanded && (
        <div className="space-y-6 pt-1">
          {/* Preset Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68766C] mb-2.5">
              Select Growing Footprint Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SPACE_PRESETS.map((p) => {
                const isSelected = currentProfile.spaceType === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all min-h-[72px] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#EAF1E4] border-[#174C35] shadow-2xs'
                        : 'bg-[#F8F6EE] border-[#E3DFD2] hover:border-[#174C35]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#203027]">{p.label}</span>
                      {isSelected && <CheckCircle2 size={15} className="text-[#174C35]" />}
                    </div>
                    <p className="text-[11px] text-[#68766C] mt-1 leading-snug">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unit Switcher & Overall Space Dimensions */}
          <div className="bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E3DFD2]">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-[#174C35]" />
                <span className="font-serif font-bold text-sm text-[#203027]">
                  Overall Space Footprint
                </span>
              </div>
              <div className="inline-flex rounded-xl border border-[#E3DFD2] p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => handleUnitToggle('cm')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeUnit === 'cm' ? 'bg-[#174C35] text-white' : 'text-[#68766C]'
                  }`}
                >
                  Metric (cm)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('in')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeUnit === 'in' ? 'bg-[#174C35] text-white' : 'text-[#68766C]'
                  }`}
                >
                  Imperial (in)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Width ({activeUnit})
                </label>
                <input
                  type="number"
                  min="10"
                  step="0.5"
                  value={currentProfile.dimensions.width || ''}
                  onChange={(e) =>
                    onProfileChange({
                      ...currentProfile,
                      dimensions: { ...currentProfile.dimensions, width: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Depth ({activeUnit})
                </label>
                <input
                  type="number"
                  min="10"
                  step="0.5"
                  value={currentProfile.dimensions.depth || ''}
                  onChange={(e) =>
                    onProfileChange({
                      ...currentProfile,
                      dimensions: { ...currentProfile.dimensions, depth: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Total Height ({activeUnit})
                </label>
                <input
                  type="number"
                  min="20"
                  step="0.5"
                  value={currentProfile.dimensions.height || ''}
                  onChange={(e) =>
                    onProfileChange({
                      ...currentProfile,
                      dimensions: { ...currentProfile.dimensions, height: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Microclimate & Environment Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] p-4 sm:p-5">
            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1">
                Growing Environment
              </label>
              <select
                value={currentProfile.environment}
                onChange={(e) =>
                  onProfileChange({ ...currentProfile, environment: e.target.value as SpaceEnvironment })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
              >
                <option value="outdoor_sheltered">Outdoor Sheltered (Balcony/Patio)</option>
                <option value="outdoor_exposed">Outdoor Exposed (Rooftop/Yard)</option>
                <option value="indoor">Indoor (Windowsill/Grow Tent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1 flex items-center justify-between">
                <span>Cardinal Orientation</span>
                <Compass size={14} className="text-[#68766C]" />
              </label>
              <select
                value={currentProfile.orientation || 'south'}
                onChange={(e) =>
                  onProfileChange({ ...currentProfile, orientation: e.target.value as SpaceOrientation })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
              >
                <option value="south">South Facing (Maximum Solar Hours)</option>
                <option value="east">East Facing (Morning Sun & Gentle Heat)</option>
                <option value="west">West Facing (Hot Afternoon Sun)</option>
                <option value="north">North Facing (Shaded / Cool Indirect)</option>
                <option value="unspecified">Unspecified / Indoor Artificial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1 flex items-center justify-between">
                <span>Direct Sunlight Hours</span>
                <Sun size={14} className="text-[#8A6400]" />
              </label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={currentProfile.sunlightHours || ''}
                onChange={(e) =>
                  onProfileChange({
                    ...currentProfile,
                    sunlightHours: Math.min(24, Math.max(0, parseFloat(e.target.value) || 0)),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DFD2] bg-white text-sm text-[#203027] min-h-[44px]"
              />
              <p className="text-[10px] text-[#68766C] mt-1">
                Ambient unobstructed daylight hours. Attenuation is simulated per tier.
              </p>
            </div>
          </div>

          {/* Tier-by-Tier Customization */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-[#203027]">
                  Rack Tiers ({currentProfile.tiers.length} Shelves)
                </h4>
                <p className="text-xs text-[#68766C]">
                  Configure per-shelf clearances, edge margins, and manufacturer load ratings.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#EAF1E4] text-xs font-semibold text-[#174C35] min-h-[44px] cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentProfile.tiers.map((tier, idx) => (
                <div
                  key={tier.tierIndex}
                  className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#EAF1E4] text-[#174C35] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      T{idx + 1}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={tier.tierName || `Tier ${idx + 1}`}
                        onChange={(e) => {
                          const updated = [...currentProfile.tiers];
                          updated[idx] = { ...tier, tierName: e.target.value };
                          onProfileChange({ ...currentProfile, tiers: updated });
                        }}
                        className="font-serif font-bold text-sm text-[#203027] bg-transparent border-b border-dashed border-[#E3DFD2]"
                      />
                      <span className="block text-[11px] text-[#68766C] capitalize">
                        {tier.position} Shelf Position
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs flex-1 max-w-2xl">
                    <div>
                      <label className="text-[11px] text-[#68766C] block mb-0.5">Shelf W ({activeUnit})</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tier.shelfDimensions.width || ''}
                        onChange={(e) => {
                          const updated = [...currentProfile.tiers];
                          updated[idx] = {
                            ...tier,
                            shelfDimensions: {
                              ...tier.shelfDimensions,
                              width: parseFloat(e.target.value) || 0,
                            },
                          };
                          onProfileChange({ ...currentProfile, tiers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#68766C] block mb-0.5">Shelf D ({activeUnit})</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tier.shelfDimensions.depth || ''}
                        onChange={(e) => {
                          const updated = [...currentProfile.tiers];
                          updated[idx] = {
                            ...tier,
                            shelfDimensions: {
                              ...tier.shelfDimensions,
                              depth: parseFloat(e.target.value) || 0,
                            },
                          };
                          onProfileChange({ ...currentProfile, tiers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#68766C] block mb-0.5">Headroom ({activeUnit})</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Open"
                        value={tier.shelfDimensions.verticalClearance || ''}
                        onChange={(e) => {
                          const updated = [...currentProfile.tiers];
                          const val = parseFloat(e.target.value);
                          updated[idx] = {
                            ...tier,
                            shelfDimensions: {
                              ...tier.shelfDimensions,
                              verticalClearance: isNaN(val) ? undefined : val,
                            },
                          };
                          onProfileChange({ ...currentProfile, tiers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#68766C] block mb-0.5" title="Leave blank if unconfirmed">
                        SWL Rating (kg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        placeholder="Unconfirmed"
                        value={tier.confirmedShelfLoadRatingKg || ''}
                        onChange={(e) => {
                          const updated = [...currentProfile.tiers];
                          const val = parseFloat(e.target.value);
                          updated[idx] = {
                            ...tier,
                            confirmedShelfLoadRatingKg: isNaN(val) ? undefined : val,
                          };
                          onProfileChange({ ...currentProfile, tiers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-white min-h-[38px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end md:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveTier(tier.tierIndex, 'up')}
                      className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                        idx === 0
                          ? 'text-[#E3DFD2] cursor-not-allowed opacity-40'
                          : 'text-[#174C35] hover:bg-[#EAF1E4] cursor-pointer'
                      }`}
                      title="Move tier up"
                      aria-label={`Move tier ${idx + 1} up`}
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentProfile.tiers.length - 1}
                      onClick={() => handleMoveTier(tier.tierIndex, 'down')}
                      className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                        idx === currentProfile.tiers.length - 1
                          ? 'text-[#E3DFD2] cursor-not-allowed opacity-40'
                          : 'text-[#174C35] hover:bg-[#EAF1E4] cursor-pointer'
                      }`}
                      title="Move tier down"
                      aria-label={`Move tier ${idx + 1} down`}
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.tierIndex)}
                      className="p-2 text-[#963A23] hover:bg-[#FBE9E2] rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Remove this tier"
                      aria-label={`Remove tier ${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
