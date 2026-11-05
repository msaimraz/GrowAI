'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function CopilotLoadingState() {
  return (
    <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex items-center gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0">
        <Loader2 size={16} className="animate-spin" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#0c2417] flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#144229]" />
          <span>Consulting garden records and synthesizing evidence...</span>
        </span>
        <span className="text-[11px] text-[#6d8573] block">
          Verifying health, care, environment, and feeding observations
        </span>
      </div>
    </div>
  );
}

