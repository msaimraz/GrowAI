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
  Sliders,
  Check,
} from 'lucide-react';

export default function AiDoctorPage() {
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
      setError('Please upload a genuine JPEG, PNG, or WebP photograph.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError('Please describe what symptoms or visual issues you observe on the plant.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Multi-phase progress simulation for authentic loading state
    setLoadingStep('Validating photographic binary signature & dimensions...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep(
        isHeuristicMode
          ? 'Cross-referencing agronomic heuristics...'
          : 'Evaluating botanical morphology with Gemini 3.8 Flash...'
      );
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Synthesizing low-risk cultural guidance & evidence...');
    }, 2400);

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
      setError(err.message || 'Diagnosis failed. Please check your network and try again.');
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="AI Plant Doctor"
        subtitle="Multimodal vision diagnostics powered by Gemini 3.8 Flash with verified agronomic heuristics."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Educational Disclaimer Banner */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded-2xl flex items-start gap-3.5 text-xs text-[#1e40af] shadow-2xs">
          <Info size={18} className="shrink-0 mt-0.5 text-[#2563eb]" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#1e3a8a]">
              Educational Agronomic Assistance (Not a Certified Laboratory Assay)
            </h4>
            <p className="leading-relaxed">
              GrowAI utilizes multimodal vision to detect observable visual symptoms and recommend non-toxic, cultural plant care. It does not replace a certified university agricultural extension lab diagnosis.
            </p>
          </div>
        </div>

        {/* Diagnostic Input Card */}
        <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229]">
                <Sparkles size={22} />
              </span>
              <div>
                <h2 className="font-serif font-bold text-xl text-[#0c2417]">
                  New Plant Health Assessment
                </h2>
                <p className="text-xs text-[#526a57]">
                  Upload a photograph and provide growing conditions for an evidence-based diagnosis
                </p>
              </div>
            </div>

            {/* Engine Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#f4f2eb] p-1 rounded-xl border border-[#ded5c5] self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsHeuristicMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f7f5ed] hover:bg-[#eef5ee] text-[#1e613b] border border-[#ded5c5] transition-colors cursor-pointer"
                >
                  ⚡ {pr.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Photograph Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                Plant Photograph (JPEG, PNG, or WebP • Max 5 MB)
              </label>

              <div className="border-2 border-dashed border-[#ded5c5] hover:border-[#144229] rounded-2xl p-5 text-center bg-[#fbf9f4] transition-colors relative">
                {photoPreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Uploaded plant preview"
                        className="max-h-56 rounded-xl mx-auto object-cover border border-[#ded5c5] shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 p-1.5 bg-[#b95835] hover:bg-[#8e381b] text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="Remove photograph"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-xs text-[#1e613b]">
                      <FileCheck2 size={16} />
                      <span className="font-medium">
                        {photoMetadata?.name} ({photoMetadata?.sizeKb} KB)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs text-[#b95835] underline hover:no-underline font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Camera size={32} className="mx-auto text-[#7e9985]" />
                    <p className="text-xs font-medium text-[#0c2417]">
                      Drag & drop a clear photo of the affected leaf, stem, or whole plant
                    </p>
                    <p className="text-[11px] text-[#526a57]">
                      Natural daylight close-ups yield the highest diagnostic fidelity
                    </p>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl text-xs font-semibold bg-white border border-[#cfdfcf] text-[#144229] hover:bg-[#eef5ee] cursor-pointer shadow-2xs transition-colors">
                      <Upload size={14} />
                      <span>Select Photo from Device</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
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
                  <Droplets size={13} className="text-[#144229]" />
                  Watering Routine
                </label>
                <select
                  value={wateringFrequency}
                  onChange={(e) => setWateringFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
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
                  <Sun size={13} className="text-[#b45309]" />
                  Sunlight Exposure
                </label>
                <select
                  value={sunlight}
                  onChange={(e) => setSunlight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                >
                  <option value="Full Sun (6+ hrs direct)">Full Sun (6+ hours direct sunlight)</option>
                  <option value="Partial Sun (3–6 hrs)">Partial Sun / Morning Sun (3–6 hours)</option>
                  <option value="Bright Indirect">Bright Indirect Light (No direct rays)</option>
                  <option value="Low Light">Low Light / Dappled Shade</option>
                </select>
              </div>
            </div>

            {/* 4. Optional Ambient Temperature & Soil Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Thermometer size={13} className="text-[#526a57]" />
                  Ambient Temperature (Optional)
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 24°C daytime, 18°C night"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5 flex items-center gap-1.5">
                  <Layers size={13} className="text-[#526a57]" />
                  Substrate / Potting Medium (Optional)
                </label>
                <input
                  type="text"
                  value={soilInfo}
                  onChange={(e) => setSoilInfo(e.target.value)}
                  placeholder="e.g. Potting soil + perlite, coco coir, clay pebbles"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                />
              </div>
            </div>

            {/* 5. Observed Symptoms Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                Observed Foliage & Plant Symptoms <span className="text-[#b95835]">*</span>
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe leaf discoloration, spots, powdery mold, wilting, insect webbing, or stunted growth..."
                required
                className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs font-semibold text-[#b91c1c] flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#526a57]">
                {photoFile ? '✓ Image attached for analysis' : '💡 Tip: Attaching a photo unlocks multimodal vision.'}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-8 py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{loadingStep || 'Analyzing Specimen...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{isHeuristicMode ? 'Run Heuristic Diagnosis' : 'Analyze with Gemini Vision'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 6. Structured Diagnosis Results */}
        {result && (
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229]">
                  <CheckCircle2 size={24} />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                    Diagnostic Findings & Agronomic Report
                  </h3>
                  <p className="text-xs text-[#526a57]">
                    Assessment ID: {result.id} • Evaluated {new Date(result.analyzedAt).toLocaleTimeString()} • Engine: {result.engine} ({result.modelUsed || 'Heuristic'})
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
                  <Badge variant="terracotta" size="md">Plant Not Recognized</Badge>
                )}
                {result.status === 'service_unavailable' && (
                  <Badge variant="neutral" size="md">Service Unavailable</Badge>
                )}
              </div>
            </div>

            {/* Specimen Recognition & Health Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Plant Identification
                </span>
                <p className="text-sm font-bold text-[#0c2417]">
                  {result.plantIdentification}
                </p>
                <span className="text-[11px] text-[#526a57] capitalize">
                  Confidence: {result.plantIdentificationConfidence}
                </span>
              </div>

              <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Overall Botanical Health
                </span>
                <p className="text-sm font-bold capitalize text-[#0c2417]">
                  {result.overallHealth.replace('_', ' ')}
                </p>
                <span className="text-[11px] text-[#526a57]">
                  {result.requiresExpertReview ? '⚠️ Specialist review advised' : '✓ Self-manageable at home'}
                </span>
              </div>

              <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526a57] block mb-1">
                  Diagnostic Confidence
                </span>
                <p className="text-sm font-bold text-[#144229]">
                  {result.possibleConditions[0]?.confidenceCategory.toUpperCase() || 'MODERATE'}
                </p>
                <span className="text-[11px] text-[#526a57]">
                  Based on observable evidence
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-[#f7f5ed] border border-[#ded5c5] text-xs sm:text-sm text-[#0c2417] leading-relaxed">
              <strong>Evaluation Summary:</strong> {result.summary}
            </div>

            {/* If Not A Plant Warning */}
            {!result.isPlantRecognized && (
              <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle size={16} />
                  <span>No recognizable living plant was detected in this photo.</span>
                </div>
                <p>
                  To receive a plant diagnosis, please upload a clear, focused close-up photograph of a plant stem, leaf, or planter.
                </p>
              </div>
            )}

            {/* Observable Symptoms */}
            {result.visibleSymptoms && result.visibleSymptoms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229]">
                  Directly Observable Foliage Symptoms:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.visibleSymptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#eef5ee] text-[#144229] border border-[#cfe0cf]"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions Breakdown */}
            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c2417]">
                  Identified Possible Conditions & Differential Diagnosis:
                </h4>

                <div className="space-y-4">
                  {result.possibleConditions.map((condition: PossibleCondition, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#f0ebe0]">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e613b]">
                            Condition Hypothesis {idx + 1}
                          </span>
                          <h5 className="text-base font-serif font-bold text-[#0c2417]">
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
                          size="sm"
                        >
                          Confidence: {condition.confidenceCategory}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#394f3f] leading-relaxed">
                        {condition.explanation}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Direct Evidence */}
                        <div className="bg-[#fbf9f4] p-3.5 rounded-xl border border-[#ded5c5] space-y-1.5">
                          <span className="text-[11px] font-bold text-[#144229] flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#144229]" />
                            Supporting Visible Evidence:
                          </span>
                          <ul className="text-xs text-[#445b49] space-y-1">
                            {condition.supportingEvidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#144229] font-bold">•</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Alternative Causes */}
                        <div className="bg-[#fbf9f4] p-3.5 rounded-xl border border-[#ded5c5] space-y-1.5">
                          <span className="text-[11px] font-bold text-[#92400e] flex items-center gap-1.5">
                            <HelpCircle size={13} className="text-[#92400e]" />
                            Alternative Causes Considered:
                          </span>
                          <ul className="text-xs text-[#445b49] space-y-1">
                            {condition.alternativeCauses.map((alt, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#92400e] font-bold">•</span>
                                <span>{alt}</span>
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
              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#144229]" />
                  Immediate Low-Risk Corrective Steps
                </h5>
                <ul className="space-y-2 text-xs text-[#394f3f]">
                  {result.immediateActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#144229] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Physical Checks */}
              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c2417] flex items-center gap-2">
                  <Search size={16} className="text-[#0c2417]" />
                  Recommended Physical Checks
                </h5>
                <ul className="space-y-2 text-xs text-[#394f3f]">
                  {result.recommendedChecks.map((chk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0c2417] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long Term Care */}
              <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#ded5c5] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#1e613b] flex items-center gap-2">
                  <Sprout size={16} className="text-[#1e613b]" />
                  Ongoing Cultural Care Adjustments
                </h5>
                <ul className="space-y-2 text-xs text-[#394f3f]">
                  {result.longTermCare.map((lt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{lt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Sustainable 3Rs */}
              <div className="bg-[#f4f8f4] p-5 rounded-2xl border border-[#cfe0cf] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-2">
                  <Droplets size={16} className="text-[#144229]" />
                  Sustainable Prevention (3Rs Botany)
                </h5>
                <ul className="space-y-2 text-xs text-[#1e613b]">
                  {result.prevention.map((prev, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#144229] mt-1.5 shrink-0" />
                      <span className="leading-relaxed font-medium">{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Uncertainties Box */}
            {result.uncertainties && result.uncertainties.length > 0 && (
              <div className="bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5] text-xs text-[#526a57] space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[#0c2417] text-[10px] block">
                  Diagnosis Uncertainties & Photo Limitations:
                </span>
                <ul className="space-y-1">
                  {result.uncertainties.map((unc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{unc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expert Review Advisory */}
            {result.requiresExpertReview && (
              <div className="p-4 rounded-xl bg-[#fef3c7] border border-[#fde68a] text-xs text-[#92400e] flex items-start gap-3">
                <ShieldAlert size={20} className="shrink-0 text-[#b45309] mt-0.5" />
                <div className="space-y-1">
                  <h6 className="font-bold text-[#78350f]">
                    Professional Horticulturist Review Recommended
                  </h6>
                  <p className="leading-relaxed">
                    Because symptoms appear advanced or ambiguous, we recommend taking a fresh cutting to your local university agricultural extension service or certified plant nursery pathologist for confirmation before applying significant interventions.
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up / New Assessment Actions */}
            <div className="pt-4 border-t border-[#f0ebe0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#526a57] space-y-0.5">
                <p className="font-semibold text-[#0c2417]">
                  Follow-up: {result.suggestedFollowUp || 'Monitor plant recovery over the next 48 hours.'}
                </p>
                <p className="italic text-[11px]">{result.disclaimer}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#ded5c5] bg-white hover:bg-[#f7f5ed] text-xs font-semibold text-[#0c2417] transition-colors cursor-pointer"
                >
                  Start New Assessment
                </button>
                <Link
                  href="/app/my-garden"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold transition-colors text-center shadow-xs"
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
