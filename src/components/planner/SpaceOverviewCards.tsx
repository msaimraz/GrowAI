'use client';

import React from 'react';
import { SpaceConfigProfile } from '@/types/space-optimizer';
import {
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  evaluateLinearPacking,
  estimateContainerWetWeight,
  evaluateStructuralLoad,
} from '@/lib/space-optimizer';
import { PLANTS_DATA } from '@/data/plants';
import {
  Ruler,
  Weight,
  Sun,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Sprout,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface SpaceOverviewCardsProps {
  profile: SpaceConfigProfile;
  selectedTierIndex?: number;
}

export function SpaceOverviewCards({ profile, selectedTierIndex }: SpaceOverviewCardsProps) {
  // Aggregate spatial, weight, and light metrics across tiers
  let totalUsableWidthCm = 0;
  let totalOccupiedWidthCm = 0;
  let totalUsableAreaCm2 = 0;
  let totalContainers = 0;
  let totalEstimatedWetWeightKg = 0;
  let hasIncompleteWeightInputs = false;
  let hasOverload = false;
  let hasUnconfirmedRatings = false;

  const tierMetrics = profile.tiers.map((tier) => {
    const usable = calculateUsableShelfDimensions(tier.shelfDimensions, profile.dimensions);
    const placements = profile.placements.filter((p) => p.tierIndex === tier.tierIndex);

    // Calculate container metrics
    const items = placements.map((p) => {
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

    // Calculate wet weight per container on this shelf
    let tierWeightKg = 0;
    items.forEach((item) => {
      const wetEst = estimateContainerWetWeight(item.container);
      if (wetEst.status === 'incomplete') hasIncompleteWeightInputs = true;
      tierWeightKg += wetEst.totalEstimatedWeightKg || 0;
    });

    const structural = evaluateStructuralLoad(
      tierWeightKg,
      tier.confirmedShelfLoadRatingKg,
      tier.tierIndex
    );

    if (structural.status === 'exceeds_confirmed_limit') hasOverload = true;
    if (structural.status === 'unknown_load_capacity') hasUnconfirmedRatings = true;

    if (usable.isValid) {
      totalUsableWidthCm += usable.usableWidthCm;
      totalUsableAreaCm2 += usable.usableAreaCm2;
    }
    totalOccupiedWidthCm += packing.occupiedWidthCm;
    totalContainers += placements.length;
    totalEstimatedWetWeightKg += tierWeightKg;

    return {
      tier,
      usable,
      packing,
      tierWeightKg,
      structural,
      containerCount: placements.length,
    };
  });

  const remainingLinearSpaceCm = Math.max(0, totalUsableWidthCm - totalOccupiedWidthCm);
  const linearCapacityPercent =
    totalUsableWidthCm > 0
      ? Math.min(100, Math.round((totalOccupiedWidthCm / totalUsableWidthCm) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Usable Spatial Capacity */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68766C]">
            Linear Capacity
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
            <Ruler size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-[#203027]">
              {totalOccupiedWidthCm} / {totalUsableWidthCm}
            </span>
            <span className="text-xs text-[#68766C]">cm occupied</span>
          </div>

          <div className="w-full bg-[#E3DFD2] h-2 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all ${
                totalOccupiedWidthCm > totalUsableWidthCm ? 'bg-[#963A23]' : 'bg-[#174C35]'
              }`}
              style={{ width: `${Math.min(100, linearCapacityPercent)}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-between text-xs text-[#68766C]">
          <span>{totalContainers} Containers placed</span>
          <strong className="text-[#203027]">{remainingLinearSpaceCm} cm free</strong>
        </div>
      </div>

      {/* 2. Structural Load & Saturated Soil Weight */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68766C]">
            Est. Wet Weight
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
            <Weight size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-[#203027]">
              ~{totalEstimatedWetWeightKg.toFixed(1)}
            </span>
            <span className="text-xs text-[#68766C]">kg wet soil load</span>
          </div>
          <p className="text-[11px] text-[#68766C] mt-1">
            {hasIncompleteWeightInputs
              ? 'Based on 1.05 kg/L soil density. Tare/biomass unconfigured.'
              : 'Includes saturated soil density, tare, and estimated biomass.'}
          </p>
        </div>

        <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-between text-xs">
          {hasOverload ? (
            <div className="inline-flex items-center gap-1.5 text-[#963A23] font-semibold">
              <AlertTriangle size={14} />
              <span>Shelf SWL Exceeded</span>
            </div>
          ) : hasUnconfirmedRatings ? (
            <div className="inline-flex items-center gap-1.5 text-[#8A6400] font-medium" title="Verify rack manufacturer ratings before loading wet soil">
              <Info size={14} />
              <span>Manufacturer load rating not provided</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[#174C35] font-semibold">
              <ShieldCheck size={14} />
              <span>Within Confirmed Limits</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Photobiology Profile & Simulated Attenuation */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68766C]">
            Sunlight Profile
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FFF3D7] text-[#8A6400] flex items-center justify-center">
            <Sun size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-[#203027]">
              {profile.sunlightHours} hrs
            </span>
            <span className="text-xs text-[#68766C] capitalize">
              {profile.orientation || 'South'} exposure
            </span>
          </div>
          <p className="text-[11px] text-[#68766C] mt-1 capitalize">
            {profile.environment.replace('_', ' ')} microclimate
          </p>
        </div>

        <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-between text-xs text-[#68766C]">
          <span className="text-[11px] text-[#68766C] italic">Simulated Attenuation</span>
          <Badge variant="amber" size="sm">
            Top: 100% • Bot: 45%
          </Badge>
        </div>
      </div>

      {/* 4. Rack Tiers & Health Summary */}
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68766C]">
            Vertical Shelves
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
            <Layers size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-[#203027]">
              {profile.tiers.length}
            </span>
            <span className="text-xs text-[#68766C]">Active shelf tiers</span>
          </div>
          <p className="text-[11px] text-[#68766C] mt-1">
            Total usable surface: ~{(totalUsableAreaCm2 / 10000).toFixed(2)} m²
          </p>
        </div>

        <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-between text-xs text-[#68766C]">
          <span>Cascading Drainage</span>
          <strong className="text-[#203027]">
            {profile.tiers.some((t) => t.confirmedShelfLoadRatingKg) ? 'SWL Configured' : 'Unrated Stand'}
          </strong>
        </div>
      </div>
    </div>
  );
}
