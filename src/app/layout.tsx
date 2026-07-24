import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SerwistProvider } from "@serwist/turbopack/react";

const APP_NAME = "BMTC Dashboard";
const APP_DESCRIPTION = "BMTC Clinic Management Dashboard";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BMTC",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{
          __html: `(async()=>{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){if(r.active?.scriptURL?.includes('/sw.js')){await r.unregister();}}const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}})()`,
        }} />
        <Providers>
          <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
        </Providers>
      </body>
    </html>
  );
}
