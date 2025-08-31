import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Gold Saving Scheme",
  description: "Professional dashboard for managing RAFI Gold Saving Scheme members, tokens, and payments",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gold Saving Scheme",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/rafiLogo.jpeg",
    apple: "/rafiLogo.jpeg",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f23' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Primary Icon */}
        <link rel="icon" href="/rafiLogo.jpeg" type="image/jpeg" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/rafiLogo.jpeg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/Logos/ios/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Logos/ios/180.png" />

        {/* Mobile Web App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RAFI Scheme" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/Logos/ios/144.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* PWA Theme Colors */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f0f23" media="(prefers-color-scheme: dark)" />

        {/* PWA Display Mode */}
        <meta name="display-mode" content="standalone" />

        {/* Prevent Phone Number Detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="light" storageKey="rafi-scheme-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
