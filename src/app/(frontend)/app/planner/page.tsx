'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { PLANTS_DATA } from '@/data/plants';
import { Plant } from '@/types/plant';
import { PlacedPlantSlot, RackTierLevel, TierConfig } from '@/types/planner';
import {
  Layers,
  Sun,
  Droplets,
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const TIER_CONFIGS: TierConfig[] = [
  {
    id: 'top',
    name: 'Top Tier (High Light & Warmth)',
    lightProfile: 'Direct Unobstructed Sunlight',
    lightLevel: 'Full Sun (6+ hrs)',
    wateringCharacteristics: 'Dries fastest due to sun exposure & wind',
    potWeightGuidance: 'Light to moderate pots (< 8 kg per slot)',
    recommendedPlantTypes: 'Fruiting crops (Tomatoes, Peppers), Sun Herbs (Basil, Marigolds, Aloe)',
    maxSlots: 3,
  },
  {
    id: 'middle',
    name: 'Middle Tier (Filtered Light & Stable Temp)',
    lightProfile: 'Filtered Sunlight / Partial Sun',
    lightLevel: 'Bright Indirect (4-6 hrs)',
    wateringCharacteristics: 'Even moderate drying; captures partial runoff',
    potWeightGuidance: 'Standard planter troughs (< 12 kg per slot)',
    recommendedPlantTypes: 'Leafy Greens (Lettuce, Spinach), Culinary Herbs (Mint, Coriander), Microgreen Trays',
    maxSlots: 3,
  },
  {
    id: 'bottom',
    name: 'Bottom Tier (Shaded & Runoff Capture)',
    lightProfile: 'Indirect Light / Cooler Microclimate',
    lightLevel: 'Shaded / Low Light (2-4 hrs)',
    wateringCharacteristics: 'Highest moisture retention; collects tray runoff',
    potWeightGuidance: 'Heaviest root pots & stable ceramic planters (< 20 kg)',
    recommendedPlantTypes: 'Root vegetables (Radish), Structural architectural foliage (Snake Plant, Lemongrass)',
    maxSlots: 3,
  },
];

// Initial default configuration
const DEFAULT_SLOTS: PlacedPlantSlot[] = [
  {
    id: 'slot-1',
    tierId: 'top',
    slotIndex: 0,
    plantSlug: 'cherry-tomato',
    plantName: 'Cherry Tomato',
    category: 'vegetables-fruits',
    spacingCm: 30,
    potDepthCm: 25,
  },
  {
    id: 'slot-2',
    tierId: 'top',
    slotIndex: 1,
    plantSlug: 'genovese-basil',
    plantName: 'Genovese Basil',
    category: 'herbs-greens',
    spacingCm: 20,
    potDepthCm: 20,
  },
  {
    id: 'slot-3',
    tierId: 'middle',
    slotIndex: 0,
    plantSlug: 'butterhead-lettuce',
    plantName: 'Butterhead Lettuce',
    category: 'herbs-greens',
    spacingCm: 15,
    potDepthCm: 15,
  },
  {
    id: 'slot-4',
    tierId: 'middle',
    slotIndex: 1,
    plantSlug: 'spearmint',
    plantName: 'Spearmint',
    category: 'herbs-greens',
    spacingCm: 25,
    potDepthCm: 20,
  },
  {
    id: 'slot-5',
    tierId: 'bottom',
    slotIndex: 0,
    plantSlug: 'french-radish',
    plantName: 'French Radish',
    category: 'vegetables-fruits',
    spacingCm: 6,
    potDepthCm: 18,
  },
  {
    id: 'slot-6',
    tierId: 'bottom',
    slotIndex: 1,
    plantSlug: 'snake-plant',
    plantName: 'Snake Plant',
    category: 'indoor-decorative',
    spacingCm: 20,
    potDepthCm: 20,
  },
];

export default function PlannerPage() {
  const [slots, setSlots] = useState<PlacedPlantSlot[]>(DEFAULT_SLOTS);
  const [selectedTierForAdd, setSelectedTierForAdd] = useState<RackTierLevel | null>(null);

  const handleRemoveSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleAddPlantToTier = (plant: Plant, tierId: RackTierLevel) => {
    const existingInTier = slots.filter((s) => s.tierId === tierId);
    const tierConfig = TIER_CONFIGS.find((t) => t.id === tierId);

    if (existingInTier.length >= (tierConfig?.maxSlots || 3)) {
      alert(`This tier is at its maximum recommended capacity (${tierConfig?.maxSlots} pots).`);
      return;
    }

    const newSlot: PlacedPlantSlot = {
      id: `slot-${Date.now()}`,
      tierId,
      slotIndex: existingInTier.length,
      plantSlug: plant.slug,
      plantName: plant.commonName,
      category: plant.category,
      spacingCm: plant.potting.spacingCm,
      potDepthCm: plant.potting.minDepthCm,
    };

    setSlots((prev) => [...prev, newSlot]);
    setSelectedTierForAdd(null);
  };

  const handleResetRack = () => {
    setSlots(DEFAULT_SLOTS);
    setSelectedTierForAdd(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="Vertical Garden Rack Planner"
        subtitle="Arrange plants across sun and moisture gradients to maximize small space production."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Conceptual Engineering Disclaimer */}
        <div className="bg-[#f7f5ed] border border-[#ded5c5] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-[#2e4435] shadow-2xs">
          <Info size={20} className="shrink-0 mt-0.5 text-[#144229]" />
          <div>
            <p className="leading-relaxed">
              <strong className="text-[#071c11]">Conceptual Planning Tool:</strong> This interactive visual layout offers botanical, light, and spacing recommendations. It does not replace structural engineering, electrical load ratings, or professional irrigation certifications. Always verify manufacturer weight capacity for your physical rack.
            </p>
          </div>
        </div>

        {/* Rack Header & Reset Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#ded5c5] shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#071c11] flex items-center gap-2.5">
              <Layers size={22} className="text-[#144229]" />
              <span>Modular 3-Tier Balcony Stand (90 cm width)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#2e4435] mt-1">
              {slots.length} of 9 total slots occupied • Balanced vertical weight distribution
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetRack}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#ded5c5] text-xs sm:text-sm font-semibold text-[#2e4435] hover:bg-[#f4f8f4] transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw size={15} />
              <span>Reset Default Layout</span>
            </button>
          </div>
        </div>

        {/* Interactive Vertical Rack Visualizer */}
        <div className="space-y-6">
          {TIER_CONFIGS.map((tier) => {
            const placedPlants = slots.filter((s) => s.tierId === tier.id);
            const isFull = placedPlants.length >= tier.maxSlots;

            return (
              <div
                key={tier.id}
                className="bg-white rounded-2xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Tier Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ebe0]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-lg text-[#071c11]">
                        {tier.name}
                      </span>
                      <Badge variant={tier.id === 'top' ? 'amber' : tier.id === 'middle' ? 'sage' : 'neutral'} size="sm">
                        {tier.lightLevel}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2e4435]">
                      {tier.lightProfile} • {tier.wateringCharacteristics}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-xs font-mono font-semibold text-[#144229] bg-[#eef5ee] px-3 py-1.5 rounded-lg border border-[#cfe0cf]">
                      {placedPlants.length} / {tier.maxSlots} Pots
                    </span>
                    {!isFull && (
                      <button
                        type="button"
                        onClick={() => setSelectedTierForAdd(tier.id)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-[#144229] hover:bg-[#071c11] text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
                      >
                        <Plus size={15} />
                        <span>Add Plant</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {placedPlants.map((slot) => {
                    const plantData = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);

                    return (
                      <div
                        key={slot.id}
                        className="p-5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] flex flex-col justify-between space-y-3.5 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#144229] bg-[#e7efe7] px-2.5 py-0.5 rounded-full capitalize">
                              {slot.category.replace('-', ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(slot.id)}
                              className="text-[#9a3412] hover:bg-[#fbeee9] p-1.5 rounded-lg transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="Remove plant from tier"
                              aria-label="Remove plant from tier"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <h4 className="font-serif font-bold text-base text-[#071c11]">
                            {slot.plantName}
                          </h4>

                          <div className="space-y-1 text-xs sm:text-sm text-[#2e4435]">
                            <p>Required Depth: <strong className="text-[#071c11]">{slot.potDepthCm} cm</strong></p>
                            <p>Spacing: <strong className="text-[#071c11]">{slot.spacingCm} cm</strong></p>
                          </div>
                        </div>

                        {plantData && (
                          <Link
                            href={`/app/plants/${plantData.slug}`}
                            className="text-xs sm:text-sm font-semibold text-[#144229] hover:underline flex items-center justify-between pt-2.5 border-t border-[#ede7da] min-h-[36px]"
                          >
                            <span>Botanical Specs</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty placeholder slots */}
                  {Array.from({ length: tier.maxSlots - placedPlants.length }).map((_, idx) => (
                    <div
                      key={`empty-${tier.id}-${idx}`}
                      onClick={() => setSelectedTierForAdd(tier.id)}
                      className="border-2 border-dashed border-[#ded5c5] hover:border-[#144229] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#fdfcf9] hover:bg-[#f4f8f4]"
                    >
                      <Plus size={20} className="text-[#8ba391] mb-1" />
                      <span className="text-xs font-semibold text-[#4b6351]">Empty Slot</span>
                      <span className="text-[10px] text-[#8ba391]">Click to assign plant</span>
                    </div>
                  ))}
                </div>

                {/* Tier Micro-Guidance */}
                <div className="pt-2 text-xs text-[#526a57] bg-[#fbf9f4] p-3 rounded-xl border border-[#ede7da] flex flex-wrap items-center justify-between gap-2">
                  <span><strong>Recommended Types:</strong> {tier.recommendedPlantTypes}</span>
                  <span className="text-[11px] text-[#786b59]">{tier.potWeightGuidance}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plant Selection Drawer / Modal when Add is clicked */}
        {selectedTierForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-[#ded5c5] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                    Assign Plant to {selectedTierForAdd.toUpperCase()} Tier
                  </h3>
                  <p className="text-xs text-[#526a57]">
                    Select a compatible species from our curated 16 plant catalog
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTierForAdd(null)}
                  className="p-1 rounded-md text-[#647f6c] hover:text-[#0c2417]"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {PLANTS_DATA.map((plant) => {
                  const isTierRecommended =
                    plant.verticalSuitability.recommendedTier === selectedTierForAdd ||
                    plant.verticalSuitability.recommendedTier === 'any';

                  return (
                    <div
                      key={plant.id}
                      onClick={() => handleAddPlantToTier(plant, selectedTierForAdd)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isTierRecommended
                          ? 'bg-white border-[#ded5c5] hover:border-[#144229] hover:bg-[#f4f8f4]'
                          : 'bg-[#fbf9f4] border-[#ded5c5] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                            {plant.commonName}
                          </h4>
                          {isTierRecommended ? (
                            <span className="text-[10px] font-semibold text-[#1e613b] bg-[#eef5ee] px-2 py-0.5 rounded-full">
                              Ideal Tier Match
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#9a3412] bg-[#fbeee9] px-2 py-0.5 rounded-full">
                              Rec: {plant.verticalSuitability.recommendedTier}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#526a57] truncate mt-0.5">
                          {plant.summary}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-[#144229] bg-[#e7efe7] px-3 py-1.5 rounded-lg border border-[#cfdfcf]">
                        Place Here
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#f0ebe0] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTierForAdd(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#526a57] hover:bg-[#f4f8f4] rounded-lg border border-[#e2dbce]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
