import "server-only";
import { cache } from "react";
import { sanityFetch } from "@/lib/sanity/fetch";
import { merge } from "@/lib/merge";
import { fallbackLegalPages, fallbackSettings } from "@/lib/data/site";
import { fallbackPages } from "@/lib/data/pages";
import { fallbackCategories, fallbackPosts, fallbackTextPages } from "@/lib/data/posts";
import type { Category, Page, Post, Section, SiteSettings, TextPage } from "@/lib/types";

/* ==========================================================================
   Content layer
   Every page reads through these functions. Sanity values win when present;
   anything missing falls back to lib/data, so the site works before the CMS
   is filled in, and an empty field never breaks a page.
   ========================================================================== */

/* ---------- GROQ fragments ---------- */

const IMG = `{ "src": asset->url, "alt": coalesce(alt, ""), "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;
const SEO = `seo{ title, description, noIndex, "image": ogImage${IMG} }`;

/** Sections: images resolved to { src, alt, width, height }; everything else as stored. */
const SECTIONS = `sections[]{
  ...,
  "image": image${IMG},
  "slides": slides[]{ label, "src": image.asset->url, "alt": coalesce(image.alt, ""), "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height },
  "items": items[]{ ..., "image": image${IMG} }
}`;

const PAGE = `{ "slug": coalesce(slug.current, ""), kind, name, order, ${SECTIONS}, ${SEO} }`;
const BODY = `body`;

type Loose = Record<string, unknown>;
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Drops Sanity's internal keys and images without a file, so the components get the same shape as lib/data. */
function normalizeSection(raw: unknown): Section | null {
  const s = (raw ?? {}) as Loose;
  if (typeof s._type !== "string") return null;
  const out: Loose = {};
  for (const [k, v] of Object.entries(s)) {
    if (v === null || v === undefined) continue;
    if (k === "image" && !(v as Loose).src) continue;
    out[k] = v;
  }
  if ("items" in out) out.items = arr<Loose>(out.items).map((it) => Object.fromEntries(Object.entries(it).filter(([k, v]) => v !== null && !(k === "image" && !(v as Loose)?.src))));
  if ("slides" in out) out.slides = arr<Loose>(out.slides).filter((x) => x.src);
  for (const k of ["buttons", "ticks", "breadcrumb", "cards", "groups", "stats", "links", "paragraphs", "steps"]) if (k in out) out[k] = arr(out[k]);
  return out as Section;
}

/** CMS documents merge over the matching fallback (same slug); CMS-only documents are added. */
function mergeBySlug<T extends { slug: string }>(fallback: T[], cms: Partial<T>[] | null, blank: T, fix: (t: T) => T = (t) => t): T[] {
  if (!cms?.length) return fallback;
  const bySlug = new Map(fallback.map((f) => [f.slug, f]));
  const merged = cms.filter((c) => typeof c.slug === "string").map((c) => fix(merge(bySlug.get(c.slug as string) ?? { ...blank, slug: c.slug as string }, c)));
  const missing = fallback.filter((f) => !cms.some((c) => c.slug === f.slug));
  return [...merged, ...missing];
}

/* ---------- Site settings ---------- */

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const cms = await sanityFetch<Partial<SiteSettings>>(
    `*[_id == "siteSettings"][0]{ ..., "logo": logo${IMG}, "logoFull": logoFull${IMG} }`,
    {},
    ["siteSettings"],
  );
  return merge(fallbackSettings, cms);
});

/* ---------- Section pages (home, about, contact, services, service areas) ---------- */

const blankPage: Page = { slug: "", kind: "company", name: "", order: 99, sections: [], seo: { title: "", description: "" } };

export const getPages = cache(async (): Promise<Page[]> => {
  const cms = await sanityFetch<Partial<Page>[]>(`*[_type == "page"] | order(order asc) ${PAGE}`, {}, ["page"]);
  const pages = mergeBySlug(fallbackPages, cms, blankPage, (p) => ({ ...p, sections: p.sections.map(normalizeSection).filter((s): s is Section => !!s) }));
  return pages.sort((a, b) => a.order - b.order);
});

export async function getPage(slug: string): Promise<Page | undefined> {
  return (await getPages()).find((p) => p.slug === slug);
}

/* ---------- Blog ---------- */

const blankPost: Post = { slug: "", title: "", date: "", category: "uncategorized", excerpt: "", body: [], seo: { title: "", description: "" } };

export const getPosts = cache(async (): Promise<Post[]> => {
  const cms = await sanityFetch<Partial<Post>[]>(
    `*[_type == "post" && defined(slug)]{ "slug": slug.current, title, date, "category": category->slug.current, excerpt, "image": image${IMG}, ${BODY}, ${SEO} }`,
    {},
    ["post"],
  );
  return mergeBySlug(fallbackPosts, cms, blankPost).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const cms = await sanityFetch<Partial<Category>[]>(`*[_type == "category" && defined(slug)]{ "slug": slug.current, title, ${SEO} }`, {}, ["category"]);
  return mergeBySlug(fallbackCategories, cms, { slug: "", title: "", seo: { title: "", description: "" } });
});

/* ---------- Text pages (the Alexandria page, privacy, accessibility) ---------- */

const blankText: TextPage = { slug: "", title: "", body: [], seo: { title: "", description: "" } };

export const getTextPages = cache(async (): Promise<TextPage[]> => {
  const cms = await sanityFetch<Partial<TextPage>[]>(`*[_type == "textPage" && defined(slug)]{ "slug": slug.current, title, ${BODY}, ${SEO} }`, {}, ["textPage"]);
  return mergeBySlug([...fallbackTextPages, ...fallbackLegalPages], cms, blankText);
});
