'use client';

import React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

export default function LearnPage() {
  const essentials = [
    {
      title: 'Water (Precision Hydration)',
      icon: Droplet,
      color: 'text-[#3b82f6] bg-[#eff6ff]',
      summary: 'Plants are up to 90% water. Transpiration draws soil minerals up through xylem tissues.',
      bestPractices: [
        'Water when the top 3 cm of soil is dry to the touch, not on a rigid calendar.',
        'Always bottom-water shallow seed trays to prevent damping-off fungal disease.',
        'Morning watering gives foliage time to dry, avoiding overnight spore germination.',
      ],
    },
    {
      title: 'Sunlight (Photoperiod Energy)',
      icon: Sun,
      color: 'text-[#c77712] bg-[#fef3c7]',
      summary: 'Photons drive chlorophyll carbon fixation. Fruiting crops need 6+ hours; leafy greens thrive on 3–4 hours.',
      bestPractices: [
        'Place sun-hungry crops (tomatoes, basil) on top tiers with unobstructed exposure.',
        'Use south- or west-facing balconies for fruit-bearing vegetables.',
        'Supplement dark indoor apartments with full-spectrum 4000K–6500K LED grow bars.',
      ],
    },
    {
      title: 'Air & Aeration (Gas Exchange)',
      icon: Wind,
      color: 'text-[#475569] bg-[#f1f5f9]',
      summary: 'Roots need oxygen (O2) just as leaves need carbon dioxide (CO2). Stagnant air invites fungal spore growth.',
      bestPractices: [
        'Incorporate perlite, pumice, or rice hulls to create permanent air pore spaces in soil.',
        'Leave 10–15 cm clearance between vertical pots to encourage air convection currents.',
        'Run a low-speed oscillating household fan near indoor vertical setups.',
      ],
    },
    {
      title: 'Nutrients (Living Soil Bio-Chemistry)',
      icon: Layers,
      color: 'text-[#1e613b] bg-[#eef5ee]',
      summary: 'Macronutrients (Nitrogen for leafy foliage, Phosphorus for roots/flowers, Potassium for fruit vigor).',
      bestPractices: [
        'Top-dress containers monthly with aged vermicompost or composted kitchen scrap mulch.',
        'Use liquid kelp or seaweed meal for gentle micronutrients without burning root hairs.',
        'Avoid heavy synthetic high-salt fertilizers in small balcony containers.',
      ],
    },
    {
      title: 'Space & Root Volume (Root Architecture)',
      icon: Box,
      color: 'text-[#9a3412] bg-[#fbeee9]',
      summary: 'A plant’s top canopy mirrors its below-ground root volume. Root-bound plants stunt quickly.',
      bestPractices: [
        'Give tomatoes at least 25–30 cm container depth; lettuces need only 15 cm.',
        'Thin seedlings promptly to recommended spacings to avoid light competition.',
        'Use breathable fabric pots to naturally "air-prune" roots and prevent circling.',
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
      checklist: ['Move immediately to bright light', 'Ensure gentle bottom airflow', 'Discontinue plastic humidity domes'],
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
        'The plant achieves full physiological canopy volume. Reproductive crops produce pollinator flowers and develop plump fruits; leafy greens yield continuous cut-and-come-again harvests.',
      checklist: ['Harvest outer leaves regularly', 'Support fruiting vines with stakes', 'Save mature seeds for next season'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="Gardening Education & Sustainability"
        subtitle="Master botanical growth essentials, the plant lifecycle, and practical home 3R practices."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Intro Hero Card */}
        <div className="bg-[#0e2a1b] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="max-w-3xl space-y-3">
            <Badge variant="forest" size="md">Foundational Plant Science</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Cultivating Knowledge Alongside Your Crops
            </h2>
            <p className="text-sm text-[#bed4c5] leading-relaxed">
              Successful urban gardening is not a mystical &ldquo;green thumb&rdquo; gift — it is an understanding of five environmental essentials and closed-loop ecological stewardship.
            </p>
          </div>
        </div>

        {/* Section 1: The 5 Growth Essentials */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[#0c2417]">
                The Five Growth Essentials
              </h3>
              <p className="text-xs text-[#526a57]">
                Every plant thrives when these environmental inputs are kept in balance
              </p>
            </div>
            <Badge variant="sage" size="sm">Botany 101</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentials.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-[#ded5c5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl ${item.color}`}>
                        <Icon size={22} />
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#0c2417]">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-[#4b6351] leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#f0ebe0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#144229] block">
                        Balcony Best Practices:
                      </span>
                      {item.bestPractices.map((bp) => (
                        <div key={bp} className="flex items-start gap-1.5 text-xs text-[#354b3c]">
                          <CheckCircle2 size={13} className="text-[#1e613b] shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Plant Life Cycle */}
        <section id="lifecycle" className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[#0c2417]">
                The Botanical Life Cycle
              </h3>
              <p className="text-xs text-[#526a57]">
                From dormant seed embryo to reproductive flowering and seed saving
              </p>
            </div>
            <Badge variant="sage" size="sm">4 Key Milestones</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifecycleStages.map((lc) => (
              <div
                key={lc.stage}
                className="bg-white rounded-2xl p-6 border border-[#ded5c5] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{lc.icon}</span>
                    <span className="text-[11px] font-mono font-semibold text-[#1e613b] bg-[#eef5ee] px-2 py-0.5 rounded-md">
                      {lc.time}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#0c2417]">
                    {lc.stage}
                  </h4>

                  <p className="text-xs text-[#4b6351] leading-relaxed">
                    {lc.description}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-[#f0ebe0]">
                  {lc.checklist.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 text-[11px] text-[#354b3c]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b]" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: The 3Rs of Sustainable Urban Gardening */}
        <section id="sustainability" className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[#0c2417]">
                The 3Rs of Sustainable Home Agriculture
              </h3>
              <p className="text-xs text-[#526a57]">
                Zero-waste principles: Reduce inputs, Reuse containers, and Recycle organics
              </p>
            </div>
            <Badge variant="forest" size="sm">Ecological Closed Loop</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reduce */}
            <div id="reduce" className="bg-white rounded-2xl p-6 border border-[#ded5c5] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229]">
                  <Droplet size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0c2417]">
                    1. Reduce
                  </h4>
                  <p className="text-xs text-[#1e613b] font-medium">Conserve Water & Fertilizer</p>
                </div>
              </div>

              <p className="text-xs text-[#4b6351] leading-relaxed">
                Vertical gardening excels at water reduction because top tier drainage can be directed to cascade into lower tiers rather than running down household storm drains.
              </p>

              <div className="bg-[#f7f5ed] p-3.5 rounded-xl border border-[#ded5c5] space-y-1.5 text-xs text-[#354b3c]">
                <strong className="text-[#144229] block">Actionable Home Project:</strong>
                <p>
                  Place shallow collection trays underneath middle and top vertical shelves to catch nutrient-rich runoff, re-using it for thirsty bottom-tier crops.
                </p>
              </div>
            </div>

            {/* Reuse */}
            <div id="reuse" className="bg-white rounded-2xl p-6 border border-[#ded5c5] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-[#fef3c7] text-[#92400e]">
                  <RefreshCw size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0c2417]">
                    2. Reuse
                  </h4>
                  <p className="text-xs text-[#92400e] font-medium">Upcycle Food-Grade Planters</p>
                </div>
              </div>

              <p className="text-xs text-[#4b6351] leading-relaxed">
                Never purchase unnecessary virgin plastic pots when safe food containers are entering your home weekly.
              </p>

              <div className="bg-[#f7f5ed] p-3.5 rounded-xl border border-[#ded5c5] space-y-1.5 text-xs text-[#354b3c]">
                <strong className="text-[#144229] block">How to Safely Prep a Container:</strong>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Use #2 (HDPE) or #5 (PP) food-grade plastic containers.</li>
                  <li>Clean thoroughly with hot water and baking soda.</li>
                  <li>Drill 4–6 drainage holes (8 mm diameter) in the bottom.</li>
                  <li>Add 2 cm of gravel or clay pebbles for air flow.</li>
                </ol>
              </div>
            </div>

            {/* Recycle */}
            <div id="recycle" className="bg-white rounded-2xl p-6 border border-[#ded5c5] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-[#fbeee9] text-[#9a3412]">
                  <Recycle size={22} />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0c2417]">
                    3. Recycle
                  </h4>
                  <p className="text-xs text-[#9a3412] font-medium">Balcony & Kitchen Composting</p>
                </div>
              </div>

              <p className="text-xs text-[#4b6351] leading-relaxed">
                Over 30% of municipal landfill waste consists of organic plant trimmings that can be recycled directly back into fertile potting soil.
              </p>

              <div className="bg-[#f7f5ed] p-3.5 rounded-xl border border-[#ded5c5] space-y-1.5 text-xs text-[#354b3c]">
                <strong className="text-[#144229] block">The 2:1 Balcony Rule:</strong>
                <p>
                  For every 1 handful of wet kitchen scraps (coffee grounds, peelings), mix in 2 handfuls of dry brown carbon (crushed dry leaves, shredded non-glossy cardboard) to keep it completely odorless.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA to test in My Garden */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-lg text-[#0c2417]">
              Put These Principles Into Practice
            </h4>
            <p className="text-xs sm:text-sm text-[#4b6351]">
              Log your plant stages in My Garden or arrange your tiered layout in the Vertical Planner.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app/my-garden"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#144229] text-white hover:bg-[#0c2417] shadow-xs transition-colors"
            >
              <Sprout size={15} />
              <span>Open My Garden</span>
            </Link>
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#144229] border border-[#cfdfcf] hover:bg-[#f4f8f4] transition-colors"
            >
              <Layers size={15} />
              <span>Launch Planner</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
