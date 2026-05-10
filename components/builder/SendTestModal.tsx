'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Key, Server, Loader2, Info } from 'lucide-react';

type Transport = 'resend' | 'smtp';

const LS_KEY = 'wizemail_send_config';

interface SendConfig {
  transport: Transport;
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpFromName: string;
}

function loadConfig(): Partial<SendConfig> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveConfig(config: Partial<SendConfig>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(config));
  } catch {}
}

interface Props {
  subject: string;
  html: string;
  onClose: () => void;
}

export function SendTestModal({ subject, html, onClose }: Props) {
  const saved = loadConfig();

  const [to, setTo] = useState('');
  const [transport, setTransport] = useState<Transport>(saved.transport ?? 'resend');

  // Resend fields
  const [resendApiKey, setResendApiKey] = useState(saved.resendApiKey ?? '');
  const [fromEmail, setFromEmail] = useState(saved.fromEmail ?? '');
  const [fromName, setFromName] = useState(saved.fromName ?? '');

  // SMTP fields
  const [smtpHost, setSmtpHost] = useState(saved.smtpHost ?? '');
  const [smtpPort, setSmtpPort] = useState(saved.smtpPort ?? '587');
  const [smtpSecure, setSmtpSecure] = useState(saved.smtpSecure ?? false);
  const [smtpUser, setSmtpUser] = useState(saved.smtpUser ?? '');
  const [smtpPass, setSmtpPass] = useState(saved.smtpPass ?? '');
  const [smtpFrom, setSmtpFrom] = useState(saved.smtpFrom ?? '');
  const [smtpFromName, setSmtpFromName] = useState(saved.smtpFromName ?? '');

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Persist config on change
  useEffect(() => {
    saveConfig({ transport, resendApiKey, fromEmail, fromName, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, smtpFromName });
  }, [transport, resendApiKey, fromEmail, fromName, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, smtpFromName]);

  const handleSend = async () => {
    if (!to.trim()) return;
    setSending(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const payload =
        transport === 'resend'
          ? { transport, to: to.trim(), subject: subject || '(No subject)', html, resendApiKey, fromEmail: fromEmail || 'onboarding@resend.dev', fromName }
          : {
              transport,
              to: to.trim(),
              subject: subject || '(No subject)',
              html,
              smtp: {
                host: smtpHost,
                port: Number(smtpPort) || 587,
                secure: smtpSecure,
                user: smtpUser,
                pass: smtpPass,
                from: smtpFrom,
                fromName: smtpFromName,
              },
            };

      const res = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error ?? 'Unknown error');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-2xl shadow-2xl w-[480px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2e] flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#f4f4f5]">Send test email</h3>
            <p className="text-[10px] text-[#71717a] mt-0.5 truncate max-w-[300px]">
              Subject: <span className="text-[#a1a1aa]">{subject || '(No subject)'}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-[#3a3a3e] hover:text-[#71717a] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Transport tab switcher */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center gap-1 bg-[#0f0f11] rounded-lg p-0.5">
              <button
                onClick={() => setTransport('resend')}
                className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                  transport === 'resend' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <Key className="w-3 h-3" />
                Resend API
              </button>
              <button
                onClick={() => setTransport('smtp')}
                className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                  transport === 'smtp' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <Server className="w-3 h-3" />
                Custom SMTP
              </button>
            </div>
          </div>

          <div className="px-5 pb-4 space-y-3">
            {/* To field — always visible */}
            <Field label="To">
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="recipient@example.com"
                autoFocus
                className={inputCls}
              />
            </Field>

            {/* ── Resend pane ── */}
            {transport === 'resend' && (
              <>
                <div className="rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/5 px-3 py-2 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#818cf8] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#818cf8] leading-relaxed">
                    Get a free API key at <span className="font-semibold">resend.com</span>. Leave the "From" field empty to use <code className="bg-[#6366f1]/20 px-1 rounded">onboarding@resend.dev</code> (Resend sandbox, works immediately with no domain setup).
                  </p>
                </div>

                <Field label="API key *">
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_••••••••••••••••"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="From email">
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="you@yourdomain.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="From name">
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="Your Company"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </>
            )}

            {/* ── SMTP pane ── */}
            {transport === 'smtp' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Field label="SMTP host *">
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.example.com"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Port">
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Username">
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="user@example.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="From email *">
                    <input
                      type="email"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="From name">
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="Your Company"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#3a3a3e] accent-[#6366f1]"
                  />
                  <span className="text-[11px] text-[#71717a]">Use SSL/TLS (port 465)</span>
                </label>
              </>
            )}

            {/* Status feedback */}
            {status === 'success' && (
              <div className="rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                <p className="text-xs text-[#10b981] font-medium">Email sent! Check your inbox.</p>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 break-words">{errorMsg}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[#2a2a2e] flex-shrink-0 bg-[#161618]">
          <p className="text-[10px] text-[#3a3a3e]">Config saved locally — never sent to our servers.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !to.trim() || (transport === 'resend' && !resendApiKey.trim()) || (transport === 'smtp' && (!smtpHost.trim() || !smtpFrom.trim()))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#6366f1] text-white font-medium hover:bg-[#818cf8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? 'Sending…' : 'Send test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full text-xs bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-2.5 py-1.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#3a3a3e]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-[#71717a]">{label}</label>
      {children}
    </div>
  );
}
