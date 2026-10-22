import { Fragment } from "react";
import type { SiteSettings } from "@/lib/types";
import { CallIcon, ClockIcon, PhoneOutlineIcon, PinIcon } from "@/components/ui/Icon";

/** The old site's footer: call band, brand + badges, link columns, contact, legal bar (Site settings). */
export function Footer({ settings: s }: { settings: SiteSettings }) {
  const f = s.footer;
  return (
    <footer className="wdp-footer" aria-labelledby="wdp-footer-cta">
      <div className="wdp-footer__top">
        <div className="wdp-container wdp-footer__top-in">
          <div>
            <h2 id="wdp-footer-cta">{f.ctaHeading}</h2>
            <p>{f.ctaText}</p>
          </div>
          <a className="wdp-btn wdp-btn--primary" href={s.phoneHref} data-track="click_to_call">
            <CallIcon />
            Call {s.phone}
          </a>
        </div>
      </div>
      <div className="wdp-container wdp-footer__cols">
        <div className="wdp-footer__brandcol">
          <div className="wdp-footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logo */}
            <img className="wdp-footer__mark" src={s.logo.src} alt={s.logo.alt} width={34} height={33} loading="lazy" decoding="async" />
            {s.name}
          </div>
          <p className="wdp-footer__desc">{f.description}</p>
          <div className="wdp-footer__badges">
            {f.badges.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
        {f.columns.map((c) => (
          <nav key={c.heading} className="wdp-footer__col" aria-label={c.ariaLabel}>
            <h3>{c.heading}</h3>
            {c.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        ))}
        <div className="wdp-footer__col">
          <h3>{f.companyHeading}</h3>
          <address className="wdp-footer__contact">
            <span>
              <PinIcon /> {s.street}, {s.city}, {s.region} {s.postalCode}
            </span>
            <a href={s.phoneHref} data-track="click_to_call">
              <PhoneOutlineIcon /> {s.phone}
            </a>
            <span>
              <ClockIcon /> {s.hoursText}
            </span>
          </address>
          <div className="wdp-footer__links2">
            {f.companyLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="wdp-footer__bar">
        <div className="wdp-container wdp-footer__bar-in">
          <span>{f.copyright}</span>
          <span>
            {f.legalLinks.map((l, i) => (
              <Fragment key={l.href}>
                {i ? " · " : null}
                <a href={l.href}>{l.label}</a>
              </Fragment>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
