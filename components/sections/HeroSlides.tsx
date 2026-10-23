"use client";

import { useEffect, useState } from "react";
import type { Img } from "@/lib/types";
import { Photo } from "@/components/ui/Photo";

/**
 * The home hero's rotating photos, with the old markup. The first photo is the page's main image;
 * the other two (hidden until the slideshow reaches them, 3 s and 6 s in) are added once the page
 * has loaded, so they never compete with it. The rotation is in components/layout/SiteScripts.tsx.
 */
export function HeroSlides({ slides }: { slides: (Img & { label: string })[] }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const on = () => setLoaded(true);
    if (document.readyState === "complete") on();
    else window.addEventListener("load", on, { once: true });
    return () => window.removeEventListener("load", on);
  }, []);
  return (
    <div className="wdp-hero__media" aria-hidden="true">
      {slides.map((sl, i) => (
        <div key={i} className="wdp-hero__slide" data-active={i === 0 ? "true" : "false"}>
          {i === 0 || loaded ? <Photo img={sl} sizes="100vw" hero={i === 0} /> : null}
        </div>
      ))}
    </div>
  );
}
