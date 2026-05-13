'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileCode, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEmailStore } from '@/store/email-store';

interface Props {
  onClose: () => void;
}

export function ImportHtmlModal({ onClose }: Props) {
  const router = useRouter();
  const { loadHtml } = useEmailStore();
  const [tab, setTab] = useState<'paste' | 'file'>('paste');
  const [html, setHtml] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setHtml((e.target?.result as string) ?? '');
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    const trimmed = html.trim();
    if (!trimmed) return;
    setLoading(true);
    loadHtml(trimmed);
    router.push('/builder');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-2xl shadow-2xl w-[520px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2e] flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#f4f4f5]">Import HTML email</h3>
            <p className="text-[10px] text-[#71717a] mt-0.5">Paste HTML or upload a file — it will open in the editor</p>
          </div>
          <button onClick={onClose} className="text-[#3a3a3e] hover:text-[#71717a] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-4 pb-0 flex-shrink-0">
          <div className="flex items-center gap-1 bg-[#0f0f11] rounded-lg p-0.5">
            <button
              onClick={() => setTab('paste')}
              className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'paste' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              <FileCode className="w-3 h-3" />
              Paste HTML
            </button>
            <button
              onClick={() => setTab('file')}
              className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'file' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              <Upload className="w-3 h-3" />
              Upload file
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'paste' ? (
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste your HTML email here…"
              className="w-full h-64 text-xs font-mono bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-3 py-2.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors resize-none placeholder:text-[#3a3a3e] leading-relaxed"
            />
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                dragging
                  ? 'border-[#6366f1] bg-[#6366f1]/10'
                  : 'border-[#2a2a2e] hover:border-[#3a3a3e] hover:bg-[#222226]/50'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <Upload className={`w-6 h-6 mb-2 transition-colors ${dragging ? 'text-[#6366f1]' : 'text-[#3a3a3e]'}`} />
              {fileName ? (
                <p className="text-xs font-medium text-[#f4f4f5]">{fileName}</p>
              ) : (
                <>
                  <p className="text-xs text-[#71717a]">Drop your HTML file here</p>
                  <p className="text-[10px] text-[#3a3a3e] mt-1">or click to browse — .html, .htm</p>
                </>
              )}
              {html && fileName && (
                <p className="text-[10px] text-[#10b981] mt-2">{html.length.toLocaleString()} characters loaded</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#2a2a2e] flex-shrink-0 bg-[#161618]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!html.trim() || loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#6366f1] text-white font-medium hover:bg-[#818cf8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5" />}
            Open in editor
          </button>
        </div>
      </div>
    </div>
  );
}
