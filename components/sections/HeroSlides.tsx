"use client";

import { useEffect, useState } from "react";
import type { Img } from "@/lib/types";
import { Photo } from "@/components/ui/Photo";

/**
 * The home hero's rotating photos. The first photo is the page's main image (loaded first, high
 * priority); the others are only added once the page has finished loading, so they never compete
 * with it. The rotation itself is in components/layout/SiteScripts.tsx.
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
