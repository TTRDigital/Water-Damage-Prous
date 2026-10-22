import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getPages, getPosts, getTextPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, postFaqs } from "@/lib/schema";
import { SectionPage, pageImage } from "@/components/pages/SectionPage";
import { Article } from "@/components/pages/Article";
import { SiteShell } from "@/components/layout/SiteShell";
import { PortableBody } from "@/components/ui/PortableBody";
import { JsonLd } from "@/components/ui/JsonLd";

/*
 * Every page at the root, as on the old site: section pages (about, contact, services, service
 * areas), blog posts (/<post>/) and plain text pages (the Alexandria page, privacy, accessibility).
 */

export const dynamicParams = false;

type Resolved =
  | { kind: "page"; page: Awaited<ReturnType<typeof getPages>>[number] }
  | { kind: "post"; post: Awaited<ReturnType<typeof getPosts>>[number] }
  | { kind: "text"; text: Awaited<ReturnType<typeof getTextPages>>[number] };

async function resolve(slug: string): Promise<Resolved | null> {
  const [pages, posts, texts] = await Promise.all([getPages(), getPosts(), getTextPages()]);
  const page = pages.find((p) => p.slug === slug && slug !== "");
  if (page) return { kind: "page", page };
  const post = posts.find((p) => p.slug === slug);
  if (post) return { kind: "post", post };
  const text = texts.find((t) => t.slug === slug);
  if (text) return { kind: "text", text };
  return null;
}

export async function generateStaticParams() {
  const [pages, posts, texts] = await Promise.all([getPages(), getPosts(), getTextPages()]);
  return [...pages.filter((p) => p.slug), ...posts, ...texts].map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) return {};
  const path = `/${slug}/`;
  if (r.kind === "page") return pageMetadata(r.page.seo, path, pageImage(r.page));
  if (r.kind === "post") {
    const m = pageMetadata(r.post.seo, path, r.post.image);
    return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: r.post.date } };
  }
  return pageMetadata(r.text.seo, path);
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) notFound();
  if (r.kind === "page") return <SectionPage page={r.page} />;

  if (r.kind === "post") {
    const { post } = r;
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === post.category);
    const faqs = postFaqs(post.body);
    return (
      <SiteShell solid>
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            ...(cat ? [{ name: cat.title, path: `/category/${cat.slug}/` }] : []),
            { name: post.title, path: `/${post.slug}/` },
          ])}
        />
        {faqs.length ? <JsonLd data={faqSchema(faqs)} /> : null}
        <Article title={post.title} className="post">
          <PortableBody blocks={post.body} />
        </Article>
      </SiteShell>
    );
  }

  const { text } = r;
  return (
    <SiteShell solid>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: text.title, path: `/${text.slug}/` }])} />
      <Article title={text.title}>
        <PortableBody blocks={text.body} />
      </Article>
    </SiteShell>
  );
}
