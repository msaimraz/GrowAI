'use client';

import React, { useState, useMemo } from 'react';
import { Plant, CategoryMetadata } from '@/types/plant';
import { PlantCard } from '@/components/ui/PlantCard';
import { FriendlyEmptyState } from '@/components/ui/FriendlyEmptyState';
import { AddToGardenModal } from '@/components/plants/AddToGardenModal';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';

interface PlantLibraryClientProps {
  initialPlants: Plant[];
  initialCategories: CategoryMetadata[];
}

interface CategoryFilterItem {
  id: string;
  label: string;
  emoji: string;
}

const ICON_CATEGORIES: CategoryFilterItem[] = [
  { id: 'all', label: 'All', emoji: '🌿' },
  { id: 'edible', label: 'Edible', emoji: '🍅' },
  { id: 'herbs', label: 'Herbs', emoji: '🌱' },
  { id: 'leafy', label: 'Leafy', emoji: '🥬' },
  { id: 'flowers', label: 'Flowers', emoji: '🌸' },
  { id: 'indoor', label: 'Indoor', emoji: '🏠' },
  { id: 'balcony', label: 'Balcony', emoji: '☀️' },
  { id: 'beginner', label: 'Beginner', emoji: '⭐' },
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

  const filteredPlants = useMemo(() => {
    return initialPlants.filter((plant) => {
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
  }, [initialPlants, searchQuery, selectedCategory, selectedEnvironment, selectedDifficulty]);

  const hasAdvancedFilters = selectedEnvironment !== 'all' || selectedDifficulty !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEnvironment('all');
    setSelectedDifficulty('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1F2A23]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🌱</span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2A23] tracking-tight">
              Plant Library
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#68736B]">
            Find your next plant 🌱 Explore container-friendly herbs, greens, and vegetables.
          </p>
        </div>

        {/* Large Friendly Search Box + Filter Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68736B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tomato, basil, mint..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl border border-[#E8E4DA] bg-white text-sm sm:text-base text-[#1F2A23] placeholder:text-[#68736B]/70 shadow-xs focus:outline-hidden focus:border-[#174C35] focus:ring-2 focus:ring-[#174C35]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#68736B] hover:text-[#1F2A23] cursor-pointer"
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
                ? 'bg-[#E6F0E3] border-[#174C35] text-[#174C35]'
                : 'bg-white border-[#E8E4DA] text-[#68736B] hover:text-[#1F2A23]'
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
          <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-medium text-[#68736B]">
              <span>Space:</span>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-[#FBF9F4] text-xs font-semibold text-[#1F2A23] cursor-pointer"
              >
                <option value="all">Any Space</option>
                <option value="indoor">Indoor Friendly</option>
                <option value="balcony">Balcony Container</option>
                <option value="rack">Vertical Rack</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#68736B]">
              <span>Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-[#FBF9F4] text-xs font-semibold text-[#1F2A23] cursor-pointer"
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
                className="text-xs text-[#A84A2A] hover:underline cursor-pointer ml-auto"
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer select-none min-h-[38px] ${
                  isSelected
                    ? 'bg-[#174C35] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F3F6EC] text-[#1F2A23] border border-[#E8E4DA]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Result Count Status */}
        <div className="flex items-center justify-between text-xs text-[#68736B] px-1 font-mono">
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
