'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  LogOut,
  Cloud,
  HardDrive,
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { hasLocalDemoData, importLocalDemoDataToCloud } from '@/lib/storage';

interface AuthStatusProps {
  variant?: 'sidebar' | 'header' | 'banner';
  onImportSuccess?: () => void;
}

export function AuthStatus({ variant = 'sidebar', onImportSuccess }: AuthStatusProps) {
  const { user, isConfigured, loading, signOut } = useAuth();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await importLocalDemoDataToCloud();
      if (res.error) {
        setImportResult(`Import failed: ${res.error}`);
      } else {
        setImportResult(
          `Imported ${res.importedCount} plant(s) to cloud (${res.skippedCount} skipped as duplicate).`
        );
        if (onImportSuccess) onImportSuccess();
      }
    } catch (err: any) {
      setImportResult(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#86aa91] py-1">
        <Loader2 size={13} className="animate-spin" />
        <span>Checking sync status...</span>
      </div>
    );
  }

  // Header compact pill
  if (variant === 'header') {
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1e613b] bg-[#eef5ee] px-2.5 py-1 rounded-lg border border-[#cfe0cf]">
            <Cloud size={13} className="text-[#257a4d]" />
            <span className="font-medium truncate max-w-[140px]">
              {user.email?.split('@')[0]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="p-1.5 text-xs text-[#526a57] hover:text-[#9a3412] hover:bg-[#fbeee9] rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#6d8573] bg-[#f7f5ed] px-2.5 py-1 rounded-lg border border-[#e2dbce]">
          <HardDrive size={13} />
          Demo Mode
        </span>
        <Link
          href="/auth/login"
          className="text-xs font-semibold text-[#144229] hover:text-white hover:bg-[#144229] px-3 py-1.5 rounded-lg border border-[#cfdfcf] transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Sidebar container
  return (
    <div className="space-y-2 pt-2">
      {user ? (
        <div className="bg-[#143a25] p-3 rounded-xl border border-[#1e5235] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#9dc2a8] font-semibold text-[11px]">
              <Cloud size={14} className="text-[#64b584]" />
              <span>Cloud Account</span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-[11px] text-[#e89078] hover:text-white flex items-center gap-1 cursor-pointer"
              title="Sign out"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-[#257a4d] flex items-center justify-center text-[10px] font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-medium truncate text-xs">{user.email}</p>
              <p className="text-[10px] text-[#86aa91]">Sync active via RLS</p>
            </div>
          </div>

          {/* Option to import local demo records if user has any */}
          {hasLocalDemoData() && (
            <div className="pt-2 border-t border-[#1e5235]/60">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#1b4e32] hover:bg-[#257a4d] text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <UploadCloud size={12} />
                )}
                <span>Import Local Demo Plants</span>
              </button>
              {importResult && (
                <p className="text-[10px] text-[#a4d4b3] mt-1 text-center">
                  {importResult}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#143a25] p-3 rounded-xl border border-[#1e5235] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#9dc2a8] font-semibold text-[11px]">
              <HardDrive size={13} className="text-[#eab308]" />
              <span>Local Demo Mode</span>
            </div>
            {isConfigured && (
              <Link
                href="/auth/login"
                className="text-[11px] text-[#64b584] hover:text-white font-medium underline"
              >
                Sign In
              </Link>
            )}
          </div>
          <p className="text-[11px] text-[#84a990] leading-relaxed">
            Data saved in this browser. Sign in to sync your garden across devices.
          </p>
        </div>
      )}
    </div>
  );
}
