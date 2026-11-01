'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SharedBotanical';
import { Plant, CategoryMetadata, GrowingEnvironment } from '@/types/plant';
import {
  Search,
  Thermometer,
  Sun,
  Clock,
  Layers,
  X,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface PlantLibraryClientProps {
  initialPlants: Plant[];
  initialCategories: CategoryMetadata[];
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  all: 'Browse all 19 curated species in GrowAI’s botanical collection, from quick sprouts to fruiting container crops.',
  microgreens: 'Fast-growing, nutrient-dense true-leaf greens harvested within 7–14 days on vertical light shelves.',
  sprouts: 'Nutrient-packed germinated seeds grown in moist darkness; includes Mung Bean, Broccoli, and Alfalfa sprouts.',
  'herbs-greens': 'Culinary and medicinal herbs providing continuous cut-and-come-again fresh kitchen harvests.',
  'vegetables-fruits': 'High-yield compact crops like cherry tomatoes and radishes calibrated for container root volumes.',
  'indoor-decorative': 'Resilient architectural foliage selected for air biophilia and low-maintenance indoor spaces.',
};

export function PlantLibraryClient({
  initialPlants,
  initialCategories,
}: PlantLibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredPlants = useMemo(() => {
    return initialPlants.filter((plant) => {
      // Search filter
      const matchesSearch =
        plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.summary.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || plant.category === selectedCategory;

      // Environment filter
      const matchesEnvironment =
        selectedEnvironment === 'all' ||
        plant.environments.includes(selectedEnvironment as GrowingEnvironment);

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        plant.difficulty.level === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesEnvironment && matchesDifficulty;
    });
  }, [initialPlants, searchQuery, selectedCategory, selectedEnvironment, selectedDifficulty]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedEnvironment !== 'all' ||
    selectedDifficulty !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEnvironment('all');
    setSelectedDifficulty('all');
  };

  // Helper for rendering difficulty dots
  const renderDifficultyScore = (score: number) => {
    return (
      <div className="flex items-center gap-1" title={`Difficulty Score: ${score}/5`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= score ? 'bg-[#144229]' : 'bg-[#ded5c5]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="Plant Library & Botanical Index"
        subtitle={`${initialPlants.length} curated balcony, indoor, and vertical species with verified agronomic parameters.`}
        actionHref="/app/planner"
        actionLabel="Arrange on Rack"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* =========================================================
            1. PAGE HERO & INTRODUCTION
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229] flex items-center gap-2">
                <Sprout size={16} />
                Botanical Herbarium
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#071c11] tracking-tight">
                Curated Species for Balcony & Vertical Gardens
              </h1>
              <p className="text-base text-[#2e4435] leading-relaxed max-w-3xl">
                Explore verified plant profiles optimized for container depths, vertical shelves, and home lighting. Each profile details growing parameters, phytochemicals, and safety guidance.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-[#f4f8f4] px-4 py-2.5 rounded-2xl border border-[#cfdfcf] text-[#144229]">
              <ShieldCheck size={20} className="text-[#144229]" />
              <span className="text-sm font-semibold">{initialPlants.length} Species Cataloged</span>
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a7662] block">
              Browse by Horticultural Category:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'bg-[#f7f5ed] text-[#2e4435] border border-[#ded5c5] hover:bg-white'
                }`}
              >
                All Plants ({initialPlants.length})
              </button>
              {initialCategories.map((cat) => {
                const count = initialPlants.filter((p) => p.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#144229] text-white shadow-xs'
                        : 'bg-[#f7f5ed] text-[#2e4435] border border-[#ded5c5] hover:bg-white'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Dynamic Friendly Category Description */}
            <p className="text-xs sm:text-sm text-[#5a7662] italic bg-[#fbf9f4] p-3 rounded-2xl border border-[#ded5c5]">
              🌿 {CATEGORY_DESCRIPTIONS[selectedCategory] || CATEGORY_DESCRIPTIONS.all}
            </p>
          </div>
        </section>

        {/* =========================================================
            2. SEARCH & REFINEMENT FILTERS
        ========================================================= */}
        <section className="bg-white p-5 rounded-3xl border border-[#ded5c5] shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor="plant-search-input" className="sr-only">
                Search plant library
              </label>
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a7662]"
              />
              <input
                id="plant-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by common name, genus, or keywords (e.g. Basil, Sprouts, Tomato)..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#071c11] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] placeholder:text-[#6a8472]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5a7662] hover:text-[#071c11] cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Growing Environment Filter */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <label htmlFor="environment-select" className="sr-only">
                Filter by Growing Environment
              </label>
              <select
                id="environment-select"
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-semibold text-[#071c11] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] cursor-pointer"
              >
                <option value="all">All Growing Environments</option>
                <option value="indoor">Indoor Friendly</option>
                <option value="balcony">Balcony Container</option>
                <option value="vertical-rack">Vertical Rack Shelf</option>
                <option value="windowsill">Windowsill</option>
                <option value="grow-tent">Grow Tent / Shelves</option>
              </select>

              {/* Difficulty Level Filter */}
              <label htmlFor="difficulty-select" className="sr-only">
                Filter by Difficulty Level
              </label>
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-semibold text-[#071c11] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] cursor-pointer"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="beginner">Beginner (1-2)</option>
                <option value="intermediate">Intermediate (3)</option>
                <option value="advanced">Advanced (4-5)</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 px-4 rounded-xl border border-[#ded5c5] text-xs sm:text-sm font-semibold text-[#9a3412] bg-[#fbeee9] hover:bg-[#f8d7cb] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <X size={15} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-[#5a7662] pt-2 border-t border-[#f0ebe0]">
            <span>
              Showing <strong>{filteredPlants.length}</strong> of {initialPlants.length} species
            </span>
            <span className="hidden sm:inline font-mono">
              Individual sprout and microgreen profiles separated
            </span>
          </div>
        </section>

        {/* =========================================================
            3. PLANT CARDS GRID
        ========================================================= */}
        {filteredPlants.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#ded5c5] text-center space-y-4 shadow-xs">
            <span className="w-14 h-14 rounded-2xl bg-[#f4f8f4] border border-[#cfe0cf] text-[#144229] flex items-center justify-center mx-auto shadow-2xs">
              <Search size={26} />
            </span>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#071c11]">
                No Matching Plants Found
              </h3>
              <p className="text-sm sm:text-base text-[#2e4435] max-w-md mx-auto leading-relaxed">
                No species matched your current filter criteria. Try clearing your filters or searching for terms like &ldquo;Basil&rdquo;, &ldquo;Sprouts&rdquo;, or &ldquo;Tomato&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] text-white px-5 py-2.5 rounded-xl min-h-[44px] cursor-pointer shadow-xs hover:bg-[#071c11] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-3xl border border-[#ded5c5] shadow-xs hover:border-[#144229]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Header / Specimen Header */}
                <div className="p-6 space-y-4">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="sage" size="sm">
                      {plant.category.replace('-', ' ')}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f7f5ed] border border-[#ded5c5] text-xs font-semibold text-[#144229]">
                        <span className="capitalize">{plant.difficulty.level}</span>
                        {renderDifficultyScore(plant.difficulty.score)}
                      </div>
                      {plant.badge && (
                        <span className="text-xs font-semibold text-[#9a3412] bg-[#fbeee9] px-2 py-0.5 rounded-full border border-[#f8d7cb]">
                          {plant.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botanical Names */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11] group-hover:text-[#144229] transition-colors leading-snug">
                      {plant.commonName}
                    </h3>
                    <p className="text-sm italic text-[#1b5837] font-serif mt-0.5">
                      {plant.scientificName}
                    </p>
                  </div>

                  {/* Beginner-friendly Summary Paragraph */}
                  <p className="text-sm text-[#2e4435] leading-relaxed line-clamp-3">
                    {plant.summary}
                  </p>

                  {/* Prioritized Key Botanical Agronomic Specifications */}
                  <div className="pt-3 border-t border-[#f0ebe0] space-y-2 text-xs sm:text-sm text-[#2e4435]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#5a7662] font-medium">
                        <Sun size={15} className="text-[#c77712]" /> Sunlight
                      </span>
                      <span className="font-semibold capitalize text-[#071c11]">
                        {plant.sunlight.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#5a7662] font-medium">
                        <Thermometer size={15} className="text-[#144229]" /> Temp Range
                      </span>
                      <span className="font-semibold text-[#071c11]">
                        {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#5a7662] font-medium">
                        <Clock size={15} className="text-[#144229]" /> Harvest Window
                      </span>
                      <span className="font-semibold text-[#071c11]">
                        {plant.timelines.harvestDays
                          ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} days`
                          : `${plant.timelines.maturityDays.min}–${plant.timelines.maturityDays.max} days`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#5a7662] font-medium">
                        <Layers size={15} className="text-[#2563eb]" /> Rack Placement
                      </span>
                      <span className="font-semibold capitalize text-[#144229] bg-[#eef5ee] px-2 py-0.5 rounded-lg border border-[#cfe0cf]">
                        {plant.verticalSuitability.recommendedTier} Shelf
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/app/plants/${plant.slug}`}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold bg-[#f4f8f4] group-hover:bg-[#144229] text-[#144229] group-hover:text-white py-2.5 rounded-xl border border-[#cfdfcf] group-hover:border-[#144229] transition-all shadow-2xs"
                  >
                    <span>View Botanical Profile</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
