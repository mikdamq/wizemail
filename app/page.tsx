'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, Code2, Eye, Zap, Globe, Accessibility, Layers, Monitor, Smartphone,
  Moon, CheckCircle2, X, ChevronRight, Mail, Sparkles, AlignRight,
  FileCode2, LayoutTemplate, Send, Lock, RefreshCw, Braces
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/* ─── Motion constants ─── */
const SPRING = { type: 'spring' as const, stiffness: 100, damping: 20 };
const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── Cursor glow ─── */
function CursorGlow() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 30, stiffness: 80 });
  const sy = useSpring(my, { damping: 30, stiffness: 80 });

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        x: sx, y: sy,
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,140,255,0.06) 0%, transparent 70%)',
        transform: 'translate(-50%,-50%)',
        zIndex: 0,
      }}
    />
  );
}

/* ─── Noise overlay ─── */
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

/* ─── Stagger reveal wrapper ─── */
const STAGGER_PARENT = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const STAGGER_CHILD = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...SPRING } },
};

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Magnetic button ─── */
function MagneticBtn({ children, className, href, primary }: { children: React.ReactNode; className?: string; href?: string; primary?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 15, stiffness: 150 });
  const sy = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  const base = primary
    ? 'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]'
    : 'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border transition-all duration-200 active:scale-[0.97]';

  const style = primary
    ? { background: '#5B8CFF', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 24px rgba(91,140,255,0.25)' }
    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' };

  return (
    <motion.a
      ref={ref}
      href={href ?? '#'}
      className={`${base} ${className ?? ''}`}
      style={{ ...style, x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.03 }}
    >
      {children}
    </motion.a>
  );
}

/* ─── Animated product preview panel ─── */
const PREVIEW_MODES = [
  { label: 'Desktop', icon: Monitor },
  { label: 'Mobile', icon: Smartphone },
  { label: 'Dark Mode', icon: Moon },
  { label: 'Outlook', icon: Mail },
  { label: 'Code', icon: Code2 },
];

function HeroPreviewPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % PREVIEW_MODES.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full select-none" style={{ perspective: 1000 }}>
      {/* Floating background glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(91,140,255,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: 'scale(1.2)',
        }}
      />

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 3 }}
        transition={{ ...SPRING, delay: 0.4 }}
        className="relative rounded-2xl border overflow-hidden"
        whileHover={{ rotateX: 0, y: -4, transition: { ...SPRING } }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex items-center gap-1">
            {PREVIEW_MODES.map((m, i) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => setActive(i)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: active === i ? 'rgba(91,140,255,0.2)' : 'transparent',
                    color: active === i ? '#5B8CFF' : 'rgba(255,255,255,0.35)',
                    border: active === i ? '1px solid rgba(91,140,255,0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
          <div className="w-16" />
        </div>

        {/* Canvas area */}
        <div className="relative overflow-hidden" style={{ height: 340 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute inset-0"
            >
              <PreviewContent mode={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating badges */}
      <FloatingBadge delay={0.8} className="absolute -top-4 -right-6 hidden lg:block">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">Outlook-safe HTML</span>
      </FloatingBadge>
      <FloatingBadge delay={1.0} className="absolute -bottom-4 -left-6 hidden lg:block">
        <Zap className="w-3.5 h-3.5 text-[#5B8CFF]" />
        <span className="text-xs font-medium" style={{ color: '#5B8CFF' }}>Live preview sync</span>
      </FloatingBadge>
    </div>
  );
}

