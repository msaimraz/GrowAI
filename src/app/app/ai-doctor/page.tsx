'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { PLANTS_DATA } from '@/data/plants';
import { DiagnosisRequest, DiagnosisResponse } from '@/types/diagnosis';
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
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function AiDoctorPage() {
  const [selectedPlantSlug, setSelectedPlantSlug] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [environment, setEnvironment] = useState('Balcony Tier');
  const [photoSelected, setPhotoSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample symptom presets for quick testing
  const presets = [
    {
      label: 'Yellowing Lower Leaves',
      text: 'Lower leaves are turning pale yellow and drooping, but top leaves are still green.',
      plant: 'genovese-basil',
    },
    {
      label: 'White Powder on Leaves',
      text: 'A white powdery flour-like dusting has formed on upper leaf surfaces.',
      plant: 'french-marigold',
    },
    {
      label: 'Crispy Brown Edges',
      text: 'Leaf margins and tips are turning brown, dry, and crispy like paper.',
      plant: 'golden-pothos',
    },
    {
      label: 'Tiny Bugs & Webbing',
      text: 'Noticed tiny specks crawling under the leaves and very fine silk webs in stem joints.',
      plant: 'cherry-tomato',
    },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    setSymptoms(preset.text);
    setSelectedPlantSlug(preset.plant);
    setError(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoSelected(url);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe what you are observing on the plant.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const plant = PLANTS_DATA.find((p) => p.slug === selectedPlantSlug);

    const payload: DiagnosisRequest = {
      plantSlug: selectedPlantSlug || undefined,
      plantName: plant ? plant.commonName : undefined,
      symptoms: symptoms.trim(),
      environment,
      hasPhoto: Boolean(photoSelected),
      photoUrl: photoSelected || undefined,
    };

    try {
      const response = await fetch('/api/ai-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Diagnosis server returned an error.');
      }

      const data = (await response.json()) as DiagnosisResponse;
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="AI Plant Doctor (Demo)"
        subtitle="Agronomic symptom evaluation with cause identification, checks, and organic remedies."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Transparent Demo Notice Banner */}
        <div className="bg-[#fef3c7] border border-[#fde68a] p-4 rounded-2xl flex items-start gap-3 text-xs text-[#92400e] shadow-xs">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-[#b45309]" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#78350f]">
              Demonstration Mode & Agronomic Rulebase
            </h4>
            <p className="leading-relaxed">
              This interface demonstrates the future AI diagnostic workflow. Sourced from agricultural extension heuristics, it matches described symptoms to probable causes and non-toxic remedies. An actual multimodal vision model will connect via server-side API keys in Phase 2.
            </p>
          </div>
        </div>

        {/* Diagnosis Input Form Card */}
        <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0ebe0]">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229]">
                <Sparkles size={22} />
              </span>
              <div>
                <h2 className="font-serif font-bold text-xl text-[#0c2417]">
                  New Diagnostic Assessment
                </h2>
                <p className="text-xs text-[#526a57]">
                  Describe visual foliage symptoms or pick a quick scenario below
                </p>
              </div>
            </div>
            <Badge variant="sage" size="md">Rulebase Engine</Badge>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
              Test Common Scenarios:
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

          <form onSubmit={handleDiagnose} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                  Select Plant (Optional if known)
                </label>
                <select
                  value={selectedPlantSlug}
                  onChange={(e) => setSelectedPlantSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                >
                  <option value="">Unknown / Other Plant</option>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs font-medium text-[#0c2417] focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                >
                  <option value="Balcony Tier">Balcony Vertical Tier</option>
                  <option value="Indoor Window">Indoor Sunny Windowsill</option>
                  <option value="Patio Container">Open Patio Container</option>
                  <option value="Kitchen Counter">Kitchen Hydroponic / Counter</option>
                </select>
              </div>
            </div>

            {/* Symptoms Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                Observed Foliage Symptoms <span className="text-[#b95835]">*</span>
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe leaf color changes, spots, powdery mold, wilting, or unusual insects..."
                required
                className="w-full px-4 py-3 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>

            {/* Photo Upload / Preview Area */}
            <div>
              <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                Plant Photo Preview (Demo Upload)
              </label>
              <div className="border-2 border-dashed border-[#ded5c5] hover:border-[#144229] rounded-2xl p-5 text-center bg-[#fbf9f4] transition-colors relative">
                {photoSelected ? (
                  <div className="space-y-3">
                    <img
                      src={photoSelected}
                      alt="Uploaded plant preview"
                      className="max-h-48 rounded-xl mx-auto object-cover border border-[#ded5c5]"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-[#1e613b] font-medium">
                        ✓ Photo attached for preview
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotoSelected(null)}
                        className="text-xs text-[#b95835] underline hover:no-underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera size={28} className="mx-auto text-[#7e9985]" />
                    <p className="text-xs text-[#526a57]">
                      Upload a close-up photo of the affected leaf or stem
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-[#cfdfcf] text-[#144229] hover:bg-[#eef5ee] cursor-pointer shadow-2xs">
                      <Upload size={14} />
                      <span>Select Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#86a18d]">
                      Photo analysis will be powered by server-side multimodal vision in Phase 2.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#b95835] font-semibold">{error}</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-7 py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Analyzing Agronomic Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run Diagnostic Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Diagnosis Result Area */}
        {result && (
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e7efe7] text-[#144229]">
                  <CheckCircle2 size={22} />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                    Diagnostic Findings
                  </h3>
                  <p className="text-xs text-[#526a57]">
                    Assessment ID: {result.id} • Evaluated {new Date(result.analyzedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="amber" size="md">
                Confidence: {result.findings[0]?.confidence || 'Moderate'}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-[#394f3f] bg-[#fbf9f4] p-4 rounded-xl border border-[#ded5c5] leading-relaxed">
              <strong>Evaluation Summary:</strong> {result.summary}
            </p>

            {result.findings.map((f, i) => (
              <div key={i} className="space-y-5">
                <div className="p-4 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e613b]">
                      Identified Condition
                    </span>
                    <h4 className="text-lg font-serif font-bold text-[#0c2417]">
                      {f.issue}
                    </h4>
                  </div>
                  <Badge variant="forest" size="sm">Action Required</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Causes & Checks */}
                  <div className="space-y-4">
                    <div className="bg-[#fbf9f4] p-5 rounded-xl border border-[#ded5c5] space-y-2.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c2417] flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-[#92400e]" />
                        Probable Causes
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#445b49]">
                        {f.probableCauses.map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#92400e] mt-1.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#fbf9f4] p-5 rounded-xl border border-[#ded5c5] space-y-2.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c2417] flex items-center gap-1.5">
                        <Search size={14} className="text-[#144229]" />
                        Recommended Physical Checks
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#445b49]">
                        {f.recommendedChecks.map((ck) => (
                          <li key={ck} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b] mt-1.5 shrink-0" />
                            <span>{ck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Immediate Steps & Remedies */}
                  <div className="space-y-4">
                    <div className="bg-[#fbf9f4] p-5 rounded-xl border border-[#ded5c5] space-y-2.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c2417] flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#1e613b]" />
                        Immediate Corrective Steps
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#445b49]">
                        {f.immediateSteps.map((st) => (
                          <li key={st} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b] mt-1.5 shrink-0" />
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#f4f8f4] p-5 rounded-xl border border-[#cfe0cf] space-y-2.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center gap-1.5">
                        <Droplets size={14} className="text-[#1e613b]" />
                        Non-Toxic Organic Treatment
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#1e613b]">
                        {f.organicTreatments.map((tr) => (
                          <li key={tr} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b] mt-1.5 shrink-0" />
                            <span className="font-medium">{tr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {f.chemicalWarnings && (
                  <div className="p-3.5 rounded-xl bg-[#fef3c7]/60 border border-[#fde68a] text-xs text-[#92400e] flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{f.chemicalWarnings}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Disclaimer */}
            <div className="pt-4 border-t border-[#f0ebe0] text-[11px] text-[#6d8573] space-y-1 italic">
              <p>{result.disclaimer}</p>
              {result.suggestedFollowUp && (
                <p className="font-semibold text-[#1e613b] not-italic">
                  Follow-up: {result.suggestedFollowUp}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
