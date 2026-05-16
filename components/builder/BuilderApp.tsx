'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmailStore } from '@/store/email-store';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/builder/LeftSidebar';
import { PreviewCanvas } from '@/components/builder/PreviewCanvas';
import { RightSidebar } from '@/components/builder/RightSidebar';
import { CodeEditor } from '@/components/editor/CodeEditor';

export function BuilderApp() {
  const { mode } = useEmailStore();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0f0f11] overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left sidebar + rail */}
        <div className="flex flex-shrink-0">
          {/* Sidebar — clip via maxWidth so inner explicit width still drives resize */}
          <div
            className="overflow-hidden transition-[max-width,opacity] duration-200"
            style={{ maxWidth: leftOpen ? 520 : 0, opacity: leftOpen ? 1 : 0 }}
          >
            <LeftSidebar />
          </div>
          {/* Slim rail with chevron toggle */}
          <div className="w-6 flex-shrink-0 bg-[#161618] border-r border-[#2a2a2e] flex items-center justify-center">
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-0.5 rounded text-[#3a3a3e] hover:text-[#a1a1aa] hover:bg-[#222226] transition-colors"
              title={leftOpen ? 'Collapse left panel' : 'Expand left panel'}
            >
              {leftOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Center area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {mode === 'visual' && (
            <div className="flex-1 overflow-hidden min-h-0">
              <PreviewCanvas />
            </div>
          )}

          {mode === 'code' && (
            <div className="flex-1 overflow-hidden bg-[#1e1e1e] min-h-0">
              <CodeEditor />
            </div>
          )}

          {mode === 'split' && (
            <>
              <div className="flex-1 overflow-hidden bg-[#1e1e1e] border-r border-[#2a2a2e] min-h-0">
                <CodeEditor />
              </div>
              <div className="flex-1 overflow-hidden min-h-0">
                <PreviewCanvas />
              </div>
            </>
          )}
        </div>

        {/* Right sidebar + rail */}
        <div className="flex flex-shrink-0">
          {/* Slim rail with chevron toggle */}
          <div className="w-6 flex-shrink-0 bg-[#161618] border-l border-[#2a2a2e] flex items-center justify-center">
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-0.5 rounded text-[#3a3a3e] hover:text-[#a1a1aa] hover:bg-[#222226] transition-colors"
              title={rightOpen ? 'Collapse right panel' : 'Expand right panel'}
            >
              {rightOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>
          {/* Sidebar — clip via maxWidth so inner w-64 still works */}
          <div
            className="overflow-hidden transition-[max-width,opacity] duration-200"
            style={{ maxWidth: rightOpen ? 520 : 0, opacity: rightOpen ? 1 : 0 }}
          >
            <RightSidebar />
          </div>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1c1c1f',
            border: '1px solid #2a2a2e',
            color: '#f4f4f5',
            fontSize: '12px',
          },
        }}
      />
    </div>
  );
}
