import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/site";

/*
 * Root layout is intentionally bare: the website's styles and chrome live in app/(site) so the
 * embedded Sanity Studio at /cms loads without them.
 *
 * Type: Instrument Serif (display; the italic carries the accent words) and Manrope (text, labels,
 * buttons), only the weights the design uses. All three files are preloaded with font-display: optional:
 * the browser waits a moment for them before the first render and never swaps a late font in afterwards,
 * so nothing moves under a visitor (CLS 0); on a very slow first visit the page simply keeps its fallback.
 */

const serif = Instrument_Serif({ subsets: ["latin"], display: "optional", variable: "--font-serif", weight: "400", style: "normal" });
// The italic sets the accent words, often in the first-screen headline.
const serifItalic = Instrument_Serif({ subsets: ["latin"], display: "optional", variable: "--font-serif-italic", weight: "400", style: "italic" });
const sans = Manrope({ subsets: ["latin"], display: "optional", variable: "--font-sans", weight: ["400", "600", "700"] });

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
