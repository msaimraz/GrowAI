'use client';

import React from 'react';
import { Plant } from '@/types/plant';
import { ShieldCheck, Compass, Layers, Ruler, Maximize2 } from 'lucide-react';

interface BotanicalPlateProps {
  plant: Plant;
}

interface BotanicalTaxonomy {
  family: string;
  order: string;
  habit: string;
  phytogeography: string;
  specimenId: string;
}

const TAXONOMY_MAP: Record<string, BotanicalTaxonomy> = {
  'golden-pothos': {
    family: 'Araceae (Aroid Family)',
    order: 'Alismatales',
    habit: 'Climbing Perennial Epiphyte',
    phytogeography: 'Solomon Islands, South Pacific',
    specimenId: 'GA-BOT-001',
  },
  'snake-plant': {
    family: 'Asparagaceae (Agavoideae)',
    order: 'Asparagales',
    habit: 'Acaulescent Evergreen Succulent',
    phytogeography: 'Tropical West Africa (Nigeria to Congo)',
    specimenId: 'GA-BOT-002',
  },
  'butterhead-lettuce': {
    family: 'Asteraceae (Daisy Family)',
    order: 'Asterales',
    habit: 'Annual Rosetted Leafy Herb',
    phytogeography: 'Mediterranean & Central Asia',
    specimenId: 'GA-BOT-003',
  },
  'french-radish': {
    family: 'Brassicaceae (Mustard Family)',
    order: 'Brassicales',
    habit: 'Fast-Growing Annual Taproot & Greens',
    phytogeography: 'Central & Western Europe',
    specimenId: 'GA-BOT-004',
  },
  'mung-bean-sprouts': {
    family: 'Fabaceae (Legume Family)',
    order: 'Fabales',
    habit: 'Germinated Seedling (Hypocotyl & Cotyledons)',
    phytogeography: 'South & Southeast Asia',
    specimenId: 'GA-BOT-005',
  },
  'broccoli-sprouts': {
    family: 'Brassicaceae (Mustard Family)',
    order: 'Brassicales',
    habit: '3-Day Germinated Micro-Sprout (Rich in Glucoraphanin)',
    phytogeography: 'Mediterranean (Selective Horticultural Cultigen)',
    specimenId: 'GA-BOT-006',
  },
  'alfalfa-sprouts': {
    family: 'Fabaceae (Legume Family)',
    order: 'Fabales',
    habit: 'Germinated Forage Micro-Sprout',
    phytogeography: 'South-Central Asia (Ancient Fertile Crescent)',
    specimenId: 'GA-BOT-007',
  },
  'broccoli-microgreens': {
    family: 'Brassicaceae (Mustard Family)',
    order: 'Brassicales',
    habit: '10–14 Day True Leaf Seedling (Photosynthetic Canopy)',
    phytogeography: 'Global Contemporary Micro-Agriculture',
    specimenId: 'GA-BOT-008',
  },
  'tomato-bush': {
    family: 'Solanaceae (Nightshade Family)',
    order: 'Solanales',
    habit: 'Determinate Compact Shrub',
    phytogeography: 'Western South America (Andes)',
    specimenId: 'GA-BOT-009',
  },
  'cherry-tomato': {
    family: 'Solanaceae (Nightshade Family)',
    order: 'Solanales',
    habit: 'Compact Patio Nightshade',
    phytogeography: 'Ecuador & Peru',
    specimenId: 'GA-BOT-010',
  },
  'spinach': {
    family: 'Amaranthaceae (Amaranth Family)',
    order: 'Caryophyllales',
    habit: 'Cool-Season Annual Rosette',
    phytogeography: 'Ancient Persia (Southwestern Asia)',
    specimenId: 'GA-BOT-011',
  },
  'spearmint': {
    family: 'Lamiaceae (Mint Family)',
    order: 'Lamiales',
    habit: 'Spreading Stoloniferous Aromatic Herb',
    phytogeography: 'Europe & Temperate Asia',
    specimenId: 'GA-BOT-012',
  },
  'genovese-basil': {
    family: 'Lamiaceae (Mint Family)',
    order: 'Lamiales',
    habit: 'Tender Aromatic Annual Herb',
    phytogeography: 'Central Africa to Southeast Asia',
    specimenId: 'GA-BOT-013',
  },
  'coriander': {
    family: 'Apiaceae (Celery Family)',
    order: 'Apiales',
    habit: 'Annual Herb with Dissected Foliage',
    phytogeography: 'Southern Europe & North Africa',
    specimenId: 'GA-BOT-014',
  },
  'aloe-vera': {
    family: 'Asphodelaceae (Aloe Family)',
    order: 'Asparagales',
    habit: 'Succulent Stemless Rosette',
    phytogeography: 'Arabian Peninsula',
    specimenId: 'GA-BOT-015',
  },
  'holy-basil-tulsi': {
    family: 'Lamiaceae (Mint Family)',
    order: 'Lamiales',
    habit: 'Perennial Aromatic Subshrub',
    phytogeography: 'Indian Subcontinent & Southeast Asia',
    specimenId: 'GA-BOT-016',
  },
  'french-marigold': {
    family: 'Asteraceae (Daisy Family)',
    order: 'Asterales',
    habit: 'Bushy Annual Composite Herb',
    phytogeography: 'Mexico & Central America',
    specimenId: 'GA-BOT-017',
  },
  'dwarf-zinnia': {
    family: 'Asteraceae (Daisy Family)',
    order: 'Asterales',
    habit: 'Compact Free-Flowering Annual',
    phytogeography: 'Southwestern United States & Mexico',
    specimenId: 'GA-BOT-018',
  },
  'lemongrass': {
    family: 'Poaceae (True Grass Family)',
    order: 'Poales',
    habit: 'Caespitose Tropical Perennial Grass',
    phytogeography: 'Maritime Southeast Asia',
    specimenId: 'GA-BOT-019',
  },
};

