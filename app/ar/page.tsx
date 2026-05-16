'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowLeft, Code2, Eye, Zap, Globe, Layers, Monitor, Smartphone,
  Moon, CheckCircle2, X, ChevronLeft, Mail, Sparkles, AlignLeft,
  FileCode2, LayoutTemplate, Send, Lock, RefreshCw, Braces, GitBranch,
  Fingerprint, Palette
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/* ─── Motion constants ─── */
const SPRING = { type: 'spring' as const, stiffness: 100, damping: 20 };
const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── Single accent ─── */
const ACCENT = '#5B8CFF';
const ACCENT_DIM = 'rgba(91,140,255,0.1)';
const ACCENT_BORDER = 'rgba(91,140,255,0.2)';

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
        background: `radial-gradient(circle, rgba(91,140,255,0.055) 0%, transparent 70%)`,
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
        opacity: 0.028,
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

/* ─── Magnetic button (RTL — gap on right side for icon) ─── */
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
    ? { background: ACCENT, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 24px rgba(91,140,255,0.22)` }
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
  { label: 'سطح المكتب', icon: Monitor },
  { label: 'الجوال', icon: Smartphone },
  { label: 'الوضع الداكن', icon: Moon },
  { label: 'Outlook', icon: Mail },
  { label: 'كود', icon: Code2 },
];

function HeroPreviewPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % PREVIEW_MODES.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full select-none" style={{ perspective: 1000 }}>
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, rgba(91,140,255,0.16) 0%, transparent 70%)`,
          filter: 'blur(40px)',
          transform: 'scale(1.2)',
        }}
      />

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
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', direction: 'ltr' }}
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
                    background: active === i ? ACCENT_DIM : 'transparent',
                    color: active === i ? ACCENT : 'rgba(255,255,255,0.35)',
                    border: active === i ? `1px solid ${ACCENT_BORDER}` : '1px solid transparent',
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute inset-0"
            >
              <PreviewContent mode={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating badges */}
      <FloatingBadge delay={0.8} className="absolute -top-4 -left-6 hidden lg:block">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">HTML آمن لـ Outlook</span>
      </FloatingBadge>
      <FloatingBadge delay={1.0} className="absolute -bottom-4 -right-6 hidden lg:block">
        <Zap className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        <span className="text-xs font-medium" style={{ color: ACCENT }}>معاينة فورية</span>
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
    <div className="flex h-full" style={{ background: mode === 2 ? '#0f1117' : '#f1f5f9', direction: 'ltr' }}>
      <div
        className="flex-shrink-0 border-r p-3 space-y-1.5 overflow-hidden"
        style={{ width: 140, background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {['رأس الصفحة', 'النص', 'الزر', 'السوشيال', 'التذييل'].map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer"
            style={{
              background: i === 0 ? ACCENT_DIM : 'transparent',
              border: i === 0 ? `1px solid ${ACCENT_BORDER}` : '1px solid transparent',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? ACCENT : 'rgba(255,255,255,0.2)' }} />
            <span className="text-[10px]" style={{ color: i === 0 ? ACCENT : 'rgba(255,255,255,0.4)' }}>{s}</span>
          </motion.div>
        ))}
      </div>

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
          <div className="h-2" style={{ background: mode === 2 ? ACCENT : '#E85D26' }} />
          <div className="p-4">
            <div className="h-2.5 rounded-full mb-2 w-3/4" style={{ background: mode === 2 ? 'rgba(255,255,255,0.15)' : '#1a1a2e' }} />
            <div className="h-1.5 rounded-full mb-1.5 w-full opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-1.5 rounded-full mb-1.5 w-5/6 opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-1.5 rounded-full mb-4 w-4/6 opacity-40" style={{ background: mode === 2 ? 'rgba(255,255,255,0.1)' : '#64748b' }} />
            <div className="h-8 rounded-lg flex items-center justify-center" style={{ background: mode === 2 ? ACCENT : '#E85D26' }}>
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
  { indent: 0, text: '<mjml>', color: ACCENT },
  { indent: 1, text: '<mj-body>', color: ACCENT },
  { indent: 2, text: '<mj-section background-color="#09090B">', color: ACCENT },
  { indent: 3, text: '<mj-column>', color: ACCENT },
  { indent: 4, text: '<mj-text color="#F5F0E8" font-size="28px">', color: ACCENT },
  { indent: 5, text: 'ابنِ رسائل بريد إلكتروني رائعة', color: '#a8d8a8' },
  { indent: 4, text: '</mj-text>', color: ACCENT },
  { indent: 4, text: '<mj-button background-color="#5B8CFF">', color: ACCENT },
  { indent: 5, text: 'ابدأ الآن', color: '#a8d8a8' },
  { indent: 4, text: '</mj-button>', color: ACCENT },
];

