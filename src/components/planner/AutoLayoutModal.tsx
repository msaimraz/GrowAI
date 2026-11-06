'use client';

import React, { useState, useId, useMemo, useEffect } from 'react';
import {
  SpaceConfigProfile,
  SavedPlacementSlot,
  CircularContainerInput,
} from '@/types/space-optimizer';
import {
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  estimateContainerWetWeight,
  evaluateLightSuitability,
} from '@/lib/space-optimizer';
import { PLANTS_DATA } from '@/data/plants';
import { Plant } from '@/types/plant';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Sparkles,
  Layers,
  Sun,
  Ruler,
  Weight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Salad,
  Coffee,
  Sprout,
  Home,
  Flower2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export type GardenGoalId =
  | 'culinary-herbs'
  | 'small-salad'
  | 'microgreens'
  | 'indoor-low-maintenance'
  | 'mixed-balcony';

export interface AutoLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SpaceConfigProfile;
  onApplyLayout: (newPlacements: SavedPlacementSlot[]) => void;
}

interface GoalDefinition {
  id: GardenGoalId;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  candidateSlugs: string[];
}

const GARDEN_GOALS: GoalDefinition[] = [
  {
    id: 'culinary-herbs',
    title: 'Culinary Herb Garden',
    subtitle: 'Aromatic kitchen herbs for seasoning and teas',
    description: 'Fresh basil, cilantro, and mint with continuous harvesting potential.',
    icon: <Coffee className="w-5 h-5 text-[#144229]" />,
    candidateSlugs: ['genovese-basil', 'coriander', 'spearmint', 'holy-basil-tulsi'],
  },
  {
    id: 'small-salad',
    title: 'Small Salad Garden',
    subtitle: 'Continuous-harvest crisp greens & root radishes',
    description: 'Compact butterhead lettuce, spinach, and breakfast radishes.',
    icon: <Salad className="w-5 h-5 text-[#144229]" />,
    candidateSlugs: ['butterhead-lettuce', 'spinach', 'french-radish'],
  },
  {
    id: 'microgreens',
    title: 'Microgreens & Sprouting',
    subtitle: 'Rapid nutrient-dense seedling trays',
    description: 'Fast-growing broccoli microgreens and tender sprouts for compact racks.',
    icon: <Sprout className="w-5 h-5 text-[#144229]" />,
    candidateSlugs: ['broccoli-microgreens', 'alfalfa-sprouts', 'broccoli-sprouts', 'mung-bean-sprouts'],
  },
  {
    id: 'indoor-low-maintenance',
    title: 'Indoor Low-Maintenance',
    subtitle: 'Resilient foliage tolerant of indoor natural light',
    description: 'Snake plant, pothos, and aloe vera adapted to moderate ambient light.',
    icon: <Home className="w-5 h-5 text-[#144229]" />,
    candidateSlugs: ['snake-plant', 'golden-pothos', 'aloe-vera'],
  },
  {
    id: 'mixed-balcony',
    title: 'Mixed Balcony Garden',
    subtitle: 'Vertical ecosystem with fruiting canopy & ground herbs',
    description: 'Determinate bush tomato on top, aromatic herbs in the middle, and greens below.',
    icon: <Flower2 className="w-5 h-5 text-[#144229]" />,
    candidateSlugs: [
      'tomato-bush',
      'cherry-tomato',
      'genovese-basil',
      'coriander',
      'spearmint',
      'spinach',
      'french-marigold',
    ],
  },
];

interface GeneratedPlacement {
  slot: SavedPlacementSlot;
  plant: Plant;
  tierIndex: number;
  tierName: string;
  rationale: string;
  estimatedWetWeightKg: number;
}

interface RejectedCandidate {
  plantSlug: string;
  commonName: string;
  reasons: string[];
}

