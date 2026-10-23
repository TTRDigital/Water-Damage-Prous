/* Content types shared by lib/data (built-in content), lib/content.ts (Sanity) and the components. */

/**
 * The old site's own markup for a photo: a WebP <source> and the JPG <img> with its srcset, sizes
 * and loading hints, served from /images/uploads (the old media library files). Set on the
 * built-in photos; a photo replaced in Sanity has none and goes through next/image instead.
 */
export type Picture = { webp?: string; webpSizes?: string; srcset?: string; sizes?: string; loading?: "lazy" | "eager"; fetchPriority?: "high" | "low" | "auto"; decoding?: "async" | "sync" | "auto" };

export type Img = { src: string; alt: string; width: number; height: number; picture?: Picture };
export type Link = { label: string; href: string };
export type Seo = { title: string; description: string; noIndex?: boolean; image?: Img };

/** A button as the old site drew it: red (primary) or glass (ghost); the call button has the phone icon and the pulse. */
export type Button = Link & { style?: "primary" | "ghost"; pulse?: boolean; phoneIcon?: boolean };

/** Icon names from components/ui/Icon.tsx (the old site's inline SVGs). */
export type IconName = string;

/**
 * Inline text in headings and short fields: `*text*` is the accent span (red in headings),
 * a line break starts a new line. Paragraphs are plain strings.
 */
export type Rich = string;

type SectionBase = { _key?: string; anchor?: string; background?: "paper" };
type Head = { kicker?: string; heading?: Rich; intro?: Rich; headingHidden?: boolean };

export type HomeHeroSection = SectionBase & {
  _type: "homeHero";
  ariaLabel?: string;
  slides: (Img & { label: string })[];
  eyebrow: string;
  heading: Rich;
  lead: Rich;
  buttons: Button[];
  cardsLabel?: string;
  cards: { accent?: boolean; google?: boolean; stars?: boolean; big: string; sub: string }[];
};

export type PageHeroSection = SectionBase & {
  _type: "pageHero";
  variant: "default" | "commercial" | "contact";
  image?: Img;
  breadcrumb: { label: string; href?: string }[];
  heading: Rich;
  sub: Rich;
  buttons: Button[];
  ticks: string[];
};

export type ProofSection = SectionBase & { _type: "proof"; ariaLabel?: string; items: { mark?: "check" | "star"; value: string; label: string }[] };
export type TrustSection = SectionBase & { _type: "trust" };
export type BenefitsSection = SectionBase & { _type: "benefits"; ariaLabel?: string; items: { icon: IconName; title: string; text: string }[] };

export type HelpSection = SectionBase & {
  _type: "help";
  kicker?: string;
  heading: Rich;
  lead?: Rich;
  ticks: string[];
  form: {
    /** quick: name, phone, address, what happened. message: name, phone, email, address, message. */
    variant: "quick" | "message";
    ratingValue: string;
    ratingText: string;
    title: string;
    sub: string;
    button: string;
    safe: string;
    /** Label and placeholder of each field, as the old form showed them (labels are screen-reader only). */
    fields?: { name: string; label: string; placeholder: string }[];
  };
};

export type ServicesSection = SectionBase &
  Head & {
    _type: "services";
    items: { icon: IconName; title: string; text: Rich; href?: string; linkLabel?: string; more?: string }[];
  };

export type ProjectsSection = SectionBase &
  Head & {
    _type: "projects";
    items: { image: Img; badge: string; location: string; title: string; text: string; meta: string[] }[];
    button?: Button;
  };

export type InsuranceSection = SectionBase & {
  _type: "insurance";
  heading: Rich;
  lead: Rich;
  steps: { label: string; title: string; text: string }[];
  carriersLabel: string;
  carriers: string;
};

export type ReviewsSection = SectionBase & {
  _type: "reviews";
  heading: string;
  rating: string;
  sub: string;
  items: { text: string; initial: string; name: string; meta: string }[];
};

export type AreaMapSection = SectionBase & {
  _type: "areaMap";
  kicker?: string;
  heading: Rich;
  lead?: Rich;
  groups: { label: string; cities: string[] }[];
  mapTitle: string;
  stats: { value: string; label: string }[];
};

