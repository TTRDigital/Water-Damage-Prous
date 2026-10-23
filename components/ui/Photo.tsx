/* eslint-disable @next/next/no-img-element -- the old site's own <picture> markup, files served as they are */
import Image from "next/image";
import type { Img } from "@/lib/types";

/**
 * A content photo. Built-in photos print the old site's markup exactly (a WebP <source> and the
 * JPG <img> with its srcset, sizes and loading hints, files in /images/uploads). A photo replaced
 * in Sanity has no such markup and goes through next/image (Sanity's CDN sizes it); the page's
 * first large photo (the hero) is then loaded eagerly with high fetch priority.
 */
export function Photo({ img, sizes, hero = false, className }: { img: Img; sizes: string; hero?: boolean; className?: string }) {
  const p = img.picture;
  if (p) {
    const el = (
      <img
        alt={img.alt}
        className={className}
        decoding={p.decoding}
        fetchPriority={p.fetchPriority}
        height={img.height}
        loading={p.loading}
        sizes={p.sizes}
        src={img.src}
        srcSet={p.srcset}
        width={img.width}
      />
    );
    if (!p.webp) return el;
    return (
      <picture>
        <source sizes={p.webpSizes} srcSet={p.webp} type="image/webp" />
        {el}
      </picture>
    );
  }
  return (
    <Image
      src={img.src}
      alt={img.alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      className={className}
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : undefined}
      decoding="async"
    />
  );
}
