'use client';

import React, { useState } from 'react';
import { ActiveCompound } from '@/types/plant';
import { Sparkles, MapPin, ChevronDown, ChevronUp, Atom, ShieldCheck } from 'lucide-react';

interface ActiveCompoundCardProps {
  compound: ActiveCompound;
}

export function ActiveCompoundCard({ compound }: ActiveCompoundCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If description is long (>180 chars) or there are multiple properties, provide expandable depth
  const isDetailed = compound.description.length > 180 || (compound.studiedProperties && compound.studiedProperties.length > 2);

  return (
    <div className="bg-white rounded-2xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs hover:border-[#144229]/40 transition-all space-y-3.5 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Card Header: Compound name + Chemical Class */}
        <div className="flex flex-wrap items-start justify-between gap-2.5 pb-2 border-b border-[#f0ebe0]">
          <div className="space-y-1">
            <h4 className="text-lg sm:text-xl font-serif font-bold text-[#071c11] flex items-center gap-2">
              <Sparkles size={18} className="text-[#c77712] shrink-0" />
              <span>{compound.name}</span>
            </h4>
            {compound.primaryLocation && (
              <p className="text-xs sm:text-sm text-[#5a7662] font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-[#144229] shrink-0" />
                <span>Tissue Location: <strong className="text-[#2e4435] font-semibold">{compound.primaryLocation}</strong></span>
              </p>
            )}
          </div>

          {compound.chemicalClass && (
            <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-full bg-[#f4f8f4] border border-[#cfdfcf] text-[#144229] font-medium self-start">
              {compound.chemicalClass}
            </span>
          )}
        </div>

        {/* Primary Description (Minimum 16px body text) */}
        <p className="text-base text-[#1c261e] leading-relaxed">
          {compound.description}
        </p>

        {/* Studied Bioactivities Cluster */}
        {compound.studiedProperties && compound.studiedProperties.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a7662] block">
              Investigated Bioactivities:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {compound.studiedProperties.map((prop) => (
                <span
                  key={prop}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-[#eef5ee] border border-[#cfe0cf] text-[#144229] font-medium"
                >
                  <ShieldCheck size={13} className="text-[#144229] shrink-0" />
                  <span>{prop}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Pharmacological Context */}
      {isDetailed && (
        <div className="pt-2 border-t border-[#f0ebe0]">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs sm:text-sm font-semibold text-[#144229] hover:text-[#071c11] flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Atom size={15} />
            <span>{isExpanded ? 'Hide Molecular Details' : 'View Biochemical Context'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExpanded && (
            <div className="mt-2.5 p-3.5 bg-[#fbf9f4] rounded-xl border border-[#ded5c5] text-xs sm:text-sm text-[#2e4435] leading-relaxed space-y-1.5 animate-fadeIn">
              <p>
                <strong>Pharmacognostic Notes:</strong> Concentrations of {compound.name} vary dynamically based on plant growth phase, harvest age, environmental temperature, and post-harvest culinary preparation.
              </p>
              <p className="text-[#5a7662]">
                For culinary species, cooking methods (heat exposure, steaming, boiling) significantly alter compound stability, active enzyme hydrolysis, and human systemic bioavailability.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
