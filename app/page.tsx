'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, FileCode, Upload, Layout, Zap, Layers, BookOpen } from 'lucide-react';
import { ImportHtmlModal } from '@/components/builder/ImportHtmlModal';

export default function DashboardPage() {
  const [importOpen, setImportOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col">
      <header className="border-b border-[#2a2a2e] px-8 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#f4f4f5] tracking-tight">Wizemail</span>
        </div>
        <span className="text-xs text-[#71717a]">HTML Email Builder</span>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="text-center mb-14 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#818cf8] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
            Developer-first email builder
          </div>
          <h1 className="text-4xl font-bold text-[#f4f4f5] tracking-tight mb-4 leading-tight">
            Build production-ready<br />HTML emails, fast.
          </h1>
          <p className="text-[#a1a1aa] text-base leading-relaxed">
            Professional code editing, visual email building, and real-time simulated previews — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mb-12">
          <Link
            href="/builder"
            data-tour="start-builder"
            className="group relative flex flex-col items-start p-5 rounded-xl bg-[#161618] border border-[#2a2a2e] hover:border-[#6366f1]/40 hover:bg-[#1c1c1f] transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-lg bg-[#6366f1]/10 flex items-center justify-center mb-4 group-hover:bg-[#6366f1]/20 transition-colors">
              <Layout className="w-4 h-4 text-[#6366f1]" />
            </div>
            <p className="text-sm font-semibold text-[#f4f4f5] mb-1">Blank Canvas</p>
            <p className="text-xs text-[#71717a] leading-relaxed">Start from scratch with a clean editor</p>
            <div className="absolute top-4 right-4 text-[#3a3a3e] group-hover:text-[#6366f1]/60 transition-colors text-xs">→</div>
          </Link>

          <Link
            href="/templates"
            className="group relative flex flex-col items-start p-5 rounded-xl bg-[#161618] border border-[#2a2a2e] hover:border-[#10b981]/40 hover:bg-[#1c1c1f] transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-4 group-hover:bg-[#10b981]/20 transition-colors">
              <Layers className="w-4 h-4 text-[#10b981]" />
            </div>
            <p className="text-sm font-semibold text-[#f4f4f5] mb-1">From Template</p>
            <p className="text-xs text-[#71717a] leading-relaxed">Pick a prebuilt email template</p>
            <div className="absolute top-4 right-4 text-[#3a3a3e] group-hover:text-[#10b981]/60 transition-colors text-xs">→</div>
          </Link>

          <button
            onClick={() => setImportOpen(true)}
            className="group relative flex flex-col items-start p-5 rounded-xl bg-[#161618] border border-[#2a2a2e] hover:border-[#f59e0b]/40 hover:bg-[#1c1c1f] transition-all duration-150 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center mb-4 group-hover:bg-[#f59e0b]/20 transition-colors">
              <Upload className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <p className="text-sm font-semibold text-[#f4f4f5] mb-1">Import HTML</p>
            <p className="text-xs text-[#71717a] leading-relaxed">Paste or upload existing HTML email</p>
            <div className="absolute top-4 right-4 text-[#3a3a3e] group-hover:text-[#f59e0b]/60 transition-colors text-xs">→</div>
          </button>

          <Link
            href="/emails"
            className="group relative flex flex-col items-start p-5 rounded-xl bg-[#161618] border border-[#2a2a2e] hover:border-[#8b5cf6]/40 hover:bg-[#1c1c1f] transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center mb-4 group-hover:bg-[#8b5cf6]/20 transition-colors">
              <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <p className="text-sm font-semibold text-[#f4f4f5] mb-1">My Emails</p>
            <p className="text-xs text-[#71717a] leading-relaxed">Open and edit your saved designs</p>
            <div className="absolute top-4 right-4 text-[#3a3a3e] group-hover:text-[#8b5cf6]/60 transition-colors text-xs">→</div>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {[
            { icon: FileCode, label: 'Monaco Editor' },
            { icon: Zap, label: 'Real-time Preview' },
            { icon: Mail, label: 'Gmail · Outlook · Apple Mail' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161618] border border-[#2a2a2e] text-[#71717a] text-xs">
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
