"use client";

import { useEffect } from "react";

/*
 * The old site's page behavior (its "Phase 1/4/5" scripts, same steps), run after React has
 * hydrated: header turns solid on scroll, phone menu toggle, hero slideshow (3 s crossfade), FAQ
 * accordion and the scroll-reveal animation. Everything degrades to visible, working content
 * without JS. (The city map is components/sections/AreaMap.tsx.)
 */
export function SiteScripts() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    /* Header: transparent over the hero, solid on scroll. */
    const header = document.querySelector<HTMLElement>(".wdp-header");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* Phone menu. */
    const toggle = document.querySelector<HTMLButtonElement>(".wdp-navtoggle");
    const nav = document.querySelector<HTMLElement>(".wdp-nav");
    if (toggle && nav) {
      const onToggle = () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      toggle.addEventListener("click", onToggle);
      cleanups.push(() => toggle.removeEventListener("click", onToggle));
    }

    /* Hero slideshow. */
    const hero = document.querySelector<HTMLElement>(".wdp-hero");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (hero) {
      const slides = Array.from(hero.querySelectorAll<HTMLElement>(".wdp-hero__slide"));
      const dots = Array.from(hero.querySelectorAll<HTMLButtonElement>(".wdp-hero__dot"));
      if (slides.length > 1 && !reduce) {
        let i = 0;
        let timer = 0;
        const show = (n: number) => {
          slides[i].setAttribute("data-active", "false");
          dots[i]?.setAttribute("aria-current", "false");
          i = (n + slides.length) % slides.length;
          slides[i].setAttribute("data-active", "true");
          dots[i]?.setAttribute("aria-current", "true");
        };
        const start = () => {
          timer = window.setInterval(() => show(i + 1), 3000);
        };
        const handlers = dots.map((d, x) => {
          const h = () => {
            window.clearInterval(timer);
            show(x);
            start();
          };
          d.addEventListener("click", h);
          return () => d.removeEventListener("click", h);
        });
        start();
        cleanups.push(() => {
          window.clearInterval(timer);
          handlers.forEach((h) => h());
        });
      }
    }

    /* FAQ accordion. */
    const qs = Array.from(document.querySelectorAll<HTMLButtonElement>(".wdp-qa__q"));
    const faqHandlers = qs.map((btn) => {
      const h = () => {
        const qa = btn.parentElement as HTMLElement;
        const panel = qa.querySelector<HTMLElement>(".wdp-qa__a");
        if (!panel) return;
        const open = qa.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.style.maxHeight = open ? `${panel.scrollHeight + 40}px` : "0px";
      };
      btn.addEventListener("click", h);
      return () => btn.removeEventListener("click", h);
    });
    cleanups.push(() => faqHandlers.forEach((h) => h()));

    /* Scroll-reveal (adds the classes in JS, so without JS everything shows). */
    if (!reduce && "IntersectionObserver" in window) {
      const selectors = [".wdp-section-head", ".wdp-benefit", ".wdp-help__grid > *", ".wdp-svc", ".wdp-project", ".wdp-rev", ".wdp-istep", ".wdp-insurance__lead", ".wdp-qa", ".wdp-area__grid > *"];
      const targets = Array.from(document.querySelectorAll<HTMLElement>(selectors.join(",")));
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      targets.forEach((el, idx) => {
        el.classList.add("wdp-reveal");
        el.style.transitionDelay = `${Math.min(idx % 4, 3) * 0.06}s`;
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
