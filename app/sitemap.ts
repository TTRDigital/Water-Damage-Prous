import type { MetadataRoute } from "next";
import { getCategories, getPages, getPosts, getTextPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Every indexable page (the privacy and accessibility placeholders are noindex until their text is in). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, cats, texts] = await Promise.all([getPages(), getPosts(), getCategories(), getTextPages()]);
  const entry = (path: string, priority: number, lastModified?: string) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority, ...(lastModified ? { lastModified } : {}) });
  return [
    ...pages.filter((p) => !p.seo.noIndex).map((p) => entry(p.slug ? `/${p.slug}/` : "/", p.slug ? (p.kind === "service" ? 0.8 : 0.7) : 1)),
    ...texts.filter((t) => !t.seo.noIndex).map((t) => entry(`/${t.slug}/`, 0.7)),
    ...posts.filter((p) => !p.seo.noIndex).map((p) => entry(`/${p.slug}/`, 0.6, p.date)),
    ...cats.filter((c) => !c.seo.noIndex).map((c) => entry(`/category/${c.slug}/`, 0.3)),
    entry("/sitemap/", 0.2),
  ];
}
