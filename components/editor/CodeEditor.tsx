'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useEmailStore } from '@/store/email-store';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function CodeEditor() {
  const { rows, theme, emailDetails, htmlCode, setHtmlCode, getAssembledHTML } = useEmailStore();

  // Keep code in sync when rows, theme, or email details change
  useEffect(() => {
    setHtmlCode(getAssembledHTML());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, theme, emailDetails]);

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language="html"
        theme="vs-dark"
        value={htmlCode}
        onChange={(val) => setHtmlCode(val ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          wordWrap: 'on',
          formatOnPaste: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          fontFamily: 'var(--font-geist-mono), "Geist Mono", "Fira Code", monospace',
          fontLigatures: true,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          suggest: { showKeywords: true },
        }}
      />
    </div>
  );
}