export function BotanicalPlate({ plant }: BotanicalPlateProps) {
  const taxonomy = TAXONOMY_MAP[plant.slug] || {
    family: 'Plantae (Vascular Plant)',
    order: 'Magnoliophyta',
    habit: 'Cultivated Botanical Specimen',
    phytogeography: 'Temperate & Subtropical Regions',
    specimenId: `GA-BOT-${plant.id.padStart(3, '0')}`,
  };

  // Determine botanical plate artwork style by plant category / slug
  const getBotanicalIcon = () => {
    if (plant.slug.includes('sprout')) {
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto text-[#144229]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Sprout seed and radical shoots */}
          <ellipse cx="80" cy="115" rx="14" ry="10" className="fill-[#eef5ee] stroke-[#144229]" />
          <path d="M80 105 Q 80 65 60 45" strokeWidth="3" />
          <path d="M80 80 Q 95 60 108 50" strokeWidth="2.5" />
          {/* Left cotyledon */}
          <path d="M60 45 C 50 35 35 45 45 55 C 55 60 60 45 60 45 Z" className="fill-[#cce4cc] stroke-[#144229]" />
          {/* Right cotyledon */}
          <path d="M108 50 C 118 40 130 50 120 60 C 112 65 108 50 108 50 Z" className="fill-[#cce4cc] stroke-[#144229]" />
          {/* Hypocotyl curve */}
          <path d="M80 125 Q 75 140 85 148" strokeWidth="2" strokeDasharray="3 3" className="text-[#3d7a5a]" />
        </svg>
      );
    }

    if (plant.slug === 'golden-pothos') {
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto text-[#144229]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Cascading vine */}
          <path d="M40 25 Q 80 40 75 80 T 110 140" strokeWidth="2.5" className="text-[#3d7a5a]" />
          {/* Heart shaped variegated leaf 1 */}
          <path d="M75 55 C 60 40 40 50 48 68 C 55 80 75 88 75 88 C 75 88 95 80 102 68 C 110 50 90 40 75 55 Z" className="fill-[#e2ede2] stroke-[#144229]" />
          <path d="M75 55 L 75 88" strokeWidth="1.5" className="text-[#144229]" />
          <path d="M75 65 Q 65 68 58 64" strokeWidth="1" className="text-[#3d7a5a]" />
          <path d="M75 75 Q 85 78 92 74" strokeWidth="1" className="text-[#3d7a5a]" />
          {/* Secondary lower leaf */}
          <path d="M110 105 C 100 95 85 102 90 115 C 95 125 110 130 110 130 C 110 130 125 125 130 115 C 135 102 120 95 110 105 Z" className="fill-[#d4ebd4] stroke-[#144229]" />
        </svg>
      );
    }

    if (plant.slug === 'snake-plant') {
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto text-[#144229]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Upright sword succulent blades */}
          <path d="M70 145 C 65 95 62 45 70 20 C 78 45 75 95 70 145 Z" className="fill-[#d4ebd4] stroke-[#144229]" strokeWidth="2.5" />
          <path d="M90 145 C 88 100 92 55 88 32 C 98 55 102 100 90 145 Z" className="fill-[#e2ede2] stroke-[#144229]" strokeWidth="2.5" />
          <path d="M52 145 C 50 110 50 75 54 50 C 60 75 62 110 52 145 Z" className="fill-[#cce4cc] stroke-[#144229]" strokeWidth="2" />
          <path d="M108 145 C 110 115 110 85 106 62 C 100 85 98 115 108 145 Z" className="fill-[#cce4cc] stroke-[#144229]" strokeWidth="2" />
          {/* Variegation bands */}
          <line x1="66" y1="50" x2="74" y2="52" strokeWidth="1.5" className="text-[#3d7a5a]" />
          <line x1="65" y1="75" x2="75" y2="77" strokeWidth="1.5" className="text-[#3d7a5a]" />
          <line x1="86" y1="65" x2="94" y2="67" strokeWidth="1.5" className="text-[#3d7a5a]" />
          <line x1="85" y1="95" x2="95" y2="97" strokeWidth="1.5" className="text-[#3d7a5a]" />
        </svg>
      );
    }

    if (plant.slug === 'french-radish') {
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto text-[#144229]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Radish cylindrical taproot */}
          <path d="M72 80 C 72 70 88 70 88 80 L 86 122 C 86 128 80 134 80 138 C 80 134 74 128 74 122 Z" className="fill-[#fde8e8] stroke-[#991b1b]" strokeWidth="2.5" />
          {/* Scarlet top half */}
          <path d="M72 80 C 72 70 88 70 88 80 L 87 105 L 73 105 Z" className="fill-[#ef4444] stroke-[#991b1b]" strokeWidth="2" />
          {/* Root tip tap hair */}
          <path d="M80 138 Q 80 152 84 156" strokeWidth="1.5" className="text-[#991b1b]" />
          {/* Rosetted foliage leaves */}
          <path d="M80 72 Q 60 50 48 38 C 58 35 68 45 74 65" className="fill-[#d4ebd4] stroke-[#144229]" strokeWidth="2" />
          <path d="M80 72 Q 100 50 112 38 C 102 35 92 45 86 65" className="fill-[#d4ebd4] stroke-[#144229]" strokeWidth="2" />
          <path d="M80 72 Q 80 38 80 25 C 84 32 86 45 82 65" className="fill-[#cce4cc] stroke-[#144229]" strokeWidth="2" />
        </svg>
      );
    }

    // Default botanical branch/leaf
    return (
      <svg viewBox="0 0 160 160" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto text-[#144229]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M80 145 C 80 100 80 50 80 25" strokeWidth="3" className="text-[#3d7a5a]" />
        {/* Leaf 1 left */}
        <path d="M80 115 C 60 105 45 110 40 120 C 45 130 65 125 80 122" className="fill-[#d4ebd4] stroke-[#144229]" strokeWidth="2" />
        {/* Leaf 2 right */}
        <path d="M80 95 C 100 85 115 90 120 100 C 115 110 95 105 80 102" className="fill-[#e2ede2] stroke-[#144229]" strokeWidth="2" />
        {/* Leaf 3 left */}
        <path d="M80 75 C 60 65 48 70 42 78 C 50 88 68 82 80 80" className="fill-[#d4ebd4] stroke-[#144229]" strokeWidth="2" />
        {/* Leaf 4 right */}
        <path d="M80 55 C 100 45 112 50 118 58 C 110 68 92 62 80 60" className="fill-[#e2ede2] stroke-[#144229]" strokeWidth="2" />
        {/* Apex leaf */}
        <path d="M80 25 C 72 15 88 15 80 25 Z" className="fill-[#cce4cc] stroke-[#144229]" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="bg-[#f7f5ed] rounded-3xl border-2 border-[#ded5c5] p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-6">
      {/* Editorial Plate Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#e5dfd3]">
        <div className="space-y-0.5">
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#144229] block">
            GrowAI Herbarium Archive
          </span>
          <span className="text-xs font-mono text-[#5a7662]">
            {taxonomy.specimenId} • {taxonomy.order.toUpperCase()}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#cfdfcf] text-xs font-semibold text-[#144229] shadow-2xs">
          <ShieldCheck size={14} className="text-[#144229]" />
          Verified Specimen
        </span>
      </div>

      {/* Center Botanical Illustration Plate */}
      <div className="relative py-3 sm:py-5 px-4 bg-white/70 rounded-2xl border border-[#e5dfd3] flex flex-col items-center justify-center text-center">
        {/* Subtle background compass / grid lines for botanical plate look */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-48 border border-dashed border-[#144229] rounded-full" />
        </div>

        <div className="relative z-10 transition-transform duration-300 hover:scale-105">
          {getBotanicalIcon()}
        </div>

        <div className="mt-3 relative z-10">
          <p className="text-xs font-mono uppercase tracking-widest text-[#5a7662]">
            Botanical Plate No. {taxonomy.specimenId.replace('GA-BOT-', '')}
          </p>
          <p className="text-sm font-serif italic text-[#144229] font-medium mt-0.5">
            {plant.scientificName}
          </p>
        </div>
      </div>

      {/* Botanical Taxonomy Metadata & Vertical Rack Specs */}
      <div className="space-y-3 pt-1">
        <div className="p-3.5 bg-white/90 rounded-2xl border border-[#ded5c5] space-y-2 text-xs sm:text-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[#5a7662] font-medium">Family:</span>
            <span className="font-semibold text-[#071c11] text-right">{taxonomy.family}</span>
          </div>
          <div className="flex items-start justify-between gap-2 border-t border-[#f0ebe0] pt-1.5">
            <span className="text-[#5a7662] font-medium">Habit:</span>
            <span className="font-semibold text-[#071c11] text-right">{taxonomy.habit}</span>
          </div>
          <div className="flex items-start justify-between gap-2 border-t border-[#f0ebe0] pt-1.5">
            <span className="text-[#5a7662] font-medium">Phytogeography:</span>
            <span className="text-[#2e4435] text-right font-medium">{taxonomy.phytogeography}</span>
          </div>
        </div>

        {/* Vertical Rack Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="p-3 bg-[#eef5ee] rounded-xl border border-[#cfe0cf] space-y-1">
            <span className="text-[11px] font-bold text-[#144229] uppercase tracking-wider block flex items-center gap-1">
              <Layers size={13} />
              Shelf Placement
            </span>
            <p className="font-bold text-[#071c11] capitalize text-sm">
              {plant.verticalSuitability.recommendedTier} Shelf
            </p>
            <p className="text-[11px] text-[#2e4435] capitalize">
              Suitability: <strong>{plant.verticalSuitability.rating}</strong>
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#ded5c5] space-y-1">
            <span className="text-[11px] font-bold text-[#5a7662] uppercase tracking-wider block flex items-center gap-1">
              <Ruler size={13} />
              Root Volume
            </span>
            <p className="font-bold text-[#071c11] text-sm">
              {plant.potting.minDepthCm} cm depth
            </p>
            <p className="text-[11px] text-[#2e4435]">
              Spacing: {plant.potting.spacingCm} cm apart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
