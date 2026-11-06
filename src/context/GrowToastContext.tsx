'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface GrowToastOptions {
  id?: string;
  title: string;
  message: string;
  icon?: string;
  variant?: ToastVariant;
  duration?: number; // ms, default 3500ms
}

export interface GrowToastItem extends GrowToastOptions {
  id: string;
  createdAt: number;
}

interface GrowToastContextValue {
  toasts: GrowToastItem[];
  showToast: (options: GrowToastOptions) => string;
  showSuccess: (title: string, message: string, icon?: string, duration?: number) => string;
  showInfo: (title: string, message: string, icon?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const GrowToastContext = createContext<GrowToastContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 2;
const DEFAULT_DURATION = 3500;
const DEDUP_WINDOW_MS = 1500;

export function GrowToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<GrowToastItem[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: GrowToastOptions): string => {
      const title = options.title.trim();
      const message = options.message.trim();
      const dedupKey = `${title}|${message}`;
      const now = Date.now();

      // Duplicate prevention within dedup window
      const lastShown = recentToastsRef.current.get(dedupKey);
      if (lastShown && now - lastShown < DEDUP_WINDOW_MS) {
        return '';
      }
      recentToastsRef.current.set(dedupKey, now);

      const id = options.id || `toast-${now}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options.duration ?? DEFAULT_DURATION;

      const newToast: GrowToastItem = {
        ...options,
        id,
        title,
        message,
        icon: options.icon || '🌱',
        variant: options.variant || 'success',
        duration,
        createdAt: now,
      };

      setToasts((prev) => {
        // Enforce maximum visible stack of 2 (newest toasts appear at top)
        const updated = [newToast, ...prev];
        return updated.slice(0, MAX_VISIBLE_TOASTS);
      });

      // Auto-dismiss timer
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (title: string, message: string, icon = '🌱', duration = DEFAULT_DURATION) => {
      return showToast({ title, message, icon, variant: 'success', duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, icon = '🌿', duration = DEFAULT_DURATION) => {
      return showToast({ title, message, icon, variant: 'info', duration });
    },
    [showToast]
  );

  return (
    <GrowToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showInfo,
        dismissToast,
      }}
    >
      {children}
    </GrowToastContext.Provider>
  );
}

export function useGrowToast() {
  const context = useContext(GrowToastContext);
  if (!context) {
    // Graceful fallback dummy if ever used outside of provider in tests or isolated components
    return {
      toasts: [],
      showToast: () => '',
      showSuccess: () => '',
      showInfo: () => '',
      dismissToast: () => {},
    };
  }
  return context;
}

