'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreditCard, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function AccountMenu() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
    setEmail(null);
    setOpen(false);
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

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-[#222226] transition-colors group"
      >
        <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
          {initial}
        </div>
        <ChevronDown className={`w-3 h-3 text-[#71717a] group-hover:text-[#a1a1aa] transition-all duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-52 bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-3 py-3 border-b border-[#2a2a2e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#f4f4f5] truncate">{email}</p>
                <p className="text-[10px] text-[#71717a]">Free plan</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
              Billing & plan
            </Link>
          </div>

          <div className="border-t border-[#2a2a2e] py-1">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#a1a1aa] hover:text-red-400 hover:bg-red-400/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
