import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { LegacyShell } from "@/components/legacy/LegacyShell";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";

/** Category archives (/category/<slug>/), as on the old site (its other template): title, photo and excerpt of each post. */

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? pageMetadata(cat.seo, `/category/${slug}/`) : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cats, posts] = await Promise.all([getCategories(), getPosts()]);
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();
  const list = posts.filter((p) => p.category === slug);
  return (
    <LegacyShell bodyClass={`archive category category-${slug}${cat.wpId ? ` category-${cat.wpId}` : ""}`}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: cat.title, path: `/category/${slug}/` }])} />
      <main id="content" className="site-main">
        <div className="page-header">
          <h1 className="entry-title">
            Category: <span>{cat.title}</span>
          </h1>
        </div>
        <div className="page-content">
          {list.map((p, i) => (
            <article key={p.slug} className="post">
              <h2 className="entry-title">
                <a href={`/${p.slug}/`}>{p.title}</a>
              </h2>
              {p.image ? (
                <a href={`/${p.slug}/`}>
                  <Photo
                    img={i === 0 && p.image.picture ? { ...p.image, picture: { ...p.image.picture, fetchPriority: "high" } } : p.image}
                    sizes="(max-width: 800px) 100vw, 800px"
                    hero={i === 0}
                    className="attachment-large size-large wp-post-image"
                  />
                </a>
              ) : null}
              <p>{p.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
    </LegacyShell>
  );
}
