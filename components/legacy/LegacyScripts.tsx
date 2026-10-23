"use client";

import { useEffect } from "react";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/lead-options";

const COMMENTER_KEY = "wdp_commenter";

/*
 * The old template's behavior, without jQuery:
 * - the ElementsKit menu (elementskit-lite nav-menu.js): the hamburger opens and closes the
 *   off-canvas menu; on phones the arrow next to "Services" / "Areas" opens the submenu (the
 *   label itself is a link); on desktop the submenus open on hover (CSS), aria-expanded follows;
 * - the "Leave a Reply" form: sent to /api/lead.php without leaving the page; "Save my name…"
 *   keeps name, email and website in this browser, as WordPress's cookies did.
 */
export function LegacyScripts() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof DocumentEventMap>(type: K, fn: (e: DocumentEventMap[K]) => void) => {
      document.addEventListener(type, fn);
      cleanups.push(() => document.removeEventListener(type, fn));
    };

    /* Menu */
    on("click", (e) => {
      const target = e.target as HTMLElement;
      const toggler = target.closest<HTMLElement>(".elementskit-menu-toggler");
      if (toggler) {
        e.preventDefault();
        const scope = toggler.closest(".elementskit-menu-container")?.parentElement ?? toggler.parentElement;
        const panels = Array.from(scope?.querySelectorAll(".elementskit-menu-offcanvas-elements") ?? []);
        const open = !panels[0]?.classList.contains("active");
        panels.forEach((p) => p.classList.toggle("active", open));
        scope?.querySelector(".elementskit-menu-hamburger")?.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      const link = target.closest<HTMLAnchorElement>(".elementskit-dropdown-has > a");
      if (link) {
        const nav = link.closest(".elementskit-navbar-nav");
        // "submenu-click-on-icon": only the arrow opens the submenu; the label stays a link.
        if (nav?.classList.contains("submenu-click-on-icon") && !target.classList.contains("elementskit-submenu-indicator")) return;
        e.preventDefault();
        const panel = link.parentElement?.querySelector(":scope > .elementskit-dropdown, :scope > .elementskit-megamenu-panel");
        if (!panel) return;
        panel.querySelectorAll(".elementskit-dropdown-open").forEach((x) => x.classList.remove("elementskit-dropdown-open"));
        const open = panel.classList.toggle("elementskit-dropdown-open");
        link.setAttribute("aria-expanded", open ? "true" : "false");
      }
    });
    const desktop = window.matchMedia("(min-width: 1025px)");
    document.querySelectorAll<HTMLElement>(".elementskit-navbar-nav > .elementskit-dropdown-has").forEach((li) => {
      const a = li.querySelector(":scope > a");
      const enter = () => desktop.matches && a?.setAttribute("aria-expanded", "true");
      const leave = () => desktop.matches && a?.setAttribute("aria-expanded", "false");
      li.addEventListener("mouseenter", enter);
      li.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        li.removeEventListener("mouseenter", enter);
        li.removeEventListener("mouseleave", leave);
      });
    });

    /* "Leave a Reply" */
    const form = document.querySelector<HTMLFormElement>("#commentform");
    if (form) {
      const startedAt = Date.now();
      const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      const remember = field("wp-comment-cookies-consent") as HTMLInputElement | null;
      try {
        const saved = JSON.parse(localStorage.getItem(COMMENTER_KEY) || "null") as Record<string, string> | null;
        if (saved) {
          for (const k of ["author", "email", "url"]) {
            const el = field(k);
            if (el && saved[k]) el.value = saved[k];
          }
          if (remember) remember.checked = true;
        }
      } catch {
        /* storage unavailable */
      }
      const note = (cls: string, text: string) => {
        form.parentElement?.querySelectorAll(".comment-awaiting-moderation, .comment-error").forEach((x) => x.remove());
        const p = document.createElement("p");
        p.className = cls;
        p.setAttribute("role", "status");
        p.textContent = text;
        form.before(p);
      };
      if (new URLSearchParams(window.location.search).get("sent") === "1") note("comment-awaiting-moderation", "Your comment is awaiting moderation.");

      const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const submit = form.querySelector<HTMLInputElement>("#submit");
        const value = (k: string) => field(k)?.value.trim() ?? "";
        try {
          if (remember?.checked) localStorage.setItem(COMMENTER_KEY, JSON.stringify({ author: value("author"), email: value("email"), url: value("url") }));
          else localStorage.removeItem(COMMENTER_KEY);
        } catch {
          /* storage unavailable */
        }
        let attribution: Record<string, string> = {};
        try {
          attribution = JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "{}");
        } catch {
          /* storage unavailable */
        }
        if (submit) submit.disabled = true;
        try {
          const res = await fetch("/api/lead.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form: "comment",
              name: value("author"),
              email: value("email"),
              website: value("url"),
              message: value("comment"),
              elapsed_ms: Date.now() - startedAt,
              page_url: window.location.href,
              ...attribution,
            }),
          });
          const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
          if (!res.ok || !data.ok) throw new Error(data.error || "Your comment could not be sent.");
          const text = field("comment");
          if (text) text.value = "";
          note("comment-awaiting-moderation", "Your comment is awaiting moderation.");
        } catch (err) {
          note("comment-error", err instanceof Error ? err.message : "Your comment could not be sent.");
        } finally {
          if (submit) submit.disabled = false;
        }
      };
      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
