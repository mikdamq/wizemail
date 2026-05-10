import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OnboardingController } from "@/components/OnboardingController";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wizemail — HTML Email Builder",
  description: "The fastest and cleanest way to build and preview production-ready HTML emails.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden">
        {children}
        <OnboardingController />
      </body>
    </html>
  );
}
