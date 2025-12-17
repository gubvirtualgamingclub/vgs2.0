import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "VGS 2.0 - GUCC Virtual Gaming Society",
  description: "Official website of GUCC Virtual Gaming Society - Gaming tournaments, events, and community",
  keywords: ["gaming", "esports", "GUCC", "virtual gaming society", "tournaments"],
  authors: [{ name: "GUCC VGS Team" }],
  robots: {
    index: true,
    follow: true,
  },
};

// Viewport configuration must be exported separately in Next.js 14+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetch for Supabase */}
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  );
}
