import type { Metadata } from "next";
import { getCategories, getPages, getPosts, getTextPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { SiteShell } from "@/components/layout/SiteShell";
import { Article } from "@/components/pages/Article";
import { JsonLd } from "@/components/ui/JsonLd";

/** HTML sitemap (the footer's "Sitemap" link pointed at a page that did not exist). Links only. */

export const metadata: Metadata = pageMetadata({ title: "Sitemap - Water Damage Pro", description: "Sitemap: every page on the Water Damage Pro website." }, "/sitemap/");

export default async function SitemapPage() {
  const [pages, posts, cats, texts] = await Promise.all([getPages(), getPosts(), getCategories(), getTextPages()]);
  const group = (kind: string) => pages.filter((p) => p.kind === kind || (kind === "company" && p.kind === "home"));
  const alexandria = texts.find((t) => t.slug === "water-damage-restoration-alexandria-va");
  const link = (href: string, label: string) => (
    <li key={href}>
      <a href={href}>{label}</a>
    </li>
  );
  return (
    <SiteShell solid>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Sitemap", path: "/sitemap/" }])} />
      <Article title="Sitemap" className="wdp-sitemap">
        <h2>Pages</h2>
        <ul>{group("company").map((p) => link(p.slug ? `/${p.slug}/` : "/", p.slug ? p.name : "Home"))}</ul>
        <h2>Services</h2>
        <ul>{group("service").map((p) => link(`/${p.slug}/`, p.name))}</ul>
        <h2>Service Areas</h2>
        <ul>
          {group("location").map((p) => link(`/${p.slug}/`, p.name))}
          {alexandria ? link(`/${alexandria.slug}/`, "Alexandria, VA") : null}
        </ul>
        <h2>Water Damage Guides</h2>
        <ul>{posts.map((p) => link(`/${p.slug}/`, p.title))}</ul>
        <h2>Categories</h2>
        <ul>{cats.map((c) => link(`/category/${c.slug}/`, c.title))}</ul>
      </Article>
    </SiteShell>
  );
}
