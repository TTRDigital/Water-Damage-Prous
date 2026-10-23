import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getPages, getPosts, getTextPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, postFaqs } from "@/lib/schema";
import { SectionPage, pageImage } from "@/components/pages/SectionPage";
import { LegacyShell } from "@/components/legacy/LegacyShell";
import { CommentForm } from "@/components/legacy/CommentForm";
import { PortableBody } from "@/components/ui/PortableBody";
import { JsonLd } from "@/components/ui/JsonLd";

/*
 * Every page at the root, as on the old site: section pages (about, contact, services, service
 * areas), blog posts (/<post>/) and the Alexandria text page. Posts and the text page use the old
 * site's other template (components/legacy), as they did there.
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
    const id = post.wpId ? `post-${post.wpId} ` : "";
    return (
      <LegacyShell bodyClass={`wp-singular post-template-default single single-post${post.wpId ? ` postid-${post.wpId}` : ""} single-format-standard`}>
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            ...(cat ? [{ name: cat.title, path: `/category/${cat.slug}/` }] : []),
            { name: post.title, path: `/${post.slug}/` },
          ])}
        />
        {faqs.length ? <JsonLd data={faqSchema(faqs)} /> : null}
        <main id="content" className={`site-main ${id}post type-post status-publish format-standard${post.image ? " has-post-thumbnail" : ""} hentry category-${post.category}`}>
          <div className="page-header">
            <h1 className="entry-title">{post.title}</h1>
          </div>
          <div className="page-content">
            {post.css ? <style>{post.css}</style> : null}
            <PortableBody blocks={post.body} />
          </div>
          {post.comments ? <CommentForm slug={post.slug} postId={post.wpId} /> : null}
        </main>
      </LegacyShell>
    );
  }

  const { text } = r;
  return (
    <LegacyShell bodyClass={`wp-singular page-template-default page${text.wpId ? ` page-id-${text.wpId}` : ""}`}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: text.title, path: `/${text.slug}/` }])} />
      <main id="content" className={`site-main ${text.wpId ? `post-${text.wpId} ` : ""}page type-page status-publish${text.seo.image ? " has-post-thumbnail" : ""} hentry`}>
        <div className="page-header">
          <h1 className="entry-title">{text.title}</h1>
        </div>
        <div className="page-content">
          <PortableBody blocks={text.body} />
        </div>
      </main>
    </LegacyShell>
  );
}
