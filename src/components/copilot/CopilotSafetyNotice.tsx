'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export function CopilotSafetyNotice() {
  return (
    <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex items-start gap-2.5 text-xs text-[#526a57] leading-relaxed">
      <ShieldCheck size={16} className="text-[#144229] shrink-0 mt-0.5" />
      <div>
        <strong className="text-[#0c2417] font-semibold">Agronomic & Evidence Boundaries: </strong>
        GrowAI answers strictly from recorded garden data. It does not invent fertilizer dosages,
        guarantee yields, or declare plant maturity from calendar days alone. Pathogen scans represent
        differential hypotheses, not medical or scientific certainty.
      </div>
    </div>
  );
}

