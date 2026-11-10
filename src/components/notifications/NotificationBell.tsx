'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import {
  fetchUserReminders,
  fetchNotificationPreferences,
} from '@/lib/reminders/reminder-storage';
import { getUnreadActiveRemindersCount } from '@/lib/reminders/reminder-status';
import { Reminder, NotificationPreferences } from '@/types/reminder';
import { UserPlant } from '@/types/garden';

interface NotificationBellProps {
  plants?: UserPlant[];
}

export function NotificationBell({ plants = [] }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [cachedReminders, setCachedReminders] = useState<Reminder[]>([]);

  const checkUnread = useCallback(async () => {
    try {
      const [remRes, prefRes] = await Promise.all([
        fetchUserReminders(),
        fetchNotificationPreferences(),
      ]);
      const fetchedReminders = remRes.reminders || [];
      setCachedReminders(fetchedReminders);
      setPreferences(prefRes.preferences);
      const count = getUnreadActiveRemindersCount(
        fetchedReminders,
        prefRes.preferences
      );
      setUnreadCount(count);
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    checkUnread();

    // Check periodically on window focus (non-aggressive)
    const handleFocus = () => {
      checkUnread();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkUnread]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl text-[#174C35] hover:bg-[#E3DFD2] active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-all duration-75 select-none touch-manipulation shrink-0"
        title="Garden Reminders & Notifications"
        aria-label={`Garden Reminders: ${unreadCount} unread`}
      >
        <Bell size={20} className="stroke-[2.2]" />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#174C35] text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-[#F8F6EE]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationCenter
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            checkUnread();
          }}
          plants={plants}
          initialReminders={cachedReminders}
          initialPreferences={preferences}
          onRemindersChanged={checkUnread}
        />
      )}
    </>
  );
}

