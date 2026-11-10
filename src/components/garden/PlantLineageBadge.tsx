'use client';

import React from 'react';
import { UserPlant, PropagationMethod } from '@/types/garden';
import { GitFork, Sprout, ArrowRight, Sparkles } from 'lucide-react';

interface PlantLineageBadgeProps {
  currentPlant: UserPlant;
  allPlants: UserPlant[];
  onSelectPlant: (plantId: string) => void;
  onOpenPropagationModal: () => void;
}

const METHOD_LABELS: Record<PropagationMethod, string> = {
  seed: 'Harvested Seed',
  cutting: 'Stem Cutting',
  division: 'Root Division',
  runner: 'Daughter Runner',
  layering: 'Layering',
  nursery_transplant: 'Nursery Transplant',
};

export function PlantLineageBadge({
  currentPlant,
  allPlants,
  onSelectPlant,
  onOpenPropagationModal,
}: PlantLineageBadgeProps) {
  // 1. Identify Parent Plant
  const parentPlant = currentPlant.parentPlantId
    ? allPlants.find((p) => p.id === currentPlant.parentPlantId)
    : null;

  // 2. Identify Offspring (Children)
  const offspring = allPlants.filter((p) => p.parentPlantId === currentPlant.id);

  const hasPropagationRecord = Boolean(currentPlant.propagationMethod);
  const isParentArchived = Boolean(
    !parentPlant && currentPlant.parentPlantId !== undefined && currentPlant.parentPlantId !== null
  );

  return (
    <div className="space-y-3 pt-2">
      {/* Parent Lineage Banner */}
      {parentPlant && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#174C35] text-white">
              <GitFork size={13} className="rotate-180" />
            </span>
            <div>
              <p className="font-semibold text-[#174C35]">
                Propagated from Mother Plant
              </p>
              <p className="text-[#174C35]">
                Method: <span className="font-medium text-[#174C35]">{METHOD_LABELS[currentPlant.propagationMethod || 'cutting']}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectPlant(parentPlant.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#174C35] hover:bg-[#174C35] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <span>View {parentPlant.nickname}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* When Parent is archived/deleted, accurately display state */}
      {isParentArchived && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8F6EE] border border-[#E3DFD2] text-xs text-[#68766C]">
          <GitFork size={13} className="rotate-180 text-[#8A6400]" />
          <span>
            Propagated via <strong className="font-semibold">{METHOD_LABELS[currentPlant.propagationMethod || 'cutting']}</strong> (Parent specimen was previously archived)
          </span>
        </div>
      )}

      {/* Offspring Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#ffffff] border border-[#E3DFD2] text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#EAF1E4] text-[#174C35]">
            <Sprout size={14} />
          </span>
          <div>
            <p className="font-semibold text-[#203027]">
              Plant Lineage & Offspring
            </p>
            <p className="text-[#68766C]">
              {offspring.length === 0
                ? 'No active daughter plants propagated from this specimen yet.'
                : `${offspring.length} active offspring registered in your garden.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPropagationModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#174C35] hover:bg-[#174C35] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer min-h-[34px]"
        >
          <Sparkles size={13} />
          <span>Propagate Specimen</span>
        </button>
      </div>

      {/* Offspring Chips */}
      {offspring.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-[11px] font-semibold text-[#68766C] uppercase tracking-wider mr-1">
            Daughter Plants:
          </span>
          {offspring.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectPlant(child.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF1E4] hover:bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] text-xs font-medium transition-colors cursor-pointer"
            >
              <Sprout size={11} className="text-[#174C35]" />
              <span>{child.nickname}</span>
              <span className="text-[10px] text-[#68766C]">
                ({child.currentStage})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
