import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerManager from "./ServiceWorkerManager";
export const metadata: Metadata = {
  title: "GloomBuilder",
  description: "Build. Share. Steal. Repeat. A community-first beatdown planning platform for F3 Qs.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GloomBuilder",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E0E10",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerManager />
        {children}
      </body>
    </html>
  );
}