export function AutoLayoutModal({
  isOpen,
  onClose,
  profile,
  onApplyLayout,
}: AutoLayoutModalProps) {
  const modalTitleId = useId();
  const [selectedGoal, setSelectedGoal] = useState<GardenGoalId>('culinary-herbs');
  const [densityPreference, setDensityPreference] = useState<'standard' | 'compact'>('standard');
  const [isGenerated, setIsGenerated] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset generated state when goal changes
  const handleSelectGoal = (goalId: GardenGoalId) => {
    setSelectedGoal(goalId);
    setIsGenerated(false);
  };

  // Heuristic Layout Generator
  const layoutResult = useMemo(() => {
    if (!isGenerated) return null;

    const goal = GARDEN_GOALS.find((g) => g.id === selectedGoal);
    if (!goal) return null;

    const candidatePlants: Plant[] = [];
    goal.candidateSlugs.forEach((slug) => {
      const p = PLANTS_DATA.find((item) => item.slug === slug);
      if (p) candidatePlants.push(p);
    });

    const placements: GeneratedPlacement[] = [];
    const rejected: RejectedCandidate[] = [];

    // Track state per tier during generation
    const tierStates = profile.tiers.map((tier) => {
      const shelf = calculateUsableShelfDimensions(tier.shelfDimensions);
      return {
        tier,
        shelf,
        occupiedWidthCm: 0,
        totalWetLoadKg: 0,
        placedCount: 0,
      };
    });

    // Helper: find best tier for a species
    candidatePlants.forEach((plant) => {
      const reasons: string[] = [];
      let placed = false;

      // Determine container dimensions based on botanical potting guidelines
      const spacing = plant.potting?.spacingCm ?? 20;
      const minDepth = plant.potting?.minDepthCm ?? 15;
      const diameter = densityPreference === 'compact' ? Math.max(spacing * 0.85, 14) : Math.max(spacing, 16);
      const height = Math.max(minDepth, 12);

      const containerInput: CircularContainerInput = {
        shape: 'circular',
        topDiameter: Number(diameter.toFixed(1)),
        height: Number(height.toFixed(1)),
        unit: 'cm',
      };
      const metrics = calculateContainerMetrics(containerInput);
      const wetWeightResult = estimateContainerWetWeight(metrics);
      const potWeightKg = wetWeightResult.totalEstimatedWeightKg ?? 2.5;

      // Sort tiers by position preference
      const preferredPosition = plant.verticalSuitability?.recommendedTier;
      const sortedTierStates = [...tierStates].sort((a, b) => {
        if (preferredPosition && a.tier.position === preferredPosition) return -1;
        if (preferredPosition && b.tier.position === preferredPosition) return 1;
        return a.tier.tierIndex - b.tier.tierIndex;
      });

      for (const tState of sortedTierStates) {
        const { tier, shelf } = tState;

        if (!shelf.isValid) {
          reasons.push(`${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Shelf dimensions invalid.`);
          continue;
        }

        // 1. Check shelf depth fit
        if (metrics.footprintDepthCm > shelf.usableDepthCm) {
          reasons.push(
            `${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Pot depth (${metrics.footprintDepthCm}cm) exceeds usable shelf depth (${shelf.usableDepthCm}cm).`
          );
          continue;
        }

        // 2. Check linear width capacity
        if (tState.occupiedWidthCm + metrics.footprintWidthCm > shelf.usableWidthCm) {
          reasons.push(
            `${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Insufficient remaining linear width (needs ${metrics.footprintWidthCm}cm).`
          );
          continue;
        }

        // 3. Check structural load if confirmed SWL is provided
        if (tier.confirmedShelfLoadRatingKg !== undefined) {
          if (tState.totalWetLoadKg + potWeightKg > tier.confirmedShelfLoadRatingKg) {
            reasons.push(
              `${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Adding pot would exceed confirmed Safe Working Load (${tier.confirmedShelfLoadRatingKg}kg).`
            );
            continue;
          }
        }

        // 4. Check photobiology & light suitability
        const lightEnv =
          profile.environment === 'indoor'
            ? profile.spaceType === 'indoor_grow_tent'
              ? 'indoor_grow_lights'
              : 'indoor_natural'
            : 'outdoor';

        const lightSuitability = evaluateLightSuitability(
          plant.sunlight,
          lightEnv,
          profile.sunlightHours,
          tier.lightAttenuationMultiplier ?? 1.0,
          true
        );

        if (lightSuitability.status === 'insufficient_light') {
          reasons.push(
            `${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Light insufficient for ${plant.sunlight} species in ${profile.environment} environment.`
          );
          continue;
        }

        if (lightSuitability.status === 'excessive_light_risk') {
          reasons.push(
            `${tier.tierName || `Tier ${tier.tierIndex + 1}`}: Direct sun creates scorch risk for ${plant.sunlight} species.`
          );
          continue;
        }

        // Passed all checks for this tier: place the plant
        const slotId = `auto-${plant.slug}-${tier.tierIndex}-${tState.placedCount + 1}`;
        const newSlot: SavedPlacementSlot = {
          id: slotId,
          tierIndex: tier.tierIndex,
          slotIndex: tState.placedCount,
          plantSlug: plant.slug,
          customNickname: plant.commonName,
          container: containerInput,
        };

        // Spearmint isolation note if applicable
        const spearmintNote =
          plant.slug === 'spearmint'
            ? ' (Assigned to isolated individual container to control stolon runners).'
            : '';

        placements.push({
          slot: newSlot,
          plant,
          tierIndex: tier.tierIndex,
          tierName: tier.tierName || `Tier ${tier.tierIndex + 1}`,
          rationale: `Selected for ${tier.tierName || `Tier ${tier.tierIndex + 1}`} matching '${plant.sunlight}' light profile with ${metrics.footprintWidthCm}cm width clearance${spearmintNote}`,
          estimatedWetWeightKg: potWeightKg,
        });

        // Update tier state
        tState.occupiedWidthCm += metrics.footprintWidthCm;
        tState.totalWetLoadKg += potWeightKg;
        tState.placedCount += 1;
        placed = true;
        break;
      }

      if (!placed) {
        rejected.push({
          plantSlug: plant.slug,
          commonName: plant.commonName,
          reasons: reasons.length > 0 ? reasons : ['No available shelf matched physical and photobiological requirements.'],
        });
      }
    });

    return { placements, rejected };
  }, [isGenerated, selectedGoal, densityPreference, profile]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!layoutResult || layoutResult.placements.length === 0) return;
    const newSlots = layoutResult.placements.map((p) => p.slot);
    onApplyLayout(newSlots);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-2xl bg-[#fbf9f4] border border-[#e2dcce] rounded-2xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e2dcce] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e7efe7] text-[#144229]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 id={modalTitleId} className="font-serif text-lg sm:text-xl font-bold text-[#144229]">
                Generate Suggested Arrangement
              </h2>
              <p className="text-xs text-[#526a57]">
                Botanical heuristic placement based on shelf dimensions and lighting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#526a57] hover:text-[#144229] hover:bg-[#f2eee3] transition-colors"
            aria-label="Close auto layout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Step 1: Select Garden Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#526a57] block mb-2">
              1. Select Growing Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GARDEN_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelectGoal(goal.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#144229] bg-white shadow-sm ring-1 ring-[#144229]'
                        : 'border-[#e2dcce] bg-[#faf8f2] hover:bg-white hover:border-[#cfdfcf]'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#e7efe7] shrink-0 mt-0.5">{goal.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-semibold text-sm text-[#144229]">
                          {goal.title}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#144229]" />}
                      </div>
                      <p className="text-[11px] text-[#526a57] mt-0.5 leading-snug line-clamp-2">
                        {goal.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Density Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#e2dcce] rounded-xl text-xs">
            <div>
              <span className="font-semibold text-[#144229] block">Spacing Density</span>
              <span className="text-[11px] text-[#526a57]">
                Controls individual pot spacing and root zone allocation
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-[#cfdfcf] p-0.5 bg-[#fbf9f4]">
              <button
                type="button"
                onClick={() => {
                  setDensityPreference('standard');
                  setIsGenerated(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  densityPreference === 'standard'
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'text-[#44403c] hover:text-[#144229]'
                }`}
              >
                Standard (Optimal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDensityPreference('compact');
                  setIsGenerated(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  densityPreference === 'compact'
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'text-[#44403c] hover:text-[#144229]'
                }`}
              >
                Compact (Higher Count)
              </button>
            </div>
          </div>

          {/* Generate Button */}
          {!isGenerated && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsGenerated(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0f2e1d] text-white font-medium text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Suggested Arrangement
              </button>
            </div>
          )}

          {/* Step 3: Layout Results */}
          {isGenerated && layoutResult && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#e2dcce] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526a57]">
                  2. Suggested Arrangement Breakdown
                </span>
                <button
                  type="button"
                  onClick={() => setIsGenerated(false)}
                  className="text-xs text-[#526a57] hover:text-[#144229] flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>

              {/* Overview Metric Banner */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-[#cfdfcf] rounded-xl text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#526a57] block">Placed</span>
                  <span className="font-serif text-lg font-bold text-[#144229]">
                    {layoutResult.placements.length}
                  </span>
                  <span className="text-[10px] text-[#526a57] block">containers</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#526a57] block">
                    Est. Wet Load
                  </span>
                  <span className="font-serif text-lg font-bold text-[#144229]">
                    ~
                    {layoutResult.placements
                      .reduce((acc, p) => acc + p.estimatedWetWeightKg, 0)
                      .toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[#526a57] block">kg total</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#526a57] block">Tiers Used</span>
                  <span className="font-serif text-lg font-bold text-[#144229]">
                    {new Set(layoutResult.placements.map((p) => p.tierIndex)).size} / {profile.tiers.length}
                  </span>
                  <span className="text-[10px] text-[#526a57] block">shelves</span>
                </div>
              </div>

              {/* Placed Species Cards */}
              {layoutResult.placements.length > 0 ? (
                <div className="space-y-2.5">
                  {layoutResult.placements.map((item, idx) => (
                    <div
                      key={item.slot.id}
                      className="p-3.5 bg-white border border-[#e2dcce] rounded-xl shadow-xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#144229] text-white flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-serif font-bold text-sm text-[#144229]">
                            {item.plant.commonName}
                          </span>
                          <Badge variant="outline" size="sm">
                            {item.tierName}
                          </Badge>
                        </div>
                        <Badge variant="sage" size="sm">
                          ~{item.estimatedWetWeightKg.toFixed(1)} kg wet
                        </Badge>
                      </div>

                      <p className="text-[11px] text-[#44403c] bg-[#faf8f2] p-2 rounded-lg border border-[#ede8dd] leading-relaxed">
                        {item.rationale}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#526a57] pt-0.5">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-[#526a57]" />
                          Ø {item.slot.container.shape === 'circular' ? (item.slot.container as CircularContainerInput).topDiameter : 20}cm pot
                        </span>
                        <span className="flex items-center gap-1">
                          <Sun className="w-3 h-3 text-[#526a57]" />
                          {item.plant.sunlight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white border border-[#e2dcce] rounded-xl text-center text-xs text-[#78716c]">
                  No species could fit into the current space profile. Check shelf dimensions or load limits.
                </div>
              )}

              {/* Rejected Species Report */}
              {layoutResult.rejected.length > 0 && (
                <div className="p-3.5 bg-[#fffcf5] border border-[#fde68a] rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#92400e]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Species Excluded from Arrangement ({layoutResult.rejected.length})
                  </div>
                  <ul className="space-y-1 text-xs text-[#92400e]">
                    {layoutResult.rejected.map((rej) => (
                      <li key={rej.plantSlug} className="text-[11px] leading-snug">
                        <strong>{rej.commonName}:</strong> {rej.reasons.join(' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transparency & Mathematical Reality Disclosure */}
              <div className="p-3 bg-[#faf8f2] border border-[#e2dcce] rounded-xl text-[11px] text-[#78716c] leading-relaxed space-y-1">
                <p className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#526a57] shrink-0 mt-0.5" />
                  <span>
                    <strong>Suggested Arrangement:</strong> This layout is generated by botanical rules and
                    linear geometric packing. It is not certified as mathematically optimal, and yields are
                    never guaranteed.
                  </span>
                </p>
                <p className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#526a57] shrink-0 mt-0.5" />
                  <span>
                    <strong>Structural Load Check:</strong> Ensure your rack manufacturer Safe Working Load
                    (SWL) is confirmed before applying soil and water.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 px-5 sm:px-6 py-4 border-t border-[#e2dcce] bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-[#44403c] hover:bg-[#f2eee3] transition-colors"
          >
            Cancel / Keep Existing
          </button>

          {isGenerated && layoutResult && layoutResult.placements.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0f2e1d] text-white font-medium text-xs sm:text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Suggested Arrangement ({layoutResult.placements.length} containers)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
