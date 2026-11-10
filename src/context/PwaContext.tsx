'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore, useRef } from 'react';
import { WifiOff, Wifi, Download, RefreshCw, X, Apple, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  return () => {
    mql.removeEventListener('change', callback);
  };
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorWithStandalone;
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function getServerStandaloneSnapshot(): boolean {
  return false;
}

function subscribeIos() {
  return () => {};
}

function getIosSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as WindowWithMSStream;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && !win.MSStream;
}

function getServerIosSnapshot(): boolean {
  return false;
}

interface PwaContextType {
  isOnline: boolean;
  isOffline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isIos: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
  applyUpdate: () => void;
  purgePrivateCaches: () => Promise<void>;
  setShowIosInstructions: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isOnline: true,
  isOffline: false,
  isInstalled: false,
  canInstall: false,
  isIos: false,
  hasUpdate: false,
  promptInstall: async () => {},
  dismissInstall: () => {},
  applyUpdate: () => {},
  purgePrivateCaches: async () => {},
  setShowIosInstructions: () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);
  const isInstalled = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getServerStandaloneSnapshot);
  const isIos = useSyncExternalStore(subscribeIos, getIosSnapshot, getServerIosSnapshot);

  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const prevOnlineRef = useRef(isOnline);

  // Connection Restored Toast
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  // 2. Service Worker Registration & Update Flow
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check if there is already a waiting worker
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setHasUpdate(true);
        }

        // Listen for new updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setHasUpdate(true);
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed (non-fatal):', err);
      });

    // Listen for controlling service worker reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // 3. PWA Installation Event Listeners
  useEffect(() => {
    if (typeof window === 'undefined' || isInstalled) return;

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);

      // Check if user dismissed prompt within last 3 days
      const dismissedTimestamp = localStorage.getItem('growai_pwa_install_dismissed');
      const now = Date.now();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      if (!dismissedTimestamp || now - parseInt(dismissedTimestamp, 10) > threeDaysMs) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setCanInstall(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Prompt install flow
  const promptInstall = useCallback(async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setCanInstall(false);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Error launching install prompt:', err);
    }
  }, [deferredPrompt, isIos]);

  // Dismiss install banner
  const dismissInstall = useCallback(() => {
    setShowInstallBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('growai_pwa_install_dismissed', Date.now().toString());
    }
  }, []);

  // Apply service worker update
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setHasUpdate(false);
  }, [waitingWorker]);

  // Purge sensitive private caches on sign out
  const purgePrivateCaches = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Message service worker to clear private pages cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_CACHE' });
    }

    // Clear user demo or session items
    try {
      localStorage.removeItem('growai_demo_user_plants');
      localStorage.removeItem('growai_demo_care_tasks');
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        isInstalled,
        canInstall,
        isIos,
        hasUpdate,
        promptInstall,
        dismissInstall,
        applyUpdate,
        purgePrivateCaches,
        setShowIosInstructions,
      }}
    >
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-[#2a1b14] text-[#F0C04D/30] border-b border-[#8A6400] px-4 py-2.5 text-xs sm:text-sm font-medium sticky top-0 z-50 shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-md bg-[#8A6400] text-white shrink-0">
                <WifiOff size={16} />
              </span>
              <span>
                <strong>Offline Mode:</strong> Plant library & guides remain accessible from cache. Gemini AI Doctor & Cloud sync will resume when connection returns.
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-[#431407] text-[#F0C04D/30] font-semibold uppercase tracking-wider shrink-0">
              Offline
            </span>
          </div>
        </aside>
      )}

      {/* 2. Restored Connection Toast */}
      {showOnlineToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#174C35] text-white px-4 py-3 rounded-xl shadow-lg border border-[#174C35] flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 size={18} className="text-[#78A95A] shrink-0" />
          <span>Connection restored. GrowAI is back online.</span>
          <button
            type="button"
            onClick={() => setShowOnlineToast(false)}
            className="text-[#78A95A] hover:text-white ml-2 p-0.5"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </aside>
      )}

      {/* 3. New Version Update Notification */}
      {hasUpdate && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm bg-white text-[#203027] p-4 rounded-2xl shadow-xl border border-[#E3DFD2] flex items-start gap-3 animate-in fade-in duration-200"
        >
          <span className="p-2 rounded-xl bg-[#EAF1E4] text-[#174C35] shrink-0">
            <RefreshCw size={18} className="animate-spin text-[#174C35]" />
          </span>
          <div className="space-y-1.5 flex-1">
            <h4 className="font-serif font-bold text-sm text-[#203027]">
              GrowAI Update Ready
            </h4>
            <p className="text-xs text-[#203027] leading-relaxed">
              A fresh botanical build is ready with improved features and performance.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={applyUpdate}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#174C35] hover:bg-[#203027] text-white shadow-2xs cursor-pointer"
              >
                Reload & Update
              </button>
              <button
                type="button"
                onClick={() => setHasUpdate(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#68766C] hover:text-[#203027] cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHasUpdate(false)}
            className="text-[#68766C] hover:text-[#203027] p-1"
            aria-label="Dismiss update notification"
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* 4. Install Application Banner (Subtle and non-intrusive) */}
      {showInstallBanner && canInstall && !isInstalled && (
        <aside
          role="dialog"
          aria-label="Install GrowAI Application"
          className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 max-w-md bg-white border border-[#E3DFD2] p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#203027] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Download size={20} className="text-[#78A95A]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#203027]">
                Install GrowAI App
              </h4>
              <p className="text-xs text-[#68766C]">
                Quick launch from home screen with offline botanical access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={promptInstall}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#174C35] hover:bg-[#203027] text-white shadow-2xs cursor-pointer"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              className="p-1.5 text-[#68766C] hover:text-[#203027] rounded-lg"
              aria-label="Dismiss install banner"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* 5. iOS Add to Home Screen Instructions Modal */}
      {showIosInstructions && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add GrowAI to Home Screen on iOS"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-[#E3DFD2] max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
              <div className="flex items-center gap-2">
                <Apple size={22} className="text-[#203027]" />
                <h3 className="font-serif font-bold text-base text-[#203027]">
                  Install on iOS Safari
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="text-[#68766C] hover:text-[#203027] p-1"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <ol className="text-xs text-[#203027] space-y-3 pl-4 list-decimal leading-relaxed">
              <li>
                Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom of Safari.
              </li>
              <li>
                Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
              </li>
              <li>
                Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner to install GrowAI on your device.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#174C35] text-white hover:bg-[#203027] transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {children}
    </PwaContext.Provider>
  );
}
