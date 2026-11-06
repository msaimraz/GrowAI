'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { completePlanStepFromReminder } from '@/lib/grow-plans/storage';
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
  const { showSuccess } = useGrowToast();
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when drawer is open without layout jump
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape key closes modal/drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDetailOpen) {
          setIsDetailOpen(false);
        } else if (isCreateOpen) {
          setIsCreateOpen(false);
        } else if (isPreferencesOpen) {
          setIsPreferencesOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDetailOpen, isCreateOpen, isPreferencesOpen, onClose]);

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

  if (!isOpen || !mounted) return null;

  const handleComplete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetRem = reminders.find((r) => r.id === id);
    await completeReminder(id);

    // If linked to a Grow Plan step, complete the step in Grow Plans as well
    if (targetRem?.metadata?.growPlanId && targetRem?.metadata?.growPlanStepId) {
      await completePlanStepFromReminder(
        targetRem.metadata.growPlanId,
        targetRem.metadata.growPlanStepId
      );
      showSuccess('🌱 Step complete!', 'Nice work keeping your grow plan moving.', '🌱');
    } else {
      showSuccess('✓ Reminder completed', 'Task marked as done.', '✓');
    }

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
      showSuccess('✓ All caught up!', 'All garden reminders marked as read.', '✓');
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

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Responsive Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Garden Reminders"
        className="fixed z-51 bg-[#fbf9f4] shadow-2xl flex flex-col transition-all duration-300
          /* Mobile styles: bottom sheet */
          bottom-0 left-0 right-0 w-full max-h-[85dvh] rounded-t-3xl border-t border-[#ded5c5]
          /* Desktop styles: right-side drawer */
          md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:max-w-[100vw] md:h-[100dvh] md:max-h-[100dvh] md:rounded-l-3xl md:rounded-r-none md:border-t-0 md:border-l md:border-[#ded5c5]
          shrink-0 overflow-hidden"
      >
        {/* Mobile Sheet Drag / Close Handle */}
        <div
          className="md:hidden pt-2.5 pb-1 flex justify-center bg-white cursor-pointer select-none shrink-0"
          onClick={onClose}
        >
          <div className="w-10 h-1.5 rounded-full bg-[#d5ccba]" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ded5c5] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0">
              <Bell size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold text-[#0c2417] flex items-center gap-2 truncate">
                <span>Garden Reminders</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#144229] text-white shrink-0">
                    {unreadCount} new
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="p-2 rounded-xl text-[#144229] hover:bg-[#eef5ee] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Create custom reminder"
              aria-label="Create custom reminder"
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="p-2 rounded-xl text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Notification preferences"
              aria-label="Notification preferences"
            >
              <Sliders size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close notification panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Subheader & Filter Tabs */}
        <div className="px-4 py-2.5 bg-white border-b border-[#ded5c5] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs gap-2">
            {/* Tab Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
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
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#144229] hover:underline cursor-pointer shrink-0 min-h-[32px]"
              >
                <CheckCheck size={14} />
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
        <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {loading && (
            <div className="p-8 text-center">
              <Loader2 size={24} className="animate-spin text-[#144229] mx-auto mb-2" />
              <p className="text-xs text-[#526a57]">Loading reminders...</p>
            </div>
          )}

          {!loading && filteredReminders.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#ded5c5] space-y-2 mt-4 shadow-xs">
              <Sprout size={32} className="text-[#6d8573] mx-auto opacity-70" />
              <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                No reminders found
              </h4>
              <p className="text-xs text-[#526a57] max-w-xs mx-auto leading-relaxed">
                {activeFilter === 'due'
                  ? 'All current garden tasks and health follow-ups are up to date.'
                  : activeFilter === 'upcoming'
                  ? 'No upcoming reminders scheduled. Tasks will appear here as due dates approach.'
                  : activeFilter === 'completed'
                  ? 'No completed reminders yet.'
                  : 'Your garden journal is calm and quiet. You can create a custom reminder anytime.'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#144229] text-white text-xs font-semibold hover:bg-[#0c2417] transition-all cursor-pointer min-h-[38px]"
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
      </aside>

      {/* Modals rendered with z-60 */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedReminder(null);
          }}
          onNavigate={() => {
            setIsDetailOpen(false);
            setSelectedReminder(null);
            onClose();
          }}
          onComplete={async (id) => {
            await handleComplete(id);
          }}
          onDismiss={async (id) => {
            await handleDismiss(id);
          }}
          onDelete={async (id) => {
            await handleDelete(id);
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
    </div>,
    document.body
  );
}

