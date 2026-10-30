'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Sprout, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, Database } from 'lucide-react';

function SignUpForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            display_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Supabase returns a user with empty identities if user already exists
      if (data?.user?.identities?.length === 0) {
        setErrorMsg('An account with this email address already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      // Check if session was immediately established or email confirmation is required
      if (data?.session) {
        router.push('/app');
        router.refresh();
      } else {
        setSuccessMsg(
          'Account created successfully! If email confirmation is enabled on your project, please check your inbox to verify your email before signing in.'
        );
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#ded5c5] shadow-md space-y-6">
      <div className="text-center space-y-2">
        <Logo size="md" className="justify-center" />
        <h1 className="text-2xl font-serif font-bold text-[#0c2417] tracking-tight">
          Create Grower Account
        </h1>
        <p className="text-xs text-[#526a57]">
          Sync your vertical garden, growth logs, and care tasks across all your devices
        </p>
      </div>

      {!isConfigured && (
        <div className="p-3.5 rounded-xl bg-[#fef3c7] border border-[#fde68a] text-xs text-[#92400e] flex items-start gap-2.5">
          <Database size={16} className="shrink-0 mt-0.5 text-[#b45309]" />
          <div>
            <span className="font-semibold block">Demo Mode Active</span>
            <span>
              Cloud authentication is offline. You can use all features locally in browser demo mode.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#fbeee9] border border-[#f8d7cb] text-xs text-[#9a3412] flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] text-xs text-[#1e613b] space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 font-semibold text-[#144229] hover:underline"
            >
              <span>Go to Sign In</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Full Name or Grower Alias
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7e9985]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Greenhouse Grower"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7e9985]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="grower@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2417] mb-1">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7e9985]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-xs sm:text-sm text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] disabled:opacity-50 text-white py-3 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-2 border-t border-[#f0ebe0] space-y-3 text-center text-xs text-[#526a57]">
        <p>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[#144229] hover:underline">
            Sign In
          </Link>
        </p>
        <p>
          Or explore without an account:{' '}
          <Link href="/app" className="font-semibold text-[#144229] hover:underline">
            Continue in Local Demo Mode →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fbf9f4]">
      <Suspense fallback={<div className="text-xs text-[#526a57]">Loading registration...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
