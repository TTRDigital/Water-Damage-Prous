"use client";

import { useEffect } from "react";

/*
 * Page behavior, run after React has hydrated: header turns solid on scroll, phone menu toggle,
 * hero slideshow (3 s crossfade), FAQ accordion and the motion below the first screen. Everything
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

    /* Swipe strips on phones (benefits, reviews) hold nothing focusable: make them reachable by keyboard. */
    document.querySelectorAll<HTMLElement>(".wdp-benefits__grid, .wdp-rev-grid").forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 4) el.tabIndex = 0;
    });

    /*
     * Motion, below the first screen only, and never on anything a visitor acts on: a form, a button,
     * a phone link or any link is on screen from the first frame (a panicking visitor never waits for
     * a call action). Without JS or with reduced motion everything is simply there.
     *  - reveal: text and cards rise in, one after another;
     *  - head: a section head's hairline draws, the heading wipes up, the intro follows;
     *  - photo: a photo is uncovered from the bottom while it settles from a slight zoom;
     *  - stage: decoration only (icons draw, timeline circles fill, lines grow) in a group that may hold links;
     *  - count: a number counts up to its own value, then the original text is put back.
     */
    if (!reduce && "IntersectionObserver" in window) {
      const fold = window.innerHeight;
      const actionable = (el: Element) =>
        el.matches("a, button, input, select, textarea, iframe, form") || !!el.querySelector("a, button, input, select, textarea, iframe, form") || !!el.closest("form");

      const countUp = (el: HTMLElement) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Text | null = null;
        while (walker.nextNode()) {
          if (/\d/.test((walker.currentNode as Text).data)) {
            node = walker.currentNode as Text;
            break;
          }
        }
        if (!node) return;
        const text = node.data;
        const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
        if (!m || m[3].startsWith("/") || m[1].endsWith("/")) return;
        const target = parseFloat(m[2].replace(/,/g, ""));
        if (!(target > 0) || (target >= 1900 && !m[2].includes(","))) return;
        const decimals = (m[2].split(".")[1] ?? "").length;
        const fmt = (v: number) => m[1] + (m[2].includes(",") ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals)) + m[3];
        el.style.minWidth = `${el.getBoundingClientRect().width}px`;
        const t0 = performance.now();
        const n = node;
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / 1700);
          n.data = p < 1 ? fmt(target * (1 - Math.pow(1 - p, 3))) : text;
          if (p < 1) requestAnimationFrame(step);
          else el.style.removeProperty("min-width");
        };
        n.data = fmt(0);
        requestAnimationFrame(step);
      };

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io.unobserve(el);
            el.classList.add("is-in");
            if (el.dataset.count !== undefined) countUp(el);
            if (el.classList.contains("wdp-reveal")) {
              // Once in, drop the reveal classes so hover effects use their own timing.
              const d = parseFloat(el.style.getPropertyValue("--d")) || 0;
              window.setTimeout(
                () => {
                  el.classList.remove("wdp-reveal", "wdp-reveal--head", "wdp-reveal--photo", "is-in");
                  el.style.removeProperty("--d");
                },
                2100 + d * 1000,
              );
            }
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );

      // Measure everything first, then write (adding classes between reads would force a layout per element).
      const jobs: { el: HTMLElement; cls?: string[]; d?: number; count?: boolean }[] = [];
      const pick = (selector: string, cls: string[], stagger: boolean, skipInside = "", decorOnly = false) => {
        const seen = new Map<Element | null, number>();
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          const r = el.getBoundingClientRect();
          // Below the first screen; not a card that starts off screen in a swipe strip; not inside a head or photo that reveals itself.
          if (r.top <= fold * 0.95 || r.left >= window.innerWidth || (!decorOnly && actionable(el)) || (skipInside && el.parentElement?.closest(skipInside))) return;
          const i = seen.get(el.parentElement) ?? 0;
          seen.set(el.parentElement, i + 1);
          jobs.push({ el, cls, d: stagger && i ? Math.min(i, 5) * 0.09 : 0 });
        });
      };
      pick(".wdp-section-head", ["wdp-reveal", "wdp-reveal--head"], false);
      pick(".wdp-project__img, .wdp-split__img, .wdp-capacity__media", ["wdp-reveal", "wdp-reveal--photo"], false);
      pick(
        [
          ".wdp-benefit, .wdp-rev, .wdp-istep, .wdp-step, .wdp-cause, .wdp-cstat, .wdp-abstat, .wdp-proof__item",
          ".wdp-cover2__head, .wdp-cover2__list li, .wdp-help__ticks li, .wdp-help .wdp-kicker, .wdp-help h2, .wdp-help__lead",
          ".wdp-project__body, .wdp-insurance h2, .wdp-insurance__lead, .wdp-insurance__carriers, .wdp-reviews__head",
          ".wdp-split__body > *, .wdp-capacity__body > :not(.wdp-capacity__stats), .wdp-area .wdp-kicker, .wdp-area h2, .wdp-area__lead, .wdp-footer__top h2",
        ].join(", "),
        ["wdp-reveal"],
        true,
        ".wdp-section-head, .wdp-project__img, .wdp-split__img, .wdp-capacity__media",
      );
      pick(".wdp-benefits__grid, .wdp-svc-grid, .wdp-causes, .wdp-cmethods, .wdp-steps, .wdp-insurance__steps", ["wdp-stage"], false, "", true);
      document.querySelectorAll<HTMLElement>(".wdp-proof__num, .wdp-abstat b, .wdp-cstat b, .wdp-reviews__big").forEach((el) => {
        if (el.getBoundingClientRect().top > fold * 0.95) jobs.push({ el, count: true });
      });
      for (const j of jobs) {
        if (j.cls) j.el.classList.add(...j.cls);
        if (j.d) j.el.style.setProperty("--d", `${j.d}s`);
        if (j.count) j.el.dataset.count = "";
        io.observe(j.el);
      }
      cleanups.push(() => io.disconnect());

      /* "Trusted & reviewed on": the badges glide past; the second copy is decoration (aria-hidden). */
      document.querySelectorAll<HTMLElement>(".wdp-trust__row").forEach((row) => {
        const badges = Array.from(row.querySelectorAll<HTMLElement>(":scope > .wdp-badge"));
        if (badges.length < 3) return;
        const track = document.createElement("div");
        track.className = "wdp-trust__track";
        const set = document.createElement("div");
        set.className = "wdp-trust__set";
        badges.forEach((b) => set.appendChild(b));
        const copy = set.cloneNode(true) as HTMLElement;
        copy.setAttribute("aria-hidden", "true");
        copy.dataset.design = "trust-marquee";
        track.append(set, copy);
        row.appendChild(track);
        row.classList.add("is-marquee");
      });

      /* Recent projects stack as you scroll: each panel settles back as the next one slides over it. */
      const stack = Array.from(document.querySelectorAll<HTMLElement>(".wdp-proj-grid > .wdp-project"));
      if (stack.length > 1) {
        let raf = 0;
        const update = () => {
          raf = 0;
          const rects = stack.map((el) => el.getBoundingClientRect());
          stack.forEach((el, i) => {
            const next = rects[i + 1];
            const p = next ? Math.min(1, Math.max(0, 1 - (next.top - rects[i].top) / rects[i].height)) : 0;
            el.style.setProperty("--stack", p.toFixed(3));
          });
        };
        const onScroll = () => {
          if (!raf) raf = requestAnimationFrame(update);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }
    }

    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
