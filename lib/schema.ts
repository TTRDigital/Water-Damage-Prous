import type { Page, PtBlock, SiteSettings } from "@/lib/types";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { plainRich } from "@/lib/text";

/*
 * Structured data. One LocalBusiness entity for the whole site (address, phone, hours and
 * service area as the site states them; no ratings, prices or claims), BreadcrumbList on inner
 * pages and FAQPage only where a page shows FAQs, word for word.
 */

export const BUSINESS_ID = `${siteUrl}/#business`;

export function businessSchema(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: s.name,
    url: absoluteUrl("/"),
    telephone: s.phoneHref.replace(/^tel:/, ""),
    email: s.email,
    image: absoluteUrl("/images/uploads/2026/07/hero-flood-1448.jpg"),
    logo: absoluteUrl(s.logoFull.src),
    address: { "@type": "PostalAddress", streetAddress: s.street, addressLocality: s.city, addressRegion: s.region, postalCode: s.postalCode, addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
    ],
    areaServed: s.areaServed.map((name) => ({ "@type": "Place", name })),
  };
}

export function breadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, ...(it.path ? { item: absoluteUrl(it.path) } : {}) })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

/** The FAQs a section page shows (the FAQ accordion), word for word. */
export function pageFaqs(page: Page) {
  return page.sections.flatMap((s) => (s._type === "faq" ? s.items : []));
}

/** Breadcrumbs as the page hero shows them. */
export function pageBreadcrumbs(page: Page) {
  const hero = page.sections.find((s) => s._type === "pageHero");
  if (!hero || hero._type !== "pageHero") return null;
  return hero.breadcrumb.map((c, i, all) => ({ name: plainRich(c.label), path: i === all.length - 1 ? `/${page.slug}/` : c.href }));
}

/**
 * FAQs inside a blog post: the questions (h3) under the "Frequently asked questions" heading (h2),
 * each answered by the paragraphs that follow it.
 */
export function postFaqs(body: PtBlock[]) {
  const text = (b: PtBlock) => (b.children ?? []).map((c) => c.text ?? "").join("");
  const start = body.findIndex((b) => b.style === "h2" && /frequently asked questions/i.test(text(b)));
  if (start < 0) return [];
  const out: { question: string; answer: string }[] = [];
  for (const b of body.slice(start + 1)) {
    if (b.style === "h2") break;
    if (b.style === "h3") out.push({ question: text(b), answer: "" });
    else if (out.length && b.style === "normal" && !b.listItem) out[out.length - 1].answer = [out[out.length - 1].answer, text(b)].filter(Boolean).join(" ");
    else if (out.length) break;
  }
  return out.filter((f) => f.answer);
}
