import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import { OnboardingController } from "@/components/OnboardingController";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import { createServiceSupabaseClient, getCurrentUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Wizemail — HTML Email Builder",
  description: "The fastest and cleanest way to build and preview production-ready HTML emails.",
};

async function MaintenanceBanner() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from('app_settings').select('data').eq('id', 1).single();
  const settings = (data?.data ?? {}) as Record<string, unknown>;
  if (!settings.maintenanceMode) return null;
  // Allow admins through even in maintenance mode
  const { user } = await getCurrentUser();
  if (isAdminEmail(user?.email)) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
        <span className="text-2xl text-white font-bold" style={{ fontFamily: 'var(--font-fraunces)' }}>W</span>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Down for maintenance</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We&apos;ll be back shortly. Thanks for your patience.</p>
      </div>
    </div>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${fraunces.variable} h-full`}>
      <body className="h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <MaintenanceBanner />
        {children}
        <OnboardingController />
      </body>
    </html>
  );
}
