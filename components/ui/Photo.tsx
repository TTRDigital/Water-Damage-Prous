import Image from "next/image";
import type { Img } from "@/lib/types";

/**
 * A content photo: WebP at the widths the browser needs (lib/image-loader.ts). Lazy by default;
 * the page's first large photo (the hero) is loaded eagerly with high fetch priority.
 */
export function Photo({ img, sizes, hero = false, className }: { img: Img; sizes: string; hero?: boolean; className?: string }) {
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
