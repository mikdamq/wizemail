'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, Mail } from 'lucide-react';
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
    <main className="min-h-[100dvh] flex" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm space-y-4">
          <div className="h-5 w-32 rounded-md animate-pulse" style={{ background: 'var(--elevated)' }} />
          <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
          <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        </div>
      </div>
      <div className="hidden lg:block w-1/2" style={{ background: 'var(--accent)' }} />
    </main>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
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
        const settingsRes = await fetch('/api/app-settings').then((r) => r.json()).catch(() => ({}));
        if (settingsRes.allowNewSignups === false) {
          setError('New signups are currently paused. Please check back later.');
          setLoading(false);
          return;
        }
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
    <main className="min-h-[100dvh] flex" style={{ background: 'var(--bg)' }}>
      {/* ── Left panel: form ── */}
      <div className="flex-1 lg:w-1/2 flex flex-col justify-between px-8 py-10 lg:px-16">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-80" style={{ background: 'var(--accent)' }}>
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
              Wizemail
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm mx-auto animate-fade-in-up">
          <div className="mb-8">
            <h1
              className="text-3xl font-semibold leading-tight mb-3"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
            >
              {mode === 'login'
                ? 'Welcome back.'
                : mode === 'signup'
                  ? 'Start building.'
                  : 'Reset your password.'}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {mode === 'reset'
                ? "We'll send a secure reset link to your email address."
                : 'Cloud sync, brand kits, and saved designs live on your account.'}
            </p>
          </div>

          {!configured && (
            <div
              className="rounded-xl px-4 py-3 text-xs mb-5"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: 'var(--warning)',
              }}
            >
              Supabase env vars are missing. Auth UI is ready, but sign-in is disabled until configured.
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                    style={{ color: 'var(--text-subtle)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-subtle)' }}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
            )}
            {message && (
              <p className="text-xs" style={{ color: 'var(--success)' }}>{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null); }}
              className="transition-colors"
              style={{ color: 'var(--accent-light)' }}
            >
              {mode === 'login' ? 'Create an account' : mode === 'signup' ? 'Already have an account?' : ''}
            </button>
            <button
              onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(null); setMessage(null); }}
              className="transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: 'var(--text-subtle)' }}>
          © {new Date().getFullYear()} Wizemail. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: email preview ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--accent)' }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow blob */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'rgba(255,200,150,0.5)', top: '10%', right: '-10%' }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'rgba(255,255,255,0.3)', bottom: '15%', left: '5%' }}
        />

        {/* Tagline */}
        <div className="relative z-10 text-center mb-10 px-8">
          <p
            className="text-4xl font-semibold leading-tight text-white"
            style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic' }}
          >
            Send emails<br />people actually open.
          </p>
          <p className="text-sm text-white/70 mt-3 font-light">
            Design beautiful HTML emails without touching a line of CSS.
          </p>
        </div>

        {/* Simulated email card */}
        <div
          className="relative z-10 w-72 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: '#FAF8F3', animationDelay: '0.2s' }}
        >
          {/* Email chrome bar */}
          <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid #DDD8CE' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-[10px] ml-2" style={{ color: '#706A5F', fontFamily: 'var(--font-ibm-plex-mono)' }}>
              Wizemail Preview
            </span>
          </div>

          {/* Email header block */}
          <div
            className="px-5 py-4 animate-fade-in-up"
            style={{ background: 'var(--accent)', animationDelay: '0.3s' }}
          >
            <p
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              The Weekly Brief
            </p>
            <p className="text-xs text-white/70 mt-0.5">Issue #42 · May 2026</p>
          </div>

          {/* Email body rows */}
          <div className="px-5 py-4 space-y-3">
            <div
              className="h-3 rounded-full animate-fade-in-up"
              style={{ background: '#DDD8CE', width: '90%', animationDelay: '0.4s' }}
            />
            <div
              className="h-3 rounded-full animate-fade-in-up"
              style={{ background: '#DDD8CE', width: '75%', animationDelay: '0.5s' }}
            />
            <div
              className="h-3 rounded-full animate-fade-in-up"
              style={{ background: '#DDD8CE', width: '82%', animationDelay: '0.6s' }}
            />

            <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div
                className="inline-block rounded-lg px-5 py-2 text-xs font-semibold text-white"
                style={{ background: 'var(--accent)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                Read the full issue →
              </div>
            </div>
          </div>

          {/* Email footer */}
          <div
            className="px-5 py-3 animate-fade-in-up"
            style={{ borderTop: '1px solid #DDD8CE', animationDelay: '0.8s' }}
          >
            <div className="flex gap-3">
              <div className="h-2 rounded-full flex-1" style={{ background: '#EAE7DE' }} />
              <div className="h-2 rounded-full w-16" style={{ background: '#EAE7DE' }} />
            </div>
          </div>
        </div>

        {/* Floating badge */}
        <div
          className="relative z-10 mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/90 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', animationDelay: '0.9s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
          Built with Wizemail · No coding needed
        </div>
      </div>
    </main>
  );
}
