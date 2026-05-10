'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEmailStore } from '@/store/email-store';
import { ClientFrame } from '@/components/preview/ClientFrame';
import { applyVariables } from '@/lib/email-utils';
import type { DeviceMode } from '@/lib/types';

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 600,
  tablet: 480,
  mobile: 375,
};

export function PreviewCanvas() {
  const { rows, theme, device, client, mode, htmlCode, variables, clearSelection, getAssembledHTML } = useEmailStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const injectHTML = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const raw = (mode === 'split' && htmlCode) ? htmlCode : getAssembledHTML();
    const html = Object.keys(variables).length > 0 ? applyVariables(raw, variables) : raw;
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [getAssembledHTML, mode, htmlCode, variables]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(injectHTML, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, theme, client, htmlCode, mode, variables]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'wizemail-height') {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const width = DEVICE_WIDTHS[device];
  const canvasBg = theme === 'dark' ? '#060609' : '#e8eaf0';

  return (
    <div
      data-tour="preview"
      className="h-full overflow-auto flex items-start justify-center py-8 px-6 transition-colors duration-300"
      style={{ background: canvasBg }}
      onClick={() => clearSelection()}
    >
      <div
        className="transition-all duration-300 ease-out relative flex flex-col w-full"
        style={{ maxWidth: width + 80 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Width badge */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-[10px] text-[#71717a] font-mono bg-[#161618] px-2 py-0.5 rounded border border-[#2a2a2e]">{width}px</span>
        </div>

        <div className="shadow-2xl shadow-black/50">
          <ClientFrame>
            <iframe
              ref={iframeRef}
              title="Email Preview"
              sandbox="allow-same-origin allow-scripts"
              style={{
                width: '100%',
                display: 'block',
                border: 'none',
                minHeight: 200,
              }}
            />
          </ClientFrame>
        </div>
      </div>
    </div>
  );
}
