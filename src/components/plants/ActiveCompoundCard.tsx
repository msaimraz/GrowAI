'use client';

import React, { useState } from 'react';
import { ActiveCompound } from '@/types/plant';
import { Sparkles, MapPin, ChevronDown, ChevronUp, Atom, ShieldCheck, Microscope } from 'lucide-react';

interface ActiveCompoundCardProps {
  compound: ActiveCompound;
}

// Plain-English translations of complex phytochemical names for teenagers & beginners
const COMPOUND_PLAIN_EXPLANATIONS: Record<string, string> = {
  'Glucoraphanin':
    'A natural compound found in broccoli sprouts. When the plant is chopped or chewed, an enzyme can help convert it into sulforaphane.',
  'Sulforaphane':
    'A beneficial sulfur compound created when broccoli tissues are chewed. Researchers study its ability to turn on natural antioxidant defenses inside human cells.',
  'Rosmarinic Acid':
    'A fragrant antioxidant made by herbs like basil and mint to protect their green leaves against intense sunlight and insect damage.',
  'Eugenol':
    'The warm, spicy aromatic oil that gives sweet basil and cloves their distinctive scent. In nature, it acts as the plant’s personal insect deterrent.',
  'L-Canavanine':
    'A natural defense chemical found in raw legume seeds like alfalfa. As seeds sprout and are cooked, canavanine levels decrease significantly.',
  'Menthol':
    'A cool essential oil that activates cold-sensing receptors on the tongue and skin, creating an instant refreshing chill without changing actual temperature.',
  'Citral':
    'The intense citrus-scented oil in lemongrass that keeps hungry plant pests away while giving dishes a bright lemon aroma.',
  'Aloin':
    'A yellow, bitter sap located right under aloe leaf skin that wild plants produce to deter desert herbivores from eating their juicy water storage.',
  'Calcium Oxalate Crystals':
    'Microscopic needle-like crystals bundled inside plant cells that cause immediate mouth burning if chewed, protecting decorative plants from being eaten.',
  'Steroidal Saponins':
    'Natural protective compounds in snake plants that foam like soap in water and upset digestive tracts if ingested by pets or humans.',
  'Lycopene':
    'The deep red antioxidant pigment in tomatoes that acts like natural botanical sunscreen, protecting ripening fruit from harsh UV light.',
  'Lutein':
    'A brilliant yellow-green carotenoid pigment that helps plant leaves absorb light energy and supports human eye health by filtering blue light.',
  'Curcumin':
    'The vibrant golden compound in turmeric roots studied worldwide for its gentle cellular antioxidant and anti-inflammatory properties.',
};

export function ActiveCompoundCard({ compound }: ActiveCompoundCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Look for curated beginner explanation or craft a readable plain-English lead
  const plainExplanation =
    COMPOUND_PLAIN_EXPLANATIONS[compound.name] ||
    COMPOUND_PLAIN_EXPLANATIONS[compound.name.split(' ')[0]];

  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs hover:border-[#174C35]/40 transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Card Header: Compound name + Chemical Class */}
        <div className="flex flex-wrap items-start justify-between gap-2.5 pb-2.5 border-b border-[#E3DFD2]">
          <div className="space-y-1">
            <h4 className="text-lg sm:text-xl font-serif font-bold text-[#203027] flex items-center gap-2">
              <Sparkles size={18} className="text-[#F0C04D] shrink-0" />
              <span>{compound.name}</span>
            </h4>
            {compound.primaryLocation && (
              <p className="text-xs sm:text-sm text-[#5F6D63] font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-[#174C35] shrink-0" />
                <span>Found in: <strong className="text-[#203027] font-semibold">{compound.primaryLocation}</strong></span>
              </p>
            )}
          </div>

          {compound.chemicalClass && (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] font-medium self-start">
              {compound.chemicalClass}
            </span>
          )}
        </div>

        {/* Teen-Friendly / Beginner Plain-English Explanation */}
        {plainExplanation ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#174C35]">
              <Microscope size={14} className="text-[#174C35]" />
              <span>In Simple Terms:</span>
            </div>
            <p className="text-base text-[#203027] leading-relaxed">
              {plainExplanation}
            </p>
          </div>
        ) : (
          <p className="text-base text-[#203027] leading-relaxed">
            {compound.description}
          </p>
        )}

        {/* Studied Bioactivities Cluster */}
        {compound.studiedProperties && compound.studiedProperties.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6D63] block">
              What Scientists Study It For:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {compound.studiedProperties.map((prop) => (
                <span
                  key={prop}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] font-medium"
                >
                  <ShieldCheck size={13} className="text-[#174C35] shrink-0" />
                  <span>{prop}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable "Explore the science" Section */}
      <div className="pt-2.5 border-t border-[#E3DFD2]">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-xs sm:text-sm font-semibold text-[#174C35] hover:text-[#203027] flex items-center justify-between w-full cursor-pointer py-1 px-2 -mx-2 rounded-lg hover:bg-[#F8F6EE] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Atom size={16} className="text-[#174C35]" />
            <span>{isExpanded ? 'Hide scientific details' : 'Explore the science'}</span>
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] text-xs sm:text-sm text-[#203027] leading-relaxed space-y-2.5 animate-fadeIn">
            <div>
              <span className="font-bold text-[#203027] block mb-0.5">Scientific Biochemical Description:</span>
              <p className="text-[#203027] leading-relaxed">
                {compound.description}
              </p>
            </div>

            {compound.chemicalClass && (
              <p className="text-[#5F6D63]">
                <strong className="text-[#203027]">Chemical Family:</strong> {compound.chemicalClass}. Secondary plant metabolites synthesized for stress adaptation, pathogen defense, and cellular signaling.
              </p>
            )}

            <p className="text-[#5F6D63] pt-1 border-t border-[#E3DFD2]">
              <strong>Laboratory & Culinary Note:</strong> Natural concentrations of {compound.name} fluctuate with harvest timing, sunlight exposure, and temperature. For culinary species, food preparation methods like chopping, heat exposure, or steaming directly influence compound stability and systemic bioavailability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

