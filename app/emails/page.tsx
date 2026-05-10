import Link from 'next/link';
import { Mail, Plus, ArrowLeft } from 'lucide-react';
import { EmailsList } from '@/components/emails/EmailsList';

export default function EmailsPage() {
  return (
    <div className="h-full bg-[#0f0f11] flex flex-col">
      <header className="border-b border-[#2a2a2e] px-8 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[#71717a] hover:text-[#a1a1aa] transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <div className="w-px h-4 bg-[#2a2a2e]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#f4f4f5] tracking-tight text-sm">My Emails</span>
          </div>
        </div>

        <Link
          href="/builder"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] text-xs text-white font-medium hover:bg-[#818cf8] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New email
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-8 max-w-7xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-[#f4f4f5] mb-1">Saved designs</h1>
          <p className="text-xs text-[#71717a]">Click any design to open it. Rename inline, duplicate, or delete from the card actions.</p>
        </div>
        <EmailsList />
      </main>
    </div>
  );
}
