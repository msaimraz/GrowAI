'use client';

import React, { useState, useEffect } from 'react';
import { Reminder } from '@/types/reminder';
import {
  fetchUserReminders,
  completeReminder,
  dismissReminder,
  createReminder,
} from '@/lib/reminders/reminder-storage';
import { getReminderStatus, isReminderActive } from '@/lib/reminders/reminder-status';
import { ReminderStatusBadge } from '@/components/notifications/ReminderStatusBadge';
import { ReminderFormModal } from '@/components/notifications/ReminderFormModal';
import { ReminderDetailModal } from '@/components/notifications/ReminderDetailModal';
import { UserPlant } from '@/types/garden';
import {
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface PlantRemindersCardProps {
  plant: UserPlant;
  onRefreshNeeded?: () => void;
}

export function PlantRemindersCard({ plant, onRefreshNeeded }: PlantRemindersCardProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await fetchUserReminders({ plantId: plant.id });
      setReminders(res.reminders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [plant.id]);

  const activeReminders = reminders.filter((r) => isReminderActive(r));
  const overdueCount = activeReminders.filter((r) => getReminderStatus(r) === 'overdue').length;

  const nextReminder = activeReminders.sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  )[0];

  const handleQuickComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await completeReminder(id);
    await loadReminders();
    onRefreshNeeded?.();
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f0ebe0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
            <Bell size={16} />
          </div>
          <div>
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#0c2417]">
              Plant Reminders
            </h4>
            <p className="text-[11px] text-[#6d8573]">
              {activeReminders.length} active schedule{activeReminders.length === 1 ? '' : 's'}
              {overdueCount > 0 && (
                <span className="text-rose-600 font-bold ml-1">
                  • {overdueCount} overdue
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#eef5ee] text-[#144229] hover:bg-[#dfeadf] border border-[#cfe0cf] transition-all cursor-pointer min-h-[36px]"
          title="Add custom reminder for this plant"
        >
          <Plus size={14} />
          <span>Add Reminder</span>
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <Loader2 size={20} className="animate-spin text-[#144229] mx-auto" />
        </div>
      ) : activeReminders.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-center text-xs text-[#526a57]">
          <span>No upcoming reminders scheduled for {plant.nickname}.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {activeReminders.map((r) => {
            const status = getReminderStatus(r);
            return (
              <div
                key={r.id}
                onClick={() => setSelectedReminder(r)}
                className="flex items-center justify-between p-3 rounded-xl border border-[#ded5c5] hover:border-[#144229]/40 bg-[#fbf9f4] hover:bg-white transition-all cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-xs text-[#0c2417] truncate">
                      {r.title}
                    </span>
                    <ReminderStatusBadge status={status} size="sm" />
                  </div>
                  <span className="text-[11px] text-[#6d8573]">
                    Due: {new Date(r.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleQuickComplete(r.id, e)}
                  className="p-1.5 rounded-lg text-[#144229] hover:bg-[#eef5ee] border border-transparent hover:border-[#c2d9c6] transition-all cursor-pointer shrink-0"
                  title="Mark as completed"
                  aria-label={`Mark ${r.title} complete`}
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isFormOpen && (
        <ReminderFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={async (input) => {
            const res = await createReminder(input);
            if (res.reminder) {
              await loadReminders();
              onRefreshNeeded?.();
              return { success: true };
            }
            return { success: false, error: res.error };
          }}
          plants={[plant]}
          defaultPlantId={plant.id}
        />
      )}

      {/* Detail Modal */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          isOpen={Boolean(selectedReminder)}
          onClose={() => setSelectedReminder(null)}
          onComplete={async (id) => {
            await completeReminder(id);
            await loadReminders();
            onRefreshNeeded?.();
          }}
          onDismiss={async (id) => {
            await dismissReminder(id);
            await loadReminders();
            onRefreshNeeded?.();
          }}
          onDelete={async (id) => {
            await completeReminder(id);
            await loadReminders();
            onRefreshNeeded?.();
          }}
        />
      )}
    </div>
  );
}

