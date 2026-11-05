import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Hero } from '@/components/landing/Hero';
import { CoreIdeaSection } from '@/components/landing/CoreIdeaSection';
import { PlanGrowAdaptSection } from '@/components/landing/PlanGrowAdaptSection';
import { ProductContextStory } from '@/components/landing/ProductContextStory';
import { SmallSpacePlannerSection } from '@/components/landing/SmallSpacePlannerSection';
import { BotanicalTrustSection } from '@/components/landing/BotanicalTrustSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { BotanicalRule } from '@/components/landing/BotanicalRule';

export const metadata: Metadata = {
  title: 'GrowAI — Intelligent Cultivation & Botanical Systems',
  description:
    'A minimal botanical editorial platform combining plant knowledge, small-space vertical planning, longitudinal growth tracking, and adaptive grow plans.',
  keywords: [
    'vertical gardening',
    'small space gardening',
    'plant growth tracker',
    'plant health monitoring',
    'grow plans',
    'balcony garden planner',
    'botanical intelligence',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E8] text-[#263028]">
      {/* Global Navigation — Editorial Header */}
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO — Editorial Headline & Desk-Framed Product UI */}
        <Hero />

        {/* 2. THE GROWING INTELLIGENCE SYSTEM — Open Design Diagram */}
        <CoreIdeaSection />

        <BotanicalRule className="opacity-40" />

        {/* 3. PLAN + GROW + ADAPT — 3 Editorial Columns & Live Engine View */}
        <PlanGrowAdaptSection />

        {/* 4. REAL PRODUCT / INTELLIGENCE — Copilot Story & Context Grounding */}
        <ProductContextStory />

        <BotanicalRule className="opacity-40" />

        {/* 5. SMALL-SPACE REALITY — Architectural Vertical Rack Elevation */}
        <SmallSpacePlannerSection />

        {/* 6. BOTANICAL KNOWLEDGE + TRUST — Large Botanical Specimen Plate & Lifecycle Strip */}
        <BotanicalTrustSection />

        {/* 7. FINAL CTA — Deep Botanical Ink (#163A2A) with Terracotta Detail */}
        <FinalCtaSection />
      </main>

      {/* Global Footer — Clean Publication Footer */}
      <Footer />
    </div>
  );
}
