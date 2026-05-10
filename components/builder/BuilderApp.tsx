'use client';

import { Toaster } from 'sonner';
import { useEmailStore } from '@/store/email-store';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/builder/LeftSidebar';
import { PreviewCanvas } from '@/components/builder/PreviewCanvas';
import { RightSidebar } from '@/components/builder/RightSidebar';
import { CodeEditor } from '@/components/editor/CodeEditor';

export function BuilderApp() {
  const { mode } = useEmailStore();

  return (
    <div className="flex flex-col h-full bg-[#0f0f11] overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftSidebar />

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

        <RightSidebar />
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
