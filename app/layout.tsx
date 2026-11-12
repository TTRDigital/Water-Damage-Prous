import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site";

/*
 * Root layout is intentionally bare: the website's styles and chrome live in app/(site) so the
 * embedded Sanity Studio at /cms loads without them. `kit` on <body> carries the old site's
 * global typography (app/styles/kit.css).
 */

// The same Google Fonts files (latin subset), kept in the repo so a build never has to download them:
// a failed fonts.googleapis.com fetch at build time is what stopped a Vercel deploy (TTR-1725).
const jakarta = localFont({ src: "./fonts/plus-jakarta-sans-latin-600-800.woff2", weight: "600 800", display: "swap", variable: "--font-jakarta" });
// Inter (body text of forms, chips and footer) is mostly below the fold: not preloaded, so it never delays the hero photo.
const inter = localFont({ src: "./fonts/inter-latin-400-600.woff2", weight: "400 600", display: "swap", variable: "--font-inter", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Water Damage Pro", template: "%s - Water Damage Pro" },
  applicationName: "Water Damage Pro",
  formatDetection: { telephone: false, address: false, email: false },
  // The old site's icons.
  icons: {
    icon: [
      { url: "/images/uploads/2025/04/Asset-13-1-removebg-preview-1-150x150.png", sizes: "32x32" },
      { url: "/images/uploads/2025/04/Asset-13-1-removebg-preview-1.png", sizes: "192x192" },
    ],
    apple: "/images/uploads/2025/04/Asset-13-1-removebg-preview-1.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0A1826" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${jakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="kit">{children}</body>
    </html>
  );
}
