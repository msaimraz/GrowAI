'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

interface PlantLibraryClientProps {
  initialPlants: Plant[];
  initialCategories: CategoryMetadata[];
}

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

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="Plant Library & Botanical Index"
        subtitle={`${initialPlants.length} curated balcony, indoor, and vertical species with verified agronomic parameters.`}
        actionHref="/app/planner"
        actionLabel="Arrange on Rack"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#144229] text-white shadow-xs'
                : 'bg-white text-[#2e4435] border border-[#ded5c5] hover:bg-[#f4f8f4]'
            }`}
          >
            All Categories ({initialPlants.length})
          </button>
          {initialCategories.map((cat) => {
            const count = initialPlants.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'bg-white text-[#2e4435] border border-[#ded5c5] hover:bg-[#f4f8f4]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Refinement Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded5c5] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
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
                placeholder="Search common name, botanical genus (e.g. Basil, Tomato, Spinach)..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#071c11] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837] placeholder:text-[#6a8472]"
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

            {/* Environment Dropdown */}
            <label htmlFor="environment-select" className="sr-only">
              Filter by Growing Environment
            </label>
            <select
              id="environment-select"
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="h-11 px-3.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#1b5837] cursor-pointer"
            >
              <option value="all">Any Environment</option>
              <option value="vertical-rack">Vertical Rack</option>
              <option value="balcony">Balcony</option>
              <option value="indoor">Indoor</option>
              <option value="patio">Patio</option>
            </select>

            {/* Difficulty Dropdown */}
            <label htmlFor="difficulty-select" className="sr-only">
              Filter by Difficulty
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-11 px-3.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#1b5837] cursor-pointer"
            >
              <option value="all">Any Difficulty</option>
              <option value="beginner">Beginner Friendly</option>
              <option value="intermediate">Intermediate Care</option>
              <option value="advanced">Advanced</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 px-4 rounded-xl border border-[#e2dbce] bg-[#f7f5ed] hover:bg-[#ede7da] text-xs sm:text-sm font-semibold text-[#2e4435] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#2e4435] pt-1">
            <span>
              Showing <strong className="text-[#071c11]">{filteredPlants.length}</strong> of{' '}
              {initialPlants.length} verified plants
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#144229]">
              <ShieldCheck size={16} />
              Peer-Reviewed Botanical Records
            </span>
          </div>
        </div>

        {/* Plants Grid */}
        {filteredPlants.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#ded5c5] text-center space-y-3">
            <span className="w-12 h-12 rounded-full bg-[#f4f8f4] text-[#144229] flex items-center justify-center mx-auto">
              <Search size={22} />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#071c11]">
              No Matching Plants Found
            </h3>
            <p className="text-sm text-[#2e4435] max-w-md mx-auto">
              No plants matched your current search filters. Try clearing your filters or searching for terms like &ldquo;herb&rdquo;, &ldquo;tomato&rdquo;, or &ldquo;lettuce&rdquo;.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#144229] text-white px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Category and Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="sage" size="sm">
                      {plant.category.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cfe0cf] capitalize">
                        {plant.difficulty.level}
                      </span>
                      {plant.badge && (
                        <span className="text-xs font-semibold text-[#9a3412] bg-[#fbeee9] px-2.5 py-0.5 rounded-full border border-[#f8d7cb]">
                          {plant.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Scientific Name */}
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#071c11] group-hover:text-[#1b5837] transition-colors">
                      {plant.commonName}
                    </h3>
                    <p className="text-sm italic text-[#2e4435] font-sans mt-0.5">
                      {plant.scientificName}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-[#2e4435] leading-relaxed line-clamp-2">
                    {plant.summary}
                  </p>

                  {/* Key Botanical Specifications */}
                  <div className="pt-3 border-t border-[#f0ebe0] space-y-2 text-sm text-[#2e4435]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3e5644] font-medium">
                        <Thermometer size={15} /> Temp Range
                      </span>
                      <span className="font-semibold text-[#071c11]">
                        {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3e5644] font-medium">
                        <Sun size={15} /> Sunlight
                      </span>
                      <span className="font-semibold capitalize text-[#071c11]">
                        {plant.sunlight.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3e5644] font-medium">
                        <Clock size={15} /> Harvest Window
                      </span>
                      <span className="font-semibold text-[#071c11]">
                        {plant.timelines.harvestDays
                          ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} days`
                          : `${plant.timelines.maturityDays.min}–${plant.timelines.maturityDays.max} days`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3e5644] font-medium">
                        <Layers size={15} /> Vertical Rack Tier
                      </span>
                      <span className="font-semibold capitalize text-[#144229]">
                        {plant.verticalSuitability.recommendedTier} Shelf
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/app/plants/${plant.slug}`}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold bg-[#f4f8f4] hover:bg-[#144229] text-[#144229] hover:text-white py-2.5 rounded-xl border border-[#cfdfcf] hover:border-[#144229] transition-all"
                  >
                    <span>View Detailed Botanical Profile</span>
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