function CodePreview() {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= CODE_LINES.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 120);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div className="h-full p-4 overflow-hidden" style={{ background: '#0d0d14', fontFamily: 'var(--font-ibm-plex-mono)', direction: 'ltr' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[10px] px-2 py-0.5 rounded" style={{ background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
          email.mjml
        </div>
      </div>
      <div className="space-y-0.5">
        {CODE_LINES.slice(0, revealed).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-[11px]">
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
              style={{ background: ACCENT }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Marquee ─── */
const SOCIAL_PROOF_AR = [
  'HTML آمن للإنتاج',
  'جداول متوافقة مع Outlook',
  'تجميع MJML',
  'معاينة الوضع الداكن',
  'متغيرات الدمج',
  'دعم RTL والعربية',
  'ألوان وخطوط العلامة التجارية',
  'تقييم سهولة الوصول',
  'تخطيطات متعددة الأعمدة',
  'تصدير بنقرة واحدة',
];

function Marquee() {
  return (
    <div className="relative overflow-hidden py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'marquee-rtl 32s linear infinite' }}>
        {[...SOCIAL_PROOF_AR, ...SOCIAL_PROOF_AR].map((b, i) => (
          <span key={i} className="flex items-center gap-2.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(91,140,255,0.5)' }} />
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
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
      style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
    >
      {children}
    </div>
  );
}

/* ─── Product showcase visuals (LTR-forced code, RTL-friendly content) ─── */
function BuilderVisual() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);
  const rows = ['رأس الصفحة', 'القسم الرئيسي', 'عنصر المميزات', 'التذييل'];
  return (
    <div className="h-full rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', direction: 'ltr' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#FEBC2E' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        <span className="text-[10px] ml-2 opacity-40">builder</span>
      </div>
      <div className="p-4 space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r}
            layout
            animate={{
              background: active === i ? ACCENT_DIM : 'rgba(255,255,255,0.03)',
              borderColor: active === i ? ACCENT_BORDER : 'rgba(255,255,255,0.06)',
            }}
            transition={{ ...SPRING }}
            className="rounded-lg px-3 py-2.5 border flex items-center justify-between cursor-pointer"
          >
            <span className="text-xs" style={{ color: active === i ? ACCENT : 'rgba(255,255,255,0.4)' }}>{r}</span>
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
    <div className="h-full rounded-xl overflow-hidden font-mono text-[10px]" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)', direction: 'ltr' }}>
      <div className="flex h-full">
        <div className="flex-1 p-4 border-r overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] mb-3 opacity-30">email.mjml</div>
          {lines.map((l, i) => (
            <div key={i} className="flex items-center leading-5">
              <span className="w-4 mr-3 opacity-20 text-right text-[9px]">{i + 1}</span>
              <span style={{ color: l.includes('<') ? ACCENT : '#a8d8a8' }}>{l}</span>
              {i === 5 && cursor % 2 === 0 && <span className="inline-block w-1.5 h-3 ml-0.5 rounded-sm" style={{ background: ACCENT }} />}
            </div>
          ))}
        </div>
        <div className="w-2/5 p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="text-[9px] mb-3 opacity-30">Live preview</div>
          <div className="rounded-lg overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-1.5 w-full" style={{ background: ACCENT }} />
            <div className="p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-1 w-5/6 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-5 w-20 rounded-md mt-2" style={{ background: ACCENT }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewVisual() {
  const clients = ['Gmail', 'Outlook', 'Apple', 'جوال'];
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
              background: active === i ? ACCENT_DIM : 'transparent',
              color: active === i ? ACCENT : 'rgba(255,255,255,0.3)',
              border: active === i ? `1px solid ${ACCENT_BORDER}` : '1px solid transparent',
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
          style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', direction: 'ltr' }}
        >
          <div className="h-1.5 w-full" style={{ background: ACCENT }} />
          <div className="p-3 space-y-1.5">
            <div className="h-2 w-2/3 rounded-full" style={{ background: '#1a1a2e' }} />
            <div className="h-1 w-full rounded-full bg-slate-200" />
            <div className="h-1 w-4/5 rounded-full bg-slate-200" />
            <div className="h-6 rounded-md mt-2 flex items-center justify-center" style={{ background: ACCENT }}>
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
    { label: 'نسبة التباين', score: 91, color: '#10b981', ok: true },
    { label: 'تغطية النص البديل', score: 78, color: '#f59e0b', ok: true },
    { label: 'التخطيط المتجاوب', score: 100, color: '#10b981', ok: true },
    { label: 'توافق Outlook', score: 64, color: '#f87171', ok: false },
  ];
  return (
    <div className="h-full rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] opacity-40">تقرير الجودة</span>
      </div>
      <div className="p-4 space-y-3">
        {checks.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-semibold" style={{ color: c.color }}>{c.score}%</span>
                {c.ok ? <CheckCircle2 className="w-3 h-3" style={{ color: c.color }} /> : <X className="w-3 h-3 text-rose-400" />}
              </div>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.label}</span>
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

/* ─── Product showcase blocks (RTL — no flip CSS trick needed, alternate via order) ─── */
const SHOWCASE_BLOCKS = [
  {
    label: 'المحرر المرئي',
    headline: 'اسحب. رتّب. خصّص.',
    body: 'ابنِ تخطيطات البريد الإلكتروني بصريًا بنظام صفوف وأعمدة. حدد كل قسم وأعد ترتيبه وصمّمه — بدون كتابة أي كود.',
    features: ['صفوف وأعمدة', 'لوحة النقر للتحديد', 'أقسام قابلة لإعادة الاستخدام', 'متجاوب افتراضيًا'],
    icon: LayoutTemplate,
    visual: <BuilderVisual />,
    visualFirst: false,
  },
  {
    label: 'وضع الكود',
    headline: 'Monaco و MJML في متناول يدك.',
    body: 'انتقل إلى محرر Monaco كامل مع تمييز الصياغة، ومعاينة مقسومة، وتجميع MJML مباشر كلما احتجت إلى تحكم مباشر.',
    features: ['تمييز الصياغة', 'عرض مقسوم', 'دعم MJML', 'مزامنة مباشرة'],
    icon: Code2,
    visual: <CodeEditorVisual />,
    visualFirst: true,
  },
  {
    label: 'معاينة البريد الإلكتروني',
    headline: 'كل عميل. كل جهاز.',
    body: 'تنقّل فورًا بين Gmail وOutlook وApple Mail وإطارات الجوال. اختبر تصيير الوضع الداكن دون مغادرة المحرر.',
    features: ['واجهة Gmail', 'إطار Outlook', 'Apple Mail', 'تصيير الوضع الداكن'],
    icon: Eye,
    visual: <PreviewVisual />,
    visualFirst: false,
  },
  {
    label: 'ضمان الجودة وسهولة الوصول',
    headline: 'أرسل بثقة كاملة.',
    body: 'اكتشف مشكلات التباين والنص البديل المفقود وتوافق عملاء البريد الإلكتروني قبل إطلاق حملتك.',
    features: ['فحوصات التباين', 'مراجعة النص البديل', 'تقييم الاستجابة', 'التحقق الآمن للبريد'],
    icon: Fingerprint,
    visual: <QaVisual />,
    visualFirst: true,
  },
];

/* ─── Feature grid ─── */
const FEATURES_AR = [
  { icon: Mail, label: 'تصدير آمن لـ Outlook', desc: 'CSS مضمّن، جداول، وحلول VML البديلة — كلها تُعالج تلقائيًا.' },
  { icon: Monitor, label: 'HTML متجاوب', desc: 'تخطيطات سائلة للجوال أولاً تتكيف مع كل الشاشات.' },
  { icon: Braces, label: 'دعم MJML', desc: 'اكتب MJML، وحوّله إلى HTML آمن للبريد بنقرة واحدة.' },
  { icon: Moon, label: 'معاينة الوضع الداكن', desc: 'اختبر تصيير الوضع الداكن الحقيقي لكل عميل بريد.' },
  { icon: Sparkles, label: 'متغيرات الدمج', desc: 'استخدم وسوم {{الاسم}} مُصدَّرة كرموز جاهزة لـ ESP.' },
  { icon: Fingerprint, label: 'تقييم سهولة الوصول', desc: 'نسب التباين والنص البديل وفحوصات WCAG مدمجة.' },
  { icon: Layers, label: 'أقسام قابلة لإعادة الاستخدام', desc: 'احفظ الرؤوس والتذييلات والكتل وأعد استخدامها عبر الحملات.' },
  { icon: Send, label: 'إرسال تجريبي', desc: 'إرسال اختبار مدعوم بـ SMTP وResend مباشرة من المحرر.' },
  { icon: FileCode2, label: 'تصدير في أي مكان', desc: 'HTML خام، مضمّن، ومُحسَّن — انسخه أو حمّله فورًا.' },
  { icon: Globe, label: 'جاهز لـ RTL', desc: 'اتجاه النص العربي والعبري مدعوم بشكل أصلي.' },
  { icon: GitBranch, label: 'سجل الإصدارات', desc: 'فتحات حفظ مسماة وحل النزاعات عبر الأجهزة.' },
  { icon: Palette, label: 'مجموعة العلامة التجارية', desc: 'الخطوط والألوان والشعار — مُطبَّقة بشكل متسق عبر جميع القوالب.' },
];

/* ─── Comparison ─── */
const OLD_FLOW_AR = [
  'جداول متداخلة معطوبة في كل مكان',
  'Outlook يتجاهل CSS الخاص بك',
  'محررات سحب وإفلات مرهقة',
  'لا اختبار للوضع الداكن',
  'تصدير → تعطّل → إصلاح → تكرار',
  'صفر تحكم للمطور',
];
const NEW_FLOW_AR = [
  'محرر مرئي بمخرجات HTML حقيقية',
  'خط أنابيب تصدير آمن لـ Outlook',
  'وضع كود Monaco، دائمًا متاح',
  'معاينة الوضع الداكن لكل عميل',
  'تصدير جاهز للإنتاج بنقرة واحدة',
  'عرض مقسوم، مزامنة كود، دعم MJML',
];

/* ─── Main page ─── */
export default function HomePageAr() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [supabase, router]);

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] flex flex-col relative overflow-x-hidden"
      style={{ background: '#09090B', color: '#F5F0E8', fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', system-ui, sans-serif" }}
    >
      <CursorGlow />
      <NoiseOverlay />

      {/* Arabic font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap');

        @keyframes marquee-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(50%); }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 md:px-10 h-14"
        style={{
          background: 'rgba(9,9,11,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Logo on right in RTL */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-sm" style={{ color: '#F5F0E8' }}>
            وايزميل
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'المميزات', href: '#features' },
            { label: 'القوالب', href: '/templates' },
            { label: 'الأسعار', href: '#pricing' },
          ].map((item) => (
            <a key={item.label} href={item.href} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Actions on left in RTL */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
            style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
          >
            <Globe className="w-3 h-3" />
            English
          </Link>
          <Link href="/auth" className="text-sm transition-colors hover:text-white hidden md:block" style={{ color: 'rgba(255,255,255,0.45)' }}>
            تسجيل الدخول
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: ACCENT, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ابدأ مجانًا
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-14" style={{ zIndex: 2 }}>
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 right-1/4 rounded-full"
            style={{
              width: 600, height: 600,
              background: 'radial-gradient(circle, rgba(91,140,255,0.07) 0%, transparent 70%)',
              filter: 'blur(60px)',
              transform: 'translate(50%,-50%)',
            }}
          />
          <div
            className="absolute bottom-1/3 left-1/4 rounded-full"
            style={{
              width: 360, height: 360,
              background: 'radial-gradient(circle, rgba(91,140,255,0.04) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24 pb-16">
          {/* Right (text in RTL is leading side) */}
          <motion.div variants={STAGGER_PARENT} initial="hidden" animate="show" className="flex flex-col">
            <motion.div variants={STAGGER_CHILD}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
                style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                منشئ بريد HTML العصري
              </div>
            </motion.div>

            <motion.h1
              variants={STAGGER_CHILD}
              className="text-4xl md:text-6xl lg:text-[4.5rem] font-semibold leading-tight mb-6"
              style={{ color: '#F5F0E8', letterSpacing: '0', textWrap: 'balance' } as React.CSSProperties}
            >
              ابنِ رسائل بريد{' '}
              <span style={{ color: ACCENT }}>HTML رائعة</span>
              {' '}بدون كسر Outlook.
            </motion.h1>

            <motion.p
              variants={STAGGER_CHILD}
              className="text-base leading-relaxed mb-10 max-w-[46ch]"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              صمّم وتوقّع واختبر وصدّر رسائل بريد إلكتروني متجاوبة جاهزة للإنتاج مع محرر مرئي عصري وسير عمل من درجة المطورين.
            </motion.p>

            <motion.div variants={STAGGER_CHILD} className="flex flex-wrap items-center gap-3 mb-12">
              <MagneticBtn href="/auth" primary>
                <ArrowLeft className="w-4 h-4" />
                ابدأ البناء مجانًا
              </MagneticBtn>
              <MagneticBtn href="#features">
                <ChevronLeft className="w-4 h-4" />
                شاهد كيف يعمل
              </MagneticBtn>
            </motion.div>

            <motion.div variants={STAGGER_CHILD} className="flex items-center gap-4">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                مجاني للبدء. لا بطاقة ائتمان مطلوبة.
              </p>
            </motion.div>
          </motion.div>

          {/* Left (visual in RTL) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
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
        <Marquee />
      </div>

      {/* ── PRODUCT SHOWCASE ── */}
      <section id="features" className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-20">
            <SectionLabel><Sparkles className="w-3 h-3" /> المنتج</SectionLabel>
            <h2
              className="text-3xl md:text-5xl font-semibold leading-tight"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              كل ما تحتاجه لبناء<br />رسائل بريد إلكتروني آمنة للإنتاج.
            </h2>
          </FadeUp>

          <div className="space-y-28">
            {SHOWCASE_BLOCKS.map((block) => {
              const Icon = block.icon;
              return (
                <FadeUp key={block.label} delay={0.05}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center`}>
                    {/* Visual first on alternating blocks */}
                    {block.visualFirst && (
                      <div className="h-72 md:h-96 order-first lg:order-none">
                        {block.visual}
                      </div>
                    )}
                    <div>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5"
                        style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
                      >
                        <Icon className="w-3 h-3" />
                        {block.label}
                      </div>
                      <h3 className="text-2xl md:text-4xl font-semibold mb-4 leading-tight">
                        {block.headline}
                      </h3>
                      <p className="text-base leading-relaxed mb-8 max-w-[44ch]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {block.body}
                      </p>
                      <ul className="space-y-2">
                        {block.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ACCENT_DIM }}>
                              <CheckCircle2 className="w-2.5 h-2.5" style={{ color: ACCENT }} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!block.visualFirst && (
                      <div className="h-72 md:h-96">
                        {block.visual}
                      </div>
                    )}
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SPLIT WORKFLOW ── */}
      <section className="relative py-28 px-6 md:px-12 overflow-hidden" style={{ zIndex: 2 }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(91,140,255,0.04) 0%, transparent 70%)` }}
        />
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-16">
            <SectionLabel><Code2 className="w-3 h-3" /> سير العمل</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              التحرير المرئي يلتقي<br />بتحكم المطور.
            </h2>
          </FadeUp>

          <FadeUp>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
                background: '#0d0d14',
              }}
            >
              <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', direction: 'ltr' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs px-3 py-1 rounded-md font-medium" style={{ background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>مرئي</span>
                  <span className="text-xs px-3 py-1 rounded-md" style={{ color: 'rgba(255,255,255,0.3)' }}>كود</span>
                </div>
                <div
                  className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                  متزامن
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ direction: 'ltr' }}>
                <div className="p-8 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs mb-4 opacity-30">Canvas</p>
                  <div className="space-y-2">
                    {['رأس الصفحة', 'القسم الرئيسي', 'كتلة CTA', 'التذييل'].map((row, i) => (
                      <div key={row} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: i === 1 ? ACCENT : 'rgba(255,255,255,0.1)' }} />
                        <span className="text-xs" style={{ color: i === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{row}</span>
                        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {[0, 1].map((j) => <div key={j} className="w-1 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 font-mono text-[11px]" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="mb-4 opacity-30" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>email.mjml</p>
                  <div className="space-y-0.5" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
                    {[
                      { t: '<mj-section background-color="#09090B">', c: ACCENT },
                      { t: '  <mj-column>', c: ACCENT },
                      { t: '    <mj-text', c: ACCENT },
                      { t: '      color="#F5F0E8"', c: '#f59e0b' },
                      { t: '      font-size="36px">', c: '#f59e0b' },
                      { t: '      ابنِ رسائل بريد رائعة', c: '#a8d8a8' },
                      { t: '    </mj-text>', c: ACCENT },
                      { t: '  </mj-column>', c: ACCENT },
                      { t: '</mj-section>', c: ACCENT },
                    ].map((l, idx) => (
                      <div key={idx} className="leading-5 flex items-center" style={{ color: l.c }}>
                        <span className="w-5 mr-3 text-right opacity-20 text-[9px]">{idx + 1}</span>
                        <span>{l.t}</span>
                        {idx === 5 && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }} className="inline-block w-1.5 h-3 ml-0.5 rounded-sm" style={{ background: ACCENT }} />}
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
      <section className="relative py-28 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-16">
            <SectionLabel><Zap className="w-3 h-3" /> الإمكانات</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              مبني لفرق البريد الإلكتروني<br />العصرية.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {FEATURES_AR.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <FadeUp key={feat.label} delay={i * 0.035}>
                  <div
                    className="group p-7 transition-all duration-300 hover:bg-white/[0.025]"
                    style={{ background: '#09090B' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-5" style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}` }}>
                      <Icon className="w-4 h-4" style={{ color: ACCENT }} />
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
      <section className="relative py-28 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-16">
            <SectionLabel><RefreshCw className="w-3 h-3" /> لماذا التغيير</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              منشئو البريد الإلكتروني لم<br />يتطوروا منذ سنوات.
            </h2>
            <p className="mt-4 text-base max-w-[46ch]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              نفس أدوات السحب والإفلات المرهقة. نفس أخطاء Outlook. نفس التصديرات المعطوبة. وايزميل هو سير العمل الذي يستحقه البريد الإلكتروني.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-4 lg:gap-6">
            <FadeUp>
              <div
                className="rounded-2xl p-8 h-full"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-[10px] font-semibold mb-6 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  قبل
                </p>
                <ul className="space-y-3.5">
                  {OLD_FLOW_AR.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-500/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            <FadeUp delay={0.08}>
              <div
                className="rounded-2xl p-8 h-full"
                style={{
                  background: ACCENT_DIM,
                  border: `1px solid ${ACCENT_BORDER}`,
                }}
              >
                <p className="text-[10px] font-semibold mb-6 tracking-widest uppercase" style={{ color: ACCENT }}>
                  مع وايزميل
                </p>
                <ul className="space-y-3.5">
                  {NEW_FLOW_AR.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MENA / REGIONAL ── */}
      <section className="relative py-28 px-6 md:px-12 overflow-hidden" style={{ zIndex: 2 }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(91,140,255,0.05) 0%, transparent 60%)' }}
        />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <SectionLabel><AlignLeft className="w-3 h-3" /> منطقة الشرق الأوسط وشمال أفريقيا</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-6">
              صُمِّم في المنطقة،<br />للمنطقة.
            </h2>
            <p className="text-base leading-relaxed mb-8 max-w-[44ch]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              وايزميل هو أول منصة عمل بريد إلكتروني عصرية مصممة مع العربية و RTL والشركات الإقليمية في الاعتبار — من حملات رمضان إلى التجارة الإلكترونية الإقليمية.
            </p>
            <ul className="space-y-2.5">
              {[
                'محرك تخطيط RTL أصلي',
                'قوالب جاهزة للعربية',
                'مجموعة حملات رمضان',
                'سير عمل التجارة الإلكترونية الإقليمية',
                'وضع محرر Monaco من اليمين إلى اليسار',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ACCENT_DIM }}>
                    <CheckCircle2 className="w-2.5 h-2.5" style={{ color: ACCENT }} />
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
                background: ACCENT_DIM,
                border: `1px solid ${ACCENT_BORDER}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'rgba(91,140,255,0.3)' }} />
                  <div>
                    <div className="text-[10px] opacity-40 mb-1">وايزميل</div>
                    <div className="h-1.5 w-28 rounded-full" style={{ background: `rgba(91,140,255,0.4)` }} />
                  </div>
                </div>
                {['رمضان كريم', 'عروض حصرية للموسم', 'تسوق الآن'].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div
                      className="inline-block px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: i === 0 ? 'rgba(91,140,255,0.2)' : 'rgba(255,255,255,0.04)',
                        border: i === 0 ? `1px solid ${ACCENT_BORDER}` : '1px solid rgba(255,255,255,0.06)',
                        color: i === 0 ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {text}
                    </div>
                  </motion.div>
                ))}
                <div className="flex mt-4">
                  <div className="h-8 w-24 rounded-lg" style={{ background: 'rgba(91,140,255,0.35)' }} />
                </div>
              </div>
              <div
                className="absolute top-4 left-4 px-2 py-0.5 rounded text-[9px] font-medium"
                style={{ background: ACCENT_DIM, color: '#a5b4fc', border: `1px solid ${ACCENT_BORDER}` }}
              >
                معاينة RTL
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-28 px-6 md:px-12" style={{ zIndex: 2 }}>
        <div className="max-w-[1400px] mx-auto">
          <FadeUp className="mb-16">
            <SectionLabel><Zap className="w-3 h-3" /> الأسعار</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-semibold">
              أسعار بسيطة.
            </h2>
            <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>لا بطاقة ائتمان مطلوبة للبدء.</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {[
              {
                name: 'مجاني',
                price: '$0',
                desc: 'للبدء والاستكشاف.',
                features: ['تصاميم بريد إلكتروني غير محدودة', 'جميع أنواع الأقسام', 'تصدير HTML و MJML', 'معاينات عملاء البريد', '3 تصاميم محفوظة'],
                cta: 'ابدأ مجانًا',
                highlight: false,
              },
              {
                name: 'احترافي',
                price: '$19',
                period: '/شهر',
                desc: 'للمحترفين والفرق.',
                features: ['كل ما في المجاني', 'تصاميم محفوظة غير محدودة', 'مجموعة العلامة التجارية', 'دعم ذو أولوية', 'وصول مبكر للمميزات'],
                cta: 'ابدأ الاحترافي',
                highlight: true,
              },
            ].map((plan) => (
              <FadeUp key={plan.name}>
                <div
                  className="rounded-2xl p-8 flex flex-col"
                  style={{
                    background: plan.highlight ? ACCENT_DIM : 'rgba(255,255,255,0.02)',
                    border: plan.highlight ? `1px solid ${ACCENT_BORDER}` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {plan.highlight && (
                    <div className="inline-flex self-start px-2 py-0.5 rounded text-[10px] font-semibold mb-4" style={{ background: 'rgba(91,140,255,0.25)', color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
                      الأكثر شعبية
                    </div>
                  )}
                  <p className="text-sm font-semibold mb-1" style={{ color: plan.highlight ? ACCENT : 'rgba(255,255,255,0.5)' }}>{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2" style={{ direction: 'ltr', justifyContent: 'flex-end' }}>
                    <span className="text-4xl font-semibold tracking-tight" style={{ color: '#F5F0E8', fontVariantNumeric: 'tabular-nums' }}>{plan.price}</span>
                    {plan.period && <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>}
                  </div>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.desc}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: plan.highlight ? ACCENT : 'rgba(255,255,255,0.25)' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: plan.highlight ? ACCENT : 'rgba(255,255,255,0.06)',
                      color: plan.highlight ? '#fff' : 'rgba(255,255,255,0.7)',
                      border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: plan.highlight ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : undefined,
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {plan.cta}
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
          style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(91,140,255,0.08) 0%, transparent 65%)` }}
        />
        <FadeUp className="max-w-3xl">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6">
            ابدأ بناء رسائل HTML<br />العصرية اليوم.
          </h2>
          <p className="text-base mb-10 max-w-[44ch]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            لا بطاقة ائتمان مطلوبة. مجاني للأبد. يعمل في كل عميل بريد إلكتروني رئيسي.
          </p>
          <MagneticBtn href="/auth" primary className="text-base px-8 py-4">
            <ArrowLeft className="w-4 h-4" />
            ابدأ مجانًا
          </MagneticBtn>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative border-t py-14 px-6 md:px-12"
        style={{ borderColor: 'rgba(255,255,255,0.06)', zIndex: 2 }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                  <Mail className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm">وايزميل</span>
              </div>
              <p className="text-sm max-w-[22ch]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                ابنِ رسائل HTML جاهزة للإنتاج بشكل مرئي.
              </p>
            </div>
            {[
              { heading: 'المنتج', links: [{ label: 'المميزات', href: '#features' }, { label: 'القوالب', href: '/templates' }, { label: 'الأسعار', href: '#pricing' }, { label: 'المحرر', href: '/builder' }] },
              { heading: 'الموارد', links: [{ label: 'التوثيق', href: '#' }, { label: 'المدونة', href: '#' }, { label: 'الحالة', href: '#' }, { label: 'الدعم', href: '#' }] },
              { heading: 'قانوني', links: [{ label: 'سياسة الخصوصية', href: '#' }, { label: 'شروط الخدمة', href: '#' }, { label: 'اتصل بنا', href: '#' }] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[10px] font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-8 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              &copy; 2026 وايزميل. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                مبني للمصممين والمطورين وفرق البريد الإلكتروني العصرية.
              </p>
              <Link href="/" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.25)' }}>
                English
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
