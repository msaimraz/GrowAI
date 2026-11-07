'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CareBadge } from './CareBadge';
import { Plant } from '@/types/plant';
import { ArrowRight, Plus } from 'lucide-react';
import { PlantCategoryIcon } from '@/components/plants/PlantCategoryIcon';

interface PlantCardProps {
  plant: Plant;
  nickname?: string;
  stage?: string;
  nextAction?: string;
  hideScientific?: boolean;
  onAddClick?: (plant: Plant) => void;
  priority?: boolean;
}

export function PlantCard({
  plant,
  nickname,
  stage,
  nextAction,
  hideScientific = false,
  onAddClick,
  priority = false,
}: PlantCardProps) {
  // Determine friendly sunlight label
  const getSunlightLabel = (sun: string) => {
    if (sun.includes('full') || sun.includes('direct')) return 'Bright Sun';
    if (sun.includes('partial')) return 'Some Sun';
    return 'Low Light';
  };

  // Determine friendly water label
  const getWaterLabel = (water: { frequency?: string; guidance?: string; moistureLevel?: string } | string) => {
    const text = typeof water === 'string' ? water : `${water.moistureLevel || ''} ${water.frequency || ''}`;
    const lower = text.toLowerCase();
    if (lower.includes('high') || lower.includes('frequent')) {
      return 'High Water';
    }
    if (lower.includes('low') || lower.includes('dry')) {
      return 'Low Water';
    }
    return 'Moderate Water';
  };

  // Determine plant emoji based on category
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'sprouts':
        return '🌱';
      case 'microgreens':
        return '🌿';
      case 'herbs-greens':
        return '🌿';
      case 'vegetables-fruits':
        return '🍅';
      case 'indoor-decorative':
        return '🪴';
      default:
        return '🌱';
    }
  };

  const displayName = nickname || plant.commonName;

  return (
    <div className="group bg-white rounded-3xl border border-[#E8E4DA] hover:border-[#174C35]/30 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* 1. Large Plant Photo / Visual Header */}
      <Link href={`/app/plants/${plant.slug}`} className="block relative aspect-4/3 w-full bg-[#F3F6EC] overflow-hidden">
        {plant.imageUrl ? (
          <Image
            src={plant.imageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F0E3] to-[#FFF0D8] p-4 text-center">
            <span className="w-12 h-12 rounded-2xl bg-white/80 border border-[#CEE4C9] flex items-center justify-center text-[#174C35] mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <PlantCategoryIcon category={plant.category} size={24} />
            </span>
            <span className="text-xs font-mono text-[#68736B] uppercase tracking-wider">
              {plant.category.replace('-', ' ')}
            </span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          {stage ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/95 text-[#174C35] shadow-xs backdrop-blur-xs">
              {stage}
            </span>
          ) : (
            <CareBadge
              type="difficulty"
              label={plant.difficulty.level.charAt(0).toUpperCase() + plant.difficulty.level.slice(1)}
              size="sm"
              className="shadow-xs bg-white/95 backdrop-blur-xs border-white"
            />
          )}
        </div>

        {/* Quick Add Button if provided */}
        {onAddClick && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddClick(plant);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-[#174C35] active:scale-90 text-[#174C35] hover:text-white border border-[#E8E4DA] flex items-center justify-center shadow-xs transition-all duration-75 cursor-pointer select-none touch-manipulation"
            title={`Add ${displayName} to garden`}
            aria-label={`Add ${displayName} to garden`}
          >
            <Plus size={16} />
          </button>
        )}
      </Link>

      {/* 2. Plant Identification & Badges */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3.5">
        <div>
          <Link href={`/app/plants/${plant.slug}`} className="block group-hover:text-[#174C35] active:scale-[0.99] transition-all">
            <h3 className="font-serif text-base sm:text-xl font-bold text-[#1F2A23] leading-snug line-clamp-2 flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-[#E6F0E3] text-[#174C35] shrink-0 inline-flex items-center justify-center">
                <PlantCategoryIcon category={plant.category} size={14} />
              </span>
              <span>{displayName}</span>
            </h3>
            {!hideScientific && plant.scientificName && (
              <p className="text-xs text-[#68736B] italic font-serif mt-0.5 line-clamp-1">
                {plant.scientificName}
              </p>
            )}
          </Link>
        </div>

        {/* Care Badges (Sun & Water) */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <CareBadge
            type="sun"
            label={getSunlightLabel(plant.sunlight)}
            size="sm"
          />
          <CareBadge
            type="water"
            label={getWaterLabel(plant.watering)}
            size="sm"
          />
        </div>

        {/* 3. Action Footer */}
        <div className="pt-2.5 border-t border-[#F3F6EC] flex items-center justify-between">
          <span className="text-xs text-[#68736B] font-medium">
            {nextAction || (plant.timelines?.maturityDays?.max
              ? `${plant.timelines.maturityDays.max}d cycle`
              : 'Container ready')}
          </span>
          <Link
            href={`/app/plants/${plant.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#174C35] group-hover:translate-x-0.5 active:scale-95 transition-all select-none touch-manipulation"
          >
            <span>Explore</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
