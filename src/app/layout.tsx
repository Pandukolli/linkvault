import type { Metadata } from "next";
import { Inter, Space_Grotesk, Caveat, Kalam } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { I18nProvider } from "@/providers/i18n-provider";
import { TransmissionProvider } from "@/providers/transmission-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const kalam = Kalam({
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vaultOS — The Elegant Personal Knowledge OS",
  description:
    "The elegant Personal Knowledge OS where notes feel like books, images tell stories, and blogs come alive. A modern, AI-powered system for your digital life.",
  keywords: ["knowledge base", "personal OS", "notes", "blogging", "AI", "bookmarks"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${caveat.variable} ${kalam.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-black">
        <ThemeProvider>
          <QueryProvider>
            <I18nProvider>
              <TransmissionProvider>
                {children}
              </TransmissionProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#F8FAFC",
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
