'use client';

import React, { useState, useEffect } from 'react';
import { Reminder, NotificationPreferences } from '@/types/reminder';
import { NotificationItem } from './NotificationItem';
import { ReminderDetailModal } from './ReminderDetailModal';
import { ReminderFormModal } from './ReminderFormModal';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';
import {
  fetchUserReminders,
  completeReminder,
  dismissReminder,
  deleteReminder,
  markRemindersAsRead,
  createReminder,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  getPendingMutationsCount,
  syncPendingMutations,
} from '@/lib/reminders/reminder-storage';
import { getReminderStatus, isReminderActive } from '@/lib/reminders/reminder-status';
import { UserPlant } from '@/types/garden';
import {
  X,
  Bell,
  CheckCheck,
  Plus,
  Sliders,
  Filter,
  Sprout,
  Loader2,
  Calendar,
  CloudOff,
  RefreshCw,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  plants?: UserPlant[];
  onRemindersChanged?: () => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  plants = [],
  onRemindersChanged,
}: NotificationCenterProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'upcoming' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals state
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [remRes, prefRes] = await Promise.all([
        fetchUserReminders(),
        fetchNotificationPreferences(),
      ]);
      setReminders(remRes.reminders || []);
      setPreferences(prefRes.preferences);
      setPendingCount(getPendingMutationsCount());
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPending = async () => {
    setIsSyncing(true);
    try {
      await syncPendingMutations();
      await loadData();
      onRemindersChanged?.();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleComplete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await completeReminder(id);
    await loadData();
    onRemindersChanged?.();
  };

  const handleDismiss = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await dismissReminder(id);
    await loadData();
    onRemindersChanged?.();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    await loadData();
    onRemindersChanged?.();
  };

  const handleMarkAllRead = async () => {
    const unreadIds = reminders.filter((r) => !r.isRead).map((r) => r.id);
    if (unreadIds.length > 0) {
      await markRemindersAsRead(unreadIds);
      await loadData();
      onRemindersChanged?.();
    }
  };

  const handleOpenDetail = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsDetailOpen(true);
    // Mark as read when opened
    if (!reminder.isRead) {
      markRemindersAsRead([reminder.id]).then(() => {
        loadData();
        onRemindersChanged?.();
      });
    }
  };

  // Filter reminders based on active tab and category
  const filteredReminders = reminders.filter((r) => {
    const status = getReminderStatus(r);

    if (activeFilter === 'due' && status !== 'due' && status !== 'overdue') {
      return false;
    }
    if (activeFilter === 'upcoming' && status !== 'scheduled') {
      return false;
    }
    if (activeFilter === 'completed' && status !== 'completed' && status !== 'dismissed') {
      return false;
    }

    if (categoryFilter !== 'all') {
      if (r.reminderType !== categoryFilter && r.sourceType !== categoryFilter) {
        return false;
      }
    }

    return true;
  });

  // Group by Today/Due, Upcoming, and Completed/Earlier
  const dueGroup: Reminder[] = [];
  const upcomingGroup: Reminder[] = [];
  const completedGroup: Reminder[] = [];

  for (const r of filteredReminders) {
    const status = getReminderStatus(r);
    if (status === 'due' || status === 'overdue') {
      dueGroup.push(r);
    } else if (status === 'scheduled') {
      upcomingGroup.push(r);
    } else {
      completedGroup.push(r);
    }
  }

  const unreadCount = reminders.filter((r) => !r.isRead && isReminderActive(r)).length;

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
        {/* Backdrop */}
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        {/* Drawer Panel */}
        <div className="relative w-full max-w-md bg-[#fbf9f4] h-full shadow-2xl flex flex-col z-10 border-l border-[#ded5c5]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#ded5c5] bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                <Bell size={17} />
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#0c2417] flex items-center gap-2">
                  <span>Garden Reminders</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#144229] text-white">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="p-2 rounded-xl text-[#144229] hover:bg-[#eef5ee] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Create custom reminder"
                aria-label="Create custom reminder"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(true)}
                className="p-2 rounded-xl text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Notification preferences"
                aria-label="Notification preferences"
              >
                <Sliders size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                aria-label="Close notification panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Subheader & Filter Tabs */}
          <div className="px-4 py-2.5 bg-white border-b border-[#ded5c5] space-y-2">
            <div className="flex items-center justify-between text-xs">
              {/* Tab Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'due', label: 'Due' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'completed', label: 'Completed' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-[#144229] text-white shadow-2xs'
                        : 'text-[#526a57] hover:bg-[#f4efe6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#144229] hover:underline cursor-pointer shrink-0"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {pendingCount > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <div className="flex items-center gap-1.5">
                  <CloudOff size={13} className="text-amber-700" />
                  <span>{pendingCount} offline update{pendingCount > 1 ? 's' : ''} pending sync</span>
                </div>
                <button
                  type="button"
                  onClick={handleSyncPending}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
                >
                  <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Sync now</span>
                </button>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {loading && (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin text-[#144229] mx-auto mb-2" />
                <p className="text-xs text-[#526a57]">Loading reminders...</p>
              </div>
            )}

            {!loading && filteredReminders.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#ded5c5] space-y-2 mt-4">
                <Sprout size={32} className="text-[#6d8573] mx-auto opacity-70" />
                <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                  No reminders found
                </h4>
                <p className="text-xs text-[#526a57] max-w-xs mx-auto">
                  {activeFilter === 'due'
                    ? 'All current garden tasks and health follow-ups are up to date.'
                    : 'Your garden journal is calm and quiet. You can create a custom reminder anytime.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#0c2417] transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Reminder</span>
                </button>
              </div>
            )}

            {/* Today / Due Group */}
            {!loading && dueGroup.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#0c2417]">
                    Due Today & Overdue
                  </span>
                  <span className="text-[11px] font-semibold text-[#b95835]">
                    {dueGroup.length}
                  </span>
                </div>
                {dueGroup.map((r) => (
                  <NotificationItem
                    key={r.id}
                    reminder={r}
                    onOpenDetail={handleOpenDetail}
                    onComplete={(id, e) => handleComplete(id, e)}
                    onDismiss={(id, e) => handleDismiss(id, e)}
                  />
                ))}
              </div>
            )}

            {/* Upcoming Group */}
            {!loading && upcomingGroup.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#526a57]">
                    Upcoming
                  </span>
                  <span className="text-[11px] font-medium text-[#6d8573]">
                    {upcomingGroup.length}
                  </span>
                </div>
                {upcomingGroup.map((r) => (
                  <NotificationItem
                    key={r.id}
                    reminder={r}
                    onOpenDetail={handleOpenDetail}
                    onComplete={(id, e) => handleComplete(id, e)}
                    onDismiss={(id, e) => handleDismiss(id, e)}
                  />
                ))}
              </div>
            )}

            {/* Completed / Earlier Group */}
            {!loading && completedGroup.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#78716c]">
                    Earlier & Completed
                  </span>
                  <span className="text-[11px] font-medium text-[#78716c]">
                    {completedGroup.length}
                  </span>
                </div>
                {completedGroup.map((r) => (
                  <NotificationItem
                    key={r.id}
                    reminder={r}
                    onOpenDetail={handleOpenDetail}
                    onComplete={(id, e) => handleComplete(id, e)}
                    onDismiss={(id, e) => handleDismiss(id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedReminder(null);
          }}
          onComplete={async (id) => {
            await completeReminder(id);
            await loadData();
            onRemindersChanged?.();
          }}
          onDismiss={async (id) => {
            await dismissReminder(id);
            await loadData();
            onRemindersChanged?.();
          }}
          onDelete={async (id) => {
            await deleteReminder(id);
            await loadData();
            onRemindersChanged?.();
          }}
        />
      )}

      {isCreateOpen && (
        <ReminderFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (input) => {
            const res = await createReminder(input);
            if (res.reminder) {
              await loadData();
              onRemindersChanged?.();
              return { success: true };
            }
            return { success: false, error: res.error };
          }}
          plants={plants}
        />
      )}

      {preferences && isPreferencesOpen && (
        <NotificationPreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          preferences={preferences}
          onSavePreferences={async (updated) => {
            const res = await updateNotificationPreferences(updated);
            if (res.preferences) {
              setPreferences(res.preferences);
              await loadData();
              onRemindersChanged?.();
              return { success: true };
            }
            return { success: false, error: res.error };
          }}
        />
      )}
    </>
  );
}

