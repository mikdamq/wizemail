'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) { setHasSession(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/builder');
  };

  if (hasSession === false) {
    return (
      <main className="min-h-[100dvh] bg-[#0f0f11] flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-[#161618] border border-[#2a2a2e] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#71717a] mb-4">This reset link has expired or is invalid.</p>
          <Link href="/auth" className="text-xs text-[#818cf8] hover:text-[#a5b4fc]">
            Request a new password reset
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#0f0f11] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#161618] border border-[#2a2a2e] rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-[#f4f4f5]">Choose a new password</h1>
        <p className="text-xs text-[#71717a] mt-1 mb-5">Use at least 8 characters.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          className="w-full bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
        />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-3 py-2 text-sm font-medium text-white hover:bg-[#818cf8] disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Update password
        </button>
        <Link href="/auth" className="block text-center text-xs text-[#71717a] hover:text-[#a1a1aa] mt-4">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
