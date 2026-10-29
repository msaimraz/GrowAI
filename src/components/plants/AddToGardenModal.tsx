'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plant } from '@/types/plant';
import { createGardenPlant } from '@/lib/storage';
import { GrowthStage } from '@/types/garden';
import { Sprout, X, Check, Calendar, MapPin, Layers, Loader2, AlertCircle } from 'lucide-react';

interface AddToGardenModalProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToGardenModal({ plant, isOpen, onClose }: AddToGardenModalProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(plant.commonName);
  const [plantedDate, setPlantedDate] = useState('2026-10-29');

  React.useEffect(() => {
    setPlantedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const [stage, setStage] = useState<GrowthStage>('Seed');
  const [tier, setTier] = useState<'top' | 'middle' | 'bottom'>(
    plant.verticalSuitability.recommendedTier === 'any'
      ? 'middle'
      : plant.verticalSuitability.recommendedTier
  );
  const [location, setLocation] = useState<'Balcony Rack' | 'Window Sill' | 'Living Room' | 'Kitchen Tier' | 'Patio'>('Balcony Rack');
  const [initialNote, setInitialNote] = useState('Sowed in fresh organic potting mix with perlite.');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await createGardenPlant({
        plantSlug: plant.slug,
        nickname,
        plantedDate,
        currentStage: stage,
        location,
        tier,
        potSize: plant.potting.recommendedPotSize,
        initialNote,
      });

      if (res.error) {
        setErrorMsg(`Failed to save plant: ${res.error}`);
        setSaving(false);
        return;
      }

      onClose();
      router.push('/app/my-garden');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#ded5c5] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e7efe7] text-[#144229]">
              <Sprout size={20} />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                Add to My Garden Log
              </h3>
              <p className="text-xs text-[#526a57]">
                {plant.commonName} ({plant.scientificName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#698570] hover:text-[#0c2417] hover:bg-[#f4f8f4]"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Plant Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                Planted Date
              </label>
              <input
                type="date"
                value={plantedDate}
                onChange={(e) => setPlantedDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                Starting Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as GrowthStage)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              >
                <option value="Seed">Seed (Day 0)</option>
                <option value="Germination">Germination (Sprout)</option>
                <option value="Seedling">Seedling (First Leaves)</option>
                <option value="Growing">Growing (Vegetative)</option>
                <option value="Mature">Mature / Flowering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                Growing Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              >
                <option value="Balcony Rack">Balcony Rack</option>
                <option value="Kitchen Tier">Kitchen Tier</option>
                <option value="Window Sill">Window Sill</option>
                <option value="Patio">Patio</option>
                <option value="Living Room">Living Room</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                Vertical Rack Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              >
                <option value="top">Top Tier (Sun/Heat)</option>
                <option value="middle">Middle Tier (Greens/Herbs)</option>
                <option value="bottom">Bottom Tier (Heavier/Roots)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Initial Growth Note (Optional)
            </label>
            <textarea
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#fbeee9] border border-[#f8d7cb] text-xs text-[#9a3412] flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-[#526a57] hover:bg-[#f4f8f4] rounded-lg border border-[#e2dbce] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-[#144229] hover:bg-[#0c2417] disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save & Go to My Garden</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
