import type { Img } from "@/lib/types";
import imageLoader from "@/lib/image-loader";
import { Photo } from "@/components/ui/Photo";

const attr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The markup <Photo> prints for a slide (the old <picture>, or a plain <img> sized by Sanity's CDN for a replaced photo), as HTML. */
function slideHtml(img: Img): string {
  const p = img.picture;
  if (!p) {
    const srcset = [640, 1080, 1440].map((w) => `${imageLoader({ src: img.src, width: w })} ${w}w`).join(", ");
    return `<img alt="${attr(img.alt)}" decoding="async" fetchpriority="low" width="${img.width}" height="${img.height}" sizes="100vw" srcset="${attr(srcset)}" src="${attr(imageLoader({ src: img.src, width: 1440 }))}">`;
  }
  const a = (k: string, v?: string | number) => (v === undefined || v === "" ? "" : ` ${k}="${attr(String(v))}"`);
  const el = `<img${a("alt", img.alt)}${a("decoding", p.decoding)}${a("fetchpriority", "low")}${a("height", img.height)}${a("loading", p.loading)}${a("sizes", p.sizes)}${a("src", img.src)}${a("srcset", p.srcset)}${a("width", img.width)}>`;
  return p.webp ? `<picture><source${a("sizes", p.webpSizes)}${a("srcset", p.webp)} type="image/webp">${el}</picture>` : el;
}

/**
 * The home hero's rotating photos, with the old markup. The first photo is the page's main image
 * (preloaded, high priority). The other two (hidden until the slideshow reaches them, 3 s and 6 s in)
 * are put in place by components/layout/SiteScripts.tsx once the page has loaded (from data-later),
 * so they never compete with the first one. No React on the client: the slideshow is in SiteScripts too.
 */
export function HeroSlides({ slides }: { slides: (Img & { label: string })[] }) {
  return (
    <div className="wdp-hero__media" aria-hidden="true">
      {slides.map((sl, i) =>
        i === 0 ? (
          <div key={i} className="wdp-hero__slide" data-active="true">
            <Photo img={sl} sizes="100vw" hero />
          </div>
        ) : (
          <div key={i} className="wdp-hero__slide" data-active="false" data-later={slideHtml(sl)} />
        ),
      )}
    </div>
  );
}
