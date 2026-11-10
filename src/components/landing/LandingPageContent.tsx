import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Hero } from '@/components/landing/Hero';
import { WhatGrowAiDoesSection } from '@/components/landing/WhatGrowAiDoesSection';
import { GrowWithGardenSection } from '@/components/landing/GrowWithGardenSection';
import { RealProductCapabilitiesSection } from '@/components/landing/RealProductCapabilitiesSection';
import { PlantIntelligenceSection } from '@/components/landing/PlantIntelligenceSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';

export const landingMetadata: Metadata = {
  title: 'GrowAI — Intelligent Cultivation & Botanical Systems',
  description:
    'A calm botanical platform combining plant knowledge, small-space vertical planning, growth tracking, and adaptive grow plans.',
  keywords: [
    'gardening app',
    'plant care',
    'plant health check',
    'small space gardening',
    'vertical garden planner',
    'grow plans',
    'botanical knowledge',
  ],
  openGraph: {
    title: 'GrowAI — Intelligent Cultivation & Botanical Systems',
    description:
      'Grounded botanical intelligence, vertical space planning, longitudinal plant timelines, and adaptive growing plans.',
    type: 'website',
    url: 'https://growai.local',
    siteName: 'GrowAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrowAI — Intelligent Cultivation & Botanical Systems',
    description:
      'Grounded botanical intelligence, vertical space planning, longitudinal plant timelines, and adaptive growing plans.',
  },
};

export function LandingPageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4] text-[#0c2417]">
      {/* 1. Global Navigation */}
      <Navbar />

      <main className="flex-1 min-w-0 max-w-full">
        {/* 2. Hero: Simple Headline, CTAs & Realistic Product UI Preview */}
        <Hero />

        {/* 3. What GrowAI Does: 5-Part Lightweight Editorial System */}
        <WhatGrowAiDoesSection />

        {/* 4. Grow With Your Garden: Plant → Observation → Condition → Intelligence → Action */}
        <GrowWithGardenSection />

        {/* 5. Real Product Capabilities: 6 Areas + Step Progression Preview */}
        <RealProductCapabilitiesSection />

        {/* 6. Plant Intelligence: Realistic Plant Record + 3-Tier Rack + Daily Growing Experience */}
        <PlantIntelligenceSection />

        {/* 7. Final CTA: Deep Botanical Ink */}
        <FinalCtaSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default LandingPageContent;