function FloatingBadge({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${className}`}
      style={{
        background: 'rgba(13,13,18,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </motion.div>
  );
}

function PreviewContent({ mode }: { mode: number }) {
  if (mode === 4) return <CodePreview />;
  return (
    <div className="flex h-full" style={{ background: mode === 2 ? '#0f1117' : '#f1f5f9' }}>
      {/* Left panel */}
      <div
        className="flex-shrink-0 border-r p-3 space-y-1.5 overflow-hidden"
        style={{
          width: 140,
          background: 'rgba(0,0,0,0.3)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {['Hero', 'Body text', 'Button', 'Social', 'Footer'].map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer"
            style={{
              background: i === 0 ? 'rgba(91,140,255,0.15)' : 'transparent',
              border: i === 0 ? '1px solid rgba(91,140,255,0.2)' : '1px solid transparent',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? '#5B8CFF' : 'rgba(255,255,255,0.2)' }} />
            <span className="text-[10px]" style={{ color: i === 0 ? '#5B8CFF' : 'rgba(255,255,255,0.4)' }}>{s}</span>
          </motion.div>
        ))}
      </div>

      {/* Email canvas */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-hidden">
        <div
          className="w-full max-w-[280px] rounded-lg overflow-hidden"
          style={{
            background: mode === 2 ? '#1a1a2e' : '#ffffff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            transform: mode === 1 ? 'scale(0.7)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="h-2" style={{ background: mode === 2 ? '#5B8CFF' : '#E85D26' }} />
          <div className="p-4">
            <div className="h-2.5 rounded-full mb-2 w-3/4" style={{ background: mode === 2 ? 'rgba(255,255,255,0.15)' : '#1a1a2e' }} />
            <div className="h-1.5 rounded-full mb-1.5 w-full opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-1.5 rounded-full mb-1.5 w-5/6 opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-1.5 rounded-full mb-4 w-4/6 opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-8 rounded-lg flex items-center justify-center" style={{ background: mode === 2 ? '#5B8CFF' : '#E85D26' }}>
              <div className="h-1.5 w-16 rounded-full bg-white opacity-80" />
            </div>
          </div>
          <div className="border-t px-4 py-3 flex justify-center gap-2" style={{ borderColor: mode === 2 ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-4 rounded-full opacity-30" style={{ background: mode === 2 ? 'rgba(255,255,255,0.5)' : '#64748b' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CODE_LINES = [
  { indent: 0, text: '<mjml>', color: '#5B8CFF' },
  { indent: 1, text: '<mj-body>', color: '#5B8CFF' },
  { indent: 2, text: '<mj-section background-color="#09090B">', color: '#5B8CFF' },
  { indent: 3, text: '<mj-column>', color: '#5B8CFF' },
  { indent: 4, text: '<mj-text color="#F5F0E8" font-size="28px">', color: '#5B8CFF' },
  { indent: 5, text: 'Build beautiful emails', color: '#a8d8a8' },
  { indent: 4, text: '</mj-text>', color: '#5B8CFF' },
  { indent: 4, text: '<mj-button background-color="#5B8CFF">', color: '#5B8CFF' },
  { indent: 5, text: 'Get Started', color: '#a8d8a8' },
  { indent: 4, text: '</mj-button>', color: '#5B8CFF' },
];

function CodePreview() {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= CODE_LINES.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 120);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div className="h-full p-4 overflow-hidden" style={{ background: '#0d0d14', fontFamily: 'var(--font-ibm-plex-mono)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(91,140,255,0.15)', color: '#5B8CFF', border: '1px solid rgba(91,140,255,0.2)' }}>
          email.mjml
        </div>
      </div>
      <div className="space-y-0.5">
        {CODE_LINES.slice(0, revealed).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-[11px]"
          >
            <span className="w-6 text-right mr-4 opacity-20" style={{ color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
            <span style={{ marginLeft: line.indent * 12, color: line.color }}>{line.text}</span>
          </motion.div>
        ))}
        {revealed < CODE_LINES.length && (
          <div className="flex items-center text-[11px]" style={{ marginLeft: (CODE_LINES[revealed]?.indent ?? 0) * 12 + 40 }}>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-2 h-3 ml-0.5 rounded-sm"
              style={{ background: '#5B8CFF' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Marquee ─── */
const BRANDS = ['Figma', 'Notion', 'Resend', 'Postmark', 'Mailgun', 'Supabase', 'Vercel', 'Linear', 'Stripe', 'Cloudflare'];

function Marquee() {
  return (
    <div className="relative overflow-hidden py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{ animation: 'marquee 28s linear infinite' }}
      >
        {[...BRANDS, ...BRANDS].map((b, i) => (
          <span key={i} className="text-sm font-medium opacity-25 tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
      style={{ background: 'rgba(91,140,255,0.1)', border: '1px solid rgba(91,140,255,0.2)', color: '#5B8CFF' }}>
      {children}
    </div>
  );
}

/* ─── Product showcase blocks ─── */
const SHOWCASE_BLOCKS = [
  {
    label: 'Visual Builder',
    headline: 'Drag. Reorder. Customize.',
    body: 'Build email layouts visually with a column-based row system. Select, rearrange, and style every section — no code needed.',
    features: ['Rows & columns', 'Click-to-select canvas', 'Reusable sections', 'Responsive by default'],
    accent: '#5B8CFF',
    icon: LayoutTemplate,
    visual: <BuilderVisual />,
  },
  {
    label: 'Code Mode',
    headline: 'Monaco-powered. MJML-ready.',
    body: 'Drop into a full Monaco editor with syntax highlighting, split-view preview, and live MJML compilation whenever you need direct control.',
    features: ['Syntax highlighting', 'Split view', 'MJML support', 'Live sync'],
    accent: '#10b981',
    icon: Code2,
    visual: <CodeEditorVisual />,
    flip: true,
  },
  {
    label: 'Email Previewing',
    headline: 'Every client. Every device.',
    body: 'Switch between Gmail, Outlook, Apple Mail, and mobile frames instantly. Test dark mode rendering without leaving the editor.',
    features: ['Gmail chrome', 'Outlook frame', 'Apple Mail', 'Dark mode render'],
    accent: '#f59e0b',
    icon: Eye,
    visual: <PreviewVisual />,
  },
  {
    label: 'Accessibility & QA',
    headline: 'Ship with confidence.',
    body: 'Catch contrast issues, missing alt text, and email client compatibility problems before your campaign goes live.',
    features: ['Contrast checks', 'Alt text audit', 'Responsive scoring', 'Email-safe validation'],
    accent: '#ec4899',
    icon: Accessibility,
    visual: <QaVisual />,
    flip: true,
  },
];

function BuilderVisual() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);
  const rows = ['Header', 'Hero section', 'Feature callout', 'Footer'];
  return (
    <div className="h-full rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#FEBC2E' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        <span className="text-[10px] ml-2 opacity-40">builder.tsx</span>
      </div>
      <div className="p-4 space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r}
            layout
            animate={{
              background: active === i ? 'rgba(91,140,255,0.1)' : 'rgba(255,255,255,0.03)',
              borderColor: active === i ? 'rgba(91,140,255,0.3)' : 'rgba(255,255,255,0.06)',
            }}
            transition={{ ...SPRING }}
            className="rounded-lg px-3 py-2.5 border flex items-center justify-between cursor-pointer"
          >
            <span className="text-xs" style={{ color: active === i ? '#5B8CFF' : 'rgba(255,255,255,0.4)' }}>{r}</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((j) => (
                <div key={j} className="w-1 h-3 rounded-full opacity-30" style={{ background: 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CodeEditorVisual() {
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCursor((c) => (c + 1) % 20), 60);
    return () => clearInterval(t);
  }, []);
  const lines = ['<mjml>', '  <mj-body>', '    <mj-section>', '      <mj-column>', '        <mj-text color="#fff">', '          Welcome aboard', '        </mj-text>', '    </mj-section>', '  </mj-body>', '</mjml>'];
  return (
    <div className="h-full rounded-xl overflow-hidden font-mono text-[10px]" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex h-full">
        <div className="flex-1 p-4 border-r overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] mb-3 opacity-30">email.mjml</div>
          {lines.map((l, i) => (
            <div key={i} className="flex items-center leading-5">
              <span className="w-4 mr-3 opacity-20 text-right text-[9px]">{i + 1}</span>
              <span style={{ color: l.includes('<') ? '#5B8CFF' : '#a8d8a8' }}>{l}</span>
              {i === 5 && cursor % 2 === 0 && <span className="inline-block w-1.5 h-3 ml-0.5 rounded-sm" style={{ background: '#5B8CFF' }} />}
            </div>
          ))}
        </div>
        <div className="w-2/5 p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="text-[9px] mb-3 opacity-30">Live preview</div>
          <div className="rounded-lg overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-1.5 w-full" style={{ background: '#5B8CFF' }} />
            <div className="p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-1 w-5/6 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-5 w-20 rounded-md mt-2" style={{ background: '#5B8CFF' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewVisual() {
  const clients = ['Gmail', 'Outlook', 'Apple', 'Mobile'];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % clients.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-full rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {clients.map((c, i) => (
          <button
            key={c}
            onClick={() => setActive(i)}
            className="px-2.5 py-1 rounded text-[10px] font-medium transition-all"
            style={{
              background: active === i ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: active === i ? '#f59e0b' : 'rgba(255,255,255,0.3)',
              border: active === i ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="p-6 flex items-center justify-center">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[200px] rounded-lg overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="h-1.5 w-full" style={{ background: '#f59e0b' }} />
          <div className="p-3 space-y-1.5">
            <div className="h-2 w-2/3 rounded-full" style={{ background: '#1a1a2e' }} />
            <div className="h-1 w-full rounded-full bg-slate-200" />
            <div className="h-1 w-4/5 rounded-full bg-slate-200" />
            <div className="h-6 rounded-md mt-2 flex items-center justify-center" style={{ background: '#f59e0b' }}>
              <div className="h-1 w-12 rounded-full bg-white opacity-80" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function QaVisual() {
  const checks = [
    { label: 'Contrast ratio', score: 91, color: '#10b981', ok: true },
    { label: 'Alt text coverage', score: 78, color: '#f59e0b', ok: true },
    { label: 'Responsive layout', score: 100, color: '#10b981', ok: true },
    { label: 'Outlook compat.', score: 64, color: '#ec4899', ok: false },
  ];
  return (
    <div className="h-full rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] opacity-40">QA Report — v2.4.1</span>
      </div>
      <div className="p-4 space-y-3">
        {checks.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-semibold" style={{ color: c.color }}>{c.score}%</span>
                {c.ok ? <CheckCircle2 className="w-3 h-3" style={{ color: c.color }} /> : <X className="w-3 h-3 text-rose-400" />}
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.score}%` }}
                transition={{ delay: i * 0.12 + 0.3, duration: 0.8, ease: EASE_OUT }}
                className="h-full rounded-full"
                style={{ background: c.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature grid ─── */
const FEATURES = [
  { icon: Mail, label: 'Outlook-safe exports', desc: 'Inlined CSS, table layouts, VML fallbacks — all handled.' },
  { icon: Monitor, label: 'Responsive HTML', desc: 'Mobile-first fluid layouts that adapt across every screen.' },
  { icon: Braces, label: 'MJML support', desc: 'Write MJML, compile to email-safe HTML with a click.' },
  { icon: Moon, label: 'Dark mode previews', desc: 'Test real dark mode rendering per email client.' },
  { icon: Sparkles, label: 'Merge variables', desc: 'Use {{first_name}} style tags exported as ESP-ready tokens.' },
  { icon: Accessibility, label: 'Accessibility scoring', desc: 'Contrast ratios, alt text, and WCAG-ready checks.' },
  { icon: Layers, label: 'Reusable sections', desc: 'Save and reuse headers, footers, and blocks across campaigns.' },
  { icon: Send, label: 'Send test emails', desc: 'SMTP and Resend-powered test sends directly from the editor.' },
  { icon: FileCode2, label: 'Export anywhere', desc: 'Raw HTML, inlined, optimized — copy or download instantly.' },
  { icon: Globe, label: 'RTL-ready', desc: 'Arabic and Hebrew text direction supported natively.' },
  { icon: Lock, label: 'Your data', desc: 'Designs stored in your own Supabase instance.' },
  { icon: RefreshCw, label: 'Version history', desc: 'Named save slots and conflict resolution across devices.' },
];

/* ─── Comparison ─── */
const OLD_FLOW = ['Broken nested tables', 'Outlook ignores your CSS', 'Clunky drag-and-drop editors', 'No dark mode testing', 'Export → break → fix → repeat', 'Zero developer control'];
const NEW_FLOW = ['Visual editor + real HTML output', 'Outlook-safe export pipeline', 'Monaco code mode, always accessible', 'Inline dark mode preview per client', 'One-click production-ready export', 'Split view, code sync, MJML support'];

/* ─── Main page ─── */
export default function HomePage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [supabase, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-x-hidden" style={{ background: '#09090B', color: '#F5F0E8' }}>
      <CursorGlow />
      <NoiseOverlay />

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14"
        style={{
          background: 'rgba(9,9,11,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#5B8CFF' }}>
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-sm" style={{ fontFamily: 'var(--font-fraunces)', color: '#F5F0E8' }}>
            Wizemail
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Templates', 'Pricing', 'Docs'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-sm transition-colors hover:text-white hidden md:block" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Sign in
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: '#5B8CFF', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[100dvh] flex items-center pt-14" style={{ zIndex: 2 }}>
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 rounded-full"
            style={{
              width: 600, height: 600,
              background: 'radial-gradient(circle, rgba(91,140,255,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
              transform: 'translate(-50%,-50%)',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 rounded-full"
            style={{
              width: 400, height: 400,
              background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
          {/* Left: copy */}
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            <motion.div variants={STAGGER_CHILD}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
                style={{
                  background: 'rgba(91,140,255,0.1)',
                  border: '1px solid rgba(91,140,255,0.2)',
                  color: '#5B8CFF',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5B8CFF' }} />
                Modern HTML Email Builder
              </div>
            </motion.div>

            <motion.h1
              variants={STAGGER_CHILD}
              className="text-4xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tighter leading-none mb-6"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#F5F0E8', letterSpacing: '-0.03em' }}
            >
              Build beautiful<br />
              <span style={{ color: '#5B8CFF' }}>HTML emails</span><br />
              without breaking<br />Outlook.
            </motion.h1>

            <motion.p
              variants={STAGGER_CHILD}
              className="text-base leading-relaxed mb-10 max-w-[48ch]"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Design, preview, test, and export responsive production-ready emails with a modern visual editor and developer-grade code workflow.
            </motion.p>

            <motion.div variants={STAGGER_CHILD} className="flex flex-wrap items-center gap-3 mb-12">
              <MagneticBtn href="/auth" primary>
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </MagneticBtn>
              <MagneticBtn href="#features">
                See how it works
                <ChevronRight className="w-4 h-4" />
              </MagneticBtn>
            </motion.div>

            <motion.p variants={STAGGER_CHILD} className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Trusted by designers, developers, and modern marketing teams.
            </motion.p>
          </motion.div>

          {/* Right: animated product panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.3 }}
            className="relative"
          >
            <HeroPreviewPanel />
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative" style={{ zIndex: 2 }}>
        <p className="text-center text-xs mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Built for modern email workflows.
        </p>
        <Marquee />
      </div>

      {/* ── PRODUCT SHOWCASE ── */}
      <section id="features" className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="text-center mb-20">
            <SectionLabel><Sparkles className="w-3 h-3" /> Product</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Everything you need to build<br />production-safe emails.
            </h2>
          </FadeUp>

          <div className="space-y-32">
            {SHOWCASE_BLOCKS.map((block, i) => {
              const Icon = block.icon;
              return (
                <FadeUp key={block.label} delay={0.05}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${block.flip ? 'lg:flex lg:flex-row-reverse' : ''}`}>
                    <div className={block.flip ? 'lg:pl-20' : ''}>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5"
                        style={{ background: `${block.accent}15`, border: `1px solid ${block.accent}30`, color: block.accent }}
                      >
                        <Icon className="w-3 h-3" />
                        {block.label}
                      </div>
                      <h3 className="text-2xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em' }}>
                        {block.headline}
                      </h3>
                      <p className="text-base leading-relaxed mb-8 max-w-[44ch]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {block.body}
                      </p>
                      <ul className="space-y-2">
                        {block.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${block.accent}20` }}>
                              <CheckCircle2 className="w-2.5 h-2.5" style={{ color: block.accent }} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="h-72 md:h-96">
                      {block.visual}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SPLIT WORKFLOW ── */}
      <section className="relative py-32 px-6 md:px-12 overflow-hidden" style={{ zIndex: 2 }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(91,140,255,0.05) 0%, transparent 70%)' }}
        />
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="text-center mb-16">
            <SectionLabel><Code2 className="w-3 h-3" /> Workflow</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Visual editing meets<br />developer control.
            </h2>
          </FadeUp>

          <FadeUp>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                background: '#0d0d14',
              }}
            >
              {/* Tab bar */}
              <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs px-3 py-1 rounded-md font-medium" style={{ background: 'rgba(91,140,255,0.15)', color: '#5B8CFF', border: '1px solid rgba(91,140,255,0.2)' }}>Visual</span>
                  <span className="text-xs px-3 py-1 rounded-md" style={{ color: 'rgba(255,255,255,0.3)' }}>Code</span>
                </div>
                <div
                  className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                  Synced
                </div>
              </div>

              {/* Split content */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Visual side */}
                <div className="p-8 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs mb-4 opacity-30">Canvas</p>
                  <div className="space-y-2">
                    {['Header', 'Hero section', 'CTA block', 'Footer'].map((row, i) => (
                      <div key={row} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: i === 1 ? '#5B8CFF' : 'rgba(255,255,255,0.1)' }} />
                        <span className="text-xs" style={{ color: i === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{row}</span>
                        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {[0, 1].map((j) => <div key={j} className="w-1 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code side */}
                <div className="p-8 font-mono text-[11px]" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="mb-4 opacity-30" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>email.mjml</p>
                  <div className="space-y-0.5" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
                    {[
                      { t: '<mj-section background-color="#09090B">', c: '#5B8CFF', i: 0 },
                      { t: '  <mj-column>', c: '#5B8CFF', i: 0 },
                      { t: '    <mj-text', c: '#5B8CFF', i: 0 },
                      { t: '      color="#F5F0E8"', c: '#f59e0b', i: 0 },
                      { t: '      font-size="36px">', c: '#f59e0b', i: 0 },
                      { t: '      Build beautiful emails', c: '#a8d8a8', i: 0 },
                      { t: '    </mj-text>', c: '#5B8CFF', i: 0 },
                      { t: '  </mj-column>', c: '#5B8CFF', i: 0 },
                      { t: '</mj-section>', c: '#5B8CFF', i: 0 },
                    ].map((l, idx) => (
                      <div key={idx} className="leading-5 flex items-center" style={{ color: l.c }}>
                        <span className="w-5 mr-3 text-right opacity-20 text-[9px]">{idx + 1}</span>
                        <span>{l.t}</span>
                        {idx === 5 && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }} className="inline-block w-1.5 h-3 ml-0.5 rounded-sm" style={{ background: '#5B8CFF' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURE GRID ── */}
      <section className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-16">
            <SectionLabel><Zap className="w-3 h-3" /> Capabilities</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Built for modern<br />email teams.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <FadeUp key={feat.label} delay={i * 0.04}>
                  <div
                    className="group p-7 transition-all duration-300 hover:bg-white/[0.02]"
                    style={{ background: '#09090B' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-5" style={{ background: 'rgba(91,140,255,0.1)', border: '1px solid rgba(91,140,255,0.15)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#5B8CFF' }} />
                    </div>
                    <p className="text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.85)' }}>{feat.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{feat.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY WIZEMAIL ── */}
      <section className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="text-center mb-16">
            <SectionLabel><RefreshCw className="w-3 h-3" /> Why switch</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Email builders haven&apos;t<br />evolved in years.
            </h2>
            <p className="mt-4 text-base max-w-[48ch] mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The same clunky drag-and-drop tools. The same Outlook bugs. The same broken exports. We built the workflow email deserves.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <FadeUp>
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-xs font-semibold mb-6 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Old workflow
                </p>
                <ul className="space-y-3">
                  {OLD_FLOW.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500 opacity-70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            <FadeUp delay={0.08}>
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(91,140,255,0.05)',
                  border: '1px solid rgba(91,140,255,0.15)',
                }}
              >
                <p className="text-xs font-semibold mb-6 tracking-wider uppercase" style={{ color: '#5B8CFF' }}>
                  Wizemail
                </p>
                <ul className="space-y-3">
                  {NEW_FLOW.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#5B8CFF' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MENA / RTL ── */}
      <section className="relative py-32 px-6 md:px-12 overflow-hidden" style={{ zIndex: 2 }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)' }}
        />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <SectionLabel><AlignRight className="w-3 h-3" /> MENA & Arabic</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight mb-6" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Built for the future of email design in MENA.
            </h2>
            <p className="text-base leading-relaxed mb-8 max-w-[44ch]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Wizemail is building the first modern email workflow platform designed with Arabic, RTL, and regional businesses in mind — from Ramadan campaigns to regional ecommerce.
            </p>
            <ul className="space-y-2.5">
              {['Native RTL layout engine', 'Arabic-ready templates', 'Ramadan campaign collection', 'Regional ecommerce workflows', 'Right-to-left Monaco editor mode'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
                    <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#8B5CF6' }} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'rgba(139,92,246,0.05)',
                border: '1px solid rgba(139,92,246,0.15)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              }}
            >
              {/* Simulated RTL email card */}
              <div className="space-y-3">
                <div className="flex items-center justify-end gap-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-right">
                    <div className="text-[10px] opacity-40 mb-1">وايزميل</div>
                    <div className="h-1.5 w-28 rounded-full ml-auto" style={{ background: 'rgba(139,92,246,0.4)' }} />
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'rgba(139,92,246,0.3)' }} />
                </div>
                {['رمضان كريم', 'عروض حصرية للموسم', 'تسوق الآن'].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-right"
                    style={{ direction: 'rtl' }}
                  >
                    <div
                      className="inline-block px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: i === 0 ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                        border: i === 0 ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        color: i === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'system-ui',
                      }}
                    >
                      {text}
                    </div>
                  </motion.div>
                ))}
                <div className="flex justify-end mt-4">
                  <div className="h-8 w-24 rounded-lg" style={{ background: 'rgba(139,92,246,0.4)' }} />
                </div>
              </div>
              <div
                className="absolute top-4 left-4 px-2 py-0.5 rounded text-[9px] font-medium"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                RTL Preview
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="text-center mb-16">
            <SectionLabel><Zap className="w-3 h-3" /> Pricing</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter" style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.03em' }}>
              Simple pricing.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: 'For getting started.',
                features: ['Unlimited email designs', 'All section types', 'HTML & MJML export', 'Email client previews', '3 saved designs'],
                cta: 'Start free',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$19',
                period: '/mo',
                desc: 'For professionals and teams.',
                features: ['Everything in Free', 'Unlimited saved designs', 'Brand kit', 'Priority support', 'Early access to features'],
                cta: 'Start Pro',
                highlight: true,
              },
            ].map((plan) => (
              <FadeUp key={plan.name}>
                <div
                  className="rounded-2xl p-8 flex flex-col h-full"
                  style={{
                    background: plan.highlight ? 'rgba(91,140,255,0.07)' : 'rgba(255,255,255,0.02)',
                    border: plan.highlight ? '1px solid rgba(91,140,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: plan.highlight ? '0 0 0 1px rgba(91,140,255,0.1) inset' : undefined,
                  }}
                >
                  {plan.highlight && (
                    <div className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold mb-4" style={{ background: '#5B8CFF', color: '#fff' }}>
                      Most popular
                    </div>
                  )}
                  <p className="text-sm font-semibold mb-1" style={{ color: plan.highlight ? '#5B8CFF' : 'rgba(255,255,255,0.5)' }}>{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-semibold tracking-tight" style={{ color: '#F5F0E8' }}>{plan.price}</span>
                    {plan.period && <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>}
                  </div>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.desc}</p>
                  <ul className="space-y-2.5 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: plan.highlight ? '#5B8CFF' : 'rgba(255,255,255,0.25)' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: plan.highlight ? '#5B8CFF' : 'rgba(255,255,255,0.06)',
                      color: plan.highlight ? '#fff' : 'rgba(255,255,255,0.7)',
                      border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: plan.highlight ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : undefined,
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-40 px-6 md:px-12 overflow-hidden" style={{ zIndex: 2 }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(91,140,255,0.1) 0%, transparent 65%)' }}
        />
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6"
            style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.04em' }}
          >
            Start building modern<br />HTML emails today.
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No credit card required. Free forever.
          </p>
          <MagneticBtn href="/auth" primary className="text-base px-8 py-4">
            Start Free
            <ArrowRight className="w-4 h-4" />
          </MagneticBtn>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative border-t py-16 px-6 md:px-12"
        style={{ borderColor: 'rgba(255,255,255,0.06)', zIndex: 2 }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#5B8CFF' }}>
                  <Mail className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-fraunces)' }}>Wizemail</span>
              </div>
              <p className="text-sm max-w-[26ch]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Build production-ready HTML emails visually.
              </p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Templates', 'Pricing', 'Changelog'] },
              { heading: 'Resources', links: ['Documentation', 'Blog', 'Status', 'Support'] },
              { heading: 'Company', links: ['About', 'Twitter / X', 'LinkedIn', 'Contact'] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold mb-4 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              &copy; 2026 Wizemail. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Built for designers, developers, and modern email teams.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
