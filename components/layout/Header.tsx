import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { CallIcon } from "@/components/ui/Icon";

/**
 * The old site's header: transparent over the photo hero, solid once the page scrolls
 * (components/layout/SiteScripts.tsx). Pages without a dark hero get the solid header from the start.
 */
export function Header({ settings, onHome, solid }: { settings: SiteSettings; onHome: boolean; solid: boolean }) {
  // On the home page the menu's /#section links stay on the page (#section), as before.
  const href = (h: string) => (onHome && h.startsWith("/#") ? h.slice(1) : h);
  return (
    <header className={solid ? "wdp-header is-scrolled" : "wdp-header"} id="wdpHeader" data-solid={solid ? "" : undefined}>
      <div className="wdp-container wdp-container--wide wdp-header__in">
        <Link className="wdp-brand" href="/" prefetch={false}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logo, no preload */}
          <img className="wdp-brand__mark" src={settings.logo.src} alt={settings.logo.alt} width={41} height={40} decoding="async" />
          <span className="wdp-brand__name">
            {settings.name}
            <small>{settings.tagline}</small>
          </span>
        </Link>
        <nav className="wdp-nav" id="wdpNav" aria-label="Primary">
          <ul className="wdp-nav__list">
            {settings.menu.map((m) => (
              <li key={m.href}>
                <a className="wdp-nav__link" href={href(m.href)}>
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="wdp-header__spacer" />
        <a className="wdp-btn wdp-btn--primary wdp-header__call wdp-header__call--desktop" href={settings.phoneHref} data-track="click_to_call">
          <CallIcon />
          {settings.phone}
        </a>
        <button className="wdp-navtoggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="wdpNav">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
