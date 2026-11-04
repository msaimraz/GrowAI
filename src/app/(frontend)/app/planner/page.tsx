'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import {
  SpaceConfigProfile,
  SavedPlacementSlot,
  CURRENT_SPACE_SCHEMA_VERSION,
} from '@/types/space-optimizer';
import {
  getSavedSpaceConfigs,
  saveSpaceConfig,
  getActiveSpaceConfigId,
  setActiveSpaceConfigId,
  deleteSpaceConfig,
} from '@/lib/space-storage';
import { SpaceConfigForm } from '@/components/planner/SpaceConfigForm';
import { SpaceOverviewCards } from '@/components/planner/SpaceOverviewCards';
import { TierVisualizer } from '@/components/planner/TierVisualizer';
import { OptimizationAdvisory } from '@/components/planner/OptimizationAdvisory';
import { AutoLayoutModal } from '@/components/planner/AutoLayoutModal';
import { SyncToGardenModal } from '@/components/planner/SyncToGardenModal';
import {
  Layers,
  Sparkles,
  Sprout,
  Settings2,
  RotateCcw,
  Plus,
  CheckCircle2,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';

const DEFAULT_BALCONY_PROFILE: SpaceConfigProfile = {
  schemaVersion: CURRENT_SPACE_SCHEMA_VERSION,
  id: 'space-default-balcony',
  name: 'Modular 3-Tier Balcony Stand',
  spaceType: 'balcony_rack',
  environment: 'outdoor_sheltered',
  orientation: 'south',
  dimensions: {
    width: 90,
    depth: 35,
    height: 160,
    unit: 'cm',
  },
  sunlightHours: 6.0,
  tiers: [
    {
      tierIndex: 0,
      tierName: 'Top Canopy',
      position: 'top',
      shelfDimensions: {
        width: 90,
        depth: 35,
        verticalClearance: 60,
        edgeMargin: 2,
        unit: 'cm',
      },
      confirmedShelfLoadRatingKg: 25,
      lightAttenuationMultiplier: 1.0,
    },
    {
      tierIndex: 1,
      tierName: 'Middle Shelf',
      position: 'middle',
      shelfDimensions: {
        width: 90,
        depth: 35,
        verticalClearance: 45,
        edgeMargin: 2,
        unit: 'cm',
      },
      confirmedShelfLoadRatingKg: 30,
      lightAttenuationMultiplier: 0.75,
    },
    {
      tierIndex: 2,
      tierName: 'Bottom Shelf',
      position: 'bottom',
      shelfDimensions: {
        width: 90,
        depth: 35,
        verticalClearance: 45,
        edgeMargin: 2,
        unit: 'cm',
      },
      confirmedShelfLoadRatingKg: 40,
      lightAttenuationMultiplier: 0.5,
    },
  ],
  placements: [
    {
      id: 'slot-1',
      tierIndex: 0,
      slotIndex: 0,
      plantSlug: 'cherry-tomato',
      customNickname: 'Cherry Tomato',
      container: {
        shape: 'circular',
        topDiameter: 25,
        height: 25,
        unit: 'cm',
      },
    },
    {
      id: 'slot-2',
      tierIndex: 0,
      slotIndex: 1,
      plantSlug: 'genovese-basil',
      customNickname: 'Genovese Basil',
      container: {
        shape: 'circular',
        topDiameter: 20,
        height: 20,
        unit: 'cm',
      },
    },
    {
      id: 'slot-3',
      tierIndex: 1,
      slotIndex: 0,
      plantSlug: 'butterhead-lettuce',
      customNickname: 'Butterhead Lettuce',
      container: {
        shape: 'circular',
        topDiameter: 18,
        height: 16,
        unit: 'cm',
      },
    },
    {
      id: 'slot-4',
      tierIndex: 1,
      slotIndex: 1,
      plantSlug: 'spearmint',
      customNickname: 'Spearmint (Isolated Pot)',
      container: {
        shape: 'circular',
        topDiameter: 20,
        height: 18,
        unit: 'cm',
      },
    },
    {
      id: 'slot-5',
      tierIndex: 2,
      slotIndex: 0,
      plantSlug: 'french-radish',
      customNickname: 'French Breakfast Radish',
      container: {
        shape: 'circular',
        topDiameter: 18,
        height: 18,
        unit: 'cm',
      },
    },
    {
      id: 'slot-6',
      tierIndex: 2,
      slotIndex: 1,
      plantSlug: 'snake-plant',
      customNickname: 'Snake Plant',
      container: {
        shape: 'circular',
        topDiameter: 22,
        height: 22,
        unit: 'cm',
      },
    },
  ],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

export default function PlannerPage() {
  const [profiles, setProfiles] = useState<SpaceConfigProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<SpaceConfigProfile>(DEFAULT_BALCONY_PROFILE);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [isAutoLayoutOpen, setIsAutoLayoutOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Initialize and load saved space profiles on mount
  useEffect(() => {
    const saved = getSavedSpaceConfigs();
    if (saved.length === 0) {
      // Seed initial default balcony profile if storage is empty
      saveSpaceConfig(DEFAULT_BALCONY_PROFILE);
      setActiveSpaceConfigId(DEFAULT_BALCONY_PROFILE.id);
      setProfiles([DEFAULT_BALCONY_PROFILE]);
      setActiveProfile(DEFAULT_BALCONY_PROFILE);
    } else {
      setProfiles(saved);
      const activeId = getActiveSpaceConfigId();
      const current = saved.find((p) => p.id === activeId) || saved[0];
      setActiveProfile(current);
      setActiveSpaceConfigId(current.id);
    }
  }, []);

  // Update active profile and persist locally
  const handleProfileChange = useCallback((updated: SpaceConfigProfile) => {
    setActiveProfile(updated);
    const saveRes = saveSpaceConfig(updated);
    if (saveRes.space) {
      const all = getSavedSpaceConfigs();
      setProfiles(all);
      setSaveBanner('Changes saved locally');
      setTimeout(() => setSaveBanner(null), 2500);
    }
  }, []);

  // Switch between saved space profiles
  const handleSwitchProfile = (spaceId: string) => {
    const target = profiles.find((p) => p.id === spaceId);
    if (target) {
      setActiveProfile(target);
      setActiveSpaceConfigId(target.id);
    }
  };

  // Reset current profile to default layout
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Reset this space to the standard 3-tier layout? Current shelf placements will be replaced.'
      )
    ) {
      const resetProfile: SpaceConfigProfile = {
        ...DEFAULT_BALCONY_PROFILE,
        id: activeProfile.id,
        name: activeProfile.name,
        createdAt: activeProfile.createdAt,
        updatedAt: new Date().toISOString(),
      };
      handleProfileChange(resetProfile);
    }
  };

  // Apply suggested arrangement from AutoLayoutModal
  const handleApplySuggestedLayout = (newPlacements: SavedPlacementSlot[]) => {
    const updated: SpaceConfigProfile = {
      ...activeProfile,
      placements: newPlacements,
      updatedAt: new Date().toISOString(),
    };
    handleProfileChange(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      {/* GrowAI Application Header */}
      <AppHeader
        title="Small-Space & Vertical Garden Optimizer"
        subtitle="Horticultural layout intelligence, structural load verification, and photobiology simulations for home growers."
      />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Conceptual Engineering & Photobiology Disclaimer Banner */}
        <div className="bg-[#f7f5ed] border border-[#ded5c5] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-[#2e4435] shadow-2xs">
          <Info size={20} className="shrink-0 mt-0.5 text-[#144229]" />
          <div className="space-y-1">
            <p className="leading-relaxed">
              <strong className="text-[#0c2417]">Deterministic Botanical Engineering:</strong> Container
              dimensions, saturated wet soil weights, and linear shelf spacings are evaluated against verified
              botanical metrics. Ambient direct sunlight hours and tier light attenuation are illustrative
              simulations. Always confirm shelf Safe Working Load (SWL) ratings with your rack manufacturer.
            </p>
          </div>
        </div>

        {/* Top Control Bar: Profile Switcher, Presets, and Actions */}
        <section
          aria-label="Space Profile Controls"
          className="bg-white rounded-3xl border border-[#ded5c5] p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Active Space Profile Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-bold tracking-wider text-[#526a57]">
                  Active Growing Space:
                </span>
                {saveBanner && (
                  <span className="text-[11px] font-medium text-[#1b5837] bg-[#f5fbf7] px-2 py-0.5 rounded-full border border-[#cfdfcf] animate-in fade-in duration-150">
                    {saveBanner}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={activeProfile.id}
                  onChange={(e) => handleSwitchProfile(e.target.value)}
                  className="font-serif font-bold text-lg sm:text-xl text-[#0c2417] bg-transparent border-b border-dashed border-[#ded5c5] focus:outline-none focus:border-[#144229] cursor-pointer max-w-[280px] sm:max-w-md truncate"
                  aria-label="Select saved growing space"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tiers.length} Tiers)
                    </option>
                  ))}
                </select>
                <Badge variant="outline" size="sm" className="capitalize shrink-0">
                  {activeProfile.spaceType.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Suggested Layout Button */}
            <button
              type="button"
              onClick={() => setIsAutoLayoutOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eef5ee] hover:bg-[#dfeadf] text-[#144229] text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
              title="Generate a suggested arrangement for herbs, salads, or microgreens"
            >
              <Sparkles size={16} />
              <span>Suggested Layout</span>
            </button>

            {/* Sync to My Garden Button */}
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px]"
              title="Create active tracking records in My Garden from this layout"
            >
              <Sprout size={16} />
              <span>Add to My Garden</span>
            </button>

            {/* Configure Dimensions Toggle Button */}
            <button
              type="button"
              onClick={() => setIsConfigDrawerOpen((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px] ${
                isConfigDrawerOpen
                  ? 'border-[#144229] bg-[#144229] text-white'
                  : 'border-[#ded5c5] bg-white text-[#2e4435] hover:bg-[#f4f8f4]'
              }`}
              title="Configure physical space dimensions and shelf tiers"
              aria-expanded={isConfigDrawerOpen}
            >
              <Settings2 size={16} />
              <span>Configure Space</span>
              {isConfigDrawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Reset Layout Button */}
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-2.5 rounded-xl border border-[#ded5c5] text-[#526a57] hover:text-[#9a3412] hover:bg-[#fbeee9] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Reset layout to standard defaults"
              aria-label="Reset layout to standard defaults"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        {/* Collapsible Space & Tier Configuration Drawer */}
        {isConfigDrawerOpen && (
          <section aria-label="Physical Space & Tier Settings" className="animate-in fade-in duration-200">
            <SpaceConfigForm
              currentProfile={activeProfile}
              onProfileChange={handleProfileChange}
              savedProfiles={profiles}
              onProfilesListChange={setProfiles}
            />
          </section>
        )}

        {/* Capacity & Environmental Metrics Cards */}
        <section aria-label="Space Overview & Capacity Diagnostics">
          <SpaceOverviewCards profile={activeProfile} />
        </section>

        {/* Interactive Multi-Tier Visualizer */}
        <section aria-label="Interactive Multi-Tier Shelf Visualizer">
          <TierVisualizer profile={activeProfile} onProfileChange={handleProfileChange} />
        </section>

        {/* Real-Time Optimization Advisory Panel */}
        <section aria-label="Horticultural & Structural Advisory Panel">
          <OptimizationAdvisory
            profile={activeProfile}
            onSelectTier={(tierIndex) => {
              // Smoothly scroll to visualizer section
              const el = document.querySelector('section[aria-label="Interactive Multi-Tier Shelf Visualizer"]');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* Educational Botanical Reference Link Footer */}
        <footer className="pt-4 pb-8 text-center text-xs text-[#526a57] space-y-1">
          <p>
            GrowAI Small-Space Optimizer • Powered by peer-reviewed botanical photobiology and physical soil physics.
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#144229]">
            <Link href="/app/my-garden" className="hover:underline">
              My Garden Dashboard
            </Link>
            <span>•</span>
            <Link href="/app/plants" className="hover:underline">
              Botanical Species Catalog
            </Link>
          </div>
        </footer>
      </main>

      {/* Suggested Layout Modal */}
      <AutoLayoutModal
        isOpen={isAutoLayoutOpen}
        onClose={() => setIsAutoLayoutOpen(false)}
        profile={activeProfile}
        onApplyLayout={handleApplySuggestedLayout}
      />

      {/* Sync Layout to My Garden Modal */}
      <SyncToGardenModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={activeProfile}
        onSyncComplete={(count) => {
          setSaveBanner(`${count} plants synchronized to My Garden!`);
        }}
      />
    </div>
  );
}
