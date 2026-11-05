'use client';

import React from 'react';
import { Reminder } from '@/types/reminder';
import { ReminderStatusBadge } from './ReminderStatusBadge';
import { getReminderStatus, isReminderActive } from '@/lib/reminders/reminder-status';
import {
  Droplets,
  Activity,
  HeartHandshake,
  Sprout,
  Sparkles,
  Bell,
  Check,
  X,
  ChevronRight,
  Repeat,
  CloudOff,
} from 'lucide-react';

interface NotificationItemProps {
  reminder: Reminder;
  onOpenDetail: (reminder: Reminder) => void;
  onComplete: (id: string, e: React.MouseEvent) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
}

export function NotificationItem({
  reminder,
  onOpenDetail,
  onComplete,
  onDismiss,
}: NotificationItemProps) {
  const currentStatus = getReminderStatus(reminder);
  const active = isReminderActive(reminder);

  const getSourceIcon = () => {
    switch (reminder.reminderType) {
      case 'care':
        return <Droplets size={16} className="text-teal-700" />;
      case 'health':
        return <Activity size={16} className="text-emerald-700" />;
      case 'treatment':
        return <HeartHandshake size={16} className="text-indigo-600" />;
      case 'growth':
        return <Sprout size={16} className="text-[#144229]" />;
      case 'milestone':
        return <Sparkles size={16} className="text-amber-600" />;
      case 'custom':
      default:
        return <Bell size={16} className="text-[#526a57]" />;
    }
  };

  const formattedDate = new Date(reminder.dueAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onOpenDetail(reminder)}
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
        !reminder.isRead && active
          ? 'bg-[#f4efe6]/60 border-[#c5bba8] shadow-2xs hover:bg-[#efe8dc]'
          : 'bg-white border-[#ded5c5] hover:border-[#144229]/40 hover:bg-[#fbf9f4]'
      }`}
    >
      {/* Unread indicator dot */}
      {!reminder.isRead && active && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#144229]" />
      )}

      {/* Leading Icon / Quick Complete Checkbox */}
      <div className="shrink-0 mt-0.5">
        {active ? (
          <button
            type="button"
            onClick={(e) => onComplete(reminder.id, e)}
            className="w-8 h-8 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] hover:bg-[#eef5ee] hover:border-[#144229] flex items-center justify-center text-[#526a57] hover:text-[#144229] transition-all cursor-pointer"
            title="Mark as completed"
            aria-label={`Mark ${reminder.title} as completed`}
          >
            {getSourceIcon()}
          </button>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#eef5ee] flex items-center justify-center text-[#144229]">
            {getSourceIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-semibold text-xs text-[#0c2417] truncate">
            {reminder.title}
          </span>
          {reminder.plantNickname && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-[#eef5ee] text-[#144229] font-medium border border-[#c2d9c6]">
              {reminder.plantNickname}
            </span>
          )}
          {reminder.recurrence && reminder.recurrence.type !== 'none' && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] text-[#6d8573]"
              title={`Repeats ${reminder.recurrence.type.replace(/_/g, ' ')}`}
            >
              <Repeat size={10} />
            </span>
          )}
        </div>

        <p className="text-xs text-[#526a57] line-clamp-2 leading-relaxed mb-2">
          {reminder.body}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6d8573]">
          <ReminderStatusBadge status={currentStatus} />
          {reminder.metadata?.syncPending && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              <CloudOff size={10} />
              <span>Pending sync</span>
            </span>
          )}
          <span>Due: {formattedDate}</span>
        </div>
      </div>

      {/* Quick Action Buttons (shown on hover or accessible) */}
      <div className="shrink-0 flex items-center gap-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
        {active && (
          <>
            <button
              type="button"
              onClick={(e) => onComplete(reminder.id, e)}
              className="p-1.5 rounded-lg text-[#144229] hover:bg-[#eef5ee] border border-transparent hover:border-[#c2d9c6] transition-all cursor-pointer"
              title="Complete reminder"
              aria-label="Complete reminder"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => onDismiss(reminder.id, e)}
              className="p-1.5 rounded-lg text-[#855302] hover:bg-[#fff3cd] border border-transparent hover:border-[#ffeeba] transition-all cursor-pointer"
              title="Dismiss reminder"
              aria-label="Dismiss reminder"
            >
              <X size={14} />
            </button>
          </>
        )}
        <ChevronRight size={14} className="text-[#a89f91]" />
      </div>
    </div>
  );
}

