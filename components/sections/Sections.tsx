import type { CSSProperties, ReactNode } from "react";
import type {
  AreaMapSection,
  BenefitsSection,
  Button,
  CapacitySection,
  CausesSection,
  CitiesSection,
  ContactMethodsSection,
  CoverageSection,
  FaqSection,
  HelpSection,
  HomeHeroSection,
  InsuranceSection,
  MapSection,
  PageHeroSection,
  ProjectsSection,
  ProofSection,
  ReviewsSection,
  Section,
  ServicesSection,
  SiteSettings,
  SplitSection,
  StatsSection,
  StepsSection,
} from "@/lib/types";
import { Rich } from "@/components/ui/Rich";
import { Photo } from "@/components/ui/Photo";
import { CallIcon, CheckIcon, Icon, LockIcon, PinIcon, ShieldIcon, XIcon } from "@/components/ui/Icon";
import { LeadForm } from "@/components/forms/LeadForm";
import { AreaMap } from "@/components/sections/AreaMap";
import { HeroSlides } from "@/components/sections/HeroSlides";
import { mapEmbedUrl } from "@/lib/maps";

/*
 * The old site's sections, with the same markup and class names, so its stylesheet
 * (app/styles/wdp.css) draws them exactly as before. Behavior (slideshow, FAQ, reveal,
 * header) is in components/layout/SiteScripts.tsx, as on the old site.
 */

type Ctx = { index: number; settings: SiteSettings; trackPage: string };

const paper = (s: { background?: "paper" }): CSSProperties | undefined => (s.background === "paper" ? { background: "var(--wdp-paper)" } : undefined);

function Btn({ b, style }: { b: Button; style?: CSSProperties }) {
  const cls = ["wdp-btn", b.style === "ghost" ? "wdp-btn--ghost" : "wdp-btn--primary", b.pulse ? "wdp-pulse" : ""].filter(Boolean).join(" ");
  return (
    <a className={cls} href={b.href} style={style} data-track={b.href.startsWith("tel:") ? "click_to_call" : undefined}>
      {b.phoneIcon ? <CallIcon /> : null}
      {b.label}
    </a>
  );
}

