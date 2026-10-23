import type { Metadata } from "next";
import type { Img, Seo } from "@/lib/types";

const SITE_NAME = "Water Damage Pro";
const DEFAULT_IMAGE: Img = { src: "/images/uploads/2026/07/hero-flood-1448.jpg", alt: "A flooded suburban home surrounded by storm water", width: 1448, height: 1086 };

/** One place for title, description, canonical, Open Graph and Twitter tags. Titles are used as written (same as the old site). */
export function pageMetadata(seo: Seo, path: string, fallbackImage?: Img): Metadata {
  const image = seo.image ?? fallbackImage ?? DEFAULT_IMAGE;
  const og = { url: image.src, width: image.width, height: image.height, alt: image.alt };
  return {
    title: { absolute: seo.title },
    description: seo.description || undefined,
    alternates: { canonical: path },
    robots: seo.noIndex ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: path, title: seo.title, description: seo.description || undefined, images: [og] },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description || undefined, images: [image.src] },
  };
}
