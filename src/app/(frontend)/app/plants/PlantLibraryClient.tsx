'use client';

import React, { useState, useMemo } from 'react';
import { Plant, CategoryMetadata } from '@/types/plant';
import { PlantCard } from '@/components/ui/PlantCard';
import { FriendlyEmptyState } from '@/components/ui/FriendlyEmptyState';
import { AddToGardenModal } from '@/components/plants/AddToGardenModal';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { PlantCategoryIcon } from '@/components/plants/PlantCategoryIcon';

interface PlantLibraryClientProps {
  initialPlants: Plant[];
  initialCategories: CategoryMetadata[];
}

const ICON_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'edible', label: 'Edible' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'leafy', label: 'Leafy' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'beginner', label: 'Beginner' },
];

export function PlantLibraryClient({
  initialPlants,
}: PlantLibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [plantToAddToGarden, setPlantToAddToGarden] = useState<Plant | null>(null);

  const normalizedPlants = useMemo(() => {
    return initialPlants.map((plant) => ({
      ...plant,
      imageUrl: plant.imageUrl || `/plants/${plant.slug}.webp`,
    }));
  }, [initialPlants]);

  const filteredPlants = useMemo(() => {
    return normalizedPlants.filter((plant) => {
      // 1. Text Search Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        plant.commonName.toLowerCase().includes(q) ||
        plant.scientificName.toLowerCase().includes(q) ||
        plant.summary.toLowerCase().includes(q);

      // 2. Icon Category Filter
      let matchesCategory = true;
      if (selectedCategory === 'edible') {
        matchesCategory =
          plant.category === 'vegetables-fruits' ||
          plant.category === 'herbs-greens' ||
          plant.category === 'microgreens' ||
          plant.slug.includes('sprout');
      } else if (selectedCategory === 'herbs') {
        matchesCategory =
          plant.category === 'herbs-greens' ||
          plant.slug.includes('basil') ||
          plant.slug.includes('mint') ||
          plant.slug.includes('coriander') ||
          plant.slug.includes('rosemary') ||
          plant.slug.includes('lemongrass');
      } else if (selectedCategory === 'leafy') {
        matchesCategory =
          plant.slug.includes('lettuce') ||
          plant.slug.includes('spinach') ||
          plant.slug.includes('chard') ||
          plant.category === 'microgreens';
      } else if (selectedCategory === 'flowers') {
        matchesCategory =
          plant.category === 'flowering' ||
          plant.slug.includes('marigold') ||
          plant.slug.includes('zinnia');
      } else if (selectedCategory === 'indoor') {
        matchesCategory =
          plant.category === 'indoor-decorative' ||
          plant.environments.some((e) => e.includes('indoor') || e.includes('windowsill'));
      } else if (selectedCategory === 'balcony') {
        matchesCategory = plant.environments.some(
          (e) => e.includes('balcony') || e.includes('patio') || e.includes('rack')
        );
      } else if (selectedCategory === 'beginner') {
        matchesCategory =
          plant.difficulty.level === 'beginner' ||
          plant.difficulty.level.toLowerCase() === 'easy';
      }

      // 3. Optional Environment Filter
      const matchesEnvironment =
        selectedEnvironment === 'all' ||
        plant.environments.some((e) => e.toLowerCase().includes(selectedEnvironment));

      // 4. Optional Difficulty Filter
      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        plant.difficulty.level.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesEnvironment && matchesDifficulty;
    });
  }, [normalizedPlants, searchQuery, selectedCategory, selectedEnvironment, selectedDifficulty]);

  const hasAdvancedFilters = selectedEnvironment !== 'all' || selectedDifficulty !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEnvironment('all');
    setSelectedDifficulty('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EE] text-[#203027]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🌱</span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#203027] tracking-tight">
              Plant Library
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#5F6D63]">
            Find your next plant 🌱 Explore container-friendly herbs, greens, and vegetables.
          </p>
        </div>

        {/* Large Friendly Search Box + Filter Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5F6D63]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tomato, basil, mint..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl border border-[#E3DFD2] bg-white text-sm sm:text-base text-[#203027] placeholder:text-[#5F6D63]/70 shadow-xs focus:outline-hidden focus:border-[#174C35] focus:ring-2 focus:ring-[#174C35]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#5F6D63] hover:text-[#203027] cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Simple Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={`h-12 px-4 rounded-2xl border text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              hasAdvancedFilters || showAdvancedFilters
                ? 'bg-[#EAF1E4] border-[#174C35] text-[#174C35]'
                : 'bg-white border-[#E3DFD2] text-[#5F6D63] hover:text-[#203027]'
            }`}
            aria-label="Toggle advanced filters"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {hasAdvancedFilters && (
              <span className="w-2 h-2 rounded-full bg-[#174C35]" />
            )}
          </button>
        </div>

        {/* Compact Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-white border border-[#E3DFD2] shadow-xs flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-medium text-[#5F6D63]">
              <span>Space:</span>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-[#F8F6EE] text-xs font-semibold text-[#203027] cursor-pointer"
              >
                <option value="all">Any Space</option>
                <option value="indoor">Indoor Friendly</option>
                <option value="balcony">Balcony Container</option>
                <option value="rack">Vertical Rack</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#5F6D63]">
              <span>Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E3DFD2] bg-[#F8F6EE] text-xs font-semibold text-[#203027] cursor-pointer"
              >
                <option value="all">Any Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {hasAdvancedFilters && (
              <button
                type="button"
                onClick={() => {
                  setSelectedEnvironment('all');
                  setSelectedDifficulty('all');
                }}
                className="text-xs text-[#E4775D] hover:underline cursor-pointer ml-auto font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Icon Categories — Horizontal Scrollable Tray */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ICON_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 cursor-pointer select-none touch-manipulation min-h-[38px] ${
                  isSelected
                    ? 'bg-[#174C35] text-white shadow-xs'
                    : 'bg-white hover:bg-[#EAF1E4] text-[#203027] border border-[#E3DFD2]'
                }`}
              >
                <PlantCategoryIcon
                  category={cat.id}
                  size={15}
                  className={isSelected ? 'text-[#78A95A]' : 'text-[#174C35]'}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Result Count Status */}
        <div className="flex items-center justify-between text-xs text-[#5F6D63] px-1 font-mono">
          <span>
            {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
          </span>
          {(searchQuery || selectedCategory !== 'all' || hasAdvancedFilters) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#174C35] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Plant Cards Grid */}
        {filteredPlants.length === 0 ? (
          <FriendlyEmptyState
            emoji="🔍"
            title="No matching plants found"
            description="We couldn't find any plants matching your search. Try searching for 'tomato', 'basil', or clearing your filters."
            actionLabel="View All Plants"
            onActionClick={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredPlants.map((plant, idx) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                priority={idx < 4}
                onAddClick={(p) => setPlantToAddToGarden(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Add To Garden Modal */}
      {plantToAddToGarden && (
        <AddToGardenModal
          plant={plantToAddToGarden}
          isOpen={true}
          onClose={() => setPlantToAddToGarden(null)}
        />
      )}
    </div>
  );
}
