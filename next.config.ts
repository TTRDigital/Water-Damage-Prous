import type { NextConfig } from "next";
import { movedPages } from "./lib/legacy-redirects";

/*
 * Served by Vercel (a Node server, no static export). What the old SiteGround files did:
 * - lead forms: app/api/lead/route.ts (was public/api/lead.php); /api/lead.php is rewritten to it so pages
 *   and comment forms already open in a browser keep working
 * - redirects: movedPages below; the 410s, ?page_id= short links, old sitemaps and media files are in proxy.ts
 * - security headers, the CSP and caching: headers() below. Compression, https and www to the bare domain are Vercel's.
 */
// Same CSP as public/.htaccess had (not on the Studio at /cms, which talks to many Sanity hosts and is protected by Sanity login),
// plus the TTR OS host for the visit tracker. A new third-party tag needs its host here.
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://portal.ttrdigitalmarketing.com https://www.googletagmanager.com https://*.leadconnectorhq.com https://*.msgsndr.com; style-src 'self' 'unsafe-inline' https://*.leadconnectorhq.com https://*.msgsndr.com; img-src 'self' data: blob: https://cdn.sanity.io https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com https://*.leadconnectorhq.com https://*.msgsndr.com; font-src 'self' data: https://*.leadconnectorhq.com https://*.msgsndr.com; connect-src 'self' https://portal.ttrdigitalmarketing.com https://www.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.leadconnectorhq.com https://*.msgsndr.com wss://*.leadconnectorhq.com; frame-src 'self' https://www.google.com https://maps.google.com https://*.leadconnectorhq.com https://*.msgsndr.com; media-src 'self' https://*.leadconnectorhq.com https://*.msgsndr.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests";

const security = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const month = [{ key: "Cache-Control", value: "public, max-age=2592000" }];

const nextConfig: NextConfig = {
  // Pages live at /about/ (matches the old WordPress URLs).
  trailingSlash: true,
  poweredByHeader: false,
  // The site's CSS goes inside the HTML instead of 3 separate files the phone has to fetch before it
  // can draw anything (PageSpeed mobile: about 470 ms of render-blocking requests, TTR-1572).
  experimental: { inlineCss: true },
  async rewrites() {
    return [{ source: "/api/lead.php", destination: "/api/lead" }];
  },
  async redirects() {
    return movedPages.map(([from, to]) => ({ source: `/${from}`, destination: to, statusCode: 301 }));
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // Everything but the Studio gets the CSP.
      { source: "/((?!cms).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
      // Photos and the old stylesheet and scripts: a month (hashed /_next files are immutable by default, pages revalidate).
      { source: "/images/:path*", headers: month },
      { source: "/legacy/:path*", headers: month },
      // Only the real domain may be indexed: the vercel.app address and every preview get noindex.
      { source: "/:path*", missing: [{ type: "host", value: "waterdamageprous.com" }, { type: "host", value: "www.waterdamageprous.com" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Keep in sync with WIDTHS in scripts/optimize-images.mjs.
    deviceSizes: [480, 640, 828, 1080, 1440],
    imageSizes: [256, 384],
    qualities: [75],
  },
};

export default nextConfig;
