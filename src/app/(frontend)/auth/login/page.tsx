'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Database, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/app';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError || null);
  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isConfigured) {
      setErrorMsg('Supabase credentials are not configured. Running in Demo Mode.');
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg('Unable to initialize Supabase client.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign-in.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E3DFD2] shadow-md space-y-6">
      <div className="text-center space-y-2">
        <Logo size="md" className="justify-center" />
        <h1 className="text-2xl font-serif font-bold text-[#203027] tracking-tight">
          Welcome Back, Grower
        </h1>
        <p className="text-xs text-[#68766C]">
          Sign in to access your persistent cloud garden log and care tasks
        </p>
      </div>

      {!isConfigured && (
        <div className="p-3.5 rounded-xl bg-[#FFF3D7] border border-[#F0C04D/30] text-xs text-[#8A6400] flex items-start gap-2.5">
          <Database size={16} className="shrink-0 mt-0.5 text-[#8A6400]" />
          <div>
            <span className="font-semibold block">Demo Mode Active</span>
            <span>
              Cloud authentication is offline. You can use all features locally in browser demo mode.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FBE9E2] border border-[#E4775D/30] text-xs text-[#963A23] flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#203027] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68766C]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="grower@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-[#203027]">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68766C]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-xs sm:text-sm text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#174C35] hover:bg-[#203027] disabled:opacity-50 text-white py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-[#E3DFD2] space-y-3 text-center text-xs text-[#68766C]">
        <p>
          Don&apos;t have a cloud account yet?{' '}
          <Link href="/auth/sign-up" className="font-semibold text-[#174C35] hover:underline">
            Create an Account
          </Link>
        </p>
        <p>
          Or explore without an account:{' '}
          <Link href="/app" className="font-semibold text-[#174C35] hover:underline">
            Continue in Local Demo Mode →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F6EE]">
      <Suspense fallback={<div className="text-xs text-[#68766C]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
