import React from 'react';
import { Sprout, Droplets, Stethoscope, Layers, TrendingUp } from 'lucide-react';

export function WhatGrowAiDoesSection() {
  const pillars = [
    {
      icon: Sprout,
      title: 'Plants',
      description: 'Know what you’re growing with curated botanical guidance.',
      accent: 'text-[#144229] bg-[#eef5ee]',
    },
    {
      icon: Droplets,
      title: 'Care',
      description: 'Keep up with what needs attention without guesswork.',
      accent: 'text-teal-800 bg-[#e6f4f2]',
    },
    {
      icon: Stethoscope,
      title: 'Health',
      description: 'Check symptoms with photo diagnosis and track recovery.',
      accent: 'text-emerald-800 bg-[#e7f5eb]',
    },
    {
      icon: Layers,
      title: 'Space',
      description: 'Plan balcony, windowsill, and vertical growing racks.',
      accent: 'text-amber-800 bg-[#fef7ea]',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'Track milestones and progress from planting to harvest.',
      accent: 'text-indigo-800 bg-[#eef0f8]',
    },
  ];

  return (
    <section id="what-growai-does" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#ded5c5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Editorial Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-[#526a57] uppercase font-bold block">
            EVERYDAY GROWING SIMPLIFIED
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0c2417] tracking-tight leading-tight">
            Your Garden, All in One Place.
          </h2>
          <p className="text-base sm:text-lg text-[#526a57] leading-relaxed pt-1">
            GrowAI connects the everyday things growers need — plants, care, health, space, plans, and progress.
          </p>
        </div>

        {/* 5-Part Lightweight Editorial System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 pt-4">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="space-y-3 text-left sm:text-left">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-2xs ${item.accent}`}
                >
                  <Icon size={22} className="stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

