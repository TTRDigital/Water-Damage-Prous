import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/site";

/*
 * Root layout is intentionally bare: the website's styles and chrome live in app/(site) so the
 * embedded Sanity Studio at /cms loads without them.
 *
 * Type: Instrument Serif (display; the italic carries the accent words) and Manrope (text, labels,
 * buttons), only the weights the design uses.
 */

const serif = Instrument_Serif({ subsets: ["latin"], display: "swap", variable: "--font-serif", weight: "400", style: "normal" });
// The italic only sets a few accent words: not preloaded (it never competes with the hero photo), and
// "optional" so a late file is never swapped in under the reader (no layout shift); it is used once cached.
const serifItalic = Instrument_Serif({ subsets: ["latin"], display: "optional", variable: "--font-serif-italic", weight: "400", style: "italic", preload: false });
const sans = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-sans", weight: ["400", "600", "700"] });

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

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0A1826" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${serif.variable} ${serifItalic.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
