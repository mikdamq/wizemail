'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, LogOut, UserCircle } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function AccountMenu() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase?.auth.signOut();
    setEmail(null);
  };

  if (!supabase) {
    return (
      <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[10px] text-[#f59e0b]">
        Auth env missing
      </span>
    );
  }

  if (!email) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#222226] border border-[#2a2a2e] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e] transition-colors"
      >
        <UserCircle className="w-3.5 h-3.5" />
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden xl:block max-w-[150px] truncate text-[11px] text-[#71717a]" title={email}>
        {email}
      </span>
      <Link
        href="/billing"
        className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
        title="Billing"
      >
        <CreditCard className="w-3.5 h-3.5" />
      </Link>
      <button
        onClick={signOut}
        className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
