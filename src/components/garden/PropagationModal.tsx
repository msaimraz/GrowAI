'use client';

import React, { useState } from 'react';
import { UserPlant, PropagationMethod } from '@/types/garden';
import { PLANTS_DATA } from '@/data/plants';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  X,
  Scissors,
  Sprout,
  Split,
  GitCommit,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface PropagationModalProps {
  parentPlant: UserPlant;
  isOpen: boolean;
  onClose: () => void;
  onPropagateSuccess: (newPlant: UserPlant) => void;
  createPropagatedPlantFn: (params: {
    parentPlant: UserPlant;
    propagationMethod: PropagationMethod;
    nickname: string;
    location?: UserPlant['location'];
    tier?: UserPlant['tier'];
    potSize?: string;
  }) => Promise<{ plant: UserPlant; isCloud: boolean; error?: string }>;
}

const METHODS: Array<{
  id: PropagationMethod;
  name: string;
  icon: any;
  summary: string;
  bestFor: string;
}> = [
  {
    id: 'cutting',
    name: 'Stem or Leaf Cutting',
    icon: Scissors,
    summary: 'Snip a healthy 10 cm top stem just below a leaf node and root it in fresh water or moist potting mix.',
    bestFor: 'Basil, Spearmint, Rosemary, Pothos',
  },
  {
    id: 'seed',
    name: 'Harvested Seed',
    icon: Sprout,
    summary: 'Sow mature dried seeds harvested from parent flowers or seed pods into a starter seedling cell.',
    bestFor: 'Tomatoes, Microgreens, Lettuce, Radish',
  },
  {
    id: 'division',
    name: 'Root / Crown Division',
    icon: Split,
    summary: 'Gently unpot and divide dense root clumps into two separate self-sufficient daughter containers.',
    bestFor: 'Lemongrass, Chives, Snake Plant, Aloe',
  },
  {
    id: 'runner',
    name: 'Daughter Runner / Stolon',
    icon: GitCommit,
    summary: 'Peg an arching horizontal baby plantlet into an adjacent small pot until roots establish.',
    bestFor: 'Strawberries, Spider Plants',
  },
  {
    id: 'nursery_transplant',
    name: 'Transplant / Repot',
    icon: Layers,
    summary: 'Pot up a rooted starter cutting or nursery plantlet into a larger permanent balcony tier.',
    bestFor: 'All species transitioning to final pots',
  },
];

export function PropagationModal({
  parentPlant,
  isOpen,
  onClose,
  onPropagateSuccess,
  createPropagatedPlantFn,
}: PropagationModalProps) {
  const { showSuccess } = useGrowToast();
  const [selectedMethod, setSelectedMethod] = useState<PropagationMethod>('cutting');
  const [nickname, setNickname] = useState(
    `${parentPlant.nickname} (Cutting ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
  );
  const [location, setLocation] = useState<UserPlant['location']>(parentPlant.location || 'Balcony Rack');
  const [tier, setTier] = useState<UserPlant['tier']>(parentPlant.tier || 'top');
  const [potSize, setPotSize] = useState('Starter 10 cm Pot');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const botanical = PLANTS_DATA.find((p) => p.slug === parentPlant.plantSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createPropagatedPlantFn({
        parentPlant,
        propagationMethod: selectedMethod,
        nickname: nickname.trim(),
        location,
        tier,
        potSize,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showSuccess('🌱 Propagation recorded!', 'Your new growing journey has been added.', '🌱');
        onPropagateSuccess(res.plant);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to propagate plant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071c11]/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-lg bg-[#fbf9f4] rounded-2xl border border-[#ded5c5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ded5c5] bg-[#ffffff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#eef5ee] text-[#1e663f]">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#071c11]">
                Propagate Daughter Specimen
              </h2>
              <p className="text-xs text-[#526a57]">
                Cloning from mother: <strong className="font-semibold text-[#144229]">{parentPlant.nickname}</strong> ({botanical?.commonName || parentPlant.plantSlug})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#526a57] hover:bg-[#ede7da] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#fbeee9] border border-[#f5c7b8] text-xs text-[#9a3412] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Choose Propagation Method */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#144229] uppercase tracking-wider">
              1. Select Propagation Technique
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(m.id);
                      setNickname(`${parentPlant.nickname} (${m.name.split(' ')[0]})`);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b5837] text-white border-[#1b5837] shadow-xs'
                        : 'bg-white text-[#1c261e] border-[#e4dcce] hover:border-[#257a4d]'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 mt-0.5 ${isSelected ? 'text-[#86efac]' : 'text-[#257a4d]'}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#071c11]'}`}>
                        {m.name}
                      </p>
                      <p className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${isSelected ? 'text-[#d2ebd7]' : 'text-[#526a57]'}`}>
                        {m.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botanical Species Integrity Notice */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#eef5ee] border border-[#c4dec4] text-xs text-[#144229]">
            <Info size={14} className="shrink-0 mt-0.5 text-[#257a4d]" />
            <p>
              <strong>Species Continuity:</strong> The child plant automatically inherits botanical DNA from <em className="italic">{botanical?.scientificName || parentPlant.plantSlug}</em> to ensure verified care instructions.
            </p>
          </div>

          {/* Step 2: Offspring Nickname */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#144229] uppercase tracking-wider">
              2. Daughter Plant Nickname
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Balcony Pesto King (Cutting 1)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#ded5c5] text-sm text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#144229]"
            />
          </div>

          {/* Step 3: Location and Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2e4435] mb-1">
                Garden Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#144229]"
              >
                <option value="Balcony Rack">Balcony Rack</option>
                <option value="Window Sill">Window Sill</option>
                <option value="Kitchen Tier">Kitchen Tier</option>
                <option value="Living Room">Living Room</option>
                <option value="Patio">Patio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2e4435] mb-1">
                Rack Tier Level
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#144229]"
              >
                <option value="top">Top Shelf (High Light)</option>
                <option value="middle">Middle Shelf (Filtered)</option>
                <option value="bottom">Bottom Shelf (Runoff)</option>
              </select>
            </div>
          </div>

          {/* Pot Size */}
          <div>
            <label className="block text-xs font-semibold text-[#2e4435] mb-1">
              Starter Container Size
            </label>
            <input
              type="text"
              value={potSize}
              onChange={(e) => setPotSize(e.target.value)}
              placeholder="e.g. Starter 10 cm Pot, 1 Liter Tray"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs text-[#071c11] focus:outline-none focus:ring-2 focus:ring-[#144229]"
            />
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-3 border-t border-[#ded5c5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#526a57] hover:bg-[#ede7da] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#144229] hover:bg-[#1e663f] text-white font-semibold text-xs shadow-xs active:scale-[0.98] select-none touch-manipulation transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Registering Offspring...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Create Propagated Plant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
