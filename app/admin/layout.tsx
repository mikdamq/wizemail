import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin — Wizemail' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect('/dashboard');
  }
  return <AdminShell>{children}</AdminShell>;
}
