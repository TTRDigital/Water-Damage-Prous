import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Search and AI crawlers are welcome; only the studio and the form endpoint are off limits.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cms/", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
