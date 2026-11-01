'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plant } from '@/types/plant';
import { Badge } from '@/components/ui/Badge';
import { AddToGardenModal } from '@/components/plants/AddToGardenModal';
import { BotanicalPlate } from '@/components/plants/BotanicalPlate';
import {
  EvidenceLevelBadge,
  EvidenceFrameworkGuide,
} from '@/components/plants/EvidencePresentation';
import { SproutSafetyCard } from '@/components/plants/SproutSafetyCard';
import { PlantSectionNav } from '@/components/plants/PlantSectionNav';
import { ActiveCompoundCard } from '@/components/plants/ActiveCompoundCard';
import { PlantReferencesList } from '@/components/plants/PlantReferencesList';
import {
  DidYouKnowCard,
  GardeningChallengeCard,
  PlantQuizCard,
  SectionExploredToggle,
} from '@/components/plants/PlantEducation';
import {
  Thermometer,
  Sun,
  Droplets,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Plus,
  ArrowLeft,
  Calendar,
  Sparkles,
  Info,
  Bug,
  Leaf,
  FlaskConical,
  Pill,
  BookOpen,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';

interface PlantDetailClientProps {
  plant: Plant;
}

export function PlantDetailClient({ plant }: PlantDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [exploredSections, setExploredSections] = useState<Record<string, boolean>>({});

  // Hydrate explored sections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`growai_explored_${plant.slug}`);
      if (saved) {
        setExploredSections(JSON.parse(saved));
      }
    } catch {}
  }, [plant.slug]);

  const handleSectionExplored = (sectionId: string, isExplored: boolean) => {
    setExploredSections((prev) => {
      const updated = { ...prev, [sectionId]: isExplored };
      try {
        localStorage.setItem(`growai_explored_${plant.slug}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const exploredCount = Object.values(exploredSections).filter(Boolean).length;

  // Helper for rendering care score dots (1 to 5)
  const renderCareScore = (score: number) => {
    return (
      <div className="flex items-center gap-1.5" title={`Care Difficulty Score: ${score}/5`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              dot <= score ? 'bg-[#144229]' : 'bg-[#ded5c5]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-32 sm:pb-20 bg-[#fbf9f4]">
      {/* 1. Top Breadcrumb & Primary Actions Bar */}
      <header className="bg-white border-b border-[#ded5c5] px-4 sm:px-8 py-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link
              href="/app/plants"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#144229] hover:text-[#071c11] min-h-[44px] transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Plant Library</span>
            </Link>
            <span className="text-[#a8a090]">/</span>
            <span className="font-serif italic text-[#2e4435] truncate max-w-[180px] sm:max-w-xs">
              {plant.commonName}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#071c11] text-white px-4 sm:px-6 py-2.5 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer min-h-[44px]"
          >
            <Plus size={18} />
            <span>Add to My Garden</span>
          </button>
        </div>
      </header>

      {/* 2. In-Page Sticky Section Navigation */}
      <PlantSectionNav exploredCount={exploredCount} />

      {/* 3. Main Botanical Editorial Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-10 sm:space-y-12">
        {/* =========================================================
            SECTION 1: HERO & BOTANICAL OVERVIEW (#overview)
        ========================================================= */}
        <section id="overview" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
              Botanical Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Plant Overview
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
              Meet your plant and discover what makes it special.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Taxonomic Nameplate & Editorial Summary */}
              <div className="lg:col-span-7 space-y-5">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="sage" size="md">
                    {plant.category.replace('-', ' ')}
                  </Badge>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f5ed] border border-[#ded5c5] text-xs font-semibold text-[#144229]">
                    <span className="capitalize">{plant.difficulty.level}</span>
                    {renderCareScore(plant.difficulty.score)}
                  </div>

                  {plant.badge && (
                    <span className="text-xs font-semibold text-[#9a3412] bg-[#fbeee9] px-3 py-1 rounded-full border border-[#f8d7cb]">
                      {plant.badge}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144229] px-2.5 py-1 rounded-full bg-[#eef5ee] border border-[#cfe0cf]">
                    <ShieldCheck size={15} />
                    Verified Botanical Record
                  </span>
                </div>

                {/* Common Name */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#071c11] tracking-tight leading-tight">
                  {plant.commonName}
                </h1>

                {/* Scientific Name */}
                <p className="text-xl sm:text-2xl font-serif italic text-[#1b5837]">
                  {plant.scientificName}
                </p>

                {/* Editorial Summary Paragraph (Minimum 16px body text) */}
                <p className="text-base sm:text-lg text-[#1c261e] leading-relaxed">
                  {plant.summary}
                </p>

                {/* Growing Environment Badges */}
                <div className="pt-1 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5a7662] block">
                    Verified Growing Environments:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plant.environments.map((env) => (
                      <span
                        key={env}
                        className="px-3.5 py-1.5 rounded-xl bg-[#f4f8f4] text-[#144229] text-sm font-semibold border border-[#cfdfcf] capitalize inline-flex items-center gap-1.5"
                      >
                        <Check size={15} className="text-[#144229]" />
                        {env.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Agronomic Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f0ebe0]">
                  <div className="space-y-1">
                    <span className="text-xs text-[#5a7662] font-medium block">Sunlight:</span>
                    <span className="text-sm sm:text-base font-bold text-[#071c11] capitalize block">
                      {plant.sunlight.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-[#5a7662] font-medium block">Daily Light:</span>
                    <span className="text-sm sm:text-base font-bold text-[#071c11] block">
                      {plant.sunlightHours}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-[#5a7662] font-medium block">Water Moisture:</span>
                    <span className="text-sm sm:text-base font-bold text-[#071c11] capitalize block">
                      {plant.watering.moistureLevel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-[#5a7662] font-medium block">Temperature:</span>
                    <span className="text-sm sm:text-base font-bold text-[#071c11] block">
                      {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Prominent Botanical Plate Artwork & Herbarium Card */}
              <div className="lg:col-span-5">
                <BotanicalPlate plant={plant} />
              </div>
            </div>
          </div>

          {/* A. Did You Know? Botanical Fact Card */}
          <DidYouKnowCard plant={plant} />

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="overview"
            sectionTitle="Plant Overview"
            isInitiallyExplored={!!exploredSections['overview']}
            onExploredToggle={handleSectionExplored}
          />
        </section>

        {/* =========================================================
            SECTION 2: GROWING CONDITIONS GUIDE (#growing-guide)
        ========================================================= */}
        <section id="growing-guide" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
              Horticultural Specifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Essential Growing Conditions & Environmental Requirements
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed max-w-3xl">
              Learn how much sunlight, water and space your plant needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Climate, Light & Temperature */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
                  <Sun size={22} className="text-[#c77712]" />
                  <h3 className="text-xl font-serif font-bold text-[#071c11]">
                    Climate, Temperature & Sunlight
                  </h3>
                </div>

                <div className="space-y-3.5 text-base">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[#5a7662] font-medium flex items-center gap-1.5">
                      <Thermometer size={18} className="text-[#144229]" />
                      Temperature Range:
                    </span>
                    <span className="text-right text-[#071c11]">
                      <strong>{plant.temperatureRange.min}°C to {plant.temperatureRange.max}°C</strong>
                      {plant.temperatureRange.idealRange && (
                        <span className="block text-xs sm:text-sm text-[#144229] font-medium mt-0.5">
                          Ideal: {plant.temperatureRange.idealRange}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-t border-[#f0ebe0] pt-2.5">
                    <span className="text-[#5a7662] font-medium">Sunlight Exposure:</span>
                    <span className="text-right text-[#071c11] font-semibold capitalize">
                      {plant.sunlight.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-t border-[#f0ebe0] pt-2.5">
                    <span className="text-[#5a7662] font-medium">Daily Photoperiod:</span>
                    <span className="text-right text-[#071c11] font-semibold">
                      {plant.sunlightHours}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#f7f5ed] rounded-2xl border border-[#ded5c5] text-xs sm:text-sm text-[#2e4435] leading-relaxed">
                <strong>Grow-Light Recommendation:</strong> If growing indoors on vertical shelves without direct window exposure, provide full-spectrum LED fixtures positioned 15–25 cm above foliage.
              </div>
            </div>

            {/* Card 2: Watering Strategy & Soil Drainage */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
                  <Droplets size={22} className="text-[#2563eb]" />
                  <h3 className="text-xl font-serif font-bold text-[#071c11]">
                    Watering & Soil Structure
                  </h3>
                </div>

                <div className="space-y-3.5 text-base text-[#1c261e]">
                  <div>
                    <span className="text-[#5a7662] font-medium text-sm block mb-1">
                      Irrigation Frequency ({plant.watering.moistureLevel} Moisture Strategy):
                    </span>
                    <p className="font-semibold text-[#071c11] leading-relaxed">
                      {plant.watering.frequency}
                    </p>
                    <p className="text-sm text-[#2e4435] mt-1 leading-relaxed">
                      {plant.watering.guidance}
                    </p>
                  </div>

                  <div className="border-t border-[#f0ebe0] pt-2.5">
                    <span className="text-[#5a7662] font-medium text-sm block mb-1">
                      Soil Medium & Drainage Requirements:
                    </span>
                    <p className="font-semibold text-[#071c11]">
                      {plant.soil.type}
                    </p>
                    <p className="text-sm text-[#2e4435]">
                      Drainage Capacity: {plant.soil.drainage}
                    </p>
                  </div>
                </div>
              </div>

              {plant.soil.recommendedMix && (
                <div className="p-3.5 bg-[#f4f8f4] rounded-2xl border border-[#cfe0cf] text-xs sm:text-sm text-[#144229] leading-relaxed">
                  <strong>Recommended Potting Soil Recipe:</strong> {plant.soil.recommendedMix}
                </div>
              )}
            </div>

            {/* Card 3: Relative Humidity & Ambient Air */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
                <Layers size={22} className="text-[#3d7a5a]" />
                <h3 className="text-xl font-serif font-bold text-[#071c11]">
                  Atmospheric Humidity Tolerance
                </h3>
              </div>

              <div className="space-y-2 text-base text-[#1c261e]">
                {plant.humidity ? (
                  <>
                    <p className="text-2xl font-serif font-bold text-[#071c11]">
                      {plant.humidity.min}% – {plant.humidity.max}% RH
                    </p>
                    {plant.humidity.note && (
                      <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                        {plant.humidity.note}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base text-[#2e4435] italic">
                    Tolerant of standard household indoor humidity (40%–60% RH).
                  </p>
                )}
              </div>
            </div>

            {/* Card 4: Soil pH Scale & Nutritive Chemistry */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
                <FlaskConical size={22} className="text-[#144229]" />
                <h3 className="text-xl font-serif font-bold text-[#071c11]">
                  Substrate pH Balance
                </h3>
              </div>

              <div className="space-y-2 text-base text-[#1c261e]">
                {plant.ph ? (
                  <>
                    <p className="text-2xl font-serif font-bold text-[#071c11]">
                      {plant.ph.min} – {plant.ph.max} pH
                    </p>
                    {plant.ph.note && (
                      <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                        {plant.ph.note}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base text-[#2e4435] italic">
                    Thrives within standard slightly acidic to neutral substrate range (6.0 – 7.0 pH).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* D. Today's Gardening Challenge */}
          <GardeningChallengeCard plant={plant} />

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="growing-guide"
            sectionTitle="Growing Guide"
            isInitiallyExplored={!!exploredSections['growing-guide']}
            onExploredToggle={handleSectionExplored}
          />
        </section>

        {/* =========================================================
            SECTION 3: GROWTH & HARVEST TIMELINE (#timeline)
        ========================================================= */}
        <section id="timeline" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
              Phenological Milestones
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Visual Growth & Harvest Timeline
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
              See how your plant grows from its earliest stage to harvest.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
                  Stage Tracking
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11] tracking-tight">
                  Days From Seeding to Maturity
                </h3>
                <p className="text-sm sm:text-base text-[#5a7662] mt-0.5">
                  Sourced from temperate horticulture extensions; growth duration responds dynamically to ambient temperature.
                </p>
              </div>

              <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#f4f8f4] border border-[#cfe0cf] text-xs font-semibold text-[#144229]">
                Horticulture Extension Verified
              </span>
            </div>

            {/* 4 Phase Stepper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Phase 1: Germination */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ed] border border-[#e2dbce] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#92400e] block">
                  Phase 1 • Germination
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11]">
                  {plant.timelines.germinationDays.min === 0
                    ? 'Stem Division'
                    : `${plant.timelines.germinationDays.min}–${plant.timelines.germinationDays.max} Days`}
                </p>
                <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                  Moist substrate in gentle warm ambient zone prior to radicle emergence.
                </p>
              </div>

              {/* Phase 2: Seedling & First True Leaves */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#144229] block">
                  Phase 2 • Seedling Stage
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11]">
                  {plant.timelines.seedlingDays.min}–{plant.timelines.seedlingDays.max} Days
                </p>
                <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                  Root system anchors and first true photosynthetic leaves develop.
                </p>
              </div>

              {/* Phase 3: First Harvest Window */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f8f4] border border-[#cfe0cf] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#144229] block">
                  {plant.timelines.harvestDays ? 'Phase 3 • First Harvest' : 'Phase 3 • Flower Opening'}
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11]">
                  {plant.timelines.harvestDays
                    ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} Days`
                    : plant.timelines.floweringDays
                    ? `${plant.timelines.floweringDays.min}–${plant.timelines.floweringDays.max} Days`
                    : `${plant.timelines.maturityDays.min} Days`}
                </p>
                <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                  Primary picking horizon for tender culinary foliage, sprouts, or blooms.
                </p>
              </div>

              {/* Phase 4: Full Physiological Maturity */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ed] border border-[#e2dbce] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#6c5940] block">
                  Phase 4 • Full Maturity
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11]">
                  {plant.timelines.maturityDays.min}–{plant.timelines.maturityDays.max} Days
                </p>
                <p className="text-sm sm:text-base text-[#2e4435] leading-relaxed">
                  Full vegetative canopy size and sustained reproductive yield horizon.
                </p>
              </div>
            </div>

            {plant.timelines.timelineNotes && (
              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex items-start gap-3 text-sm sm:text-base text-[#144229] leading-relaxed">
                <Info size={20} className="text-[#144229] shrink-0 mt-0.5" />
                <span>{plant.timelines.timelineNotes}</span>
              </div>
            )}
          </div>

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="timeline"
            sectionTitle="Growth Timeline"
            isInitiallyExplored={!!exploredSections['timeline']}
            onExploredToggle={handleSectionExplored}
          />
        </section>

        {/* =========================================================
            SECTION 4: CARE & PROBLEMS (#care-problems)
        ========================================================= */}
        <section id="care-problems" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
              Diagnostic & Health
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Plant Problems & Preventive Organic Care
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
              Spot common problems and learn how to care for your plant.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#fbeee9] border border-[#f8d7cb] flex items-center justify-center text-[#9a3412] shrink-0">
                  <Bug size={20} />
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                    Common Garden Pests & Stress Symptoms
                  </h3>
                  <p className="text-sm sm:text-base text-[#5a7662]">
                    Diagnostic symptoms, cultural prevention methods, and non-toxic horticultural remedies.
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#f4f8f4] border border-[#cfe0cf] text-xs font-semibold text-[#144229]">
                Organic & Safe
              </span>
            </div>

            {/* Problem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {plant.commonProblems.map((prob) => (
                <div
                  key={prob.issue}
                  className="p-6 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-3.5 hover:border-[#144229]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-[#071c11]">
                        {prob.issue}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#fbeee9] border border-[#f8d7cb] text-xs font-bold text-[#9a3412] uppercase tracking-wider">
                        Watch Out
                      </span>
                    </div>

                    <div className="space-y-1.5 text-base">
                      <p className="text-[#2e4435] leading-relaxed">
                        <strong className="text-[#071c11] font-semibold">Visual Symptoms:</strong>{' '}
                        {prob.symptoms}
                      </p>
                      <p className="text-[#2e4435] leading-relaxed">
                        <strong className="text-[#071c11] font-semibold">Prevention Protocol:</strong>{' '}
                        {prob.prevention}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#cfe0cf] text-sm sm:text-base text-[#144229] leading-relaxed space-y-1">
                    <span className="font-bold block text-xs uppercase tracking-wider text-[#144229]">
                      Recommended Organic Remedy:
                    </span>
                    <p>{prob.organicRemedy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Quick Knowledge Check Interactive Quiz */}
          <PlantQuizCard plant={plant} />

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="care-problems"
            sectionTitle="Plant Problems & Care"
            isInitiallyExplored={!!exploredSections['care-problems']}
            onExploredToggle={handleSectionExplored}
          />
        </section>

        {/* =========================================================
            PRACTICAL & CULINARY USES SECTION
        ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
              <Leaf size={22} className="text-[#144229]" />
              <h3 className="text-xl font-serif font-bold text-[#071c11]">
                Practical & Culinary Uses
              </h3>
            </div>
            <ul className="space-y-3 text-base text-[#1c261e]">
              {plant.practicalUses.map((use) => (
                <li key={use} className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#144229] mt-2 shrink-0" />
                  <span className="leading-relaxed">{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ebe0]">
              <AlertTriangle size={22} className="text-[#92400e]" />
              <h3 className="text-xl font-serif font-bold text-[#071c11]">
                General Safety & Handling Notes
              </h3>
            </div>
            <p className="text-base text-[#2e4435] leading-relaxed">
              {plant.safetyNotes || 'Non-toxic under normal culinary handling and harvesting procedures.'}
            </p>
            <div className="p-4 rounded-2xl bg-[#fef3c7]/70 border border-[#fde68a] text-xs sm:text-sm text-[#92400e] leading-relaxed">
              <strong>GrowAI Educational Disclaimer:</strong> GrowAI provides agricultural and botanical education. Never use garden plants to replace prescribed medical treatments or self-medicate acute health conditions.
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: MEDICINAL & PHYTOCHEMICAL PROFILE (#medicinal-profile)
        ========================================================= */}
        {plant.medicinalProfile ? (
          <section id="medicinal-profile" className="scroll-mt-32 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
                Phytochemical Science
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
                Medicinal Properties & Active Compounds
              </h2>
              <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
                Discover the natural compounds researchers study in this plant.
              </p>
            </div>

            {/* Grand Pharmacognosy Header Banner */}
            <div className="bg-[#144229] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#a3c2a3] font-semibold flex items-center gap-2">
                    <FlaskConical size={18} />
                    Botanical Pharmacognosy & Secondary Metabolites
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                    Medicinal & Phytochemical Profile
                  </h3>
                  <p className="text-base sm:text-lg text-[#e2ede2] max-w-3xl leading-relaxed">
                    Evidence-graded biochemical constituents, clinical research summaries, ethnobotanical history, and safety toxicology.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 bg-[#0d2e1c] px-4 py-3 rounded-2xl border border-[#205e3b]">
                  <ShieldCheck size={20} className="text-[#86efac]" />
                  <span className="text-sm font-semibold text-white">Evidence-Graded Data</span>
                </div>
              </div>
            </div>

            {/* Scientific Evidence Hierarchy Guide */}
            <EvidenceFrameworkGuide />

            {/* SUB-SECTION 1: Medicinal Value & Edibility Assessment */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#f7f5ed] border border-[#ded5c5] flex items-center justify-center text-[#144229] shrink-0">
                    <Heart size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                      1. Medicinal Value & Edibility Assessment
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5a7662]">
                      Consumption suitability and investigated physiological activities.
                    </p>
                  </div>
                </div>

                {/* Edibility Category Badge */}
                <div>
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'edible' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#eef5ee] text-[#144229] border border-[#cfe0cf] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <CheckCircle2 size={16} />
                      Edible (Food / Culinary)
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'edible-with-preparation' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertTriangle size={16} />
                      Edible with Preparation / Cooking Required
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'toxic-inedible' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertCircle size={16} />
                      Toxic / Inedible (Dangerous if Ingested)
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'strictly-ornamental' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertCircle size={16} />
                      Strictly Ornamental (Not for Consumption)
                    </span>
                  )}
                </div>
              </div>

              {/* Medicinal Value Summary (18px lead text) */}
              <p className="text-base sm:text-lg text-[#1c261e] leading-relaxed">
                {plant.medicinalProfile.medicinalValueSummary}
              </p>

              {/* Consumption Guidance Callout */}
              <div className="p-5 rounded-2xl bg-[#f7f5ed] border border-[#ded5c5] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                  Dietary & Consumption Guidance:
                </span>
                <p className="text-base text-[#2e4435] leading-relaxed">
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityNotes}
                </p>
              </div>

              {/* Biological Properties Pill Cluster */}
              {plant.medicinalProfile.biologicalProperties.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5a7662] block">
                    Observed Biological Activities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plant.medicinalProfile.biologicalProperties.map((prop) => (
                      <span
                        key={prop}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1 rounded-xl bg-[#f4f8f4] border border-[#cfdfcf] text-[#144229] font-medium"
                      >
                        <ShieldCheck size={14} className="text-[#144229]" />
                        <span>{prop}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SUB-SECTION 2: Active Compounds & Phytochemicals */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#fef9ee] border border-[#fed7aa] flex items-center justify-center text-[#c77712] shrink-0">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                      2. Active Compounds & Phytochemicals
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5a7662]">
                      Identified secondary metabolites, chemical classifications, and tissue distribution.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#144229] px-3 py-1 rounded-full bg-[#f4f8f4] border border-[#cfdfcf] self-start sm:self-auto">
                  {plant.medicinalProfile.activeCompounds.length} Key Compounds Documented
                </span>
              </div>

              {plant.medicinalProfile.activeCompounds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {plant.medicinalProfile.activeCompounds.map((comp) => (
                    <ActiveCompoundCard key={comp.name} compound={comp} />
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#2e4435] italic p-5 bg-[#fbf9f4] rounded-2xl border border-[#ded5c5]">
                  No well-established active compounds identified in the reviewed sources.
                </p>
              )}
            </div>

            {/* SUB-SECTION 3: Herbal Preparations & Formulations */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb] shrink-0">
                    <Pill size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                      3. Herbal Preparations & Formulations
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5a7662]">
                      Documented extraction methods, anatomical parts used, and evidence status.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#2563eb] px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] self-start sm:self-auto">
                  Integrative Care & Formulations
                </span>
              </div>

              {plant.medicinalProfile.herbalPreparations.length > 0 ? (
                <div className="space-y-4">
                  {plant.medicinalProfile.herbalPreparations.map((prep, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-[#f7f5ed] border border-[#e2dbce] space-y-3.5 hover:border-[#144229]/30 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif font-bold text-lg sm:text-xl text-[#071c11]">
                            {prep.type}
                          </h4>
                          {prep.partUsed && prep.partUsed !== 'None' && (
                            <span className="text-xs sm:text-sm bg-white text-[#2e4435] px-3 py-0.5 rounded-full border border-[#ded5c5] font-medium">
                              Part used: {prep.partUsed}
                            </span>
                          )}
                        </div>

                        <EvidenceLevelBadge level={prep.evidenceLevel} size="sm" />
                      </div>

                      <p className="text-base text-[#1c261e] leading-relaxed">
                        {prep.traditionalRole}
                      </p>

                      {prep.activeCompounds && prep.activeCompounds.length > 0 && (
                        <p className="text-sm text-[#2e4435]">
                          <strong className="text-[#071c11] font-semibold">Key Associated Phytochemicals:</strong>{' '}
                          {prep.activeCompounds.join(', ')}
                        </p>
                      )}

                      {prep.safetyConsiderations && (
                        <div className="p-3.5 rounded-xl bg-white border border-[#e2dbce] text-xs sm:text-sm text-[#92400e] leading-relaxed flex items-start gap-2.5">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <span><strong>Preparation Caution:</strong> {prep.safetyConsiderations}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#2e4435] italic p-5 bg-[#fbf9f4] rounded-2xl border border-[#ded5c5]">
                  No well-established medicinal preparation identified in the reviewed sources.
                </p>
              )}
            </div>

            {/* SUB-SECTION 4: Role in Traditional Herbal Medicine */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#f0ebe0]">
                <span className="w-10 h-10 rounded-2xl bg-[#f7f5ed] border border-[#ded5c5] flex items-center justify-center text-[#6c5940] shrink-0">
                  <BookOpen size={20} />
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                    4. Role in Traditional Herbal Medicine
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5a7662]">
                    Historical ethnobotanical context across world botanical traditions.
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#1c261e] leading-relaxed">
                {plant.medicinalProfile.traditionalMedicineRole}
              </p>

              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] text-xs sm:text-sm text-[#6c5940] leading-relaxed flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5 text-[#6c5940]" />
                <span>
                  <strong>Ethnobotanical Notice:</strong> Traditional and historical folklore reports reflect ancient cultural practices and do not constitute clinical efficacy proof. GrowAI does not recommend consuming ornamental or non-food plants for medicinal experimentation.
                </span>
              </div>
            </div>

            {/* SUB-SECTION 5: Scientific Research & Biological Properties */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-center text-[#144229] shrink-0">
                    <FlaskConical size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                      5. Scientific Research & Biological Properties
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5a7662]">
                      Peer-reviewed laboratory investigations and current evidentiary standing.
                    </p>
                  </div>
                </div>

                <EvidenceLevelBadge
                  level={plant.medicinalProfile.overallEvidenceLevel}
                  size="md"
                />
              </div>

              {plant.medicinalProfile.biologicalProperties.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5a7662] block">
                    Documented Biological Activities in Research:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-[#1c261e]">
                    {plant.medicinalProfile.biologicalProperties.map((prop) => (
                      <li key={prop} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fbf9f4] border border-[#ded5c5]">
                        <ShieldCheck size={18} className="text-[#144229] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{prop}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#fef3c7]/70 border border-[#fde68a] text-xs sm:text-sm text-[#92400e] leading-relaxed flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#92400e]" />
                <span>
                  <strong>Scientific Rigor Standard:</strong> In vitro laboratory cell assays and animal experiments identify molecular mechanisms and bioactivities, but cannot be construed as proven human therapeutic cures without randomized double-blind clinical trials.
                </span>
              </div>
            </div>

            {/* Section Explored Learning Tracker */}
            <SectionExploredToggle
              sectionId="medicinal-profile"
              sectionTitle="Medicinal Properties"
              isInitiallyExplored={!!exploredSections['medicinal-profile']}
              onExploredToggle={handleSectionExplored}
            />
          </section>
        ) : (
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-8 text-base text-[#2e4435] italic text-center">
            No medicinal or phytochemical profile documented for this plant entry.
          </div>
        )}

        {/* =========================================================
            SECTION 6: SAFETY, TOXICITY & TOXICOLOGY (#safety-toxicity)
        ========================================================= */}
        <section id="safety-toxicity" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#991b1b]">
              Botanical Safety & Toxicology
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Safety, Toxicity & Handling Guidance
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
              Important things to know before handling or consuming this plant.
            </p>
          </div>

          {/* Prominent Teen & Beginner Safety Rules Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#ded5c5] shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ebe0]">
              <span className="w-10 h-10 rounded-2xl bg-[#fee2e2] border border-[#fca5a5] flex items-center justify-center text-[#991b1b] shrink-0">
                <ShieldAlert size={22} />
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#071c11]">
                  Essential Botanical Safety Rules for Young Gardeners
                </h3>
                <p className="text-xs sm:text-sm text-[#5a7662]">
                  Safe, responsible gardening practices for beginners, students, and teenagers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base text-[#1c261e]">
              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5">
                <span className="font-bold text-[#071c11] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#144229] text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
                  Never Taste Unknown Plants
                </span>
                <p className="text-[#2e4435] text-xs sm:text-sm leading-relaxed">
                  Only eat plants that have been explicitly identified as culinary food by a knowledgeable adult. Many wild plants and houseplants look harmless but can cause serious stomach pain and mucosal injury.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5">
                <span className="font-bold text-[#071c11] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#144229] text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
                  Keep Ornamental Plants Off the Plate
                </span>
                <p className="text-[#2e4435] text-xs sm:text-sm leading-relaxed">
                  Popular indoor plants like <strong>Golden Pothos (Money Plant)</strong> and <strong>Snake Plant</strong> are purely ornamental. Their tissues contain sharp microscopic calcium oxalate needles or bitter saponins that trigger intense mouth burning, throat swelling, and nausea.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5">
                <span className="font-bold text-[#071c11] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#144229] text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
                  Research Does Not Equal Medical Treatment
                </span>
                <p className="text-[#2e4435] text-xs sm:text-sm leading-relaxed">
                  Laboratory tests in petri dishes show fascinating natural chemistry, but they do NOT mean eating a plant will cure or treat medical illnesses. Never brew concentrated home extracts or attempt self-medication.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5">
                <span className="font-bold text-[#071c11] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#144229] text-white text-xs flex items-center justify-center font-bold shrink-0">4</span>
                  Practice Clean Kitchen Hygiene
                </span>
                <p className="text-[#2e4435] text-xs sm:text-sm leading-relaxed">
                  Always wash your hands with warm water and soap after gardening. For edible plants like sprouts, always cook them thoroughly (to 74°C / 165°F) before eating.
                </p>
              </div>
            </div>
          </div>

          {/* Plant-specific toxicology details if medicinalProfile exists */}
          {plant.medicinalProfile?.safetyAndToxicity && (
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#fee2e2] border border-[#fca5a5] flex items-center justify-center text-[#991b1b] shrink-0">
                    <ShieldAlert size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                      Plant-Specific Safety & Ingestion Toxicology
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5a7662]">
                      Toxicological risks, adverse ingestion symptoms, contraindications, and drug interactions.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#991b1b] px-3 py-1 rounded-full bg-[#fee2e2] border border-[#fca5a5] self-start sm:self-auto">
                  Toxicology Assessment
                </span>
              </div>

              {/* Prominent Toxicity Level Banner */}
              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'toxic-calcium-oxalate' && (
                <div className="p-6 rounded-2xl bg-[#fee2e2] border-2 border-[#ef4444] text-[#991b1b] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={24} className="text-[#b91c1c] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#7f1d1d]">
                      Severe Ingestion Toxicity: Insoluble Calcium Oxalate Raphides
                    </h4>
                  </div>
                  <p className="text-base text-[#7f1d1d] leading-relaxed">
                    Microscopic needle-like crystals bundle inside vacuolar idioblasts. Mastication mechanically punctures oral mucous membranes, causing immediate intense burning, salivation, dysphagia, and pharyngeal edema.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-[#991b1b]">
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#fca5a5]">
                      ⚠️ Strictly Inedible for Humans
                    </span>
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#fca5a5]">
                      🐾 Toxic to Cats & Dogs (ASPCA Animal Poison Control)
                    </span>
                  </div>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'toxic-saponins' && (
                <div className="p-6 rounded-2xl bg-[#fee2e2] border-2 border-[#ef4444] text-[#991b1b] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={24} className="text-[#b91c1c] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#7f1d1d]">
                      Ingestion Toxicity: Steroidal Saponins
                    </h4>
                  </div>
                  <p className="text-base text-[#7f1d1d] leading-relaxed">
                    Contains natural surfactant saponins irritating to the gastrointestinal lining. Ingestion induces acute nausea, vomiting, hypersalivation, abdominal cramping, and diarrhea in humans and pets.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-[#991b1b]">
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#fca5a5]">
                      ⚠️ Not Safe for Human Consumption
                    </span>
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#fca5a5]">
                      🐾 Ingestion Toxic to Domestic Pets
                    </span>
                  </div>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'contains-anti-nutrients' && (
                <div className="p-6 rounded-2xl bg-[#fef3c7] border-2 border-[#f59e0b] text-[#92400e] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={24} className="text-[#b45309] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#78350f]">
                      Nutritional Caution: Active Anti-Nutrients & Non-Protein Amino Acids
                    </h4>
                  </div>
                  <p className="text-base text-[#92400e] leading-relaxed">
                    Contains active constituents (such as L-canavanine in alfalfa or phytic complexes in legumes) requiring culinary heat treatment or clinical precautions for autoimmune and sensitive populations.
                  </p>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'mildly-toxic-if-ingested' && (
                <div className="p-6 rounded-2xl bg-[#fef3c7] border-2 border-[#f59e0b] text-[#92400e] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={24} className="text-[#b45309] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#78350f]">
                      Caution: Mild Ingestion Toxicity
                    </h4>
                  </div>
                  <p className="text-base text-[#92400e] leading-relaxed">
                    Certain plant tissues contain irritants or purgative compounds requiring separation before consumption.
                  </p>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'non-toxic' && (
                <div className="p-5 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] text-[#144229] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#144229]" />
                    <h4 className="font-bold text-base sm:text-lg text-[#071c11]">
                      Non-Toxic in Customary Food Amounts
                    </h4>
                  </div>
                  <p className="text-base text-[#2e4435] leading-relaxed">
                    Generally recognized as wholesome and safe for dietary and culinary use under normal handling.
                  </p>
                </div>
              )}

              {/* Toxic Parts & Symptoms Callout */}
              {(plant.medicinalProfile.safetyAndToxicity.toxicParts ||
                plant.medicinalProfile.safetyAndToxicity.symptoms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plant.medicinalProfile.safetyAndToxicity.toxicParts && (
                    <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#991b1b] block">
                        Toxic / Irritant Anatomical Parts:
                      </span>
                      <p className="text-base font-semibold text-[#071c11]">
                        {plant.medicinalProfile.safetyAndToxicity.toxicParts}
                      </p>
                    </div>
                  )}

                  {plant.medicinalProfile.safetyAndToxicity.symptoms && (
                    <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#991b1b] block">
                        Documented Ingestion Symptoms:
                      </span>
                      <p className="text-base text-[#2e4435] leading-relaxed">
                        {plant.medicinalProfile.safetyAndToxicity.symptoms}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contraindications List */}
              {plant.medicinalProfile.safetyAndToxicity.contraindications &&
                plant.medicinalProfile.safetyAndToxicity.contraindications.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#991b1b] block flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-[#991b1b]" />
                      Documented Medical Contraindications:
                    </span>
                    <ul className="space-y-2 text-base text-[#1c261e]">
                      {plant.medicinalProfile.safetyAndToxicity.contraindications.map((ci) => (
                        <li key={ci} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fff5f5] border border-[#fecaca]">
                          <span className="text-[#991b1b] font-bold text-lg leading-none mt-0.5">•</span>
                          <span className="leading-relaxed font-medium">{ci}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Potential Medication Interactions */}
              {plant.medicinalProfile.safetyAndToxicity.medicationInteractions &&
                plant.medicinalProfile.safetyAndToxicity.medicationInteractions.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#92400e] block flex items-center gap-1.5">
                      <Pill size={15} className="text-[#92400e]" />
                      Potential Pharmacokinetic & Drug Interactions:
                    </span>
                    <ul className="space-y-2 text-base text-[#1c261e]">
                      {plant.medicinalProfile.safetyAndToxicity.medicationInteractions.map((mi) => (
                        <li key={mi} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a]">
                          <span className="text-[#92400e] font-bold text-lg leading-none mt-0.5">•</span>
                          <span className="leading-relaxed font-medium">{mi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* General Precautions */}
              <div className="p-4 rounded-xl bg-[#f7f5ed] border border-[#ded5c5] space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                  General Handling Precautions:
                </span>
                <p className="text-base text-[#2e4435] leading-relaxed">
                  {plant.medicinalProfile.safetyAndToxicity.generalPrecautions}
                </p>
              </div>

              {/* DEDICATED SPROUT FOOD SAFETY ALERT CARD */}
              {plant.medicinalProfile.foodSafety && (
                <SproutSafetyCard
                  foodSafety={plant.medicinalProfile.foodSafety}
                  plantName={plant.commonName}
                />
              )}
            </div>
          )}

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="safety-toxicity"
            sectionTitle="Safety & Toxicity"
            isInitiallyExplored={!!exploredSections['safety-toxicity']}
            onExploredToggle={handleSectionExplored}
          />
        </section>

        {/* =========================================================
            SECTION 7: SCIENTIFIC REFERENCES (#references)
        ========================================================= */}
        <section id="references" className="scroll-mt-32 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229]">
              Academic Citations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
              Scientific References & Trusted Sources
            </h2>
            <p className="text-base sm:text-lg text-[#2e4435] leading-relaxed">
              Explore the research and trusted sources behind this information.
            </p>
          </div>

          <PlantReferencesList
            medicinalReferences={plant.medicinalProfile?.references || []}
            horticulturalUrls={plant.sourceUrls}
          />

          {/* Section Explored Learning Tracker */}
          <SectionExploredToggle
            sectionId="references"
            sectionTitle="Scientific References"
            isInitiallyExplored={!!exploredSections['references']}
            onExploredToggle={handleSectionExplored}
          />
        </section>
      </main>

      {/* Add To Garden Modal Dialog */}
      <AddToGardenModal
        plant={plant}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
