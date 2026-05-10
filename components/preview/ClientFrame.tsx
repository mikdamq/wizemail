'use client';

import { useEmailStore } from '@/store/email-store';
import type { ClientMode, EmailDetails } from '@/lib/types';

type ChromeProps = { children: React.ReactNode; emailDetails: EmailDetails };

function GmailChrome({ children, emailDetails }: ChromeProps) {
  const subject = emailDetails.subject || 'Subject Line Preview';
  const senderName = emailDetails.senderName || 'Sender';
  const senderEmail = emailDetails.senderEmail || 'sender@example.com';
  const initial = senderName.charAt(0).toUpperCase() || 'S';
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-[#2a2a2e] shadow-2xl">
      {/* Gmail top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="flex-1 mx-3">
          <div className="bg-[#0f0f11] rounded px-2.5 py-0.5 text-[10px] text-[#71717a] font-medium">Gmail</div>
        </div>
      </div>
      {/* Gmail header bar */}
      <div className="px-4 py-2 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-[#f4f4f5]">{subject}</span>
          <span className="text-[10px] text-[#71717a]">Inbox</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">{initial}</div>
          <span className="text-[10px] text-[#a1a1aa]">{senderEmail}</span>
          <span className="text-[10px] text-[#3a3a3e] ml-auto">just now</span>
        </div>
      </div>
      {/* Email content */}
      <div className="flex-1 overflow-auto bg-[#f1f5f9]">{children}</div>
    </div>
  );
}

function OutlookChrome({ children, emailDetails }: ChromeProps) {
  const subject = emailDetails.subject || 'Subject Line Preview';
  const senderName = emailDetails.senderName || 'Sender Name';
  const senderEmail = emailDetails.senderEmail || 'sender@example.com';
  const initial = senderName.charAt(0).toUpperCase() || 'S';
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-[#2a2a2e] shadow-2xl">
      {/* Outlook title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0072c6] flex-shrink-0">
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <div className="w-3 h-3 rounded-full bg-white/30" />
        </div>
        <span className="text-xs text-white font-medium ml-2">Outlook</span>
      </div>
      {/* Outlook reading pane header */}
      <div className="px-4 py-2.5 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <p className="text-xs font-semibold text-[#f4f4f5] mb-1">{subject}</p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#0072c6] flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">{initial}</div>
          <div>
            <p className="text-[10px] text-[#a1a1aa]">{senderName} &lt;{senderEmail}&gt;</p>
            <p className="text-[9px] text-[#3a3a3e]">To: you@example.com</p>
          </div>
        </div>
        {/* Outlook CSS warning */}
        <div className="mt-2 px-2 py-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[9px] text-[#f59e0b] flex items-center gap-1">
          <span>⚠</span>
          Some styles may not display correctly in Outlook
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#f1f5f9]">{children}</div>
    </div>
  );
}

function AppleMailChrome({ children, emailDetails }: ChromeProps) {
  const subject = emailDetails.subject || 'Subject Line Preview';
  const senderName = emailDetails.senderName || 'Sender Name';
  const senderEmail = emailDetails.senderEmail || 'sender@example.com';
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-[#2a2a2e] shadow-2xl">
      {/* Apple Mail title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2e] flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] text-[#71717a] mx-auto">Mail — Inbox</span>
      </div>
      {/* Message header */}
      <div className="px-4 py-3 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <p className="text-sm font-semibold text-[#f4f4f5] mb-1.5">{subject}</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
          <span className="text-[10px] text-[#71717a]">From:</span>
          <span className="text-[10px] text-[#a1a1aa]">{senderName} &lt;{senderEmail}&gt;</span>
          <span className="text-[10px] text-[#71717a]">To:</span>
          <span className="text-[10px] text-[#a1a1aa]">you@example.com</span>
          <span className="text-[10px] text-[#71717a]">Date:</span>
          <span className="text-[10px] text-[#a1a1aa]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">{children}</div>
    </div>
  );
}

function MobileChrome({ children, emailDetails }: ChromeProps) {
  const subject = emailDetails.subject || 'Subject Line';
  const senderName = emailDetails.senderName || 'Sender Name';
  const initial = senderName.charAt(0).toUpperCase() || 'S';
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[2rem] border-4 border-[#2a2a2e] shadow-2xl">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1f] flex-shrink-0">
        <span className="text-[10px] text-[#f4f4f5] font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-0.5 rounded-sm bg-[#f4f4f5]" style={{ height: 3 + i * 1.5 }} />
            ))}
          </div>
          <div className="w-4 h-2 rounded-sm border border-[#f4f4f5] ml-1 relative">
            <div className="absolute inset-0.5 rounded-[1px] bg-[#f4f4f5] w-2/3" />
          </div>
        </div>
      </div>
      {/* Email app bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <span className="text-[10px] text-[#6366f1] font-medium">← Back</span>
        <span className="text-xs font-semibold text-[#f4f4f5] flex-1 text-center truncate px-2">{subject}</span>
        <span className="text-[10px] text-[#71717a]">···</span>
      </div>
      {/* Message meta */}
      <div className="px-3 py-2 bg-[#1c1c1f] border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-[9px] text-white font-bold">{initial}</div>
          <div>
            <p className="text-[10px] font-semibold text-[#f4f4f5]">{senderName}</p>
            <p className="text-[9px] text-[#71717a]">To: me</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">{children}</div>
    </div>
  );
}

const CHROME_COMPONENTS: Record<ClientMode, React.FC<ChromeProps>> = {
  gmail: GmailChrome,
  outlook: OutlookChrome,
  apple: AppleMailChrome,
  mobile: MobileChrome,
};

export function ClientFrame({ children }: { children: React.ReactNode }) {
  const { client, emailDetails } = useEmailStore();
  const Chrome = CHROME_COMPONENTS[client];
  return <Chrome emailDetails={emailDetails}>{children}</Chrome>;
}
