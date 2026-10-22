import type { SiteSettings, TextPage } from "@/lib/types";

/* Site-wide content from the old site's header, trust strip and footer (word for word). */

export const fallbackSettings: SiteSettings = {
  name: "Water Damage Pro",
  tagline: "FAST · LOCAL · TRUSTED",
  phone: "(571) 210-2498",
  phoneHref: "tel:+15712102498",
  email: "waterdamageprous@gmail.com",
  street: "8858 Glenridge Ct",
  city: "Vienna",
  region: "VA",
  postalCode: "22182",
  // From the old site's LocalBusiness schema.
  latitude: 38.9012,
  longitude: -77.2653,
  hoursText: "Open 24/7 · 365 days",
  logo: { src: "/images/brand/logo-icon.png", alt: "Water Damage Pro logo", width: 123, height: 120 },
  logoFull: { src: "/images/brand/logo.png", alt: "Water Damage Pro logo", width: 195, height: 222 },
  menu: [
    { label: "Services", href: "/#services" },
    { label: "Locations", href: "/#locations" },
    { label: "Reviews", href: "/#reviews" },
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
  trustLabel: "As trusted & reviewed on",
  trustBadges: ["IICRC", "5.0 Google", "BBB A+", "Yelp", "Angi", "We Bill Insurance", "Licensed & Insured"],
  footer: {
    ctaHeading: "Need help right now?",
    ctaText: "Certified technicians dispatched fast — 24/7 across the DMV.",
    description: "The DMV’s fastest, most trusted water, fire & storm damage restoration team. Locally owned in Vienna, VA — certified, insured, and on call 24/7.",
    badges: ["IICRC Certified", "Licensed & Insured", "BBB A+", "★ 5.0 Google"],
    columns: [
      {
        heading: "Services",
        ariaLabel: "Services",
        links: [
          { label: "Water Damage", href: "/water-damage-restoration/" },
          { label: "Flood & Basement", href: "/water-extraction/" },
          { label: "Fire & Smoke", href: "/fire-damage-restoration/" },
          { label: "Storm Damage", href: "/storm-damage-restoration/" },
          { label: "Commercial", href: "/commercial-water-damage/" },
          { label: "24/7 Emergency", href: "/emergency-water-damage/" },
          { label: "Insurance Claims", href: "/insurance-claims/" },
        ],
      },
      {
        heading: "Northern VA",
        ariaLabel: "Northern Virginia service areas",
        links: [
          { label: "Vienna", href: "/vienna/" },
          { label: "McLean", href: "/mclean/" },
          { label: "Tysons", href: "/tysons/" },
          { label: "Fairfax", href: "/fairfax/" },
          { label: "Arlington", href: "/arlington/" },
          { label: "Alexandria", href: "/water-damage-restoration-alexandria-va/" },
          { label: "Reston", href: "/reston/" },
        ],
      },
      {
        heading: "DC · MD · WV",
        ariaLabel: "DC, Maryland and West Virginia service areas",
        links: [
          { label: "Washington DC", href: "/washington-dc/" },
          { label: "Bethesda", href: "/bethesda/" },
          { label: "Rockville", href: "/rockville/" },
          { label: "Frederick", href: "/frederick/" },
          { label: "Winchester", href: "/winchester/" },
          { label: "Fredericksburg", href: "/fredericksburg/" },
          { label: "Martinsburg", href: "/martinsburg/" },
        ],
      },
    ],
    companyHeading: "Company",
    companyLinks: [
      { label: "About", href: "/about/" },
      { label: "Reviews", href: "/#reviews" },
      { label: "Contact", href: "/contact/" },
    ],
    copyright: "© 2026 Water Damage Pro · Serving VA · DC · MD · WV",
    legalLinks: [
      { label: "Privacy", href: "/privacy/" },
      { label: "Sitemap", href: "/sitemap/" },
      { label: "Accessibility", href: "/accessibility/" },
    ],
  },
  // The old site's LocalBusiness areaServed list.
  areaServed: [
    "Vienna VA",
    "McLean VA",
    "Tysons VA",
    "Falls Church VA",
    "Fairfax VA",
    "Reston VA",
    "Arlington VA",
    "Alexandria VA",
    "Ashburn VA",
    "Leesburg VA",
    "Washington DC",
    "Bethesda MD",
    "Rockville MD",
    "Silver Spring MD",
    "Frederick MD",
    "Winchester VA",
    "Fredericksburg VA",
    "Martinsburg WV",
  ],
};

const placeholder = (k: string): TextPage["body"][number] => ({
  _type: "block",
  _key: k,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${k}s`, text: "[PLACEHOLDER]", marks: [] }],
});

/**
 * The footer linked to /privacy/ and /accessibility/, which never existed. The pages exist now
 * with [PLACEHOLDER] text; they stay noindex and out of the sitemap until the client sends the text.
 */
export const fallbackLegalPages: TextPage[] = [
  { slug: "privacy", title: "Privacy Policy", body: [placeholder("pp1")], seo: { title: "Privacy Policy - Water Damage Pro", description: "[PLACEHOLDER]", noIndex: true } },
  { slug: "accessibility", title: "Accessibility", body: [placeholder("ac1")], seo: { title: "Accessibility - Water Damage Pro", description: "[PLACEHOLDER]", noIndex: true } },
];
