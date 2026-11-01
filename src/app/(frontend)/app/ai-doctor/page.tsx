'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { PLANTS_DATA } from '@/data/plants';
import { DiagnosisResponse, PossibleCondition } from '@/types/diagnosis';
import {
  Sparkles,
  Camera,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Droplets,
  Search,
  Upload,
  RefreshCw,
  Info,
  X,
  FileCheck2,
  Thermometer,
  Layers,
  Sun,
  Sprout,
  ArrowRight,
  ExternalLink,
  WifiOff,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';
import { usePwa } from '@/context/PwaContext';

export default function AiDoctorPage() {
  const { isOffline } = usePwa();

  // Grower Context State
  const [selectedPlantSlug, setSelectedPlantSlug] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('Every 2–3 days');
  const [sunlight, setSunlight] = useState('Partial Sun (3–6 hrs)');
  const [environment, setEnvironment] = useState('Balcony Tier');
  const [temperature, setTemperature] = useState('');
  const [soilInfo, setSoilInfo] = useState('');
  const [isHeuristicMode, setIsHeuristicMode] = useState(false);

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMetadata, setPhotoMetadata] = useState<{ name: string; sizeKb: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interaction State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick symptom presets
  const presets = [
    {
      label: 'Yellowing Lower Leaves',
      text: 'Lower leaves are turning pale yellow and drooping, but top growth is still green.',
      plant: 'genovese-basil',
      watering: 'Daily (top soil moist)',
    },
    {
      label: 'White Powdery Dusting',
      text: 'A white powdery flour-like dusting has formed on upper leaf surfaces and spreading.',
      plant: 'french-marigold',
      watering: 'Every 2–3 days',
    },
    {
      label: 'Crispy Brown Margins',
      text: 'Leaf margins and tips are turning brown, dry, and crispy like paper.',
      plant: 'golden-pothos',
      watering: 'Weekly',
    },
    {
      label: 'Stippling & Fine Webs',
      text: 'Noticed tiny yellow specks crawling on leaf undersides and fine silk webs in stem joints.',
      plant: 'cherry-tomato',
      watering: 'Every 2 days',
    },
  ];

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    setSymptoms(preset.text);
    setSelectedPlantSlug(preset.plant);
    if (preset.watering) setWateringFrequency(preset.watering);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size client-side (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5 MB limit. Please choose a smaller image.');
      return;
    }

    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP photograph.');
      return;
    }

    setPhotoFile(file);
    setPhotoMetadata({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
    });

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setError(null);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOffline) {
      setError('You are currently offline. Gemini Vision AI Plant Doctor requires an active internet connection to evaluate photos.');
      return;
    }

    if (!symptoms.trim()) {
      setError('Please describe what symptoms or visual issues you observe on the plant.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Multi-phase progress descriptions without fake percentage numbers
    setLoadingStep('Inspecting photograph resolution and focus...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep(
        isHeuristicMode
          ? 'Cross-referencing agronomic rulebase and verified symptoms...'
          : 'Analyzing foliar morphology with Gemini 3.8 Flash Vision...'
      );
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Synthesizing low-risk cultural guidance and preventative care...');
    }, 2200);

    try {
      const plant = PLANTS_DATA.find((p) => p.slug === selectedPlantSlug);

      const formData = new FormData();
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      formData.append('symptoms', symptoms.trim());
      if (selectedPlantSlug) formData.append('plantSlug', selectedPlantSlug);
      if (plant) formData.append('plantName', plant.commonName);
      formData.append('wateringFrequency', wateringFrequency);
      formData.append('sunlight', sunlight);
      formData.append('environment', environment);
      if (temperature) formData.append('temperature', temperature);
      if (soilInfo) formData.append('soilInfo', soilInfo);
      formData.append('mode', isHeuristicMode ? 'heuristic' : 'ai');

      const response = await fetch('/api/ai-doctor', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setResult(data as DiagnosisResponse);
    } catch (err: any) {
      setError(err.message || 'Diagnosis consultation failed. Please check your network and try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    handleRemovePhoto();
    setSymptoms('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="AI Plant Doctor Consultation"
        subtitle="Multimodal vision diagnostics powered by Gemini 3.8 Flash with verified agronomic heuristics."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Friendly Consultation Intro */}
        <div className="bg-[#0e2a1b] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm space-y-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1e4d34] text-white">
                <Stethoscope size={18} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#9ec4a9]">
                Friendly Plant Health Clinic
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Let&apos;s diagnose your plant together.
            </h2>
            <p className="text-sm sm:text-base text-[#d1e6d7] leading-relaxed">
              Tell us what you notice and attach a photo. Clear natural lighting on the affected leaf or stem helps Gemini Vision distinguish between watering stress, pest damage, and fungal spots.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#bed4c5]">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Camera size={16} className="text-[#a4f0bf] shrink-0" />
              <span>Natural daylight close-ups</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Droplets size={16} className="text-[#a4f0bf] shrink-0" />
              <span>Watering & environment details</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <HeartHandshake size={16} className="text-[#a4f0bf] shrink-0" />
              <span>Non-toxic, safe home care</span>
            </div>
          </div>
        </div>

        {/* Offline Warning Notice if disconnected */}
        {isOffline && (
          <div className="bg-[#fff8e6] border border-[#fde68a] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-sm text-[#92400e] shadow-2xs">
            <WifiOff size={22} className="shrink-0 mt-0.5 text-[#b45309]" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#78350f]">
                Offline Mode: Gemini Vision Requires Internet Connectivity
              </h4>
              <p className="leading-relaxed text-[#92400e]">
                AI photo diagnosis runs securely on our servers. While offline, you can explore peer-reviewed care parameters and organic pest remedies in the cached Plant Library.
              </p>
              <div className="pt-1">
                <Link
                  href="/app/plants"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#144229] hover:underline"
                >
                  <span>Explore Cached Plant Library Remedies →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Input Card */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f0ebe0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                  Plant Consultation Form
                </h3>
                <p className="text-xs text-[#526a57]">
                  Fill in symptoms below or pick a quick scenario to begin
                </p>
              </div>
            </div>

            {/* Engine Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#f4f2eb] p-1.5 rounded-xl border border-[#ded5c5] self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsHeuristicMode(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  !isHeuristicMode
                    ? 'bg-[#144229] text-white shadow-2xs'
                    : 'text-[#445b49] hover:text-[#0c2417]'
                }`}
              >
                ✨ Gemini 3.8 Flash
              </button>
              <button
                type="button"
                onClick={() => setIsHeuristicMode(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  isHeuristicMode
                    ? 'bg-[#144229] text-white shadow-2xs'
                    : 'text-[#445b49] hover:text-[#0c2417]'
                }`}
              >
                🌱 Heuristic Rulebase
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
              Quick Test Scenarios:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((pr) => (
                <button
                  key={pr.label}
                  type="button"
                  onClick={() => handlePresetClick(pr)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#fbf9f4] hover:bg-[#eef5ee] text-[#144229] border border-[#ded5c5] transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  ⚡ {pr.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Photograph Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#144229]">
                  Plant Photograph (Optional but highly recommended)
                </label>
                <span className="text-xs text-[#526a57]">JPEG, PNG, WebP up to 5 MB</span>
              </div>

              <div className="border-2 border-dashed border-[#ded5c5] hover:border-[#144229] rounded-3xl p-6 sm:p-8 text-center bg-[#fbf9f4] transition-all relative">
                {photoPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Uploaded plant specimen preview"
                        className="max-h-64 rounded-2xl mx-auto object-cover border border-[#ded5c5] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2.5 -right-2.5 p-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white rounded-full shadow-md transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Remove photograph"
                        aria-label="Remove photograph"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#144229]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FileCheck2 size={18} />
                        <span>{photoMetadata?.name} ({photoMetadata?.sizeKb} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="text-xs font-semibold text-[#144229] underline hover:no-underline cursor-pointer min-h-[44px] flex items-center"
                      >
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-[#9a3412] underline hover:no-underline cursor-pointer min-h-[44px] flex items-center"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
                      <Camera size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-serif font-bold text-[#0c2417]">
                        Upload a clear close-up of the plant leaf or stem
                      </p>
                      <p className="text-xs text-[#526a57] mt-0.5 max-w-md mx-auto">
                        High resolution natural daylight photos allow Gemini 3.8 Flash to evaluate discoloration, spore patterning, and insect traces.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#cfdfcf] text-[#144229] hover:bg-[#eef5ee] cursor-pointer shadow-xs transition-colors min-h-[44px]"
                      >
                        <Upload size={16} />
                        <span>Select Photo from Device</span>
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 2. Plant Selection & Growing Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                  Plant Species (Optional if known)
                </label>
                <select
                  value={selectedPlantSlug}
                  onChange={(e) => setSelectedPlantSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                >
                  <option value="">Unknown / Auto-detect via Vision</option>
                  {PLANTS_DATA.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.commonName} ({p.scientificName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                  Growing Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                >
                  <option value="Balcony Tier">Balcony Vertical Tier</option>
                  <option value="Sunny Windowsill">Indoor Sunny Windowsill</option>
                  <option value="Patio Container">Open Patio Container</option>
                  <option value="Indoor LED Rack">Indoor Grow Light / LED Rack</option>
                  <option value="Kitchen Counter">Kitchen Hydroponic / Countertop</option>
                </select>
              </div>
            </div>

            {/* 3. Watering & Sunlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Droplets size={14} className="text-[#144229]" />
                  <span>Watering Routine</span>
                </label>
                <select
                  value={wateringFrequency}
                  onChange={(e) => setWateringFrequency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                >
                  <option value="Daily">Daily (frequent)</option>
                  <option value="Every 2–3 days">Every 2–3 days (moderate)</option>
                  <option value="Weekly">Weekly (infrequent)</option>
                  <option value="When top soil is dry">When top 3 cm is dry to the touch</option>
                  <option value="Irregular">Irregular / As remembered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Sun size={14} className="text-[#b45309]" />
                  <span>Sunlight Exposure</span>
                </label>
                <select
                  value={sunlight}
                  onChange={(e) => setSunlight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                >
                  <option value="Full Sun (6+ hrs direct)">Full Sun (6+ hours direct sunlight)</option>
                  <option value="Partial Sun (3–6 hrs)">Partial Sun / Morning Sun (3–6 hours)</option>
                  <option value="Bright Indirect">Bright Indirect Light (No direct rays)</option>
                  <option value="Low Light">Low Light / Dappled Shade</option>
                </select>
              </div>
            </div>

            {/* 4. Ambient Temperature & Substrate Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Thermometer size={14} className="text-[#526a57]" />
                  <span>Ambient Temperature (Optional)</span>
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 24°C daytime, 18°C night"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#526a57]" />
                  <span>Potting Medium / Substrate (Optional)</span>
                </label>
                <input
                  type="text"
                  value={soilInfo}
                  onChange={(e) => setSoilInfo(e.target.value)}
                  placeholder="e.g. Potting soil + perlite, coco coir, clay pebbles"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                />
              </div>
            </div>

            {/* 5. Observed Symptoms Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                Observed Symptoms & Problem Description <span className="text-[#9a3412]">*</span>
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe leaf discoloration, brown margins, white powdery mold, wilting stems, insect webs, or stunted growth..."
                required
                className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#fbeee9] border border-[#f8d7cb] text-xs sm:text-sm font-semibold text-[#9a3412] flex items-center gap-3">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#526a57]">
                {photoFile ? '✓ Specimen photo ready for evaluation' : '💡 Tip: Attaching a photo unlocks multimodal vision.'}
              </span>

              <button
                type="submit"
                disabled={loading || isOffline}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-8 py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {isOffline ? (
                  <>
                    <WifiOff size={18} />
                    <span>Offline — Reconnect to Consult AI</span>
                  </>
                ) : loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>{loadingStep || 'Analyzing Specimen...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{isHeuristicMode ? 'Run Heuristic Consultation' : 'Analyze with Gemini Vision'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 6. Structured Diagnosis Results */}
        {result && (
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-sm space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0c2417]">
                    Diagnostic Findings & Agronomic Report
                  </h3>
                  <p className="text-xs text-[#526a57] mt-0.5">
                    Assessment ID: {result.id} • Engine: <strong>{result.engine}</strong> ({result.modelUsed || 'Heuristic'})
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap gap-2">
                {result.status === 'completed' && (
                  <Badge variant="forest" size="md">Analysis Completed</Badge>
                )}
                {result.status === 'inconclusive' && (
                  <Badge variant="amber" size="md">Inconclusive Result</Badge>
                )}
                {result.status === 'not_a_plant' && (
                  <Badge variant="terracotta" size="md">Plant Not Detected</Badge>
                )}
                {result.status === 'service_unavailable' && (
                  <Badge variant="neutral" size="md">Service Unavailable</Badge>
                )}
              </div>
            </div>

            {/* Specimen Recognition & Health Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Plant Identification
                </span>
                <p className="text-base font-serif font-bold text-[#0c2417]">
                  {result.plantIdentification}
                </p>
                <span className="text-xs text-[#526a57] capitalize">
                  Confidence: {result.plantIdentificationConfidence}
                </span>
              </div>

              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Overall Botanical Health
                </span>
                <p className="text-base font-serif font-bold capitalize text-[#0c2417]">
                  {result.overallHealth.replace('_', ' ')}
                </p>
                <span className="text-xs text-[#526a57]">
                  {result.requiresExpertReview ? '⚠️ Specialist review advised' : '✓ Self-manageable at home'}
                </span>
              </div>

              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Diagnostic Certainty
                </span>
                <p className="text-base font-serif font-bold text-[#144229]">
                  {result.possibleConditions[0]?.confidenceCategory.toUpperCase() || 'MODERATE'}
                </p>
                <span className="text-xs text-[#526a57]">
                  Grounded in observable symptoms
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] text-sm text-[#0c2417] leading-relaxed">
              <strong className="font-serif text-base block text-[#144229] mb-1">Consultation Summary:</strong>
              {result.summary}
            </div>

            {/* If Not A Plant Warning */}
            {!result.isPlantRecognized && (
              <div className="p-4 rounded-2xl bg-[#fbeee9] border border-[#f8d7cb] text-xs sm:text-sm text-[#9a3412] space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle size={18} />
                  <span>No recognizable living plant was detected in this photo.</span>
                </div>
                <p>
                  To receive a plant diagnosis, please upload a clear, focused photograph of a living leaf, stem, or pot.
                </p>
              </div>
            )}

            {/* Observable Symptoms */}
            {result.visibleSymptoms && result.visibleSymptoms.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-2">
                  <Search size={15} />
                  <span>Observed Visible Evidence:</span>
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {result.visibleSymptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#fbf9f4] text-[#144229] border border-[#ded5c5]"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions Breakdown */}
            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c2417]">
                  Identified Possible Conditions & Differential Diagnosis:
                </h4>

                <div className="space-y-4">
                  {result.possibleConditions.map((condition: PossibleCondition, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border border-[#ded5c5] shadow-xs space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0ebe0]">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#144229]">
                            Condition Hypothesis #{idx + 1}
                          </span>
                          <h5 className="text-lg font-serif font-bold text-[#0c2417]">
                            {condition.name}
                          </h5>
                        </div>
                        <Badge
                          variant={
                            condition.confidenceCategory === 'high'
                              ? 'forest'
                              : condition.confidenceCategory === 'moderate'
                              ? 'amber'
                              : 'neutral'
                          }
                          size="md"
                        >
                          Confidence: {condition.confidenceCategory}
                        </Badge>
                      </div>

                      <p className="text-sm text-[#2e4435] leading-relaxed">
                        {condition.explanation}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Direct Evidence */}
                        <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5] space-y-2">
                          <span className="text-xs font-bold text-[#144229] flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-[#144229]" />
                            Supporting Visible Evidence:
                          </span>
                          <ul className="text-xs text-[#445b49] space-y-1.5">
                            {condition.supportingEvidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#144229] font-bold">•</span>
                                <span className="leading-relaxed">{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Alternative Causes */}
                        <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5] space-y-2">
                          <span className="text-xs font-bold text-[#92400e] flex items-center gap-1.5">
                            <HelpCircle size={15} className="text-[#92400e]" />
                            Alternative Causes Considered:
                          </span>
                          <ul className="text-xs text-[#445b49] space-y-1.5">
                            {condition.alternativeCauses.map((alt, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#92400e] font-bold">•</span>
                                <span className="leading-relaxed">{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Low-Risk Guidance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Immediate Corrective Actions */}
              <div className="bg-[#fbf9f4] p-6 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#144229]" />
                  Immediate Low-Risk Corrective Steps
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#2e4435]">
                  {result.immediateActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#144229] mt-2 shrink-0" />
                      <span className="leading-relaxed">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Physical Checks */}
              <div className="bg-[#fbf9f4] p-6 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c2417] flex items-center gap-2">
                  <Search size={18} className="text-[#0c2417]" />
                  Recommended Physical Checks
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#2e4435]">
                  {result.recommendedChecks.map((chk, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0c2417] mt-2 shrink-0" />
                      <span className="leading-relaxed">{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long Term Care */}
              <div className="bg-[#fbf9f4] p-6 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#1e613b] flex items-center gap-2">
                  <Sprout size={18} className="text-[#1e613b]" />
                  Ongoing Cultural Care Adjustments
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#2e4435]">
                  {result.longTermCare.map((lt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#1e613b] mt-2 shrink-0" />
                      <span className="leading-relaxed">{lt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Sustainable 3Rs */}
              <div className="bg-[#eef5ee] p-6 rounded-2xl border border-[#cfe0cf] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-2">
                  <Droplets size={18} className="text-[#144229]" />
                  Sustainable Prevention (3Rs Home Botany)
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#1e613b]">
                  {result.prevention.map((prev, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#144229] mt-2 shrink-0" />
                      <span className="leading-relaxed font-medium">{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Uncertainties Box */}
            {result.uncertainties && result.uncertainties.length > 0 && (
              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5] text-xs sm:text-sm text-[#526a57] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#0c2417] text-xs block">
                  Diagnosis Uncertainties & Photo Limitations:
                </span>
                <ul className="space-y-1.5">
                  {result.uncertainties.map((unc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#144229]">•</span>
                      <span className="leading-relaxed">{unc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expert Review Advisory */}
            {result.requiresExpertReview && (
              <div className="p-5 rounded-2xl bg-[#fff8e6] border border-[#fde68a] text-xs sm:text-sm text-[#92400e] flex items-start gap-3.5">
                <ShieldAlert size={22} className="shrink-0 text-[#b45309] mt-0.5" />
                <div className="space-y-1">
                  <h6 className="font-bold text-[#78350f]">
                    Certified Extension Specialist Consultation Advised
                  </h6>
                  <p className="leading-relaxed">
                    Because symptoms appear advanced or ambiguous, we recommend taking a fresh cutting to your local university agricultural extension service or certified plant pathologist for confirmation before applying significant chemical treatments.
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up / New Assessment Actions */}
            <div className="pt-5 border-t border-[#f0ebe0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#526a57] space-y-1">
                <p className="font-semibold text-[#0c2417]">
                  Follow-up: {result.suggestedFollowUp || 'Monitor plant recovery over the next 48 hours.'}
                </p>
                <p className="italic text-[11px]">{result.disclaimer}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#ded5c5] bg-white hover:bg-[#fbf9f4] text-xs sm:text-sm font-semibold text-[#0c2417] transition-colors cursor-pointer min-h-[44px]"
                >
                  Start New Assessment
                </button>
                <Link
                  href="/app/my-garden"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs sm:text-sm font-semibold transition-colors text-center shadow-xs min-h-[44px] flex items-center justify-center"
                >
                  Go to My Garden
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
