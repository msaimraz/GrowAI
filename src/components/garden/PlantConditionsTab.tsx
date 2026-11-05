'use client';

import React, { useState } from 'react';
import { UserPlant } from '@/types/garden';
import {
  GrowingConditionObservation,
  LightLevel,
  LightSource,
  AirflowQuality,
  SoilMoistureObservation,
  DrainageQuality,
  ConditionMetricAssessment,
} from '@/types/grow-intelligence';
import { assessConditions } from '@/lib/grow-intelligence/conditions-engine';
import { saveGrowingCondition } from '@/lib/grow-intelligence/storage';
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  X,
  Loader2,
} from 'lucide-react';

interface PlantConditionsTabProps {
  plant: UserPlant;
  conditions: GrowingConditionObservation[];
  onConditionAdded?: () => void;
}

export function PlantConditionsTab({
  plant,
  conditions,
  onConditionAdded,
}: PlantConditionsTabProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [temperature, setTemperature] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [lightLevel, setLightLevel] = useState<LightLevel>('bright_indirect');
  const [lightSource, setLightSource] = useState<LightSource>('natural');
  const [lightHours, setLightHours] = useState<string>('');
  const [soilMoisture, setSoilMoisture] = useState<SoilMoistureObservation>('moist');
  const [airflow, setAirflow] = useState<AirflowQuality>('moderate');
  const [drainage, setDrainage] = useState<DrainageQuality>('adequate');
  const [notes, setNotes] = useState<string>('');

  const plantConditions = conditions.filter(
    (c) => c.plantId === plant.id || !c.plantId
  );
  const latest = plantConditions[0];
  const assessment = assessConditions(latest, plant.plantSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const tempNum = temperature.trim() ? parseFloat(temperature) : null;
      const humNum = humidity.trim() ? parseFloat(humidity) : null;
      const hoursNum = lightHours.trim() ? parseFloat(lightHours) : null;

      const res = await saveGrowingCondition({
        plantId: plant.id,
        temperatureCelsius: tempNum !== null && !isNaN(tempNum) ? tempNum : null,
        relativeHumidityPercent: humNum !== null && !isNaN(humNum) ? humNum : null,
        lightLevel,
        lightSource,
        lightDurationHours: hoursNum !== null && !isNaN(hoursNum) ? hoursNum : null,
        isGrowLight: lightSource === 'grow_light' || lightSource === 'mixed',
        soilMoisture,
        airflowQuality: airflow,
        drainageQuality: drainage,
        notes: notes.trim() || null,
        observationTime: new Date().toISOString(),
      });

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      setShowLogModal(false);
      // Reset form
      setTemperature('');
      setHumidity('');
      setNotes('');
      if (onConditionAdded) onConditionAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save condition observation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#ded5c5] shadow-xs">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
            <Thermometer size={20} className="text-[#144229]" />
            <span>Environmental Growing Conditions</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#526a57] mt-0.5">
            Log temperature, ambient humidity, light exposure, and soil moisture observations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus size={16} />
          <span>Log Observation</span>
        </button>
      </div>

      {/* Latest Condition Assessment Summary */}
      {latest ? (
        <div className="bg-[#fbf9f4] border border-[#ded5c5] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ded5c5]/60">
            <span className="text-xs font-semibold text-[#526a57]">
              Latest Observation: {new Date(latest.observationTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="text-xs font-medium bg-[#eef5ee] text-[#144229] px-2.5 py-0.5 rounded-full border border-[#cfe0cf]">
              {plantConditions.length} total entries
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {assessment.assessments.map((a: ConditionMetricAssessment, idx: number) => {
              const statusColor =
                a.status === 'within_expected_range'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : a.status === 'possibly_low' || a.status === 'possibly_high'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200';

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#ded5c5] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6d8573]">
                      {a.metricName.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${statusColor}`}>
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#0c2417]">
                    {a.observedValue !== null && a.observedValue !== undefined
                      ? `${a.observedValue}${a.metricName === 'temperature' ? '°C' : a.metricName === 'humidity' ? '%' : ''}`
                      : 'Unknown'}
                  </div>
                  <p className="text-[11px] text-[#526a57] leading-tight">{a.explanation}</p>
                </div>
              );
            })}
          </div>

          {/* Unrecorded parameters notice */}
          {assessment.unrecordedParameters.length > 0 && (
            <div className="text-xs text-[#526a57] flex items-center gap-1.5 pt-1">
              <HelpCircle size={14} className="text-[#6d8573]" />
              <span>
                Not recorded in this entry: {assessment.unrecordedParameters.join(', ')}.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#ded5c5] space-y-3">
          <Thermometer size={32} className="mx-auto text-[#8ba391]" />
          <h4 className="font-serif font-bold text-[#0c2417]">No Growing Conditions Logged Yet</h4>
          <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto">
            Recording ambient temperature, humidity, and soil moisture allows GrowAI to assess
            whether conditions fall within standard botanical comfort ranges.
          </p>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Record First Observation</span>
          </button>
        </div>
      )}

      {/* Observation History Log */}
      {plantConditions.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-4">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#0c2417] pb-2 border-b border-[#f0ebe0]">
            Environmental Observation History
          </h4>

          <div className="divide-y divide-[#f0ebe0]">
            {plantConditions.map((cond) => (
              <div key={cond.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0c2417]">
                    {new Date(cond.observationTime).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    {cond.temperatureCelsius !== null && (
                      <span className="text-xs bg-[#fbf9f4] border border-[#ded5c5] px-2 py-0.5 rounded-md font-mono text-[#144229]">
                        {cond.temperatureCelsius}°C
                      </span>
                    )}
                    {cond.relativeHumidityPercent !== null && (
                      <span className="text-xs bg-[#fbf9f4] border border-[#ded5c5] px-2 py-0.5 rounded-md font-mono text-[#1e40af]">
                        {cond.relativeHumidityPercent}% RH
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#526a57]">
                  {cond.soilMoisture && (
                    <span>Soil: <strong>{cond.soilMoisture.replace('_', ' ')}</strong></span>
                  )}
                  {cond.lightLevel && (
                    <span>• Light: <strong>{cond.lightLevel.replace('_', ' ')}</strong></span>
                  )}
                  {cond.airflowQuality && (
                    <span>• Airflow: <strong>{cond.airflowQuality.replace('_', ' ')}</strong></span>
                  )}
                  {cond.drainageQuality && (
                    <span>• Drainage: <strong>{cond.drainageQuality}</strong></span>
                  )}
                </div>

                {cond.notes && (
                  <p className="text-xs text-[#6d8573] italic pt-0.5">{cond.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Condition Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ded5c5] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
              <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                <Thermometer size={20} className="text-[#144229]" />
                <span>Log Environmental Conditions</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-2 text-[#526a57] hover:text-[#0c2417] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 22"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Relative Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="e.g. 55"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Light Level
                  </label>
                  <select
                    value={lightLevel}
                    onChange={(e) => setLightLevel(e.target.value as LightLevel)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="low">Low Light</option>
                    <option value="medium">Medium Light</option>
                    <option value="bright_indirect">Bright Indirect</option>
                    <option value="direct_sun">Direct Sunlight</option>
                    <option value="grow_light">Artificial Grow Light</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Light Source
                  </label>
                  <select
                    value={lightSource}
                    onChange={(e) => setLightSource(e.target.value as LightSource)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="natural">Natural Sun</option>
                    <option value="grow_light">Dedicated Grow Light</option>
                    <option value="mixed">Mixed Sun & Light</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Soil Moisture Observation
                  </label>
                  <select
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(e.target.value as SoilMoistureObservation)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="dry">Dry</option>
                    <option value="slightly_moist">Slightly Moist</option>
                    <option value="moist">Moist (Ideal)</option>
                    <option value="waterlogged">Waterlogged / Saturated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                    Airflow Quality
                  </label>
                  <select
                    value={airflow}
                    onChange={(e) => setAirflow(e.target.value as AirflowQuality)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                  >
                    <option value="stagnant">Stagnant</option>
                    <option value="gentle">Gentle Breeze</option>
                    <option value="moderate">Moderate Circulation</option>
                    <option value="fan_ventilated">Fan Ventilated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                  Observational Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Afternoon sun was particularly intense today; soil dried fast."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ded5c5] text-xs font-semibold text-[#526a57] hover:bg-[#fbf9f4] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#1b5535] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Observation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
