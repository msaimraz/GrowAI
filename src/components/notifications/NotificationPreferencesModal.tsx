'use client';

import React, { useState, useEffect } from 'react';
import {
  NotificationPreferences,
  BrowserPermissionState,
} from '@/types/reminder';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from '@/lib/reminders/browser-notification';
import {
  X,
  Sliders,
  Bell,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: NotificationPreferences;
  onSavePreferences: (
    updated: Partial<NotificationPreferences>
  ) => Promise<{ success: boolean; error?: string }>;
}

export function NotificationPreferencesModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}: NotificationPreferencesModalProps) {
  const [categories, setCategories] = useState(preferences.categories);
  const [channels, setChannels] = useState(preferences.channels);
  const [timezone, setTimezone] = useState(preferences.timezone || 'UTC');
  const [browserPerm, setBrowserPerm] = useState<BrowserPermissionState>('default');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCategories(preferences.categories);
      setChannels(preferences.channels);
      setTimezone(preferences.timezone || 'UTC');
      setBrowserPerm(getBrowserNotificationPermission());
      setStatusMessage(null);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const handleToggleBrowser = async () => {
    if (channels.browser) {
      // User is disabling browser notifications
      setChannels((prev) => ({ ...prev, browser: false }));
      return;
    }

    // User is attempting to enable browser notifications
    const perm = getBrowserNotificationPermission();
    if (perm === 'granted') {
      setChannels((prev) => ({ ...prev, browser: true }));
      setBrowserPerm('granted');
    } else if (perm === 'denied') {
      setStatusMessage(
        'Browser notifications are blocked in your browser settings. Please permit notifications in your browser address bar to enable.'
      );
      setBrowserPerm('denied');
    } else {
      // Request permission upon explicit user tap
      const requested = await requestBrowserNotificationPermission();
      setBrowserPerm(requested);
      if (requested === 'granted') {
        setChannels((prev) => ({ ...prev, browser: true }));
        setStatusMessage('Browser notifications successfully enabled!');
      } else {
        setStatusMessage('Browser notification permission was not granted.');
        setChannels((prev) => ({ ...prev, browser: false }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await onSavePreferences({
        categories,
        channels,
        timezone,
      });
      if (res.success) {
        onClose();
      } else {
        setStatusMessage(res.error || 'Failed to update preferences.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[calc(100vw-24px)] sm:max-w-lg bg-[#F8F6EE] rounded-3xl border border-[#E3DFD2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E3DFD2] bg-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
              <Sliders size={16} />
            </span>
            <h3 className="font-serif text-lg font-bold text-[#203027]">
              Notification Preferences
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#68766C] hover:bg-[#EAF1E4] hover:text-[#174C35] transition-colors cursor-pointer"
            aria-label="Close preferences"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-amber-700" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Delivery Channels */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#203027] mb-2 flex items-center gap-1.5">
              <Bell size={15} className="text-[#174C35]" />
              <span>Delivery Channels</span>
            </h4>
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E3DFD2]">
              {/* In-App */}
              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-xl hover:bg-[#F8F6EE]">
                <div>
                  <span className="font-semibold text-xs text-[#203027] block">
                    In-App Notification Center
                  </span>
                  <span className="text-[11px] text-[#68766C]">
                    Display reminders in the GrowAI app navigation bell.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={channels.inApp}
                  onChange={(e) =>
                    setChannels((prev) => ({ ...prev, inApp: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#174C35] accent-[#174C35] cursor-pointer"
                />
              </label>

              {/* Browser / PWA */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F8F6EE] border-t border-[#E3DFD2]">
                <div>
                  <span className="font-semibold text-xs text-[#203027] block">
                    Browser & Device Notifications
                  </span>
                  <span className="text-[11px] text-[#68766C]">
                    Receive system notifications on desktop or mobile device.
                  </span>
                  {browserPerm === 'denied' && (
                    <span className="text-[10px] text-rose-600 block mt-0.5">
                      Permission denied in browser settings
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleToggleBrowser}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    channels.browser
                      ? 'bg-[#174C35] text-white border-[#174C35]'
                      : 'bg-white text-[#68766C] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                  }`}
                >
                  {channels.browser ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Reminder Categories */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#203027] mb-2 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#174C35]" />
              <span>Reminder Categories</span>
            </h4>
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E3DFD2]">
              {[
                { key: 'care', label: 'Care Tasks', desc: 'Watering, fertilizing, pruning, and inspection reminders' },
                { key: 'healthFollowUp', label: 'Health Follow-ups', desc: 'Evaluations of ongoing plant health observations' },
                { key: 'treatment', label: 'Treatment Actions', desc: 'Reminders for planned or in-progress interventions' },
                { key: 'growth', label: 'Growth Observations', desc: 'Suggestions to record journal entries and photos' },
                { key: 'milestones', label: 'Planting & Growth Milestones', desc: 'Milestone observation reviews (never time-based maturity)' },
                { key: 'overdue', label: 'Overdue Reminders', desc: 'Keep uncompleted past tasks visible in active badges' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between cursor-pointer p-1.5 rounded-xl hover:bg-[#F8F6EE]"
                >
                  <div>
                    <span className="font-semibold text-xs text-[#203027] block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#68766C] block">
                      {item.desc}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={categories[item.key as keyof typeof categories]}
                    onChange={(e) =>
                      setCategories((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-[#174C35] accent-[#174C35] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#203027] mb-2 flex items-center gap-1.5">
              <Globe size={15} className="text-[#174C35]" />
              <span>Timezone</span>
            </h4>
            <div className="bg-white p-3.5 rounded-2xl border border-[#E3DFD2]">
              <div className="flex items-center justify-between text-xs text-[#68766C]">
                <span>Active Notification Timezone:</span>
                <strong className="text-[#203027]">{timezone}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E3DFD2] bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E3DFD2] text-[#68766C] hover:bg-[#EAF1E4] transition-all cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#174C35] text-white hover:bg-[#203027] transition-all cursor-pointer min-h-[40px]"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

