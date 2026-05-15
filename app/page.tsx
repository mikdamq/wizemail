'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, FileCode, Upload, Layers, Zap, Layout, BookOpen } from 'lucide-react';
import { ImportHtmlModal } from '@/components/builder/ImportHtmlModal';
import { AccountMenu } from '@/components/auth/AccountMenu';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function HomePage() {
  const [importOpen, setImportOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header
        className="border-b px-8 h-14 flex items-center justify-between flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-semibold tracking-tight text-sm"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
          >
            Wizemail
          </span>
        </div>
        <AccountMenu />
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="text-center mb-14 max-w-lg animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-6"
            style={{
              background: 'var(--accent-dim)',
              borderColor: 'rgba(232,93,38,0.3)',
              color: 'var(--accent-light)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            Developer-first email builder
          </div>
          <h1
            className="text-4xl font-semibold leading-tight mb-4"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
          >
            Build production-ready<br />HTML emails, fast.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Professional code editing, visual email building, and real-time simulated previews — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <ActionCard
            href="/builder"
            data-tour="start-builder"
            icon={<Layout className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
            iconBg="var(--accent-dim)"
            iconHoverBg="rgba(232,93,38,0.25)"
            hoverBorderColor="rgba(232,93,38,0.4)"
            label="Blank Canvas"
            description="Start from scratch with a clean editor"
          />
          <ActionCard
            href="/templates"
            icon={<Layers className="w-4 h-4 text-[#10b981]" />}
            iconBg="rgba(16,185,129,0.1)"
            iconHoverBg="rgba(16,185,129,0.2)"
            hoverBorderColor="rgba(16,185,129,0.4)"
            label="From Template"
            description="Pick a prebuilt email template"
          />
          <ActionCard
            onClick={() => setImportOpen(true)}
            icon={<Upload className="w-4 h-4 text-[#f59e0b]" />}
            iconBg="rgba(245,158,11,0.1)"
            iconHoverBg="rgba(245,158,11,0.2)"
            hoverBorderColor="rgba(245,158,11,0.4)"
            label="Import HTML"
            description="Paste or upload existing HTML email"
          />
          <ActionCard
            href="/emails"
            icon={<BookOpen className="w-4 h-4 text-[#8b5cf6]" />}
            iconBg="rgba(139,92,246,0.1)"
            iconHoverBg="rgba(139,92,246,0.2)"
            hoverBorderColor="rgba(139,92,246,0.4)"
            label="My Emails"
            description="Open and edit your saved designs"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: FileCode, label: 'Monaco Editor' },
            { icon: Zap, label: 'Real-time Preview' },
            { icon: Mail, label: 'Gmail · Outlook · Apple Mail' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {importOpen && <ImportHtmlModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function ActionCard({
  href,
  onClick,
  icon,
  iconBg,
  iconHoverBg,
  hoverBorderColor,
  label,
  description,
  ...rest
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  iconBg: string;
  iconHoverBg: string;
  hoverBorderColor: string;
  label: string;
  description: string;
  [key: string]: unknown;
}) {
  const className =
    'group relative flex flex-col items-start p-5 rounded-xl border transition-all duration-150 cursor-pointer text-left';
  const style = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = hoverBorderColor;
    (e.currentTarget as HTMLElement).style.background = 'var(--elevated)';
    const iconEl = (e.currentTarget as HTMLElement).querySelector('.icon-wrap') as HTMLElement | null;
    if (iconEl) iconEl.style.background = iconHoverBg;
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
    (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
    const iconEl = (e.currentTarget as HTMLElement).querySelector('.icon-wrap') as HTMLElement | null;
    if (iconEl) iconEl.style.background = iconBg;
  };

  const inner = (
    <>
      <div className="icon-wrap w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
      <div className="absolute top-4 right-4 text-xs" style={{ color: 'var(--text-subtle)' }}>→</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} style={style} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...(rest as Record<string, unknown>)}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={className} style={style} onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {inner}
    </button>
  );
}
