import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Gold Saving Scheme",
  description: "Professional dashboard for managing RAFI Gold Saving Scheme members, tokens, and payments",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/rafiLogo.jpeg" type="image/jpeg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Theme color meta tag for mobile browsers */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f0f23" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="light" storageKey="rafi-scheme-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
