'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailsList } from '@/components/emails/EmailsList';

export default function EmailsPage() {
  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
              >
                My Emails
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Click any design to open it. Rename inline, duplicate, or delete from the card actions.
              </p>
            </div>
            <Link
              href="/builder"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New email
            </Link>
          </div>
          <EmailsList />
        </div>
      </div>
    </AppShell>
  );
}
