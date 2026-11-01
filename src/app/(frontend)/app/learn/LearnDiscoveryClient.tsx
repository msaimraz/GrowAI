'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EditorialArticle } from '@/types/article';
import { Plant } from '@/types/plant';
import {
  DidYouKnowCard,
  PlantQuizCard,
  GardeningChallengeCard,
} from '@/components/plants/PlantEducation';
import {
  Sprout,
  Droplet,
  Sun,
  Wind,
  Layers,
  Recycle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Box,
  Compass,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  ShieldCheck,
  Search,
  FlaskConical,
  Award,
} from 'lucide-react';

interface LearnDiscoveryClientProps {
  articles: EditorialArticle[];
  plants: Plant[];
}

interface TopicCard {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  summary: string;
  evidenceType: 'established-fact' | 'clinical-research' | 'botanical-standard';
  evidenceLabel: string;
  deepExplanation: string;
  actionableTips: string[];
}

const TOPICS: TopicCard[] = [
  {
    id: 'growth-essentials',
    category: 'growth-basics',
    categoryLabel: 'Plant Growth Basics',
    title: 'The Five Environmental Growth Essentials',
    summary:
      'Healthy plant metabolism requires a delicate balance of five core inputs: water, photosynthetically active radiation, root-zone oxygen, soil minerals, and container volume.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'Water acts as both the structural hydrostatic skeleton of non-woody plants and the solvent medium that carries dissolved nitrogen, phosphorus, and potassium through xylem vessels via capillary transpiration. Without adequate air pores in the potting substrate, root cells drown and lose the ability to respire ATP, leading to anaerobic root rot even in nutrient-rich media.',
    actionableTips: [
      'Check top 3 cm of substrate with your finger before irrigating; avoid rigid calendar watering.',
      'Always ensure potting containers have unobstructed bottom drainage holes.',
      'Blend 20–30% coarse perlite or pumice into peat substrates to preserve aeration voids.',
    ],
  },
  {
    id: 'indoor-photoperiod',
    category: 'indoor',
    categoryLabel: 'Indoor Gardening',
    title: 'Indoor Photoperiod & Artificial Light Spectra',
    summary:
      'Window glass filters out ultraviolet rays and diminishes photosynthetically active radiation (PAR). Supplementing with 4000K–6500K LED grow bars unlocks robust indoor growth.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'Sunlight through standard double-pane glass loses up to 40% of its usable photosynthetic photon flux density (PPFD). Indoor fruiting plants (like bush tomatoes) require 250–400 µmol/m²/s of light over a 14–16 hour photoperiod, whereas shade-tolerant species (like snake plant and pothos) sustain metabolism at just 50–100 µmol/m²/s.',
    actionableTips: [
      'Position LED grow lights 15–25 cm above seedling canopies to prevent legginess.',
      'Use south- or west-facing windows for herbs; place snake plants and pothos in east or north exposure.',
      'Rotate indoor pots 90 degrees every week to maintain balanced, upright phototropism.',
    ],
  },
  {
    id: 'vertical-tiering',
    category: 'vertical',
    categoryLabel: 'Vertical Gardening',
    title: 'Microclimates in Tiered Vertical Shelving',
    summary:
      'Vertical racks create microclimates. Top tiers receive maximum heat and direct sunlight, middle tiers provide stable humidity, and bottom tiers catch gravity-fed runoff.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'Because hot air rises and upper shelves enjoy unshaded solar exposure, top tiers dry out up to twice as fast as bottom tiers. Aligning plants by their water and light demands—fruiting crops up top, delicate salad greens in the middle, and heavy deep-root pots on bottom—prevents structural collapse and water waste.',
    actionableTips: [
      'Reserve the top tier for sun-hungry dwarf tomatoes, peppers, and Genovese basil.',
      'Keep tender leafy lettuces, spinach, and spearmint on middle shelves to avoid heat scorching.',
      'Place ceramic root containers (radishes) on the lowest tier for maximum weight stability.',
    ],
  },
  {
    id: 'phytochemical-profiles',
    category: 'medicinal',
    categoryLabel: 'Medicinal Plants & Phytochemicals',
    title: 'Phytochemical Synergy & Active Botanical Compounds',
    summary:
      'Plants synthesize secondary metabolites—such as eugenol in Tulsi and sulforaphane in broccoli sprouts—as internal defense mechanisms with documented cellular properties.',
    evidenceType: 'clinical-research',
    evidenceLabel: 'Active Clinical Research',
    deepExplanation:
      'Unlike primary metabolites (sugars, amino acids) needed for cellular survival, secondary metabolites are synthesized in specialized glandular trichomes or vacuole reserves to deter herbivores, combat fungal pathogens, and mitigate ultraviolet oxidative stress. Research is investigating these bio-active polyphenols, glucosinolates, and terpenoids for their human cellular anti-inflammatory and antioxidant pathways.',
    actionableTips: [
      'Harvest culinary and medicinal herbs in the early morning when essential oil concentrations peak.',
      'Chew or chop Brassica sprouts thoroughly to trigger myrosinase enzymatic conversion into sulforaphane.',
      'Distinguish laboratory in vitro findings from clinically validated medical treatments.',
    ],
  },
  {
    id: 'safety-and-pets',
    category: 'safety',
    categoryLabel: 'Plant Safety & Pet Precautions',
    title: 'Insoluble Calcium Oxalate Crystals & Household Safety',
    summary:
      'Common decorative houseplants like Golden Pothos and Snake Plant contain microscopic needle-like calcium oxalate raphides that cause intense oral irritation if chewed by pets.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'When ingested by curious cats or dogs, the specialized idioblast cells in Araceae and Asparagaceae family tissues rupture, ejecting thousands of microscopic oxalate needle crystals into oral tissues. This triggers instantaneous burning, excessive salivation, vomiting, and esophageal swelling. While rarely fatal in adult animals, prompt veterinary care is essential.',
    actionableTips: [
      'Keep Golden Pothos trailing vines pinned high above reach or inside hanging macramé planters.',
      'Wear gardening gloves when pruning Euphorbias or sap-bearing decorative species to avoid dermal dermatitis.',
      'Wash hands thoroughly after handling unverified ornamental plants before preparing food.',
    ],
  },
  {
    id: 'composting-closed-loop',
    category: 'composting-3rs',
    categoryLabel: 'Composting & The 3Rs',
    title: 'The 2:1 Brown-to-Green Aerobic Composting Formula',
    summary:
      'Over 30% of municipal domestic waste consists of organic kitchen scraps that can be transformed into odorless, nutrient-dense vermicompost directly on an apartment balcony.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'Aerobic thermophilic microorganisms decompose cellulose and protein by consuming 25–30 parts carbon (Browns: dry leaves, non-glossy cardboard) for every 1 part nitrogen (Greens: fresh veggie peels, coffee grounds). When the carbon ratio drops too low, anaerobic bacteria take over, causing foul sulfur odors and fruit fly infestations.',
    actionableTips: [
      'Always cover fresh kitchen scrap additions with a 5 cm layer of dry shredded cardboard.',
      'Never compost cooked meats, dairy fats, or diseased plant foliage in small container tumblers.',
      'Collect drain leachate (compost tea) and dilute 1:10 with fresh water for gentle foliar feeding.',
    ],
  },
  {
    id: 'sprout-food-safety',
    category: 'sprouts-food-safety',
    categoryLabel: 'Sprout Growing & Food Safety',
    title: 'Sanitation Protocols for Home Sprout Cultivation',
    summary:
      'Warmth and humidity create ideal conditions for seed germination—and potential microbial pathogens. Strict seed sanitation and twice-daily cold rinsing are mandatory.',
    evidenceType: 'botanical-standard',
    evidenceLabel: 'Food Safety Standard',
    deepExplanation:
      'Because sprouts are grown in dark, moist 20°C–24°C environments without soil or sunlight, bacterial pathogens like Salmonella and pathogenic E. coli can multiply exponentially on unwashed seed surfaces. Testing and sanitizing seeds with hot water or food-grade hydrogen peroxide before soaking reduces pathogen risk by over 99.9%.',
    actionableTips: [
      'Only purchase certified pathogen-tested sprouting seeds, never agricultural crop seed packets.',
      'Sanitize glass sprouting jars and mesh lids thoroughly with boiling water before every batch.',
      'Rinse sprouts with cold, filtered drinking water at least twice daily and invert at 45° to drain fully.',
    ],
  },
  {
    id: 'beginner-step-by-step',
    category: 'beginner',
    categoryLabel: 'Beginner Gardening Guides',
    title: 'The First-Time Grower’s Checklist: From Seed to Table',
    summary:
      'Starting your very first container garden doesn’t require complex tools. Focus on high-reward, fast-growing companion crops like French Radish, Spearmint, and Genovese Basil.',
    evidenceType: 'established-fact',
    evidenceLabel: 'Established Horticultural Fact',
    deepExplanation:
      'Beginner frustration usually stems from choosing slow, demanding crops (like large beefsteak tomatoes) in undersized pots with low sunlight. Quick-harvest root crops (Radish yields in 25 days) and hardy culinary herbs build confidence and immediate culinary value without expensive equipment.',
    actionableTips: [
      'Start with 3 complementary plants: one fast root crop, one leafy green, and one culinary herb.',
      'Label your containers with planting dates to accurately track developmental milestones.',
      'Harvest outer leaves progressively instead of uprooting the whole plant (cut-and-come-again).',
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: BookOpen },
  { id: 'growth-basics', label: 'Plant Growth Basics', icon: Sprout },
  { id: 'indoor', label: 'Indoor Gardening', icon: Sun },
  { id: 'vertical', label: 'Vertical Gardening', icon: Layers },
  { id: 'medicinal', label: 'Medicinal Plants & Phytochemicals', icon: FlaskConical },
  { id: 'safety', label: 'Plant Safety & Precautions', icon: ShieldAlert },
  { id: 'composting-3rs', label: 'Composting & The 3Rs', icon: Recycle },
  { id: 'sprouts-food-safety', label: 'Sprouts & Food Safety', icon: ShieldCheck },
  { id: 'beginner', label: 'Beginner Guides', icon: Award },
];

export function LearnDiscoveryClient({ articles, plants }: LearnDiscoveryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>('growth-essentials');
  const [selectedQuizSlug, setSelectedQuizSlug] = useState<string>('holy-basil-tulsi');

  const filteredTopics = TOPICS.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const toggleExpand = (id: string) => {
    setExpandedTopicId((prev) => (prev === id ? null : id));
  };

  const activeQuizPlant =
    plants.find((p) => p.slug === selectedQuizSlug) || plants[0] || undefined;

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
          Explore Botanical Discovery Categories:
        </label>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-[#144229] text-white shadow-xs ring-2 ring-[#144229]/20'
                    : 'bg-white text-[#445b49] border border-[#ded5c5] hover:bg-[#eef5ee] hover:text-[#0c2417]'
                }`}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Topic Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
          <div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0c2417]">
              {selectedCategory === 'all'
                ? 'Curated Horticultural Modules'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
              Showing {filteredTopics.length} interactive learning module(s)
            </p>
          </div>
          <Badge variant="sage" size="md">
            Scientific Rigor
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-md">
                      {topic.categoryLabel}
                    </span>
                    <Badge
                      variant={
                        topic.evidenceType === 'established-fact'
                          ? 'forest'
                          : topic.evidenceType === 'clinical-research'
                          ? 'amber'
                          : 'sage'
                      }
                      size="sm"
                    >
                      {topic.evidenceLabel}
                    </Badge>
                  </div>

                  <h4 className="font-serif font-bold text-lg sm:text-xl text-[#0c2417]">
                    {topic.title}
                  </h4>

                  <p className="text-sm text-[#2e4435] leading-relaxed">
                    {topic.summary}
                  </p>

                  {/* Expandable Deeper Explanation */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#f0ebe0] space-y-3 animate-in fade-in duration-200">
                      <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-[#ded5c5] text-xs sm:text-sm text-[#2c3d30] leading-relaxed">
                        <strong className="text-[#144229] block font-serif font-bold text-sm mb-1">
                          Botanical Mechanism & Science:
                        </strong>
                        {topic.deepExplanation}
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                          Actionable Best Practices:
                        </span>
                        {topic.actionableTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2e4435]">
                            <CheckCircle2 size={16} className="text-[#144229] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(topic.id)}
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] hover:bg-[#eef5ee] text-xs sm:text-sm font-semibold text-[#144229] transition-colors cursor-pointer min-h-[44px]"
                  >
                    <span>{isExpanded ? 'Collapse Deeper Science' : 'Read Deeper Scientific Explanation'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Educational Suite: Quiz, Did You Know, Challenge */}
      <section className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
          <div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0c2417] flex items-center gap-2.5">
              <Sparkles size={22} className="text-[#144229]" />
              <span>Interactive Knowledge Testing & Daily Challenge</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
              Test your botanical memory and earn daily gardening badges
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#0c2417]">Select Specimen:</label>
            <select
              value={selectedQuizSlug}
              onChange={(e) => setSelectedQuizSlug(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[40px]"
            >
              {plants.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.commonName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeQuizPlant && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <div className="col-span-1 flex flex-col">
              <DidYouKnowCard plant={activeQuizPlant} />
            </div>
            <div className="col-span-1 flex flex-col">
              <GardeningChallengeCard plant={activeQuizPlant} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col">
              <PlantQuizCard plant={activeQuizPlant} />
            </div>
          </div>
        )}
      </section>

      {/* Editorial Guides from Payload CMS */}
      {articles && articles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0c2417]">
                Curated Agronomic & Vertical Farming Editorial Guides
              </h3>
              <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
                Managed dynamically via Payload CMS with real botanical workflows
              </p>
            </div>
            <Badge variant="sage" size="md">
              Payload CMS Library
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ded5c5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-md">
                      {art.categoryLabel || art.category}
                    </span>
                    {art.publishedAt && (
                      <span className="text-xs font-mono text-[#526a57]">
                        {art.publishedAt}
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-lg text-[#0c2417] leading-snug">
                    {art.title}
                  </h4>

                  <p className="text-sm text-[#2e4435] leading-relaxed">
                    {art.summary}
                  </p>

                  {art.keyTakeaways && art.keyTakeaways.length > 0 && (
                    <div className="pt-3 border-t border-[#f0ebe0] space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                        Key Takeaways:
                      </span>
                      {art.keyTakeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2e4435]">
                          <CheckCircle2 size={16} className="text-[#144229] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e2a1b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <Badge variant="forest" size="md">Put Knowledge Into Practice</Badge>
          <h4 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Ready to test your botany in the real world?
          </h4>
          <p className="text-xs sm:text-sm text-[#d1e6d7] max-w-lg">
            Track developmental milestones in My Garden Journal or configure light tiers in the Vertical Planner.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/my-garden"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#257a4d] text-white hover:bg-[#1e613b] shadow-xs transition-colors min-h-[44px]"
          >
            <Sprout size={16} />
            <span>Open Garden Journal</span>
          </Link>
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white text-[#0e2a1b] hover:bg-[#fbf9f4] transition-colors min-h-[44px]"
          >
            <Layers size={16} />
            <span>Open Planner</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
