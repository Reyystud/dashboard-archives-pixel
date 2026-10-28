import { Providers } from "@/components/Providers";
import { IntroLoader } from "@/components/motion/IntroLoader";
import { BackdropCanvas } from "@/components/background/BackdropCanvas";
import { ToastProvider } from "@/components/ui/Toast";
import { INTRO_BOOT_SCRIPT } from "@/lib/brand/intro";
import { clientEnv } from "@/lib/env";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "PIXEL'25 · HMIF ITB", template: "%s | PIXEL'25" },
  description: "Web angkatan PIXEL'25 HMIF ITB: arsip broadcast, kalender deadline, momen, dan pojok aspirasi.",
  openGraph: { siteName: "PIXEL'25", images: ["/brand/pixel-logo.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#161F3C", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body>
        <div className="backdrop-scene" aria-hidden>
          <BackdropCanvas />
        </div>
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
        <IntroLoader />
      </body>
    </html>
  );
}
