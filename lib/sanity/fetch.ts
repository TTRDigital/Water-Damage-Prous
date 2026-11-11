import "server-only";

import { isPreview } from "@/lib/preview";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/** How long CMS content is kept before it is read again, in seconds. Publishing also refreshes at once (app/api/revalidate). */
export const REVALIDATE_SECONDS = 300;

/** Draft preview (lib/preview.ts): Sanity's drafts, with the read token, only while draft mode is on. */
async function previewToken(): Promise<string | undefined> {
  const token = process.env.SANITY_READ_TOKEN;
  return token && (await isPreview()) ? token : undefined;
}

/**
 * Fetch content from Sanity.
 *
 * - Published content comes from the API CDN and is kept for REVALIDATE_SECONDS; the publish webhook
 *   (app/api/revalidate) clears it at once (tag "sanity").
 * - In draft preview the live API is read with SANITY_READ_TOKEN (the CDN only has published content) and nothing is cached.
 * - Never throws: returns null on any failure so pages fall back to lib/content.ts defaults and the site keeps working.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T | null> {
  if (!projectId) return null;

  const token = await previewToken();
  const search = new URLSearchParams({ query, perspective: token ? "drafts" : "published" });
  for (const [key, value] of Object.entries(params)) {
    search.set(`$${key}`, JSON.stringify(value));
  }
  // SANITY_API_URL points the build at another API host (used to test the
  // queries against a local mock of the seeded dataset); normally unset.
  const host = process.env.SANITY_API_URL?.replace(/\/$/, "") || `https://${projectId}.${token ? "api" : "apicdn"}.sanity.io`;
  const url = `${host}/v${apiVersion}/data/query/${dataset}?${search}`;

  try {
    const res = token
      ? await fetch(url, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } })
      : await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: ["sanity", ...tags] } });
    if (!res.ok) {
      console.warn(`[sanity] ${res.status} for query tags=${tags.join(",")}`);
      return null;
    }
    const json = (await res.json()) as { result?: T };
    return json.result ?? null;
  } catch (error) {
    console.warn("[sanity] fetch failed, using fallbacks", error);
    return null;
  }
}
