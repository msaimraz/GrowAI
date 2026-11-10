import React from 'react';
import { connection } from 'next/server';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { fetchPublishedArticles, fetchPublishedPlants } from '@/lib/payload';
import { LearnDiscoveryClient } from './LearnDiscoveryClient';
import {
  Droplet,
  Sun,
  Wind,
  Layers,
  Box,
  CheckCircle2,
  Recycle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const instant = false;

export default async function LearnPage() {
  await connection();
  const [articles, plants] = await Promise.all([
    fetchPublishedArticles(),
    fetchPublishedPlants(),
  ]);

  const essentials = [
    {
      title: 'Water (Precision Hydration)',
      icon: Droplet,
      color: 'text-[#174C35] bg-[#EAF1E4]',
      summary:
        'Plants are up to 90% water. Transpiration draws soil minerals up through xylem tissues to fuel cellular expansion.',
      bestPractices: [
        'Water when the top 3 cm of soil is dry to the touch, not on a rigid calendar.',
        'Bottom-water shallow seed trays to prevent damping-off fungal infection.',
        'Morning watering allows foliage to dry, preventing overnight fungal spores.',
      ],
    },
    {
      title: 'Sunlight (Photoperiod Energy)',
      icon: Sun,
      color: 'text-[#8A6400] bg-[#FFF3D7]',
      summary:
        'Photons drive chlorophyll carbon fixation. Fruiting crops need 6+ hours; leafy greens thrive on 3–4 hours of bright light.',
      bestPractices: [
        'Place sun-hungry crops (tomatoes, basil) on top tiers with unobstructed exposure.',
        'Use south- or west-facing balconies for fruit-bearing vegetables.',
        'Supplement indoor rooms with full-spectrum 4000K–6500K LED grow bars.',
      ],
    },
    {
      title: 'Air & Aeration (Gas Exchange)',
      icon: Wind,
      color: 'text-[#594186] bg-[#F0ECF7]',
      summary:
        'Roots need oxygen (O2) just as leaves need carbon dioxide (CO2). Stagnant air invites mold and root rot.',
      bestPractices: [
        'Incorporate perlite, pumice, or rice hulls to create permanent air pores in soil.',
        'Leave 10–15 cm clearance between vertical pots to encourage natural airflow.',
        'Run a low-speed oscillating household fan near indoor vertical setups.',
      ],
    },
    {
      title: 'Living Soil & Nutrition (Bio-Chemistry)',
      icon: Layers,
      color: 'text-[#174C35] bg-[#EAF1E4]',
      summary:
        'Macronutrients (Nitrogen for lush leaves, Phosphorus for roots, Potassium for vigor) thrive in organic living soil.',
      bestPractices: [
        'Top-dress containers monthly with aged vermicompost or composted kitchen mulch.',
        'Use diluted liquid kelp or seaweed meal for gentle micronutrients without root burn.',
        'Avoid heavy synthetic high-salt fertilizers in small balcony containers.',
      ],
    },
    {
      title: 'Root Volume & Spacing (Root Architecture)',
      icon: Box,
      color: 'text-[#963A23] bg-[#FBE9E2]',
      summary:
        'A plant’s top canopy mirrors its below-ground root architecture. Root-bound plants stunt quickly without proper depth.',
      bestPractices: [
        'Give tomatoes at least 25–30 cm container depth; lettuces need only 15 cm.',
        'Thin seedlings promptly to recommended spacings to avoid light competition.',
        'Use breathable fabric pots to naturally air-prune roots and prevent root circling.',
      ],
    },
  ];

  const lifecycleStages = [
    {
      stage: '1. Seed (Dormant Potential)',
      time: 'Day 0',
      icon: '🌱',
      description:
        'A living embryo protected by a seed coat, containing stored endosperm starches. Requires moisture, oxygen, and ambient warmth (typically 20°C–24°C) to break dormancy.',
      checklist: ['Keep medium continuously moist', 'Maintain darkness until emergence', 'Avoid waterlogging'],
    },
    {
      stage: '2. Germination (The Radical & Cotyledons)',
      time: 'Day 3–10',
      icon: '🌿',
      description:
        'The taproot (radicle) punches downward, anchoring the seedling. Soon after, embryonic seed leaves (cotyledons) unfurl and turn green in response to light.',
      checklist: ['Move immediately to bright light', 'Ensure gentle bottom airflow', 'Remove humidity domes'],
    },
    {
      stage: '3. Seedling & True Leaves',
      time: 'Day 14–25',
      icon: '🪴',
      description:
        'The plant produces its first authentic species leaves with characteristic margins, serrations, and aroma. Photosynthetic capacity accelerates exponentially.',
      checklist: ['Apply first diluted organic feed', 'Pinch early tips for branching herbs', 'Transplant if in plug cells'],
    },
    {
      stage: '4. Mature Plant & Harvest',
      time: 'Day 30–90+',
      icon: '🍅',
      description:
        'The plant achieves full physiological canopy volume. Reproductive crops produce pollinator flowers and develop fruits; leafy greens yield continuous cut-and-come-again harvests.',
      checklist: ['Harvest outer leaves regularly', 'Support fruiting vines with stakes', 'Save mature seeds for next season'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EE]">
      <AppHeader
        title="Botanical Learning & Sustainability Hub"
        subtitle="Explore peer-reviewed plant science, balcony vertical microclimates, and closed-loop home gardening."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 max-w-full space-y-12">
        {/* Intro Hero Card */}
        <div className="bg-[#203027] text-white p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-sm space-y-4">
          <div className="max-w-3xl space-y-3">
            <Badge variant="forest" size="md">Botanical Science & Urban Sustainability</Badge>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Cultivating Botanical Understanding Alongside Your Crops
            </h2>
            <p className="text-sm sm:text-base text-[#EAF1E4] leading-relaxed">
              Successful urban gardening is not a mystical &ldquo;green thumb&rdquo; gift — it is an understanding of environmental inputs, plant biology, and closed-loop ecological stewardship.
            </p>
          </div>
        </div>

        {/* Client Interactive Discovery Hub: Categories, Expandable Topics, Quiz */}
        <LearnDiscoveryClient articles={articles} plants={plants} />

        {/* The 5 Growth Essentials */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                The Five Growth Essentials
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] mt-0.5">
                Every plant flourishes when these five environmental inputs remain in balance
              </p>
            </div>
            <Badge variant="sage" size="md">Foundational Botany</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentials.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3DFD2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`p-3 rounded-2xl ${item.color}`}>
                        <Icon size={22} />
                      </span>
                      <h4 className="font-serif font-bold text-lg text-[#203027]">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-sm text-[#203027] leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-[#E3DFD2]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#174C35] block">
                        Balcony Best Practices:
                      </span>
                      {item.bestPractices.map((bp) => (
                        <div key={bp} className="flex items-start gap-2 text-xs sm:text-sm text-[#203027]">
                          <CheckCircle2 size={16} className="text-[#174C35] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Plant Life Cycle Section */}
        <section id="lifecycle" className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                The Botanical Life Cycle
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] mt-0.5">
                From dormant seed embryo to true leaves, flowering, and seed saving
              </p>
            </div>
            <Badge variant="sage" size="md">4 Key Milestones</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifecycleStages.map((lc) => (
              <div
                key={lc.stage}
                className="bg-white rounded-3xl p-6 border border-[#E3DFD2] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{lc.icon}</span>
                    <span className="text-xs font-mono font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-1 rounded-lg">
                      {lc.time}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-lg text-[#203027]">
                    {lc.stage}
                  </h4>

                  <p className="text-sm text-[#203027] leading-relaxed">
                    {lc.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#E3DFD2]">
                  {lc.checklist.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-xs text-[#203027]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#174C35]" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 3Rs of Sustainable Home Agriculture */}
        <section id="sustainability" className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                The 3Rs of Sustainable Home Agriculture
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] mt-0.5">
                Zero-waste principles: Reduce inputs, Reuse containers, and Recycle organics
              </p>
            </div>
            <Badge variant="forest" size="md">Ecological Closed Loop</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reduce */}
            <div id="reduce" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3DFD2] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#EAF1E4] text-[#174C35]">
                  <Droplet size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#203027]">
                    1. Reduce
                  </h4>
                  <p className="text-xs font-semibold text-[#174C35]">Conserve Water & Fertilizer</p>
                </div>
              </div>

              <p className="text-sm text-[#203027] leading-relaxed">
                Vertical gardening excels at water reduction because top tier drainage can be directed to cascade into lower tiers rather than running down household storm drains.
              </p>

              <div className="bg-[#F8F6EE] p-4 rounded-2xl border border-[#E3DFD2] space-y-1.5 text-xs sm:text-sm text-[#203027]">
                <strong className="text-[#174C35] block font-bold">Actionable Home Project:</strong>
                <p className="leading-relaxed">
                  Place shallow collection trays underneath middle and top vertical shelves to catch nutrient-rich runoff, re-using it for thirsty bottom-tier crops.
                </p>
              </div>
            </div>

            {/* Reuse */}
            <div id="reuse" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3DFD2] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#FFF3D7] text-[#8A6400]">
                  <RefreshCw size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#203027]">
                    2. Reuse
                  </h4>
                  <p className="text-xs font-semibold text-[#8A6400]">Upcycle Food-Grade Planters</p>
                </div>
              </div>

              <p className="text-sm text-[#203027] leading-relaxed">
                Never purchase unnecessary virgin plastic pots when safe food containers are entering your home weekly.
              </p>

              <div className="bg-[#F8F6EE] p-4 rounded-2xl border border-[#E3DFD2] space-y-1.5 text-xs sm:text-sm text-[#203027]">
                <strong className="text-[#174C35] block font-bold">How to Safely Prep a Container:</strong>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li>Use #2 (HDPE) or #5 (PP) food-grade plastic containers.</li>
                  <li>Clean thoroughly with hot water and baking soda.</li>
                  <li>Drill 4–6 drainage holes (8 mm diameter) in the bottom.</li>
                  <li>Add 2 cm of gravel or clay pebbles for air flow.</li>
                </ol>
              </div>
            </div>

            {/* Recycle */}
            <div id="recycle" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3DFD2] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#FBE9E2] text-[#963A23]">
                  <Recycle size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#203027]">
                    3. Recycle
                  </h4>
                  <p className="text-xs font-semibold text-[#963A23]">Balcony Kitchen Composting</p>
                </div>
              </div>

              <p className="text-sm text-[#203027] leading-relaxed">
                Over 30% of domestic waste consists of organic plant trimmings that can be recycled directly back into fertile potting soil.
              </p>

              <div className="bg-[#F8F6EE] p-4 rounded-2xl border border-[#E3DFD2] space-y-1.5 text-xs sm:text-sm text-[#203027]">
                <strong className="text-[#174C35] block font-bold">The 2:1 Balcony Rule:</strong>
                <p className="leading-relaxed">
                  For every 1 handful of wet kitchen scraps (coffee grounds, peelings), mix in 2 handfuls of dry brown carbon (crushed dry leaves, shredded cardboard) to keep it completely odorless.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
