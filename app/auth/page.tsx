'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { env, isSupabaseConfigured } from '@/lib/env';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthShell />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthShell() {
  return (
    <main className="min-h-[100dvh] bg-[#0f0f11] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-[#161618] border border-[#2a2a2e] rounded-2xl p-6">
        <div className="h-5 w-32 rounded bg-[#222226] mb-4" />
        <div className="h-9 rounded bg-[#222226]" />
      </div>
    </main>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/builder';
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();
  const configured = isSupabaseConfigured() && supabase;

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) {
      setError('Supabase is not configured yet. Add the env vars in .env.local.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${env.appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
    const resetRedirectTo = `${env.appUrl}/auth/reset`;

    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (localStorage.getItem('wizemail-tour-seen') !== 'true') {
          localStorage.setItem('wizemail-show-tour', 'true');
        }
        router.push(next);
      } else if (mode === 'signup') {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (authError) throw authError;
        if (localStorage.getItem('wizemail-tour-seen') !== 'true') {
          localStorage.setItem('wizemail-show-tour', 'true');
        }
        setMessage('Check your email to verify your account.');
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetRedirectTo,
        });
        if (authError) throw authError;
        setMessage('Password reset link sent.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#0f0f11] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#71717a] hover:text-[#a1a1aa] mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center mb-4">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#f4f4f5] tracking-tight">
              {mode === 'login' ? 'Sign in to Wizemail' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </h1>
            <p className="text-xs text-[#71717a] mt-1">
              {mode === 'reset'
                ? 'We will send a secure reset link to your email.'
                : 'Cloud sync, billing, and saved projects use this account.'}
            </p>
          </div>

          {!configured && (
            <div className="rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-3 py-2 text-[11px] text-[#f59e0b] mb-4">
              Supabase env vars are missing. Auth UI is ready, but sign-in is disabled until configured.
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <label className="block">
              <span className="text-[11px] text-[#71717a]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-1 w-full bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors"
              />
            </label>

            {mode !== 'reset' && (
              <label className="block">
                <span className="text-[11px] text-[#71717a]">Password</span>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#3a3a3e]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-[#0f0f11] border border-[#2a2a2e] rounded-lg pl-9 pr-9 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#3a3a3e] hover:text-[#71717a] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </label>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
            {message && <p className="text-xs text-[#10b981]">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-3 py-2 text-sm font-medium text-white hover:bg-[#818cf8] disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs">
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">
              {mode === 'login' ? 'Create account' : mode === 'signup' ? 'Have an account? Sign in' : ''}
            </button>
            <button onClick={() => setMode(mode === 'reset' ? 'login' : 'reset')} className="text-[#71717a] hover:text-[#a1a1aa] transition-colors">
              {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
