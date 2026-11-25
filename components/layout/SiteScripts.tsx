"use client";

import { useEffect } from "react";

/*
 * Page behavior, run after React has hydrated: header turns solid on scroll, phone menu toggle,
 * hero slideshow (3 s crossfade), FAQ accordion and the scroll-reveal animation. Everything
 * degrades to visible, working content without JS. (The city map is components/sections/AreaMap.tsx.)
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
        header?.classList.toggle("is-menu-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      toggle.addEventListener("click", onToggle);
      cleanups.push(() => toggle.removeEventListener("click", onToggle));
    }

    /* Hero slideshow. Its 2nd and 3rd photos wait in data-later (components/sections/HeroSlides.tsx) until the page has loaded. */
    const later = () =>
      document.querySelectorAll<HTMLElement>(".wdp-hero__slide[data-later]").forEach((el) => {
        if (!el.firstChild) el.innerHTML = el.dataset.later ?? "";
      });
    if (document.readyState === "complete") later();
    else {
      window.addEventListener("load", later, { once: true });
      cleanups.push(() => window.removeEventListener("load", later));
    }
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

    /*
     * Scroll-reveal: photos, headings and cards that start below the first screen fade in.
     * Never anything a visitor needs to act on: a form, a button, a phone link or any link
     * (so a panicking visitor never waits for a call action). Without JS everything shows.
     */
    if (!reduce && "IntersectionObserver" in window) {
      const selectors = [".wdp-section-head", ".wdp-benefit", ".wdp-project__img", ".wdp-rev", ".wdp-istep", ".wdp-step", ".wdp-cause", ".wdp-split__img", ".wdp-capacity__media", ".wdp-insurance__lead"];
      const fold = window.innerHeight;
      const targets = Array.from(document.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
        (el) => el.getBoundingClientRect().top > fold && !el.querySelector("a, button, form, input, iframe") && !el.closest("form, .wdp-help"),
      );
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
      );
      targets.forEach((el, idx) => {
        el.classList.add("wdp-reveal");
        el.style.transitionDelay = `${Math.min(idx % 3, 2) * 0.07}s`;
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
