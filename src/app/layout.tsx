import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bodoni_Moda, Jost } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { I18nProvider } from "@/providers/i18n-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkVault — Save, Organize & Share Your Bookmarks",
  description:
    "A modern, AI-powered bookmark manager. Save links, auto-tag with AI, organize into collections, and share with the world.",
  keywords: ["bookmarks", "link manager", "organize links", "AI tagging", "collections"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${bodoniModa.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <QueryProvider>
            <I18nProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "var(--color-zinc-900)",
                    border: "1px solid var(--color-zinc-800)",
                    color: "var(--color-slate-100)",
                    backdropFilter: "blur(12px)",
                  },
                }}
              />
            </I18nProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
