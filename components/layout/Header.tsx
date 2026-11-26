import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { CallIcon } from "@/components/ui/Icon";

/**
 * The header: transparent over the photo heroes, warm and solid once the page scrolls
 * (components/layout/SiteScripts.tsx). The call button stays in it on desktop; phones get the call bar.
 */
export function Header({ settings, onHome }: { settings: SiteSettings; onHome: boolean }) {
  // On the home page the menu's /#section links stay on the page (#section), as before.
  const href = (h: string) => (onHome && h.startsWith("/#") ? h.slice(1) : h);
  return (
    <header className="wdp-header" id="wdpHeader">
      <div className="wdp-container wdp-container--wide wdp-header__in">
        {/* No aria-label: the link is named by its visible text (the logo is decorative), so speech users can say what they see. */}
        <Link className="wdp-brand" href="/" prefetch={false}>
          {/* Low priority: React would otherwise preload this small logo at high priority, next to the hero photo. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logo, no preload */}
          <img className="wdp-brand__mark" src={settings.logo.src} alt={settings.logo.alt} width={41} height={40} decoding="async" fetchPriority="low" />
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
