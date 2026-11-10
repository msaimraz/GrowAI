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
import { SaveDiagnosisModal } from '@/components/diagnosis/SaveDiagnosisModal';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { History, BookmarkCheck } from 'lucide-react';

export default function AiDoctorPage() {
  const { isOffline } = usePwa();
  const { showSuccess } = useGrowToast();

  // Grower Context State
  const [selectedPlantSlug, setSelectedPlantSlug] = useState<string>('');
  const [urlPlantId, setUrlPlantId] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('Every 2–3 days');
  const [sunlight, setSunlight] = useState('Partial Sun (3–6 hrs)');
  const [environment, setEnvironment] = useState('Balcony Tier');
  const [temperature, setTemperature] = useState('');
  const [soilInfo, setSoilInfo] = useState('');
  const [isHeuristicMode, setIsHeuristicMode] = useState(false);

  // Initialize query parameters from URL if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const slug = sp.get('plantSlug');
      const pId = sp.get('plantId');
      if (slug) setSelectedPlantSlug(slug);
      if (pId) setUrlPlantId(pId);
    }
  }, []);

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);

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
      const isFallback = (data as DiagnosisResponse).modelUsed?.toLowerCase().includes('heuristic') || (data as DiagnosisResponse).modelUsed?.toLowerCase().includes('rule');
      if (isFallback) {
        showSuccess('🌿 Plant check complete', 'Botanical guidance prepared from plant care records.', '🌿');
      } else {
        showSuccess('🌿 Plant check complete', 'Visual inspection analysis ready to review.', '🌿');
      }
    } catch (err: any) {
      console.error('Plant check consultation error:', err);
      setError(err.message || 'We couldn’t inspect this plant photo right now. Please check your connection and try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setShowSaveModal(false);
    setSavedDiagnosisId(null);
    setResult(null);
    setError(null);
    handleRemovePhoto();
    setSymptoms('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EE]">
      <AppHeader
        title="Plant Check"
        subtitle="Not sure what’s wrong with your plant? Snap a photo and we’ll help you investigate."
        actionHref="/app/ai-doctor/history"
        actionLabel="Check History"
        actionIcon="none"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full min-w-0 max-w-full space-y-6 sm:space-y-8">
        {/* Friendly Consultation Intro */}
        <div className="bg-[#174C35] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xs space-y-3">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-xl">
                🌿
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#78A95A]">
                Plant Health Clinic
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Not sure what’s wrong?
            </h1>
            <p className="text-sm sm:text-base text-[#EAF1E4] leading-relaxed">
              Take a photo of your plant and we’ll investigate. Good natural light on affected leaves helps spot whether it’s watering stress, sunlight issues, or bugs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#EAF1E4]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
              📷 Clear daylight close-ups
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
              💧 Non-toxic home remedies
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
              🌱 Safe for edible herbs & greens
            </span>
          </div>
        </div>

        {/* Offline Warning Notice if disconnected */}
        {isOffline && (
          <div className="bg-[#FFF3D7] border border-[#F0C04D/30] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-sm text-[#8A6400] shadow-2xs">
            <WifiOff size={22} className="shrink-0 mt-0.5 text-[#8A6400]" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#8A6400]">
                Offline Mode: Gemini Vision Requires Internet Connectivity
              </h4>
              <p className="leading-relaxed text-[#8A6400]">
                AI photo diagnosis runs securely on our servers. While offline, you can explore peer-reviewed care parameters and organic pest remedies in the cached Plant Library.
              </p>
              <div className="pt-1">
                <Link
                  href="/app/plants"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#174C35] hover:underline"
                >
                  <span>Explore Cached Plant Library Remedies →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Input Card */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3DFD2]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#203027]">
                  Plant Consultation Form
                </h3>
                <p className="text-xs text-[#68766C]">
                  Fill in symptoms below or pick a quick scenario to begin
                </p>
              </div>
            </div>

            {/* Engine Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#F8F6EE] p-1.5 rounded-xl border border-[#E3DFD2] self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsHeuristicMode(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  !isHeuristicMode
                    ? 'bg-[#174C35] text-white shadow-2xs'
                    : 'text-[#68766C] hover:text-[#203027]'
                }`}
              >
                ✨ Gemini 3.8 Flash
              </button>
              <button
                type="button"
                onClick={() => setIsHeuristicMode(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  isHeuristicMode
                    ? 'bg-[#174C35] text-white shadow-2xs'
                    : 'text-[#68766C] hover:text-[#203027]'
                }`}
              >
                🌱 Heuristic Rulebase
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#174C35] block">
              Quick Test Scenarios:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((pr) => (
                <button
                  key={pr.label}
                  type="button"
                  onClick={() => handlePresetClick(pr)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#F8F6EE] hover:bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2] transition-colors cursor-pointer min-h-[44px] flex items-center"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#174C35]">
                  Plant Photograph (Optional but highly recommended)
                </label>
                <span className="text-xs text-[#68766C]">JPEG, PNG, WebP up to 5 MB</span>
              </div>

              <div className="border-2 border-dashed border-[#E3DFD2] hover:border-[#174C35] rounded-3xl p-6 sm:p-8 text-center bg-[#F8F6EE] transition-all relative">
                {photoPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Uploaded plant specimen preview"
                        className="max-h-64 rounded-2xl mx-auto object-cover border border-[#E3DFD2] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2.5 -right-2.5 p-2 bg-[#963A23] hover:bg-[#963A23] text-white rounded-full shadow-md transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Remove photograph"
                        aria-label="Remove photograph"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#174C35]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FileCheck2 size={18} />
                        <span>{photoMetadata?.name} ({photoMetadata?.sizeKb} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="text-xs font-semibold text-[#174C35] underline hover:no-underline cursor-pointer min-h-[44px] flex items-center"
                      >
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-[#963A23] underline hover:no-underline cursor-pointer min-h-[44px] flex items-center"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-[#EAF1E4] text-[#174C35] flex items-center justify-center mx-auto">
                      <Camera size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-serif font-bold text-[#203027]">
                        Upload a clear close-up of the plant leaf or stem
                      </p>
                      <p className="text-xs text-[#68766C] mt-0.5 max-w-md mx-auto">
                        High resolution natural daylight photos allow Gemini 3.8 Flash to evaluate discoloration, spore patterning, and insect traces.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#E3DFD2] text-[#174C35] hover:bg-[#EAF1E4] cursor-pointer shadow-xs transition-colors min-h-[44px]"
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
                <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                  Plant Species (Optional if known)
                </label>
                <select
                  value={selectedPlantSlug}
                  onChange={(e) => setSelectedPlantSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm font-medium text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
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
                <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                  Growing Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm font-medium text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
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
                <label className="block text-xs font-semibold text-[#203027] mb-1.5 flex items-center gap-1.5">
                  <Droplets size={14} className="text-[#174C35]" />
                  <span>Watering Routine</span>
                </label>
                <select
                  value={wateringFrequency}
                  onChange={(e) => setWateringFrequency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm font-medium text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                >
                  <option value="Daily">Daily (frequent)</option>
                  <option value="Every 2–3 days">Every 2–3 days (moderate)</option>
                  <option value="Weekly">Weekly (infrequent)</option>
                  <option value="When top soil is dry">When top 3 cm is dry to the touch</option>
                  <option value="Irregular">Irregular / As remembered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1.5 flex items-center gap-1.5">
                  <Sun size={14} className="text-[#8A6400]" />
                  <span>Sunlight Exposure</span>
                </label>
                <select
                  value={sunlight}
                  onChange={(e) => setSunlight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm font-medium text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
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
                <label className="block text-xs font-semibold text-[#203027] mb-1.5 flex items-center gap-1.5">
                  <Thermometer size={14} className="text-[#68766C]" />
                  <span>Ambient Temperature (Optional)</span>
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 24°C daytime, 18°C night"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#68766C]" />
                  <span>Potting Medium / Substrate (Optional)</span>
                </label>
                <input
                  type="text"
                  value={soilInfo}
                  onChange={(e) => setSoilInfo(e.target.value)}
                  placeholder="e.g. Potting soil + perlite, coco coir, clay pebbles"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                />
              </div>
            </div>

            {/* 5. Observed Symptoms Description */}
            <div>
              <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                Observed Symptoms & Problem Description <span className="text-[#963A23]">*</span>
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe leaf discoloration, brown margins, white powdery mold, wilting stems, insect webs, or stunted growth..."
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] text-xs sm:text-sm font-semibold text-[#963A23] flex items-center gap-3">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#68766C]">
                {photoFile ? '✓ Specimen photo ready for evaluation' : '💡 Tip: Attaching a photo unlocks multimodal vision.'}
              </span>

              <button
                type="submit"
                disabled={loading || isOffline}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#174C35] hover:bg-[#203027] text-white px-8 py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer disabled:opacity-50 min-h-[44px]"
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
          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-sm space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3DFD2]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center text-xl">
                  🌿
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#68766C] block">
                    Plant Health Results
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#203027]">
                    Here’s what we found with your plant
                  </h3>
                </div>
              </div>

              {/* Status Badge & Re-take */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E3DFD2] hover:bg-[#EAF1E4] text-xs font-medium text-[#203027] transition-colors cursor-pointer"
                >
                  Check Another Photo
                </button>
                {result.status === 'completed' && (
                  <Badge variant="forest" size="md">Analysis Complete</Badge>
                )}
                {result.status === 'inconclusive' && (
                  <Badge variant="amber" size="md">Needs Clearer Photo</Badge>
                )}
              </div>
            </div>

            {/* Specimen Recognition & Health Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F8F6EE] p-5 rounded-2xl border border-[#E3DFD2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766C] block mb-1">
                  Plant Identification
                </span>
                <p className="text-base font-serif font-bold text-[#203027]">
                  {result.plantIdentification}
                </p>
                <span className="text-xs text-[#68766C] capitalize">
                  Confidence: {result.plantIdentificationConfidence}
                </span>
              </div>

              <div className="bg-[#F8F6EE] p-5 rounded-2xl border border-[#E3DFD2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766C] block mb-1">
                  Overall Botanical Health
                </span>
                <p className="text-base font-serif font-bold capitalize text-[#203027]">
                  {result.overallHealth.replace('_', ' ')}
                </p>
                <span className="text-xs text-[#68766C]">
                  {result.requiresExpertReview ? '⚠️ Specialist review advised' : '✓ Self-manageable at home'}
                </span>
              </div>

              <div className="bg-[#F8F6EE] p-5 rounded-2xl border border-[#E3DFD2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766C] block mb-1">
                  Diagnostic Certainty
                </span>
                <p className="text-base font-serif font-bold text-[#174C35]">
                  {result.possibleConditions[0]?.confidenceCategory.toUpperCase() || 'MODERATE'}
                </p>
                <span className="text-xs text-[#68766C]">
                  Grounded in observable symptoms
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] text-sm text-[#203027] leading-relaxed">
              <strong className="font-serif text-base block text-[#174C35] mb-1">Consultation Summary:</strong>
              {result.summary}
            </div>

            {/* If Not A Plant Warning */}
            {!result.isPlantRecognized && (
              <div className="p-4 rounded-2xl bg-[#FBE9E2] border border-[#E4775D/30] text-xs sm:text-sm text-[#963A23] space-y-1">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#174C35] flex items-center gap-2">
                  <Search size={15} />
                  <span>Observed Visible Evidence:</span>
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {result.visibleSymptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#F8F6EE] text-[#174C35] border border-[#E3DFD2]"
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#203027]">
                  Identified Possible Conditions & Differential Diagnosis:
                </h4>

                <div className="space-y-4">
                  {result.possibleConditions.map((condition: PossibleCondition, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border border-[#E3DFD2] shadow-xs space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3DFD2]">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174C35]">
                            Condition Hypothesis #{idx + 1}
                          </span>
                          <h5 className="text-lg font-serif font-bold text-[#203027]">
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

                      <p className="text-sm text-[#203027] leading-relaxed">
                        {condition.explanation}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Direct Evidence */}
                        <div className="bg-[#F8F6EE] p-4 rounded-xl border border-[#E3DFD2] space-y-2">
                          <span className="text-xs font-bold text-[#174C35] flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-[#174C35]" />
                            Supporting Visible Evidence:
                          </span>
                          <ul className="text-xs text-[#68766C] space-y-1.5">
                            {condition.supportingEvidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#174C35] font-bold">•</span>
                                <span className="leading-relaxed">{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Alternative Causes */}
                        <div className="bg-[#F8F6EE] p-4 rounded-xl border border-[#E3DFD2] space-y-2">
                          <span className="text-xs font-bold text-[#8A6400] flex items-center gap-1.5">
                            <HelpCircle size={15} className="text-[#8A6400]" />
                            Alternative Causes Considered:
                          </span>
                          <ul className="text-xs text-[#68766C] space-y-1.5">
                            {condition.alternativeCauses.map((alt, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#8A6400] font-bold">•</span>
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
              <div className="bg-[#F8F6EE] p-6 rounded-2xl border border-[#E3DFD2] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#174C35] flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#174C35]" />
                  Immediate Low-Risk Corrective Steps
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#203027]">
                  {result.immediateActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#174C35] mt-2 shrink-0" />
                      <span className="leading-relaxed">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Physical Checks */}
              <div className="bg-[#F8F6EE] p-6 rounded-2xl border border-[#E3DFD2] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#203027] flex items-center gap-2">
                  <Search size={18} className="text-[#203027]" />
                  Recommended Physical Checks
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#203027]">
                  {result.recommendedChecks.map((chk, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#203027] mt-2 shrink-0" />
                      <span className="leading-relaxed">{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long Term Care */}
              <div className="bg-[#F8F6EE] p-6 rounded-2xl border border-[#E3DFD2] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#174C35] flex items-center gap-2">
                  <Sprout size={18} className="text-[#174C35]" />
                  Ongoing Cultural Care Adjustments
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#203027]">
                  {result.longTermCare.map((lt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#174C35] mt-2 shrink-0" />
                      <span className="leading-relaxed">{lt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Sustainable 3Rs */}
              <div className="bg-[#EAF1E4] p-6 rounded-2xl border border-[#E3DFD2] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#174C35] flex items-center gap-2">
                  <Droplets size={18} className="text-[#174C35]" />
                  Sustainable Prevention (3Rs Home Botany)
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#174C35]">
                  {result.prevention.map((prev, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#174C35] mt-2 shrink-0" />
                      <span className="leading-relaxed font-medium">{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Uncertainties Box */}
            {result.uncertainties && result.uncertainties.length > 0 && (
              <div className="bg-[#F8F6EE] p-5 rounded-2xl border border-[#E3DFD2] text-xs sm:text-sm text-[#68766C] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#203027] text-xs block">
                  Diagnosis Uncertainties & Photo Limitations:
                </span>
                <ul className="space-y-1.5">
                  {result.uncertainties.map((unc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#174C35]">•</span>
                      <span className="leading-relaxed">{unc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expert Review Advisory */}
            {result.requiresExpertReview && (
              <div className="p-5 rounded-2xl bg-[#FFF3D7] border border-[#F0C04D/30] text-xs sm:text-sm text-[#8A6400] flex items-start gap-3.5">
                <ShieldAlert size={22} className="shrink-0 text-[#8A6400] mt-0.5" />
                <div className="space-y-1">
                  <h6 className="font-bold text-[#8A6400]">
                    Certified Extension Specialist Consultation Advised
                  </h6>
                  <p className="leading-relaxed">
                    Because symptoms appear advanced or ambiguous, we recommend taking a fresh cutting to your local university agricultural extension service or certified plant pathologist for confirmation before applying significant chemical treatments.
                  </p>
                </div>
              </div>
            )}

            {/* Save Diagnosis to History Modal */}
            <SaveDiagnosisModal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              diagnosis={result}
              defaultPlantId={urlPlantId || undefined}
              onSaved={(id) => setSavedDiagnosisId(id)}
            />

            {/* Follow-up / New Assessment Actions */}
            <div className="pt-5 border-t border-[#E3DFD2] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#68766C] space-y-1">
                <p className="font-semibold text-[#203027]">
                  Follow-up: {result.suggestedFollowUp || 'Monitor plant recovery over the next 48 hours.'}
                </p>
                <p className="italic text-[11px]">{result.disclaimer}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {savedDiagnosisId ? (
                  <Link
                    href={`/app/ai-doctor/history/${savedDiagnosisId}`}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] hover:bg-[#EAF1E4] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    <BookmarkCheck size={16} />
                    <span>View in History →</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#174C35] hover:bg-[#174C35] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <BookmarkCheck size={16} />
                    <span>Save Diagnosis</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#F8F6EE] text-xs sm:text-sm font-semibold text-[#203027] transition-colors cursor-pointer min-h-[44px]"
                >
                  Start New Assessment
                </button>
                <Link
                  href="/app/my-garden"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs sm:text-sm font-semibold transition-colors text-center shadow-xs min-h-[44px] flex items-center justify-center"
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