export type MapSection = SectionBase & Head & { _type: "map"; query: string; zoom: number; title: string; framed?: boolean };
export type CitiesSection = SectionBase & Head & { _type: "cities"; links: Link[] };
export type FaqSection = SectionBase & Head & { _type: "faq"; items: { question: string; answer: string }[] };

export type SplitSection = SectionBase & {
  _type: "split";
  variant: "default" | "team";
  kicker?: string;
  heading: Rich;
  paragraphs: Rich[];
  image: Img;
};

export type StatsSection = SectionBase & { _type: "stats"; ariaLabel?: string; items: { mark?: "accent" | "star"; value: string; label: string }[] };

export type CapacitySection = SectionBase & {
  _type: "capacity";
  image: Img;
  kicker?: string;
  heading: Rich;
  paragraphs: Rich[];
  stats: { value: string; label: string }[];
  button?: Button;
};

export type ContactMethodsSection = SectionBase & Head & { _type: "contactMethods"; items: { icon: IconName; title: string; value: string; href?: string; note: string }[] };
export type CausesSection = SectionBase & Head & { _type: "causes"; items: { icon: IconName; title: string; text?: string }[] };
export type StepsSection = SectionBase & Head & { _type: "steps"; columns?: number; items: { title: string; text: string }[] };
export type CoverageSection = SectionBase &
  Head & {
    _type: "coverage";
    cards: { tone: "yes" | "no"; title: string; items: string[] }[];
    note?: Rich;
  };

export type Section =
  | HomeHeroSection
  | PageHeroSection
  | ProofSection
  | TrustSection
  | BenefitsSection
  | HelpSection
  | ServicesSection
  | ProjectsSection
  | InsuranceSection
  | ReviewsSection
  | AreaMapSection
  | MapSection
  | CitiesSection
  | FaqSection
  | SplitSection
  | StatsSection
  | CapacitySection
  | ContactMethodsSection
  | CausesSection
  | StepsSection
  | CoverageSection;

/** Every page of the old site built from sections (home, about, contact, services, service areas). */
export type Page = {
  slug: string;
  kind: "home" | "company" | "service" | "location";
  /** Name used in breadcrumbs and the sitemap page. */
  name: string;
  order: number;
  sections: Section[];
  /** Footer links shown with another label on this page, as on the old site (e.g. the "Vienna" link labelled with the page's city). */
  footerLinkLabels?: Link[];
  seo: Seo;
};

/* ---------- Blog (Portable Text) ---------- */

export type PtSpan = { _type: "span"; _key: string; text: string; marks: string[] };
export type PtMarkDef = { _type: "link"; _key: string; href: string };
export type PtBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "h4" | "blockquote" | "small";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: PtMarkDef[];
  children: PtSpan[];
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image?: Img;
  body: PtBlock[];
  /** The post's own <style> block, printed at the top of the text as on the old site (the guide posts' article style). */
  css?: string;
  /** Shows the "Leave a Reply" form (comments were open on some of the old posts, closed on others). */
  comments?: boolean;
  /** WordPress post ID: the old page's post-<id> classes and the comment form's post ID. */
  wpId?: number;
  seo: Seo;
};

export type Category = { slug: string; title: string; wpId?: number; seo: Seo };

/** Plain page with Portable Text (the Alexandria page). */
export type TextPage = { slug: string; title: string; body: PtBlock[]; wpId?: number; seo: Seo };

/* ---------- Site settings ---------- */

export type FooterColumn = { heading: string; ariaLabel: string; links: Link[] };

export type SiteSettings = {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  hoursText: string;
  logo: Img;
  logoFull: Img;
  menu: Link[];
  trustLabel: string;
  trustBadges: string[];
  footer: {
    ctaHeading: string;
    ctaText: string;
    description: string;
    badges: string[];
    columns: FooterColumn[];
    companyHeading: string;
    companyLinks: Link[];
    copyright: string;
    legalLinks: Link[];
  };
  areaServed: string[];
};
