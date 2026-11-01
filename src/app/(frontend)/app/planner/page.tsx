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
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
  Ruler,
} from 'lucide-react';

const TIER_CONFIGS: TierConfig[] = [
  {
    id: 'top',
    name: 'Top Tier (High Sun & Warmth)',
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
    recommendedPlantTypes: 'Leafy Greens (Lettuce, Spinach), Culinary Herbs (Mint, Coriander), Microgreens',
    maxSlots: 3,
  },
  {
    id: 'bottom',
    name: 'Bottom Tier (Shaded & Runoff Capture)',
    lightProfile: 'Indirect Light / Cooler Microclimate',
    lightLevel: 'Shaded / Low Light (2-4 hrs)',
    wateringCharacteristics: 'Highest moisture retention; collects shelf runoff',
    potWeightGuidance: 'Heaviest root pots & stable ceramic planters (< 20 kg)',
    recommendedPlantTypes: 'Root crops (Radish), Structural architectural foliage (Snake Plant, Lemongrass)',
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
  const [searchQuery, setSearchQuery] = useState('');

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
    setSearchQuery('');
  };

  const handleResetRack = () => {
    setSlots(DEFAULT_SLOTS);
    setSelectedTierForAdd(null);
  };

  const filteredPlantsForAdd = PLANTS_DATA.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.commonName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="Vertical Garden Rack Planner"
        subtitle="Arrange companion plants across light and drainage gradients to maximize small balcony spaces."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Conceptual Engineering Disclaimer */}
        <div className="bg-[#f7f5ed] border border-[#ded5c5] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-[#2e4435] shadow-2xs">
          <Info size={20} className="shrink-0 mt-0.5 text-[#144229]" />
          <div>
            <p className="leading-relaxed">
              <strong className="text-[#0c2417]">Botanical Planning System:</strong> This layout visualizes sunlight availability, root depth, and cascading runoff. Recommendations are grounded in peer-reviewed photobiology. Always ensure your physical stand is anchored securely and within manufacturer load tolerances.
            </p>
          </div>
        </div>

        {/* Rack Header & Overview Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#ded5c5] shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                <Layers size={22} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#0c2417]">
                  Modular 3-Tier Balcony Stand (90 cm width)
                </h2>
                <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
                  {slots.length} of 9 positions occupied • Gravity-fed runoff design
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetRack}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs sm:text-sm font-semibold text-[#2e4435] hover:bg-[#f4f8f4] transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw size={16} />
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
                className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5"
              >
                {/* Tier Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-xl text-[#0c2417]">
                        {tier.name}
                      </span>
                      <Badge
                        variant={tier.id === 'top' ? 'amber' : tier.id === 'middle' ? 'sage' : 'neutral'}
                        size="md"
                      >
                        {tier.lightLevel}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-[#526a57]">
                      {tier.lightProfile} • {tier.wateringCharacteristics}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-xs font-mono font-semibold text-[#144229] bg-[#eef5ee] px-3.5 py-1.5 rounded-xl border border-[#cfe0cf]">
                      {placedPlants.length} / {tier.maxSlots} Slots Placed
                    </span>
                    {!isFull && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTierForAdd(tier.id);
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
                      >
                        <Plus size={16} />
                        <span>Assign Plant</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {placedPlants.map((slot) => {
                    const plantData = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);
                    const isOptimalMatch =
                      plantData?.verticalSuitability.recommendedTier === tier.id ||
                      plantData?.verticalSuitability.recommendedTier === 'any';

                    return (
                      <div
                        key={slot.id}
                        className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#144229] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full capitalize">
                              {slot.category.replace('-', ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(slot.id)}
                              className="text-[#9a3412] hover:bg-[#fbeee9] p-2 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Remove plant from tier"
                              aria-label="Remove plant from tier"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-lg text-[#0c2417]">
                              {slot.plantName}
                            </h4>
                            <p className="text-xs text-[#526a57] italic">
                              {plantData?.scientificName}
                            </p>
                          </div>

                          {/* Placement Compatibility Status */}
                          <div className="pt-1">
                            {isOptimalMatch ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eef5ee] border border-[#cfe0cf] text-[11px] font-semibold text-[#1e613b]">
                                <CheckCircle2 size={13} className="text-[#144229]" />
                                <span>Recommended Tier Match</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fff8e6] border border-[#fde68a] text-[11px] font-semibold text-[#92400e]">
                                <AlertTriangle size={13} className="text-[#b45309]" />
                                <span>User Placed (Prefers {plantData?.verticalSuitability.recommendedTier} tier)</span>
                              </div>
                            )}
                          </div>

                          {/* Pot depth and spacing metrics */}
                          <div className="space-y-1.5 text-xs text-[#2e4435] pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[#647f6c]">Container Depth:</span>
                              <strong className="text-[#0c2417]">{slot.potDepthCm} cm depth</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#647f6c]">In-Rack Spacing:</span>
                              <strong className="text-[#0c2417]">{slot.spacingCm} cm spacing</strong>
                            </div>
                          </div>
                        </div>

                        {plantData && (
                          <Link
                            href={`/app/plants/${plantData.slug}`}
                            className="text-xs font-semibold text-[#144229] hover:text-[#0c2417] hover:underline flex items-center justify-between pt-3 border-t border-[#ede7da] min-h-[44px]"
                          >
                            <span>View Botanical Profile</span>
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
                      onClick={() => {
                        setSelectedTierForAdd(tier.id);
                        setSearchQuery('');
                      }}
                      className="border-2 border-dashed border-[#ded5c5] hover:border-[#144229] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#fdfcf9] hover:bg-[#eef5ee] min-h-[180px] group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#f4f2eb] group-hover:bg-white text-[#8ba391] group-hover:text-[#144229] flex items-center justify-center mb-2 transition-colors">
                        <Plus size={22} />
                      </div>
                      <span className="text-sm font-serif font-bold text-[#4b6351] group-hover:text-[#0c2417]">
                        Empty Slot
                      </span>
                      <span className="text-xs text-[#8ba391] mt-0.5">
                        Click to assign a companion plant
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tier Micro-Guidance */}
                <div className="text-xs sm:text-sm text-[#526a57] bg-[#fbf9f4] p-4 rounded-2xl border border-[#ede7da] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong className="text-[#0c2417]">Recommended Plant Types:</strong> {tier.recommendedPlantTypes}
                  </div>
                  <div className="text-xs font-mono text-[#786b59] bg-white px-3 py-1 rounded-lg border border-[#e2dbce]">
                    {tier.potWeightGuidance}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plant Selection Modal with Search */}
        {selectedTierForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-[#ded5c5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ebe0]">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                    Assign Plant to {selectedTierForAdd.toUpperCase()} Tier
                  </h3>
                  <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
                    Browse our curated 19 botanical species with placement suitability
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTierForAdd(null)}
                  className="p-2.5 rounded-xl text-[#647f6c] hover:text-[#0c2417] hover:bg-[#f4f8f4] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8ba391]" />
                <input
                  type="text"
                  placeholder="Search species (e.g. Basil, Tomato, Mint)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              {/* Plant selection list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {filteredPlantsForAdd.map((plant) => {
                  const isTierRecommended =
                    plant.verticalSuitability.recommendedTier === selectedTierForAdd ||
                    plant.verticalSuitability.recommendedTier === 'any';

                  return (
                    <div
                      key={plant.id}
                      onClick={() => handleAddPlantToTier(plant, selectedTierForAdd)}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all min-h-[64px] ${
                        isTierRecommended
                          ? 'bg-white border-[#ded5c5] hover:border-[#144229] hover:bg-[#eef5ee]'
                          : 'bg-[#fbf9f4] border-[#ded5c5] opacity-80 hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#0c2417]">
                            {plant.commonName}
                          </h4>
                          {isTierRecommended ? (
                            <span className="text-[11px] font-semibold text-[#1e613b] bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cfe0cf]">
                              ✓ Ideal Tier Match
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#9a3412] bg-[#fbeee9] px-2.5 py-0.5 rounded-full">
                              Prefers {plant.verticalSuitability.recommendedTier} tier
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#526a57] truncate mt-1">
                          <em>{plant.scientificName}</em> • {plant.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-white bg-[#144229] hover:bg-[#0c2417] px-4 py-2.5 rounded-xl shadow-xs min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        Place Here
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#f0ebe0] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTierForAdd(null)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#526a57] hover:bg-[#f4f8f4] rounded-xl border border-[#ded5c5] min-h-[44px] cursor-pointer"
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
