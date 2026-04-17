import type { Metadata } from "next";
import { Inter, Merriweather, Space_Grotesk } from "next/font/google";
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

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkVault — Professional Knowledge Platform",
  description:
    "A structured, secure, and professional hub for digital artifacts. Architected for clarity, clean hierarchy, and optimal reading experiences.",
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
      className={`${inter.variable} ${merriweather.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#111827]">
        <ThemeProvider defaultTheme="light"强制LightMode={true}>
          <QueryProvider>
            <I18nProvider>
              <TransmissionProvider>
                {children}
              </TransmissionProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    color: "#111827",
                    borderRadius: "6px",
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
