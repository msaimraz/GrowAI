import React from 'react';
import { ReminderStatus } from '@/types/reminder';
import { CheckCircle2, Clock, AlertCircle, XCircle, Calendar, Ban } from 'lucide-react';

interface ReminderStatusBadgeProps {
  status: ReminderStatus;
  size?: 'sm' | 'md';
}

export function ReminderStatusBadge({ status, size = 'sm' }: ReminderStatusBadgeProps) {
  let label = 'Scheduled';
  let classes = 'bg-[#f4efe6] text-[#526a57] border-[#ded5c5]';
  let icon = <Calendar size={size === 'sm' ? 12 : 14} />;

  switch (status) {
    case 'due':
      label = 'Due Today';
      classes = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      icon = <Clock size={size === 'sm' ? 12 : 14} className="text-amber-600" />;
      break;
    case 'overdue':
      label = 'Overdue';
      classes = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      icon = <AlertCircle size={size === 'sm' ? 12 : 14} className="text-rose-600" />;
      break;
    case 'completed':
      label = 'Completed';
      classes = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} className="text-emerald-600" />;
      break;
    case 'dismissed':
      label = 'Dismissed';
      classes = 'bg-[#f0ece1] text-[#78716c] border-[#ded5c5]';
      icon = <XCircle size={size === 'sm' ? 12 : 14} className="text-[#a8a29e]" />;
      break;
    case 'cancelled':
      label = 'Cancelled';
      classes = 'bg-zinc-100 text-zinc-600 border-zinc-200';
      icon = <Ban size={size === 'sm' ? 12 : 14} className="text-zinc-500" />;
      break;
    case 'scheduled':
    default:
      label = 'Scheduled';
      classes = 'bg-[#eef5ee] text-[#144229] border-[#c2d9c6]';
      icon = <Calendar size={size === 'sm' ? 12 : 14} className="text-[#144229]" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${classes} ${
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      }`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}

