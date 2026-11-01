'use client';

import React, { useState } from 'react';
import { ScientificEvidenceLevel } from '@/types/plant';
import {
  ShieldCheck,
  FlaskConical,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EvidenceBadgeProps {
  level: ScientificEvidenceLevel;
  size?: 'sm' | 'md' | 'lg';
  showModalTrigger?: boolean;
}

export const EVIDENCE_CONFIG: Record<
  ScientificEvidenceLevel,
  {
    label: string;
    description: string;
    bg: string;
    border: string;
    text: string;
    icon: typeof ShieldCheck;
    tagline: string;
  }
> = {
  'clinical-evidence': {
    label: 'Clinical Evidence',
    tagline: 'Supported by Controlled Human Clinical Studies',
    description:
      'Rigorous scientific data derived from peer-reviewed human clinical trials, randomized controlled studies, or formal pharmacokinetic evaluations.',
    bg: 'bg-[#eef5ee]',
    border: 'border-[#cfe0cf]',
    text: 'text-[#144229]',
    icon: CheckCircle2,
  },
  'preliminary-research': {
    label: 'Preliminary Research',
    tagline: 'Laboratory (In Vitro) & Animal (In Vivo) Models',
    description:
      'Observed in laboratory cell culture assays or animal models. Demonstrates biological pathways and mechanisms of action, but is not yet validated by human clinical efficacy trials.',
    bg: 'bg-[#f0f7ff]',
    border: 'border-[#bae0fd]',
    text: 'text-[#0369a1]',
    icon: FlaskConical,
  },
  'traditional-use': {
    label: 'Traditional Use',
    tagline: 'Historically Documented Ethnobotanical Practices',
    description:
      'Documented in ancient or regional herbal traditions (e.g. Ayurveda, Traditional Chinese Medicine, Greco-Roman, Unani). Reflects historical cultural practices without modern clinical confirmation.',
    bg: 'bg-[#fef9ee]',
    border: 'border-[#fed7aa]',
    text: 'text-[#c2410c]',
    icon: BookOpen,
  },
  'insufficient-evidence': {
    label: 'Insufficient Evidence',
    tagline: 'Substantiation Unavailable in Scientific Literature',
    description:
      'Current pharmacological and clinical literature cannot adequately confirm or validate proposed physiological activities or health claims.',
    bg: 'bg-[#f8fafc]',
    border: 'border-[#cbd5e1]',
    text: 'text-[#475569]',
    icon: HelpCircle,
  },
};

export function EvidenceLevelBadge({
  level,
  size = 'md',
  showModalTrigger = false,
}: EvidenceBadgeProps) {
  const config = EVIDENCE_CONFIG[level] || EVIDENCE_CONFIG['insufficient-evidence'];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-xl font-medium border shadow-2xs ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
      title={config.tagline}
    >
      <IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      <span>{config.label}</span>
      {size !== 'sm' && (
        <span className="opacity-75 text-xs font-normal hidden sm:inline">
          • {level === 'clinical-evidence' ? 'Human Studies' : level === 'preliminary-research' ? 'Lab & Animal' : level === 'traditional-use' ? 'Ethnobotanical' : 'Unsubstantiated'}
        </span>
      )}
    </span>
  );
}

export function EvidenceFrameworkGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#f7f5ed] rounded-2xl border border-[#ded5c5] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-[#f2efe4] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-white border border-[#ded5c5] flex items-center justify-center text-[#144229] shrink-0">
            <Info size={20} />
          </span>
          <div>
            <h4 className="text-base sm:text-lg font-serif font-bold text-[#071c11]">
              Scientific Evidence Hierarchy Guide
            </h4>
            <p className="text-xs sm:text-sm text-[#5a7662]">
              How GrowAI evaluates clinical trials, in vitro laboratory research, and traditional medicine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#144229] shrink-0">
          <span>{isOpen ? 'Hide Framework' : 'View Standards'}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-[#ded5c5] bg-white space-y-4">
          <p className="text-sm sm:text-base text-[#1c261e] leading-relaxed">
            GrowAI adheres to strict pharmacological reporting standards to prevent misleading health claims. We distinguish historically documented folklore from contemporary biochemical investigations:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {Object.entries(EVIDENCE_CONFIG).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border ${item.bg} ${item.border} space-y-1.5`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={item.text} />
                    <h5 className={`font-bold text-sm sm:text-base ${item.text}`}>
                      {item.label}
                    </h5>
                  </div>
                  <p className="text-xs font-semibold text-[#071c11]">
                    {item.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-[#2e4435] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#fef3c7]/70 rounded-xl border border-[#fde68a] text-xs sm:text-sm text-[#92400e] leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#92400e]" />
            <span>
              <strong>Crucial Distinction:</strong> In vitro assays (test-tube cell cultures) and animal experiments reveal biological pathways but do <em>never</em> constitute proven clinical medical efficacy in humans. Dietary presence of phytochemicals (such as sulforaphane or vitexin) does not substitute for approved pharmaceuticals.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
