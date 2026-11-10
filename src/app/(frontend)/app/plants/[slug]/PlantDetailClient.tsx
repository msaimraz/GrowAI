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
  SectionExploredToggle,
} from '@/components/plants/PlantEducation';
import { VisualPlantQuiz } from '@/components/plants/VisualPlantQuiz';
import { CareBadge } from '@/components/ui/CareBadge';
import { VisualProgress } from '@/components/ui/VisualProgress';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
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
  const { showSuccess } = useGrowToast();
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
      const wasAllExplored = Object.values(prev).filter(Boolean).length === 7;
      const wasOverviewExplored = !!prev['overview'];
      const updated = { ...prev, [sectionId]: isExplored };
      try {
        localStorage.setItem(`growai_explored_${plant.slug}`, JSON.stringify(updated));
      } catch {}

      const newExploredCount = Object.values(updated).filter(Boolean).length;

      // Section 10: 7 of 7 Explored completion toast
      if (!wasAllExplored && newExploredCount === 7) {
        showSuccess(
          '🌱 Great job, Grower!',
          `You’ve explored all the ${plant.commonName} essentials.`,
          '🌱'
        );
      }
      // Section 11: Overview section explored for the first time
      else if (!wasOverviewExplored && sectionId === 'overview' && isExplored) {
        showSuccess(
          '🌿 Nice work!',
          'You’re getting to know your plant better.',
          '🌿'
        );
      }

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
              dot <= score ? 'bg-[#174C35]' : 'bg-[#E3DFD2]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-32 sm:pb-20 bg-[#F8F6EE]">
      {/* 1. Top Breadcrumb & Primary Actions Bar */}
      <header className="bg-white border-b border-[#E3DFD2] px-4 sm:px-8 py-3 relative sm:sticky sm:top-0 sm:h-16 sm:py-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto h-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 min-w-0">
          <nav aria-label="Breadcrumb" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm min-w-0">
            <Link
              href="/app/plants"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#174C35] hover:text-[#203027] min-h-[36px] sm:min-h-[44px] transition-colors w-fit shrink-0"
            >
              <ArrowLeft size={16} />
              <span>Plant Library</span>
            </Link>
            <span className="hidden sm:inline text-[#68766C]">/</span>
            <span className="font-serif font-bold text-base sm:text-base text-[#203027] truncate max-w-full">
              {plant.commonName}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold bg-[#174C35] hover:bg-[#203027] text-white px-4 sm:px-6 py-2.5 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer min-h-[44px] w-full sm:w-auto shrink-0"
          >
            <Plus size={16} />
            <span>Add to My Garden</span>
          </button>
        </div>
      </header>

      {/* 2. In-Page Sticky Section Navigation */}
      <PlantSectionNav exploredCount={exploredCount} />

      {/* 3. Main Botanical Editorial Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full min-w-0 max-w-full space-y-10 sm:space-y-12">
        {/* =========================================================
            SECTION 1: HERO & BOTANICAL OVERVIEW (#overview)
        ========================================================= */}
        <section id="overview" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
              Botanical Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Plant Overview
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
              Meet your plant and discover what makes it special.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden min-w-0 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-w-0 max-w-full">
              {/* Left Column: Taxonomic Nameplate & Editorial Summary */}
              <div className="lg:col-span-7 space-y-5 min-w-0 max-w-full">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <CareBadge
                    type="difficulty"
                    label={`${plant.difficulty.level.charAt(0).toUpperCase() + plant.difficulty.level.slice(1)} Care`}
                    size="md"
                  />
                  <CareBadge
                    type="sun"
                    label={plant.sunlight.includes('full') ? 'Bright Direct Sun' : plant.sunlight.includes('partial') ? 'Partial Sunlight' : 'Low/Indirect Light'}
                    size="md"
                  />
                  <CareBadge
                    type="water"
                    label={`${plant.watering.moistureLevel.charAt(0).toUpperCase() + plant.watering.moistureLevel.slice(1)} Water`}
                    size="md"
                  />
                  {plant.badge && (
                    <span className="text-xs font-semibold text-[#8A6400] bg-[#FFF3D7] px-3 py-1 rounded-full border border-[#F0C04D/30]">
                      {plant.badge}
                    </span>
                  )}
                </div>

                {/* Common Name */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#203027] tracking-tight leading-tight">
                  {plant.commonName}
                </h1>

                {/* Scientific Name */}
                <p className="text-xl sm:text-2xl font-serif italic text-[#174C35]">
                  {plant.scientificName}
                </p>

                {/* Primary CTA */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 font-medium bg-[#174C35] hover:bg-[#123C2A] text-white px-6 py-3 rounded-2xl shadow-xs transition-all cursor-pointer text-sm sm:text-base min-h-[46px]"
                  >
                    <Plus size={18} />
                    <span>+ Add to My Garden</span>
                  </button>
                </div>

                {/* Editorial Summary Paragraph */}
                <p className="text-base text-[#203027] leading-relaxed pt-1">
                  {plant.summary}
                </p>

                {/* Simple Visual Care Cards: Light, Water, Temp, Soil, Harvest */}
                <div className="pt-4 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#174C35]">
                    Quick Care Essentials
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                    {/* ☀️ Light */}
                    <div className="p-3 rounded-xl bg-[#FFF3D7]/70 border border-[#F0C04D/30] space-y-1">
                      <span className="text-base block">☀️</span>
                      <strong className="text-[#203027] block text-xs">Light</strong>
                      <p className="text-[11px] text-[#68766C] leading-tight">
                        {plant.sunlightHours || plant.sunlight.replace('-', ' ')}
                      </p>
                    </div>

                    {/* 💧 Water */}
                    <div className="p-3 rounded-xl bg-[#E7F2F9]/70 border border-[#65A8D0/30] space-y-1">
                      <span className="text-base block">💧</span>
                      <strong className="text-[#203027] block text-xs">Water</strong>
                      <p className="text-[11px] text-[#68766C] leading-tight">
                        {plant.watering.moistureLevel} · When top soil is dry
                      </p>
                    </div>

                    {/* 🌡️ Temperature */}
                    <div className="p-3 rounded-xl bg-[#FBE9E2]/70 border border-[#E4775D/30] space-y-1">
                      <span className="text-base block">🌡️</span>
                      <strong className="text-[#203027] block text-xs">Temp</strong>
                      <p className="text-[11px] text-[#68766C] leading-tight">
                        {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                      </p>
                    </div>

                    {/* 🌱 Soil */}
                    <div className="p-3 rounded-xl bg-[#EAF1E4]/70 border border-[#E3DFD2] space-y-1">
                      <span className="text-base block">🌱</span>
                      <strong className="text-[#203027] block text-xs">Soil</strong>
                      <p className="text-[11px] text-[#68766C] leading-tight line-clamp-2">
                        {plant.soil.type || 'Aerated container potting mix'}
                      </p>
                    </div>

                    {/* ✂️ Harvest / Cycle */}
                    <div className="p-3 rounded-xl bg-[#F0ECF7]/70 border border-[#9A83C5/30] space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-base block">✂️</span>
                      <strong className="text-[#203027] block text-xs">Cycle</strong>
                      <p className="text-[11px] text-[#68766C] leading-tight">
                        {plant.timelines?.harvestDays?.max
                          ? `${plant.timelines.harvestDays.max}d to harvest`
                          : plant.daysToMaturity
                          ? `${plant.daysToMaturity}d to harvest`
                          : 'Continuous harvests'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to grow it: Illustrated Progression */}
                <div className="pt-4 border-t border-[#EAF1E4] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#174C35]">
                      How to Grow It · Growth Journey
                    </h3>
                    <span className="text-[11px] font-mono text-[#68766C]">
                      From seed/cutting to harvest
                    </span>
                  </div>
                  <VisualProgress />
                </div>

                {/* Growing Environment Badges */}
                <div className="pt-1 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#68766C] block">
                    Verified Growing Environments:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plant.environments.map((env) => (
                      <span
                        key={env}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EAF1E4] text-[#174C35] text-sm font-semibold border border-[#E3DFD2] capitalize inline-flex items-center gap-1.5"
                      >
                        <Check size={15} className="text-[#174C35]" />
                        {env.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Agronomic Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-[#E3DFD2]">
                  {/* Metric 1: Sunlight */}
                  <div className="bg-[#F8F6EE] p-3.5 rounded-2xl border border-[#E3DFD2]/70 space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#68766C] block">
                      Sunlight Exposure
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#203027] capitalize block">
                      {plant.sunlight.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Metric 2: Moisture Strategy */}
                  <div className="bg-[#F8F6EE] p-3.5 rounded-2xl border border-[#E3DFD2]/70 space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#68766C] block">
                      Moisture Strategy
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#203027] capitalize block">
                      {plant.watering.moistureLevel} Moisture
                    </span>
                  </div>

                  {/* Metric 3: Temperature Range */}
                  <div className="bg-[#F8F6EE] p-3.5 rounded-2xl border border-[#E3DFD2]/70 space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#68766C] block">
                      Temperature Range
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#203027] block">
                      {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                    </span>
                  </div>

                  {/* Metric 4: Daily Light / Photoperiod - SPANS FULL WIDTH */}
                  <div className="col-span-1 sm:col-span-3 bg-[#F8F6EE] p-4 rounded-2xl border border-[#E3DFD2]/70 space-y-1.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#68766C] block">
                      Daily Light & Photoperiod Regime
                    </span>
                    <p className="text-base font-semibold text-[#203027] leading-relaxed">
                      {plant.sunlightHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Prominent Botanical Plate Artwork & Herbarium Card */}
              <div className="lg:col-span-5 min-w-0 max-w-full">
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
        <section id="growing-guide" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
              Horticultural Specifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Essential Growing Conditions & Environmental Requirements
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed max-w-3xl">
              Learn how much sunlight, water and space your plant needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Climate, Light & Temperature */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
                  <Sun size={22} className="text-[#F0C04D]" />
                  <h3 className="text-xl font-serif font-bold text-[#203027]">
                    Climate, Temperature & Sunlight
                  </h3>
                </div>

                <div className="space-y-3.5 text-base">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                    <span className="text-[#68766C] font-medium flex items-center gap-1.5 shrink-0">
                      <Thermometer size={18} className="text-[#174C35]" />
                      Temperature Range:
                    </span>
                    <span className="sm:text-right text-[#203027]">
                      <strong>{plant.temperatureRange.min}°C to {plant.temperatureRange.max}°C</strong>
                      {plant.temperatureRange.idealRange && (
                        <span className="block text-xs sm:text-sm text-[#174C35] font-medium mt-0.5">
                          Ideal: {plant.temperatureRange.idealRange}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 border-t border-[#E3DFD2] pt-2.5">
                    <span className="text-[#68766C] font-medium shrink-0">Sunlight Exposure:</span>
                    <span className="sm:text-right text-[#203027] font-semibold capitalize">
                      {plant.sunlight.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="border-t border-[#E3DFD2] pt-3 space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#68766C] block">
                      Daily Photoperiod & Light Regime:
                    </span>
                    <p className="text-base font-semibold text-[#203027] leading-relaxed">
                      {plant.sunlightHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] text-xs sm:text-sm text-[#203027] leading-relaxed">
                <strong>Grow-Light Recommendation:</strong> If growing indoors on vertical shelves without direct window exposure, provide full-spectrum LED fixtures positioned 15–25 cm above foliage.
              </div>
            </div>

            {/* Card 2: Watering Strategy & Soil Drainage */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
                  <Droplets size={22} className="text-[#1B5D88]" />
                  <h3 className="text-xl font-serif font-bold text-[#203027]">
                    Watering & Soil Structure
                  </h3>
                </div>

                <div className="space-y-3.5 text-base text-[#203027]">
                  <div>
                    <span className="text-[#68766C] font-medium text-sm block mb-1">
                      Irrigation Frequency ({plant.watering.moistureLevel} Moisture Strategy):
                    </span>
                    <p className="font-semibold text-[#203027] leading-relaxed">
                      {plant.watering.frequency}
                    </p>
                    <p className="text-sm text-[#203027] mt-1 leading-relaxed">
                      {plant.watering.guidance}
                    </p>
                  </div>

                  <div className="border-t border-[#E3DFD2] pt-2.5">
                    <span className="text-[#68766C] font-medium text-sm block mb-1">
                      Soil Medium & Drainage Requirements:
                    </span>
                    <p className="font-semibold text-[#203027]">
                      {plant.soil.type}
                    </p>
                    <p className="text-sm text-[#203027]">
                      Drainage Capacity: {plant.soil.drainage}
                    </p>
                  </div>
                </div>
              </div>

              {plant.soil.recommendedMix && (
                <div className="p-3.5 bg-[#EAF1E4] rounded-2xl border border-[#E3DFD2] text-xs sm:text-sm text-[#174C35] leading-relaxed">
                  <strong>Recommended Potting Soil Recipe:</strong> {plant.soil.recommendedMix}
                </div>
              )}
            </div>

            {/* Card 3: Relative Humidity & Ambient Air */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
                <Layers size={22} className="text-[#78A95A]" />
                <h3 className="text-xl font-serif font-bold text-[#203027]">
                  Atmospheric Humidity Tolerance
                </h3>
              </div>

              <div className="space-y-2 text-base text-[#203027]">
                {plant.humidity ? (
                  <>
                    <p className="text-2xl font-serif font-bold text-[#203027]">
                      {plant.humidity.min}% – {plant.humidity.max}% RH
                    </p>
                    {plant.humidity.note && (
                      <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                        {plant.humidity.note}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base text-[#203027] italic">
                    Tolerant of standard household indoor humidity (40%–60% RH).
                  </p>
                )}
              </div>
            </div>

            {/* Card 4: Soil pH Scale & Nutritive Chemistry */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
                <FlaskConical size={22} className="text-[#174C35]" />
                <h3 className="text-xl font-serif font-bold text-[#203027]">
                  Substrate pH Balance
                </h3>
              </div>

              <div className="space-y-2 text-base text-[#203027]">
                {plant.ph ? (
                  <>
                    <p className="text-2xl font-serif font-bold text-[#203027]">
                      {plant.ph.min} – {plant.ph.max} pH
                    </p>
                    {plant.ph.note && (
                      <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                        {plant.ph.note}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base text-[#203027] italic">
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
        <section id="timeline" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
              Phenological Milestones
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Visual Growth & Harvest Timeline
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
              See how your plant grows from its earliest stage to harvest.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
                  Stage Tracking
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027] tracking-tight">
                  Days From Seeding to Maturity
                </h3>
                <p className="text-sm sm:text-base text-[#68766C] mt-0.5">
                  Sourced from temperate horticulture extensions; growth duration responds dynamically to ambient temperature.
                </p>
              </div>

              <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] text-xs font-semibold text-[#174C35]">
                Horticulture Extension Verified
              </span>
            </div>

            {/* 4 Phase Stepper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Phase 1: Germination */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#8A6400] block">
                  Phase 1 • Germination
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#203027]">
                  {plant.timelines.germinationDays.min === 0
                    ? 'Stem Division'
                    : `${plant.timelines.germinationDays.min}–${plant.timelines.germinationDays.max} Days`}
                </p>
                <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                  Moist substrate in gentle warm ambient zone prior to radicle emergence.
                </p>
              </div>

              {/* Phase 2: Seedling & First True Leaves */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#174C35] block">
                  Phase 2 • Seedling Stage
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#203027]">
                  {plant.timelines.seedlingDays.min}–{plant.timelines.seedlingDays.max} Days
                </p>
                <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                  Root system anchors and first true photosynthetic leaves develop.
                </p>
              </div>

              {/* Phase 3: First Harvest Window */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#174C35] block">
                  {plant.timelines.harvestDays ? 'Phase 3 • First Harvest' : 'Phase 3 • Flower Opening'}
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#203027]">
                  {plant.timelines.harvestDays
                    ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} Days`
                    : plant.timelines.floweringDays
                    ? `${plant.timelines.floweringDays.min}–${plant.timelines.floweringDays.max} Days`
                    : `${plant.timelines.maturityDays.min} Days`}
                </p>
                <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                  Primary picking horizon for tender culinary foliage, sprouts, or blooms.
                </p>
              </div>

              {/* Phase 4: Full Physiological Maturity */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-2 relative">
                <span className="text-xs font-mono uppercase font-bold text-[#68766C] block">
                  Phase 4 • Full Maturity
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#203027]">
                  {plant.timelines.maturityDays.min}–{plant.timelines.maturityDays.max} Days
                </p>
                <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
                  Full vegetative canopy size and sustained reproductive yield horizon.
                </p>
              </div>
            </div>

            {plant.timelines.timelineNotes && (
              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex items-start gap-3 text-sm sm:text-base text-[#174C35] leading-relaxed">
                <Info size={20} className="text-[#174C35] shrink-0 mt-0.5" />
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
        <section id="care-problems" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
              Diagnostic & Health
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Plant Problems & Preventive Organic Care
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
              Spot common problems and learn how to care for your plant.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3DFD2]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] flex items-center justify-center text-[#963A23] shrink-0">
                  <Bug size={20} />
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                    Common Garden Pests & Stress Symptoms
                  </h3>
                  <p className="text-sm sm:text-base text-[#68766C]">
                    Diagnostic symptoms, cultural prevention methods, and non-toxic horticultural remedies.
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] text-xs font-semibold text-[#174C35]">
                Organic & Safe
              </span>
            </div>

            {/* Problem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {plant.commonProblems.map((prob) => (
                <div
                  key={prob.issue}
                  className="p-6 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-3.5 hover:border-[#174C35]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-[#203027]">
                        {prob.issue}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FBE9E2] border border-[#E4775D/30] text-xs font-bold text-[#963A23] uppercase tracking-wider">
                        Watch Out
                      </span>
                    </div>

                    <div className="space-y-1.5 text-base">
                      <p className="text-[#203027] leading-relaxed">
                        <strong className="text-[#203027] font-semibold">Visual Symptoms:</strong>{' '}
                        {prob.symptoms}
                      </p>
                      <p className="text-[#203027] leading-relaxed">
                        <strong className="text-[#203027] font-semibold">Prevention Protocol:</strong>{' '}
                        {prob.prevention}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E3DFD2] text-sm sm:text-base text-[#174C35] leading-relaxed space-y-1">
                    <span className="font-bold block text-xs uppercase tracking-wider text-[#174C35]">
                      Recommended Organic Remedy:
                    </span>
                    <p>{prob.organicRemedy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Quick Knowledge Check Interactive Quiz (Visual, fast) */}
          <VisualPlantQuiz plant={plant} />

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
          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
              <Leaf size={22} className="text-[#174C35]" />
              <h3 className="text-xl font-serif font-bold text-[#203027]">
                Practical & Culinary Uses
              </h3>
            </div>
            <ul className="space-y-3 text-base text-[#203027]">
              {plant.practicalUses.map((use) => (
                <li key={use} className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#174C35] mt-2 shrink-0" />
                  <span className="leading-relaxed">{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
              <AlertTriangle size={22} className="text-[#8A6400]" />
              <h3 className="text-xl font-serif font-bold text-[#203027]">
                General Safety & Handling Notes
              </h3>
            </div>
            <p className="text-base text-[#203027] leading-relaxed">
              {plant.safetyNotes || 'Non-toxic under normal culinary handling and harvesting procedures.'}
            </p>
            <div className="p-4 rounded-2xl bg-[#FFF3D7]/70 border border-[#F0C04D/30] text-xs sm:text-sm text-[#8A6400] leading-relaxed">
              <strong>GrowAI Educational Disclaimer:</strong> GrowAI provides agricultural and botanical education. Never use garden plants to replace prescribed medical treatments or self-medicate acute health conditions.
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: MEDICINAL & PHYTOCHEMICAL PROFILE (#medicinal-profile)
        ========================================================= */}
        {plant.medicinalProfile ? (
          <section id="medicinal-profile" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-8 min-w-0 max-w-full">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
                Phytochemical Science
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
                Medicinal Properties & Active Compounds
              </h2>
              <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
                Discover the natural compounds researchers study in this plant.
              </p>
            </div>

            {/* Grand Pharmacognosy Header Banner */}
            <div className="bg-[#174C35] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#78A95A] font-semibold flex items-center gap-2">
                    <FlaskConical size={18} />
                    Botanical Pharmacognosy & Secondary Metabolites
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                    Medicinal & Phytochemical Profile
                  </h3>
                  <p className="text-base sm:text-lg text-[#EAF1E4] max-w-3xl leading-relaxed">
                    Evidence-graded biochemical constituents, clinical research summaries, ethnobotanical history, and safety toxicology.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 bg-[#123C2A] px-4 py-3 rounded-2xl border border-[#174C35]">
                  <ShieldCheck size={20} className="text-[#78A95A]" />
                  <span className="text-sm font-semibold text-white">Evidence-Graded Data</span>
                </div>
              </div>
            </div>

            {/* Scientific Evidence Hierarchy Guide */}
            <EvidenceFrameworkGuide />

            {/* SUB-SECTION 1: Medicinal Value & Edibility Assessment */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex items-center justify-center text-[#174C35] shrink-0">
                    <Heart size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                      1. Medicinal Value & Edibility Assessment
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C]">
                      Consumption suitability and investigated physiological activities.
                    </p>
                  </div>
                </div>

                {/* Edibility Category Badge */}
                <div>
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'edible' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <CheckCircle2 size={16} />
                      Edible (Food / Culinary)
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'edible-with-preparation' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D/30] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertTriangle size={16} />
                      Edible with Preparation / Cooking Required
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'toxic-inedible' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#FBE9E2] text-[#963A23] border border-[#E4775D/30] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertCircle size={16} />
                      Toxic / Inedible (Dangerous if Ingested)
                    </span>
                  )}
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityCategory === 'strictly-ornamental' && (
                    <span className="px-4 py-1.5 rounded-xl bg-[#FBE9E2] text-[#963A23] border border-[#E4775D/30] text-sm font-semibold inline-flex items-center gap-2 shadow-2xs">
                      <AlertCircle size={16} />
                      Strictly Ornamental (Not for Consumption)
                    </span>
                  )}
                </div>
              </div>

              {/* Medicinal Value Summary (18px lead text) */}
              <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
                {plant.medicinalProfile.medicinalValueSummary}
              </p>

              {/* Consumption Guidance Callout */}
              <div className="p-5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#174C35] block">
                  Dietary & Consumption Guidance:
                </span>
                <p className="text-base text-[#203027] leading-relaxed">
                  {plant.medicinalProfile.suitabilityForConsumption.edibilityNotes}
                </p>
              </div>

              {/* Biological Properties Pill Cluster */}
              {plant.medicinalProfile.biologicalProperties.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#68766C] block">
                    Observed Biological Activities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plant.medicinalProfile.biologicalProperties.map((prop) => (
                      <span
                        key={prop}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] font-medium"
                      >
                        <ShieldCheck size={14} className="text-[#174C35]" />
                        <span>{prop}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SUB-SECTION 2: Active Compounds & Phytochemicals */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3DFD2]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#FFF3D7] border border-[#F0C04D/30] flex items-center justify-center text-[#F0C04D] shrink-0">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                      2. Active Compounds & Phytochemicals
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C]">
                      Identified secondary metabolites, chemical classifications, and tissue distribution.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#174C35] px-3 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] self-start sm:self-auto">
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
                <p className="text-base text-[#203027] italic p-5 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2]">
                  No well-established active compounds identified in the reviewed sources.
                </p>
              )}
            </div>

            {/* SUB-SECTION 3: Herbal Preparations & Formulations */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3DFD2]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#E7F2F9] border border-[#65A8D0/30] flex items-center justify-center text-[#1B5D88] shrink-0">
                    <Pill size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                      3. Herbal Preparations & Formulations
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C]">
                      Documented extraction methods, anatomical parts used, and evidence status.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#1B5D88] px-3 py-1 rounded-full bg-[#E7F2F9] border border-[#65A8D0/30] self-start sm:self-auto">
                  Integrative Care & Formulations
                </span>
              </div>

              {plant.medicinalProfile.herbalPreparations.length > 0 ? (
                <div className="space-y-4">
                  {plant.medicinalProfile.herbalPreparations.map((prep, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-3.5 hover:border-[#174C35]/30 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif font-bold text-lg sm:text-xl text-[#203027]">
                            {prep.type}
                          </h4>
                          {prep.partUsed && prep.partUsed !== 'None' && (
                            <span className="text-xs sm:text-sm bg-white text-[#203027] px-3 py-0.5 rounded-full border border-[#E3DFD2] font-medium">
                              Part used: {prep.partUsed}
                            </span>
                          )}
                        </div>

                        <EvidenceLevelBadge level={prep.evidenceLevel} size="sm" />
                      </div>

                      <p className="text-base text-[#203027] leading-relaxed">
                        {prep.traditionalRole}
                      </p>

                      {prep.activeCompounds && prep.activeCompounds.length > 0 && (
                        <p className="text-sm text-[#203027]">
                          <strong className="text-[#203027] font-semibold">Key Associated Phytochemicals:</strong>{' '}
                          {prep.activeCompounds.join(', ')}
                        </p>
                      )}

                      {prep.safetyConsiderations && (
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3DFD2] text-xs sm:text-sm text-[#8A6400] leading-relaxed flex items-start gap-2.5">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <span><strong>Preparation Caution:</strong> {prep.safetyConsiderations}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#203027] italic p-5 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2]">
                  No well-established medicinal preparation identified in the reviewed sources.
                </p>
              )}
            </div>

            {/* SUB-SECTION 4: Role in Traditional Herbal Medicine */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#E3DFD2]">
                <span className="w-10 h-10 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex items-center justify-center text-[#68766C] shrink-0">
                  <BookOpen size={20} />
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                    4. Role in Traditional Herbal Medicine
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68766C]">
                    Historical ethnobotanical context across world botanical traditions.
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
                {plant.medicinalProfile.traditionalMedicineRole}
              </p>

              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] text-xs sm:text-sm text-[#68766C] leading-relaxed flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5 text-[#68766C]" />
                <span>
                  <strong>Ethnobotanical Notice:</strong> Traditional and historical folklore reports reflect ancient cultural practices and do not constitute clinical efficacy proof. GrowAI does not recommend consuming ornamental or non-food plants for medicinal experimentation.
                </span>
              </div>
            </div>

            {/* SUB-SECTION 5: Scientific Research & Biological Properties */}
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-center text-[#174C35] shrink-0">
                    <FlaskConical size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                      5. Scientific Research & Biological Properties
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C]">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#68766C] block">
                    Documented Biological Activities in Research:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-[#203027]">
                    {plant.medicinalProfile.biologicalProperties.map((prop) => (
                      <li key={prop} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F6EE] border border-[#E3DFD2]">
                        <ShieldCheck size={18} className="text-[#174C35] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{prop}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FFF3D7]/70 border border-[#F0C04D/30] text-xs sm:text-sm text-[#8A6400] leading-relaxed flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#8A6400]" />
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
          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-8 text-base text-[#203027] italic text-center">
            No medicinal or phytochemical profile documented for this plant entry.
          </div>
        )}

        {/* =========================================================
            SECTION 6: SAFETY, TOXICITY & TOXICOLOGY (#safety-toxicity)
        ========================================================= */}
        <section id="safety-toxicity" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#963A23]">
              Botanical Safety & Toxicology
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Safety, Toxicity & Handling Guidance
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
              Important things to know before handling or consuming this plant.
            </p>
          </div>

          {/* Prominent Teen & Beginner Safety Rules Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#E3DFD2] shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E3DFD2]">
              <span className="w-10 h-10 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] flex items-center justify-center text-[#963A23] shrink-0">
                <ShieldAlert size={22} />
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#203027]">
                  Essential Botanical Safety Rules for Young Gardeners
                </h3>
                <p className="text-xs sm:text-sm text-[#68766C]">
                  Safe, responsible gardening practices for beginners, students, and teenagers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base text-[#203027]">
              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1.5">
                <span className="font-bold text-[#203027] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#174C35] text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
                  Never Taste Unknown Plants
                </span>
                <p className="text-[#203027] text-xs sm:text-sm leading-relaxed">
                  Only eat plants that have been explicitly identified as culinary food by a knowledgeable adult. Many wild plants and houseplants look harmless but can cause serious stomach pain and mucosal injury.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1.5">
                <span className="font-bold text-[#203027] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#174C35] text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
                  Keep Ornamental Plants Off the Plate
                </span>
                <p className="text-[#203027] text-xs sm:text-sm leading-relaxed">
                  Popular indoor plants like <strong>Golden Pothos (Money Plant)</strong> and <strong>Snake Plant</strong> are purely ornamental. Their tissues contain sharp microscopic calcium oxalate needles or bitter saponins that trigger intense mouth burning, throat swelling, and nausea.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1.5">
                <span className="font-bold text-[#203027] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#174C35] text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
                  Research Does Not Equal Medical Treatment
                </span>
                <p className="text-[#203027] text-xs sm:text-sm leading-relaxed">
                  Laboratory tests in petri dishes show fascinating natural chemistry, but they do NOT mean eating a plant will cure or treat medical illnesses. Never brew concentrated home extracts or attempt self-medication.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1.5">
                <span className="font-bold text-[#203027] block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#174C35] text-white text-xs flex items-center justify-center font-bold shrink-0">4</span>
                  Practice Clean Kitchen Hygiene
                </span>
                <p className="text-[#203027] text-xs sm:text-sm leading-relaxed">
                  Always wash your hands with warm water and soap after gardening. For edible plants like sprouts, always cook them thoroughly (to 74°C / 165°F) before eating.
                </p>
              </div>
            </div>
          </div>

          {/* Plant-specific toxicology details if medicinalProfile exists */}
          {plant.medicinalProfile?.safetyAndToxicity && (
            <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3DFD2]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] flex items-center justify-center text-[#963A23] shrink-0">
                    <ShieldAlert size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                      Plant-Specific Safety & Ingestion Toxicology
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C]">
                      Toxicological risks, adverse ingestion symptoms, contraindications, and drug interactions.
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-[#963A23] px-3 py-1 rounded-full bg-[#FBE9E2] border border-[#E4775D/30] self-start sm:self-auto">
                  Toxicology Assessment
                </span>
              </div>

              {/* Prominent Toxicity Level Banner */}
              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'toxic-calcium-oxalate' && (
                <div className="p-6 rounded-2xl bg-[#FBE9E2] border-2 border-[#E4775D] text-[#963A23] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={24} className="text-[#963A23] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#963A23]">
                      Severe Ingestion Toxicity: Insoluble Calcium Oxalate Raphides
                    </h4>
                  </div>
                  <p className="text-base text-[#963A23] leading-relaxed">
                    Microscopic needle-like crystals bundle inside vacuolar idioblasts. Mastication mechanically punctures oral mucous membranes, causing immediate intense burning, salivation, dysphagia, and pharyngeal edema.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-[#963A23]">
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#E4775D/30]">
                      ⚠️ Strictly Inedible for Humans
                    </span>
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#E4775D/30]">
                      🐾 Toxic to Cats & Dogs (ASPCA Animal Poison Control)
                    </span>
                  </div>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'toxic-saponins' && (
                <div className="p-6 rounded-2xl bg-[#FBE9E2] border-2 border-[#E4775D] text-[#963A23] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={24} className="text-[#963A23] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#963A23]">
                      Ingestion Toxicity: Steroidal Saponins
                    </h4>
                  </div>
                  <p className="text-base text-[#963A23] leading-relaxed">
                    Contains natural surfactant saponins irritating to the gastrointestinal lining. Ingestion induces acute nausea, vomiting, hypersalivation, abdominal cramping, and diarrhea in humans and pets.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-[#963A23]">
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#E4775D/30]">
                      ⚠️ Not Safe for Human Consumption
                    </span>
                    <span className="bg-white/80 px-3 py-1 rounded-lg border border-[#E4775D/30]">
                      🐾 Ingestion Toxic to Domestic Pets
                    </span>
                  </div>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'contains-anti-nutrients' && (
                <div className="p-6 rounded-2xl bg-[#FFF3D7] border-2 border-[#F0C04D] text-[#8A6400] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={24} className="text-[#8A6400] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#8A6400]">
                      Nutritional Caution: Active Anti-Nutrients & Non-Protein Amino Acids
                    </h4>
                  </div>
                  <p className="text-base text-[#8A6400] leading-relaxed">
                    Contains active constituents (such as L-canavanine in alfalfa or phytic complexes in legumes) requiring culinary heat treatment or clinical precautions for autoimmune and sensitive populations.
                  </p>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'mildly-toxic-if-ingested' && (
                <div className="p-6 rounded-2xl bg-[#FFF3D7] border-2 border-[#F0C04D] text-[#8A6400] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={24} className="text-[#8A6400] shrink-0" />
                    <h4 className="font-bold text-lg sm:text-xl text-[#8A6400]">
                      Caution: Mild Ingestion Toxicity
                    </h4>
                  </div>
                  <p className="text-base text-[#8A6400] leading-relaxed">
                    Certain plant tissues contain irritants or purgative compounds requiring separation before consumption.
                  </p>
                </div>
              )}

              {plant.medicinalProfile.safetyAndToxicity.toxicityLevel === 'non-toxic' && (
                <div className="p-5 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#174C35]" />
                    <h4 className="font-bold text-base sm:text-lg text-[#203027]">
                      Non-Toxic in Customary Food Amounts
                    </h4>
                  </div>
                  <p className="text-base text-[#203027] leading-relaxed">
                    Generally recognized as wholesome and safe for dietary and culinary use under normal handling.
                  </p>
                </div>
              )}

              {/* Toxic Parts & Symptoms Callout */}
              {(plant.medicinalProfile.safetyAndToxicity.toxicParts ||
                plant.medicinalProfile.safetyAndToxicity.symptoms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plant.medicinalProfile.safetyAndToxicity.toxicParts && (
                    <div className="p-4 rounded-xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#963A23] block">
                        Toxic / Irritant Anatomical Parts:
                      </span>
                      <p className="text-base font-semibold text-[#203027]">
                        {plant.medicinalProfile.safetyAndToxicity.toxicParts}
                      </p>
                    </div>
                  )}

                  {plant.medicinalProfile.safetyAndToxicity.symptoms && (
                    <div className="p-4 rounded-xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#963A23] block">
                        Documented Ingestion Symptoms:
                      </span>
                      <p className="text-base text-[#203027] leading-relaxed">
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
                    <span className="text-xs font-bold uppercase tracking-wider text-[#963A23] block flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-[#963A23]" />
                      Documented Medical Contraindications:
                    </span>
                    <ul className="space-y-2 text-base text-[#203027]">
                      {plant.medicinalProfile.safetyAndToxicity.contraindications.map((ci) => (
                        <li key={ci} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FBE9E2] border border-[#E4775D/30]">
                          <span className="text-[#963A23] font-bold text-lg leading-none mt-0.5">•</span>
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
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8A6400] block flex items-center gap-1.5">
                      <Pill size={15} className="text-[#8A6400]" />
                      Potential Pharmacokinetic & Drug Interactions:
                    </span>
                    <ul className="space-y-2 text-base text-[#203027]">
                      {plant.medicinalProfile.safetyAndToxicity.medicationInteractions.map((mi) => (
                        <li key={mi} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF3D7] border border-[#F0C04D/30]">
                          <span className="text-[#8A6400] font-bold text-lg leading-none mt-0.5">•</span>
                          <span className="leading-relaxed font-medium">{mi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* General Precautions */}
              <div className="p-4 rounded-xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#174C35] block">
                  General Handling Precautions:
                </span>
                <p className="text-base text-[#203027] leading-relaxed">
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
        <section id="references" className="scroll-mt-[72px] sm:scroll-mt-[140px] space-y-6 min-w-0 max-w-full">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35]">
              Academic Citations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
              Scientific References & Trusted Sources
            </h2>
            <p className="text-base sm:text-lg text-[#203027] leading-relaxed">
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
