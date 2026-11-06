import type { Metadata, Viewport } from "next";
import "@fontsource/archivo/800-italic.css";
import "@fontsource/archivo/900-italic.css";
import "@fontsource/jetbrains-mono/500-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { business, site } from "@/lib/config/business";
import { themeInitScript } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${business.name} — Own your street, define your style`, template: `%s · ${business.name}` },
  description: "Premium oversized streetwear from Bangalore. Limited drops, big-print oversized tees, One of One custom pieces, customisation and 60-minute delivery in select areas.",
  applicationName: business.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/brand/s-mark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/s-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/s-mark-180.png",
  },
  openGraph: {
    type: "website",
    siteName: business.name,
    locale: "en_IN",
    images: [{ url: "/brand/logo-primary-900.webp", width: 900, height: 900, alt: business.name }],
  },
  twitter: { card: "summary_large_image" },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07070A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
