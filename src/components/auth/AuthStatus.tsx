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
      <div className="flex items-center gap-2 text-xs text-[#5F6D63] py-1">
        <Loader2 size={13} className="animate-spin" />
        <span>Checking sync status...</span>
      </div>
    );
  }

  // Header compact pill
  if (variant === 'header') {
    if (user) {
      return (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#174C35] bg-[#EAF1E4] px-2.5 py-1 rounded-lg border border-[#E3DFD2]">
            <Cloud size={13} className="text-[#174C35]" />
            <span className="font-medium truncate max-w-[120px]">
              {user.email?.split('@')[0]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="p-1.5 text-xs text-[#5F6D63] hover:text-[#963A23] hover:bg-[#FBE9E2] rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
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
        <Link
          href="/auth/login"
          className="text-xs font-semibold text-[#174C35] hover:text-white hover:bg-[#174C35] px-3 py-1.5 rounded-lg border border-[#E3DFD2] transition-all min-h-[38px] flex items-center"
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
        <div className="bg-[#174C35] p-3 rounded-xl border border-[#174C35] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#78A95A] font-semibold text-[11px]">
              <Cloud size={14} className="text-[#78A95A]" />
              <span>Cloud Account</span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-[11px] text-[#E4775D] hover:text-white flex items-center gap-1 cursor-pointer"
              title="Sign out"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-[#174C35] flex items-center justify-center text-[10px] font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-medium truncate text-xs">{user.email}</p>
              <p className="text-[10px] text-[#EAF1E4]/90">Sync active via RLS</p>
            </div>
          </div>

          {/* Option to import local demo records if user has any */}
          {hasLocalDemoData() && (
            <div className="pt-2 border-t border-[#174C35]/60">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#174C35] hover:bg-[#174C35] text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <UploadCloud size={12} />
                )}
                <span>Import Local Demo Plants</span>
              </button>
              {importResult && (
                <p className="text-[10px] text-[#78A95A] mt-1 text-center">
                  {importResult}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#174C35] p-3 rounded-xl border border-[#174C35] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#78A95A] font-semibold text-[11px]">
              <HardDrive size={13} className="text-[#F0C04D]" />
              <span>Local Demo Mode</span>
            </div>
            {isConfigured && (
              <Link
                href="/auth/login"
                className="text-[11px] text-[#78A95A] hover:text-white font-medium underline"
              >
                Sign In
              </Link>
            )}
          </div>
          <p className="text-[11px] text-[#EAF1E4]/90 leading-relaxed">
            Data saved in this browser. Sign in to sync your garden across devices.
          </p>
        </div>
      )}
    </div>
  );
}
