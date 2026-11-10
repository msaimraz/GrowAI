'use client';

import React from 'react';
import Link from 'next/link';
import { CareBadge } from './CareBadge';
import { GrowthStageBadge } from './GrowthStageBadge';
import { Plant } from '@/types/plant';
import { ArrowRight, Plus } from 'lucide-react';
import { PlantCategoryIcon } from '@/components/plants/PlantCategoryIcon';
import { PlantImage } from '@/components/plants/PlantImage';

interface PlantCardProps {
  plant: Plant;
  nickname?: string;
  stage?: string;
  nextAction?: string;
  latestObservation?: string;
  timelinePreview?: string[];
  hideScientific?: boolean;
  onAddClick?: (plant: Plant) => void;
  priority?: boolean;
}

export function PlantCard({
  plant,
  nickname,
  stage,
  nextAction,
  latestObservation,
  timelinePreview,
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

  const displayName = nickname || plant.commonName;

  return (
    <div className="group bg-white rounded-3xl border border-[#E3DFD2] hover:border-[#174C35]/35 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* 1. Real Plant Botanical Photo (40-50% Card Height) */}
      <Link
        href={`/app/plants/${plant.slug}`}
        className="block relative aspect-4/3 w-full bg-[#EAF1E4] overflow-hidden"
      >
        <PlantImage
          src={plant.imageUrl || `/plants/${plant.slug}.webp`}
          alt={displayName}
          category={plant.category}
          aspectRatio="4/3"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imageClassName="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Semantic Growth Stage or Difficulty Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
          {stage ? (
            <GrowthStageBadge stage={stage} size="sm" className="shadow-xs backdrop-blur-xs" />
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
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 hover:bg-[#174C35] active:scale-90 text-[#174C35] hover:text-white border border-[#E3DFD2] flex items-center justify-center shadow-xs transition-all duration-75 cursor-pointer select-none touch-manipulation z-10"
            title={`Add ${displayName} to garden`}
            aria-label={`Add ${displayName} to garden`}
          >
            <Plus size={16} />
          </button>
        )}
      </Link>

      {/* 2. Plant Identification & Contextual Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <Link
            href={`/app/plants/${plant.slug}`}
            className="block group-hover:text-[#174C35] active:scale-[0.99] transition-all"
          >
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#203027] group-hover:text-[#174C35] leading-snug line-clamp-2 flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-[#EAF1E4] text-[#174C35] shrink-0 inline-flex items-center justify-center">
                <PlantCategoryIcon category={plant.category} size={14} />
              </span>
              <span>{displayName}</span>
            </h3>
            {!hideScientific && plant.scientificName && (
              <p className="text-xs text-[#68766C] italic font-serif mt-0.5 line-clamp-1">
                {plant.scientificName}
              </p>
            )}
          </Link>

          {/* Care Badges (Sun & Water) */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
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

          {/* Plant Observation Progress */}
          {latestObservation ? (
            <div className="text-xs text-[#203027] bg-[#EAF1E4]/70 p-2.5 rounded-xl border border-[#E3DFD2] space-y-0.5 mt-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#68766C] block font-semibold">
                Latest Observation
              </span>
              <p className="line-clamp-2 text-[#203027] font-medium leading-relaxed">
                {latestObservation}
              </p>
            </div>
          ) : stage ? (
            <p className="text-xs text-[#68766C] italic pt-1">
              Start tracking your plant’s growth.
            </p>
          ) : null}

          {/* Growth Timeline Preview if available */}
          {timelinePreview && timelinePreview.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#174C35] pt-1 overflow-x-auto scrollbar-none">
              {timelinePreview.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[#78A95A]/70">→</span>}
                  <span className="bg-[#EAF1E4] text-[#174C35] px-2 py-0.5 rounded-md whitespace-nowrap text-[10px]">
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* 3. Action Footer */}
        <div className="pt-2.5 border-t border-[#E3DFD2] flex items-center justify-between">
          <span className="text-xs text-[#68766C] font-medium truncate max-w-[65%]">
            {nextAction || (plant.timelines?.maturityDays?.max
              ? `${plant.timelines.maturityDays.max}d cycle`
              : 'Container ready')}
          </span>
          <Link
            href={`/app/plants/${plant.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#174C35] group-hover:text-[#123E2A] group-hover:translate-x-0.5 active:scale-95 transition-all select-none touch-manipulation shrink-0"
          >
            <span>Explore</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
