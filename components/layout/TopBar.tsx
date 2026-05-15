'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Mail, Eye, Code2, Columns2, Monitor, Tablet, Smartphone,
  Sun, Moon, Download, Copy, Check, ChevronDown, ImageIcon, Code,
  Save, Braces, Plus, X, SendHorizonal, Pencil, Undo2, Redo2, Upload, MoreHorizontal,
} from 'lucide-react';
import { SendTestModal } from '@/components/builder/SendTestModal';
import { trackClientEvent } from '@/lib/track-client';
import { ImportHtmlModal } from '@/components/builder/ImportHtmlModal';
import { AccountMenu } from '@/components/auth/AccountMenu';
import { toast } from 'sonner';
import { useEmailStore } from '@/store/email-store';
import { downloadHTML, copyToClipboard, downloadInlinedHTML, exportAsSVG } from '@/lib/email-utils';
import { saveDesign } from '@/lib/storage';
import { saveCloudDesign } from '@/lib/cloud-designs';
import { validateVariableName } from '@/lib/validation';
import type { EditorMode, DeviceMode, ClientMode } from '@/lib/types';

const CLIENT_LABELS: Record<ClientMode, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  apple: 'Apple Mail',
  mobile: 'Mobile',
};

export function TopBar() {
  const {
    mode, device, theme, client, rows, emailDetails, variables, variableUsage,
    currentDesignId, currentDesignName, currentDesignVersion, hasUnsavedChanges, brandKit,
    setMode, setDevice, setTheme, setClient,
    setCurrentDesign, setCurrentDesignName, getAssembledHTML, setVariable, removeVariable,
    undo, redo, canUndo, canRedo, markSaved,
  } = useEmailStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!currentDesignId) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      const saved = saveDesign({ name: currentDesignName, rows, emailDetails, theme, variables, brandKit }, currentDesignId);
      const cloudSaved = await saveCloudDesign({
        id: saved.id,
        name: saved.name,
        rows,
        emailDetails,
        theme,
        variables,
        brandKit,
        version: currentDesignVersion ?? undefined,
      });
      if (cloudSaved) setCurrentDesign(cloudSaved.id, cloudSaved.name, cloudSaved.version);
      markSaved();
    }, 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, emailDetails, variables, brandKit, currentDesignId]);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [varKeyError, setVarKeyError] = useState<string | null>(null);

  const handleSave = () => {
    if (currentDesignId) {
      saveDesign({ name: currentDesignName, rows, emailDetails, theme, variables, brandKit }, currentDesignId);
      saveCloudDesign({
        id: currentDesignId,
        name: currentDesignName,
        rows,
        emailDetails,
        theme,
        variables,
        brandKit,
        version: currentDesignVersion ?? undefined,
      }).then((cloudSaved) => {
        if (cloudSaved) setCurrentDesign(cloudSaved.id, cloudSaved.name, cloudSaved.version);
      });
      toast.success('Design saved', { description: currentDesignName });
    } else {
      setSaveName('');
      setSaveDialogOpen(true);
    }
  };

  const handleConfirmSave = () => {
    const name = saveName.trim() || 'Untitled design';
    const saved = saveDesign({ name, rows, emailDetails, theme, variables, brandKit });
    setCurrentDesign(saved.id, saved.name, saved.version ?? null);
    saveCloudDesign({
      id: saved.id,
      name,
      rows,
      emailDetails,
      theme,
      variables,
      brandKit,
    }).then((cloudSaved) => {
      if (cloudSaved) setCurrentDesign(cloudSaved.id, cloudSaved.name, cloudSaved.version);
    });
    setSaveDialogOpen(false);
    toast.success('Design saved', { description: name });
  };

  const commitRename = () => {
    const name = draftName.trim() || currentDesignName;
    setCurrentDesignName(name);
    setEditingName(false);
  };

  const handleAddVariable = () => {
    const key = newVarKey.trim();
    if (!key) return;

    // Validate variable name
    const validation = validateVariableName(key);
    if (!validation.isValid) {
      setVarKeyError(validation.error!);
      return;
    }

    // Check for duplicates (case-insensitive)
    const existingKeys = Object.keys(variables);
    if (existingKeys.some(existing => existing.toLowerCase() === key.toLowerCase())) {
      setVarKeyError('Variable name already exists');
      return;
    }

    setVariable(key, newVarValue);
    setNewVarKey('');
    setNewVarValue('');
    setVarKeyError(null);
  };

  const handleCopyHTML = async () => {
    await copyToClipboard(getAssembledHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setExportOpen(false);
  };

  const handleDownloadHTML = () => {
    downloadHTML(getAssembledHTML(), 'email.html');
    setExportOpen(false);
  };

  const handleExportJSON = () => {
    const sections = rows.map((r) => ({ type: r.columns[0]?.type ?? 'text', content: r.columns[0]?.content ?? {} }));
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-sections.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const assembledHTML = getAssembledHTML();
  const hasMjml = /<mjml[\s>]/i.test(assembledHTML);

  const handleDownloadInlined = async () => {
    setExporting('inline');
    setExportOpen(false);
    try {
      await downloadInlinedHTML(assembledHTML, 'email-inlined.html');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadMjml = async () => {
    setExporting('mjml');
    setExportOpen(false);
    try {
      await downloadInlinedHTML(assembledHTML, 'email-mjml.html');
    } finally {
      setExporting(null);
    }
  };

  const handleExportSVG = async () => {
    setExporting('svg');
    setExportOpen(false);
    try {
      await exportAsSVG(rows, theme, brandKit);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="h-12 bg-[#161618] border-b border-[#2a2a2e] flex items-center px-3 gap-0 flex-shrink-0 select-none">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 pr-3 border-r border-[#2a2a2e] mr-3 hover:opacity-80 transition-opacity flex-shrink-0">
        <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
          <Mail className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-[#f4f4f5] tracking-tight">Wizemail</span>
      </Link>

      {/* Group 1: Mode + Undo/Redo */}
      <div className="flex items-center gap-1 mr-1">
        <div data-tour="mode-toggle" className="flex items-center gap-0.5 bg-[#0f0f11] rounded-lg p-0.5">
          {([
            { id: 'visual', icon: Eye, label: 'Visual' },
            { id: 'code', icon: Code2, label: 'Code' },
            { id: 'split', icon: Columns2, label: 'Split' },
          ] as { id: EditorMode; icon: typeof Eye; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); trackClientEvent('editor.mode.changed', { mode: id }); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-100 ${
                mode === id
                  ? 'bg-[#222226] text-[#f4f4f5] shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1.5 rounded-md transition-colors text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#222226] disabled:opacity-25 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1.5 rounded-md transition-colors text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#222226] disabled:opacity-25 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#2a2a2e] mx-2 flex-shrink-0" />

      {/* Group 2: Device + Theme + Client */}
      <div className="flex items-center gap-1 mr-auto">
        <div className="flex items-center gap-0.5">
          {([
            { id: 'desktop', icon: Monitor },
            { id: 'tablet', icon: Tablet },
            { id: 'mobile', icon: Smartphone },
          ] as { id: DeviceMode; icon: typeof Monitor }[]).map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              className={`p-1.5 rounded-md transition-colors ${
                device === id ? 'text-[#f4f4f5] bg-[#222226]' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'dark' ? 'text-[#818cf8] bg-[#6366f1]/10' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark'
              ? <Moon className="w-3.5 h-3.5" />
              : <Sun className="w-3.5 h-3.5" />
            }
          </button>
        </div>
        <div className="w-px h-4 bg-[#2a2a2e] mx-1 flex-shrink-0" />
        {/* Client selector */}
        <div className="relative">
          <button
            onClick={() => setClientOpen(!clientOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f0f11] border border-[#2a2a2e] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e] transition-colors"
          >
            {CLIENT_LABELS[client]}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {clientOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              {(Object.keys(CLIENT_LABELS) as ClientMode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setClient(c); setClientOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    client === c
                      ? 'text-[#818cf8] bg-[#6366f1]/10'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226]'
                  }`}
                >
                  {CLIENT_LABELS[c]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#2a2a2e] mx-2 flex-shrink-0" />

      {/* More overflow menu — Variables, Import, Copy HTML, Send test */}
      <div className="relative mr-1">
        <button
          onClick={() => { setMoreOpen(!moreOpen); setExportOpen(false); setClientOpen(false); }}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            moreOpen || Object.keys(variables).length > 0
              ? 'text-[#818cf8] bg-[#6366f1]/10'
              : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#222226]'
          }`}
          title="More tools"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
          {Object.keys(variables).length > 0 && (
            <span className="bg-[#6366f1] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
              {Object.keys(variables).length}
            </span>
          )}
        </button>

        {moreOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-64 bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl shadow-2xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick actions */}
            <div className="p-1.5 border-b border-[#2a2a2e] flex flex-col gap-0.5">
              <button
                onClick={() => { handleCopyHTML(); setMoreOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
                {copied ? 'Copied!' : 'Copy HTML'}
              </button>
              <button
                onClick={() => { setMoreOpen(false); setSendTestOpen(true); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              >
                <SendHorizonal className="w-3.5 h-3.5 flex-shrink-0" />
                Send test email
              </button>
              <button
                onClick={() => { setMoreOpen(false); setImportOpen(true); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                Import HTML
              </button>
            </div>

            {/* Variables section */}
            <div>
              <div
                data-tour="variables"
                className="px-3 py-2 border-b border-[#2a2a2e] flex items-center justify-between cursor-pointer"
                onClick={() => setVariablesOpen(!variablesOpen)}
              >
                <div className="flex items-center gap-2">
                  <Braces className="w-3.5 h-3.5 text-[#818cf8]" />
                  <p className="text-xs font-semibold text-[#f4f4f5]">Merge Variables</p>
                  {Object.keys(variables).length > 0 && (
                    <span className="bg-[#6366f1] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {Object.keys(variables).length}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3 h-3 text-[#71717a] transition-transform ${variablesOpen ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-[10px] text-[#71717a] px-3 pt-2 pb-1">Use <code className="text-[#818cf8]">{'{{key}}'}</code> in any text field</p>

              {variablesOpen && (
                <>
                  {/* Variable list */}
                  <div className="max-h-40 overflow-y-auto">
                    {Object.keys(variables).length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4 px-4">
                        <div className="w-7 h-7 rounded-xl bg-[#0f0f11] border border-[#2a2a2e] flex items-center justify-center">
                          <Braces className="w-3.5 h-3.5 text-[#52525b]" />
                        </div>
                        <p className="text-[10px] text-[#71717a] text-center">No variables yet. Add one below.</p>
                      </div>
                    ) : (
                      Object.entries(variables).map(([key, val]) => {
                        const usageCount = variableUsage[key] || 0;
                        const isUnused = usageCount === 0;
                        return (
                          <div key={key} className={`flex items-center gap-2 px-3 py-2 border-b border-[#1a1a1d] last:border-0 group ${isUnused ? 'opacity-60' : ''}`}>
                            <code className="text-[10px] text-[#818cf8] bg-[#6366f1]/10 px-1.5 py-0.5 rounded font-mono flex-shrink-0 min-w-0 max-w-[80px] truncate" title={`{{${key}}}`}>
                              {`{{${key}}}`}
                            </code>
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => setVariable(key, e.target.value)}
                              className="flex-1 min-w-0 text-[11px] bg-[#0f0f11] border border-[#2a2a2e] rounded px-1.5 py-0.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors"
                              placeholder="value"
                            />
                            {usageCount > 0 && (
                              <span className="text-[9px] text-[#10b981] bg-[#10b981]/10 px-1 py-0.5 rounded flex-shrink-0">{usageCount}×</span>
                            )}
                            <button
                              onClick={() => removeVariable(key)}
                              className="text-[#3a3a3e] hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add new variable */}
                  <div className="px-3 py-2.5 border-t border-[#2a2a2e] bg-[#161618]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <input
                        type="text"
                        value={newVarKey}
                        onChange={(e) => { setNewVarKey(e.target.value); if (varKeyError) setVarKeyError(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariable(); }}
                        className={`flex-1 min-w-0 text-[11px] bg-[#0f0f11] border rounded px-2 py-1 text-[#f4f4f5] focus:outline-none transition-colors font-mono ${
                          varKeyError ? 'border-red-500' : 'border-[#2a2a2e] focus:border-[#6366f1]'
                        }`}
                        placeholder="key"
                      />
                      <input
                        type="text"
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariable(); }}
                        className="flex-1 min-w-0 text-[11px] bg-[#0f0f11] border border-[#2a2a2e] rounded px-2 py-1 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors"
                        placeholder="value"
                      />
                      <button
                        onClick={handleAddVariable}
                        disabled={!newVarKey.trim() || !!varKeyError}
                        className="flex-shrink-0 p-1 rounded bg-[#6366f1] text-white hover:bg-[#818cf8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {varKeyError && (
                      <p className="text-[9px] text-red-400 mb-1">{varKeyError}</p>
                    )}
                    <p className="text-[9px] text-[#3a3a3e]">Exported HTML keeps raw <code className="text-[#818cf8]">{'{{tags}}'}</code> for your ESP.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#2a2a2e] mx-2 flex-shrink-0" />

      {/* Group 5: Name / Save / Copy / Send / Export / Account */}
      <div className="flex items-center gap-1.5">
        {/* Design name + inline rename */}
        {currentDesignName || currentDesignId ? (
          <div className="hidden xl:flex items-center gap-1.5 max-w-[160px]">
            {editingName ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingName(false); }}
                className="text-xs bg-transparent border-b border-[#6366f1] text-[#f4f4f5] focus:outline-none w-32 py-0.5"
              />
            ) : (
              <button
                onClick={() => { setDraftName(currentDesignName); setEditingName(true); }}
                className="group flex items-center gap-1 text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors truncate cursor-text"
                title="Click to rename"
              >
                <span className="truncate">{currentDesignName || <span className="italic text-[#3a3a3e]">Untitled</span>}</span>
                <Pencil className="w-2.5 h-2.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            {hasUnsavedChanges && !editingName && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] flex-shrink-0" title="Unsaved changes" />
            )}
          </div>
        ) : null}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
            hasUnsavedChanges && currentDesignId
              ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/20'
              : 'bg-[#222226] border-[#2a2a2e] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e]'
          }`}
          title={currentDesignId ? `Save "${currentDesignName}"` : 'Save design'}
        >
          <Save className="w-3 h-3" />
          {currentDesignId ? 'Save' : 'Save as…'}
        </button>

        <div className="relative">
          <button
            data-tour="export"
            onClick={() => { setExportOpen(!exportOpen); setMoreOpen(false); }}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] text-xs text-white font-medium hover:bg-[#818cf8] transition-colors disabled:opacity-60"
          >
            <Download className="w-3 h-3" />
            {exporting ? `Exporting…` : 'Export'}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {exportOpen && (
            <div className="absolute top-full right-0 mt-1 w-52 bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              <button
                onClick={handleDownloadHTML}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download HTML
              </button>
              <button
                onClick={handleDownloadInlined}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="flex-1">Download optimized HTML</span>
                <span className="text-[10px] text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded">Outlook-ready</span>
              </button>
              <button
                onClick={handleDownloadMjml}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="flex-1">Download MJML-compiled HTML</span>
                {hasMjml && (
                  <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">MJML detected</span>
                )}
              </button>
              <button
                onClick={handleExportSVG}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Export as SVG
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export as JSON
              </button>
              <div className="border-t border-[#2a2a2e] my-1" />
              <button
                onClick={handleCopyHTML}
                className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
        <AccountMenu />
      </div>

      {/* Send test modal */}
      {sendTestOpen && (
        <SendTestModal
          subject={emailDetails.subject}
          html={getAssembledHTML()}
          onClose={() => setSendTestOpen(false)}
        />
      )}

      {/* Import HTML modal */}
      {importOpen && <ImportHtmlModal onClose={() => setImportOpen(false)} />}

      {/* Save dialog */}
      {saveDialogOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSaveDialogOpen(false)}
        >
          <div
            className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl p-5 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-[#f4f4f5] mb-1">Save design</h3>
            <p className="text-xs text-[#71717a] mb-4">Give your email design a name to save it locally.</p>
            <input
              autoFocus
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSave(); if (e.key === 'Escape') setSaveDialogOpen(false); }}
              placeholder="e.g. Welcome email Q2"
              className="w-full bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-[#f4f4f5] placeholder-[#3a3a3e] focus:outline-none focus:border-[#6366f1]/60 mb-4 transition-colors"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#6366f1] text-white font-medium hover:bg-[#818cf8] transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
