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
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f4f8f4] border border-[#d2e4d4] text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#257a4d] text-white">
              <GitFork size={13} className="rotate-180" />
            </span>
            <div>
              <p className="font-semibold text-[#144229]">
                Propagated from Mother Plant
              </p>
              <p className="text-[#3c5d46]">
                Method: <span className="font-medium text-[#144229]">{METHOD_LABELS[currentPlant.propagationMethod || 'cutting']}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectPlant(parentPlant.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#144229] hover:bg-[#1e663f] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <span>View {parentPlant.nickname}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* When Parent is archived/deleted, accurately display state */}
      {isParentArchived && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#fdfaf3] border border-[#f0e4cf] text-xs text-[#6e5634]">
          <GitFork size={13} className="rotate-180 text-[#9e763b]" />
          <span>
            Propagated via <strong className="font-semibold">{METHOD_LABELS[currentPlant.propagationMethod || 'cutting']}</strong> (Parent specimen was previously archived)
          </span>
        </div>
      )}

      {/* Offspring Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#ffffff] border border-[#e4dcce] text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#eef5ee] text-[#1b5837]">
            <Sprout size={14} />
          </span>
          <div>
            <p className="font-semibold text-[#1c261e]">
              Plant Lineage & Offspring
            </p>
            <p className="text-[#526a57]">
              {offspring.length === 0
                ? 'No active daughter plants propagated from this specimen yet.'
                : `${offspring.length} active offspring registered in your garden.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPropagationModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#144229] hover:bg-[#1e663f] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer min-h-[34px]"
        >
          <Sparkles size={13} />
          <span>Propagate Specimen</span>
        </button>
      </div>

      {/* Offspring Chips */}
      {offspring.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-[11px] font-semibold text-[#526a57] uppercase tracking-wider mr-1">
            Daughter Plants:
          </span>
          {offspring.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectPlant(child.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef5ee] hover:bg-[#d8e9d8] border border-[#c4dec4] text-[#144229] text-xs font-medium transition-colors cursor-pointer"
            >
              <Sprout size={11} className="text-[#257a4d]" />
              <span>{child.nickname}</span>
              <span className="text-[10px] text-[#526a57]">
                ({child.currentStage})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
