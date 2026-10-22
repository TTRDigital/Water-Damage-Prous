import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategories, getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { SiteShell } from "@/components/layout/SiteShell";
import { Article } from "@/components/pages/Article";
import { JsonLd } from "@/components/ui/JsonLd";

/** Category archives (/category/<slug>/), as on the old site: title, photo and excerpt of each post. */

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
    <SiteShell solid>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: cat.title, path: `/category/${slug}/` }])} />
      <Article
        title={
          <>
            Category: <span>{cat.title}</span>
          </>
        }
      >
        {list.map((p, i) => (
          <article key={p.slug} className="post">
            <h2 className="entry-title">
              <a href={`/${p.slug}/`}>{p.title}</a>
            </h2>
            {p.image ? (
              <a href={`/${p.slug}/`} tabIndex={-1} aria-hidden="true">
                <Image
                  className="wp-post-image"
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(max-width: 800px) 100vw, 800px"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
              </a>
            ) : null}
            <p>{p.excerpt}</p>
          </article>
        ))}
      </Article>
    </SiteShell>
  );
}
