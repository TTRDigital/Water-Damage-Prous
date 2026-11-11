import type { NextConfig } from "next";

/*
 * Served by Vercel (a Node server, no static export). What the old SiteGround files did:
 * - lead forms: app/api/lead/route.ts (was public/api/lead.php); /api/lead.php is rewritten to it so pages
 *   and comment forms already open in a browser keep working
 * - redirects, security headers, caching: still to move here from public/.htaccess (next step, same branch)
 */
const nextConfig: NextConfig = {
  // Pages live at /about/ (matches the old WordPress URLs).
  trailingSlash: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/lead.php", destination: "/api/lead" }];
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
