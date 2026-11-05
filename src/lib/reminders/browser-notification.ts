/**
 * GrowAI Phase 9.1: Browser / PWA Notifications Client Helper
 * Handles browser notification permission queries, user requests, and safe delivery.
 *
 * Adheres to Section 13 rules:
 * - Permission states: unsupported, default, granted, denied
 * - Never prompts automatically on page load
 * - Never repeatedly prompts after user denial
 * - Safely guards against missing window/Notification/ServiceWorker APIs
 */

import { BrowserPermissionState, Reminder } from '@/types/reminder';

/**
 * Returns the current browser notification permission state.
 */
export function getBrowserNotificationPermission(): BrowserPermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  const perm = Notification.permission;
  if (perm === 'granted' || perm === 'denied' || perm === 'default') {
    return perm;
  }
  return 'unsupported';
}

/**
 * Requests browser notification permission after explicit user interaction.
 * Never invoke automatically on page load.
 */
export async function requestBrowserNotificationPermission(): Promise<BrowserPermissionState> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }

  // If already denied or granted, do not prompt again
  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    return result as BrowserPermissionState;
  } catch (err) {
    console.warn('[GrowAI Notification] Error requesting permission:', err);
    return getBrowserNotificationPermission();
  }
}

/**
 * Safely delivers a browser notification if permission is granted and browser is supported.
 * Returns true if sent successfully, false otherwise.
 */
export async function dispatchBrowserNotification(
  title: string,
  options?: NotificationOptions & { url?: string }
): Promise<boolean> {
  if (getBrowserNotificationPermission() !== 'granted') {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    body: options?.body || '',
    icon: options?.icon || '/icons/icon-192.png',
    badge: options?.badge || '/icons/icon-192.png',
    tag: options?.tag || 'growai-reminder',
    data: {
      url: options?.url || '/app/my-garden',
    },
    ...options,
  };

  // Try via active service worker registration first (preferred for PWA / background)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (err) {
      console.warn('[GrowAI Notification] Service worker showNotification failed, trying standard API:', err);
    }
  }

  // Fallback to standard Window Notification constructor
  try {
    if (typeof Notification !== 'undefined') {
      const notif = new Notification(title, notificationOptions);
      if (options?.url) {
        notif.onclick = () => {
          window.focus();
          window.location.href = options.url || '/app/my-garden';
        };
      }
      return true;
    }
  } catch (err) {
    console.warn('[GrowAI Notification] Window notification failed:', err);
  }

  return false;
}