function Head({ s, id }: { s: { kicker?: string; heading?: string; intro?: string; headingHidden?: boolean }; id: string }) {
  if (s.headingHidden)
    return (
      <h2 className="wdp-sr-only" id={id}>
        <Rich text={s.heading} />
      </h2>
    );
  return (
    <div className="wdp-section-head">
      {s.kicker ? <p className="wdp-kicker">{s.kicker}</p> : null}
      {s.heading ? (
        <h2 id={id}>
          <Rich text={s.heading} />
        </h2>
      ) : null}
      {s.intro ? (
        <p>
          <Rich text={s.intro} />
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Heroes ---------- */

function HomeHero({ s }: { s: HomeHeroSection }) {
  return (
    <section className="wdp-hero" aria-label={s.ariaLabel}>
      <HeroSlides slides={s.slides} />
      <div className="wdp-hero__scrim" />
      <div className="wdp-container wdp-container--wide wdp-hero__inner">
        <div className="wdp-hero__content">
          <p className="wdp-hero__eyebrow">{s.eyebrow}</p>
          <h1 className="wdp-hero__title">
            <Rich text={s.heading} />
          </h1>
          <p className="wdp-hero__lead">
            <Rich text={s.lead} />
          </p>
          <div className="wdp-hero__cta">
            {s.buttons.map((b, i) => (
              <Btn key={i} b={b} />
            ))}
          </div>
        </div>
        <aside className="wdp-hero__cards" aria-label={s.cardsLabel}>
          {s.cards.map((c, i) => (
            <div key={i} className={c.accent ? "wdp-stat wdp-stat--accent" : "wdp-stat"}>
              <div className="wdp-stat__big">
                {c.google ? <span className="g">G</span> : null}
                {c.big}
                {c.stars ? (
                  <span className="stars" aria-hidden="true">
                    ★★★★★
                  </span>
                ) : null}
              </div>
              <div className="wdp-stat__sub">{c.sub}</div>
            </div>
          ))}
        </aside>
      </div>
      {s.slides.length > 1 ? (
        <div className="wdp-hero__dots" role="tablist" aria-label="Choose hero image">
          {s.slides.map((sl, i) => (
            <button key={i} type="button" className="wdp-hero__dot" role="tab" aria-label={sl.label} aria-current={i === 0 ? "true" : "false"} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PageHero({ s, ctx }: { s: PageHeroSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h1`;
  const cls = ["wdp-phero", s.variant !== "default" ? `wdp-phero--${s.variant}` : ""].filter(Boolean).join(" ");
  const crumbs: ReactNode[] = [];
  s.breadcrumb.forEach((c, i) => {
    if (i) crumbs.push(" › ");
    crumbs.push(
      c.href ? (
        <a key={i} href={c.href}>
          {c.label}
        </a>
      ) : (
        <span key={i} aria-current="page">
          {c.label}
        </span>
      ),
    );
  });
  return (
    <section className={cls} aria-labelledby={id}>
      {s.image && s.variant !== "contact" ? (
        <div className="wdp-phero__img" aria-hidden="true">
          <Photo img={s.image} sizes="100vw" hero />
        </div>
      ) : null}
      <div className="wdp-phero__scrim" />
      <div className="wdp-container wdp-phero__in">
        <nav className="wdp-breadcrumb" aria-label="Breadcrumb">
          {crumbs}
        </nav>
        <h1 id={id}>
          <Rich text={s.heading} />
        </h1>
        <p className="wdp-phero__sub">
          <Rich text={s.sub} />
        </p>
        <div className="wdp-phero__cta">
          {s.buttons.map((b, i) => (
            <Btn key={i} b={b} />
          ))}
        </div>
        {s.ticks.length ? (
          <div className="wdp-phero__ticks">
            {s.ticks.map((t, i) => (
              <span key={i}>
                <CheckIcon /> {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Strips ---------- */

function Proof({ s }: { s: ProofSection }) {
  return (
    <section className="wdp-proof" aria-label={s.ariaLabel}>
      <div className="wdp-container wdp-proof__row">
        {s.items.map((it, i) => (
          <div key={i} className="wdp-proof__item">
            <div className="wdp-proof__num">
              {it.mark === "check" ? <span className="accent">✓</span> : it.mark === "star" ? <span className="star">★</span> : null}
              {it.value}
            </div>
            <div className="wdp-proof__lab">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The site-wide "As trusted & reviewed on" strip (Site settings). */
export function Trust({ settings }: { settings: SiteSettings }) {
  const badge = (b: string, i: number) => {
    if (/^5\.0 Google$/i.test(b))
      return (
        <span key={i} className="wdp-badge">
          <span className="g">G</span>
          <span className="star" aria-hidden="true">
            ★
          </span>
          {b}
        </span>
      );
    if (/^yelp$/i.test(b))
      return (
        <span key={i} className="wdp-badge">
          <span className="yelp">{b}</span>
        </span>
      );
    if (/^(IICRC|We Bill Insurance)$/i.test(b))
      return (
        <span key={i} className="wdp-badge">
          <ShieldIcon /> {b}
        </span>
      );
    if (/licensed/i.test(b))
      return (
        <span key={i} className="wdp-badge">
          <CheckIcon /> {b}
        </span>
      );
    return (
      <span key={i} className="wdp-badge">
        {b}
      </span>
    );
  };
  return (
    <section className="wdp-trust" aria-label="Certifications and reviews">
      <div className="wdp-container wdp-trust__row">
        <span className="wdp-trust__label">{settings.trustLabel}</span>
        {settings.trustBadges.map(badge)}
      </div>
    </section>
  );
}

function Benefits({ s }: { s: BenefitsSection }) {
  return (
    <section className="wdp-benefits" aria-label={s.ariaLabel}>
      <div className="wdp-container wdp-benefits__grid">
        {s.items.map((it, i) => (
          <div key={i} className="wdp-benefit">
            <span className="wdp-benefit__ico" aria-hidden="true">
              <Icon name={it.icon} />
            </span>
            <div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats({ s }: { s: StatsSection }) {
  return (
    <section className="wdp-abstats" aria-label={s.ariaLabel}>
      <div className="wdp-container wdp-abstats__grid">
        {s.items.map((it, i) => (
          <div key={i} className="wdp-abstat">
            <b>
              {it.mark === "accent" ? <span className="accent">{it.value}</span> : null}
              {it.mark === "star" ? (
                <>
                  <span className="star">★</span>
                  {it.value}
                </>
              ) : null}
              {!it.mark ? it.value : null}
            </b>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Form ---------- */

function Help({ s, ctx }: { s: HelpSection; ctx: Ctx }) {
  return (
    <section className="wdp-help" id={s.anchor ?? "help"} aria-labelledby="wdp-help-heading">
      <div className="wdp-container wdp-help__grid">
        <div>
          {s.kicker ? <p className="wdp-kicker">{s.kicker}</p> : null}
          <h2 id="wdp-help-heading">
            <Rich text={s.heading} />
          </h2>
          {s.lead ? (
            <p className="wdp-help__lead">
              <Rich text={s.lead} />
            </p>
          ) : null}
          <ul className="wdp-help__ticks">
            {s.ticks.map((t, i) => (
              <li key={i}>
                <CheckIcon /> {t}
              </li>
            ))}
          </ul>
        </div>
        <LeadForm form={s.form} businessName={ctx.settings.name} phone={ctx.settings.phone} phoneHref={ctx.settings.phoneHref} trackPage={ctx.trackPage} lockIcon={<LockIcon />} />
      </div>
    </section>
  );
}

/* ---------- Grids ---------- */

function Services({ s, ctx }: { s: ServicesSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-services wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-svc-grid">
          {s.items.map((it, i) => (
            <article key={i} className="wdp-svc">
              <span className="wdp-svc__ico" aria-hidden="true">
                <Icon name={it.icon} />
              </span>
              <h3>{it.title}</h3>
              <p>
                <Rich text={it.text} />
              </p>
              {it.more ? (
                <span className="wdp-svc__more" aria-hidden="true">
                  {it.more}
                </span>
              ) : null}
              {it.href ? (
                <a className="wdp-svc__link" href={it.href}>
                  <span>{it.linkLabel ?? it.title}</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects({ s, ctx }: { s: ProjectsSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-projects wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-proj-grid">
          {s.items.map((it, i) => (
            <article key={i} className="wdp-project">
              <div className="wdp-project__img">
                <Photo img={it.image} sizes="(max-width:820px) 100vw, 33vw" />
                <span className="wdp-project__badge">{it.badge}</span>
                <span className="wdp-project__loc">
                  <PinIcon /> {it.location}
                </span>
              </div>
              <div className="wdp-project__body">
                <h3>{it.title}</h3>
                <p>{it.text}</p>
                <div className="wdp-project__meta">
                  {it.meta.map((m, j) => (
                    <span key={j}>{m}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        {s.button ? (
          <div className="wdp-center">
            <Btn b={{ ...s.button, style: "ghost" }} style={{ color: "var(--wdp-ink)", borderColor: "var(--wdp-line)", background: "#fff" }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Causes({ s, ctx }: { s: CausesSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-causes">
          {s.items.map((it, i) => (
            <div key={i} className="wdp-cause">
              <span className="wdp-cause__ico" aria-hidden="true">
                <Icon name={it.icon} />
              </span>
              <b>{it.title}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ s, ctx }: { s: StepsSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className={s.columns === 4 ? "wdp-steps wdp-steps--4" : "wdp-steps"}>
          {s.items.map((it, i) => (
            <div key={i} className="wdp-step">
              <div className="wdp-step__n">{i + 1}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactMethods({ s, ctx }: { s: ContactMethodsSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-cmethods">
          {s.items.map((it, i) => (
            <div key={i} className="wdp-cmethod">
              <span className="wdp-cmethod__ico" aria-hidden="true">
                <Icon name={it.icon} />
              </span>
              <h3>{it.title}</h3>
              {it.href ? (
                <a href={it.href} data-track={it.href.startsWith("tel:") ? "click_to_call" : undefined}>
                  {it.value}
                </a>
              ) : (
                <p>{it.value}</p>
              )}
              <small>{it.note}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coverage({ s, ctx }: { s: CoverageSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-cover2">
          {s.cards.map((c, i) => (
            <div key={i} className={`wdp-cover2__card wdp-cover2__card--${c.tone}`}>
              <div className="wdp-cover2__head">
                <span className="wdp-cover2__ico" aria-hidden="true">
                  {c.tone === "yes" ? <CheckIcon /> : <XIcon />}
                </span>
                <h3>{c.title}</h3>
              </div>
              <ul className="wdp-cover2__list">
                {c.items.map((t, j) => (
                  <li key={j}>
                    {c.tone === "yes" ? <CheckIcon /> : <XIcon />} {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {s.note ? (
          <p className="wdp-cover2__note">
            <Rich text={s.note} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Bands ---------- */

function Insurance({ s, ctx }: { s: InsuranceSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-insurance" id={s.anchor} aria-labelledby={id}>
      <div className="wdp-container wdp-insurance__in">
        <h2 id={id}>
          <Rich text={s.heading} />
        </h2>
        <p className="wdp-insurance__lead">
          <Rich text={s.lead} />
        </p>
        <div className="wdp-insurance__steps">
          {s.steps.map((st, i) => (
            <div key={i} className="wdp-istep">
              <p className="wdp-istep__n">{st.label}</p>
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </div>
          ))}
        </div>
        <p className="wdp-insurance__carriers">
          <strong>{s.carriersLabel}</strong> {s.carriers}
        </p>
      </div>
    </section>
  );
}

function Reviews({ s }: { s: ReviewsSection }) {
  return (
    <section className="wdp-reviews wdp-section" id={s.anchor ?? "reviews"} aria-labelledby="wdp-reviews-heading">
      <div className="wdp-container">
        <h2 className="wdp-sr-only" id="wdp-reviews-heading">
          {s.heading}
        </h2>
        <div className="wdp-reviews__head">
          <span className="wdp-reviews__big">{s.rating}</span>
          <span>
            <span className="wdp-reviews__stars" aria-hidden="true">
              ★★★★★
            </span>
            <span className="wdp-reviews__sub" style={{ display: "block" }}>
              {s.sub}
            </span>
          </span>
        </div>
        <div className="wdp-rev-grid">
          {s.items.map((r, i) => (
            <article key={i} className="wdp-rev">
              <div className="wdp-rev__stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p>{r.text}</p>
              <div className="wdp-rev__who">
                <span className="wdp-rev__av" aria-hidden="true">
                  {r.initial}
                </span>
                <span>
                  <b>{r.name}</b>
                  <span>{r.meta}</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Split({ s, ctx }: { s: SplitSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  const team = s.variant === "team";
  return (
    <section className={team ? "wdp-split wdp-section wdp-about-team" : "wdp-split wdp-section"} id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container wdp-split__grid">
        <div className="wdp-split__body">
          {s.kicker ? <p className="wdp-kicker">{s.kicker}</p> : null}
          <h2 id={id}>
            <Rich text={s.heading} />
          </h2>
          {s.paragraphs.map((p, i) => (
            <p key={i}>
              <Rich text={p} />
            </p>
          ))}
        </div>
        <div className="wdp-split__img">
          <Photo img={s.image} sizes={team ? "(max-width:820px) 100vw, 480px" : "(max-width:820px) 100vw, 45vw"} />
        </div>
      </div>
    </section>
  );
}

function Capacity({ s, ctx }: { s: CapacitySection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-capacity" id={s.anchor} aria-labelledby={id}>
      <div className="wdp-container">
        <div className="wdp-capacity__grid">
          <div className="wdp-capacity__media">
            <Photo img={s.image} sizes="(max-width:860px) 100vw, 48vw" />
          </div>
          <div className="wdp-capacity__body">
            {s.kicker ? <p className="wdp-kicker wdp-kicker--light">{s.kicker}</p> : null}
            <h2 id={id}>
              <Rich text={s.heading} />
            </h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>
                <Rich text={p} />
              </p>
            ))}
            <div className="wdp-capacity__stats">
              {s.stats.map((st, i) => (
                <div key={i} className="wdp-cstat">
                  <b>{st.value}</b>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
            {s.button ? <Btn b={s.button} style={{ marginTop: 22 }} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Maps, links, FAQ ---------- */

function MapBlock({ s, ctx }: { s: MapSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  const src = mapEmbedUrl(s.query, s.zoom);
  return (
    <section className={s.framed ? "wdp-area wdp-section" : "wdp-section"} id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        {s.framed ? (
          <div className="wdp-cmap" style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--wdp-line)" }}>
            <iframe title={s.title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ display: "block", width: "100%", height: 400, border: 0 }} src={src} />
          </div>
        ) : (
          <div className="wdp-cmap">
            <iframe title={s.title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={src} />
          </div>
        )}
      </div>
    </section>
  );
}

function Cities({ s, ctx }: { s: CitiesSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-cities wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-cities__grid">
          {s.links.map((l, i) => (
            <a key={i} href={l.href}>
              <PinIcon /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ s, ctx }: { s: FaqSection; ctx: Ctx }) {
  const id = `s${ctx.index}-h`;
  return (
    <section className="wdp-faqwrap wdp-section" id={s.anchor} aria-labelledby={id} style={paper(s)}>
      <div className="wdp-container">
        <Head s={s} id={id} />
        <div className="wdp-faq">
          {s.items.map((q, i) => (
            <div key={i} className="wdp-qa">
              <button type="button" className="wdp-qa__q" aria-expanded="false" aria-controls={`${id}-a${i}`}>
                {q.question} <span className="pl" aria-hidden="true">+</span>
              </button>
              <div className="wdp-qa__a" id={`${id}-a${i}`} role="region">
                <div>{q.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AreaMapBlock({ s }: { s: AreaMapSection }) {
  return <AreaMap s={s} />;
}

/* ---------- Renderer ---------- */

export function Sections({ sections, settings, trackPage }: { sections: Section[]; settings: SiteSettings; trackPage: string }) {
  return (
    <>
      {sections.map((s, index) => {
        const ctx: Ctx = { index, settings, trackPage };
        const key = s._key ?? `${s._type}-${index}`;
        switch (s._type) {
          case "homeHero":
            return <HomeHero key={key} s={s} />;
          case "pageHero":
            return <PageHero key={key} s={s} ctx={ctx} />;
          case "proof":
            return <Proof key={key} s={s} />;
          case "trust":
            return <Trust key={key} settings={settings} />;
          case "benefits":
            return <Benefits key={key} s={s} />;
          case "help":
            return <Help key={key} s={s} ctx={ctx} />;
          case "services":
            return <Services key={key} s={s} ctx={ctx} />;
          case "projects":
            return <Projects key={key} s={s} ctx={ctx} />;
          case "insurance":
            return <Insurance key={key} s={s} ctx={ctx} />;
          case "reviews":
            return <Reviews key={key} s={s} />;
          case "areaMap":
            return <AreaMapBlock key={key} s={s} />;
          case "map":
            return <MapBlock key={key} s={s} ctx={ctx} />;
          case "cities":
            return <Cities key={key} s={s} ctx={ctx} />;
          case "faq":
            return <Faq key={key} s={s} ctx={ctx} />;
          case "split":
            return <Split key={key} s={s} ctx={ctx} />;
          case "stats":
            return <Stats key={key} s={s} />;
          case "capacity":
            return <Capacity key={key} s={s} ctx={ctx} />;
          case "contactMethods":
            return <ContactMethods key={key} s={s} ctx={ctx} />;
          case "causes":
            return <Causes key={key} s={s} ctx={ctx} />;
          case "steps":
            return <Steps key={key} s={s} ctx={ctx} />;
          case "coverage":
            return <Coverage key={key} s={s} ctx={ctx} />;
          default:
            return null;
        }
      })}
    </>
  );
}
