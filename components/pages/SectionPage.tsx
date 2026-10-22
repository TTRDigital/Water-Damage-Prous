import type { Page } from "@/lib/types";
import { getSiteSettings } from "@/lib/content";
import { breadcrumbSchema, faqSchema, pageBreadcrumbs, pageFaqs } from "@/lib/schema";
import { SiteShell } from "@/components/layout/SiteShell";
import { Sections } from "@/components/sections/Sections";
import { JsonLd } from "@/components/ui/JsonLd";

/** A page built from sections (home, about, contact, services, service areas). */
export async function SectionPage({ page }: { page: Page }) {
  const settings = await getSiteSettings();
  const faqs = pageFaqs(page);
  const crumbs = pageBreadcrumbs(page);
  return (
    <SiteShell onHome={page.slug === ""}>
      {crumbs ? <JsonLd data={breadcrumbSchema(crumbs)} /> : null}
      {faqs.length ? <JsonLd data={faqSchema(faqs)} /> : null}
      <Sections sections={page.sections} settings={settings} trackPage={page.slug || "home"} />
    </SiteShell>
  );
}

/** The first photo of a page, for Open Graph. */
export function pageImage(page: Page) {
  for (const s of page.sections) {
    if (s._type === "homeHero" && s.slides[0]) return s.slides[0];
    if (s._type === "pageHero" && s.image) return s.image;
  }
  return undefined;
}
