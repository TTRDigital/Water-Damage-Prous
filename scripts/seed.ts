/**
 * Loads the built-in content (lib/data) and its photos into Sanity, so the CMS starts full
 * instead of empty.
 *
 *   npm run seed                 # create documents that don't exist yet (add-missing)
 *   npm run seed -- --force      # overwrite everything with the built-in content
 *   npm run seed -- --dry-run    # build every document without uploading or writing
 *   npm run seed -- --only=page-vienna,post-   # only documents whose ID starts with these
 *
 * Writes to the project in sanity/env.ts (NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET override it,
 * from the environment or .env.local). Needs SANITY_WRITE_TOKEN (Editor token). Without --force,
 * anything an editor already changed is kept.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import type { Img, Page, Section } from "../lib/types";
import { fallbackSettings } from "../lib/data/site.ts";
import { fallbackPages } from "../lib/data/pages.ts";
import { fallbackCategories, fallbackPosts, fallbackTextPages } from "../lib/data/posts.ts";

const root = new URL("..", import.meta.url).pathname;

// Minimal .env.local reader so the script works without extra packages.
if (existsSync(join(root, ".env.local"))) {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Imported after .env.local is loaded so its values apply.
const { dataset, projectId } = await import("../sanity/env.ts");
const token = process.env.SANITY_WRITE_TOKEN;
const force = process.argv.includes("--force");
// --export=file.json: dry run that also writes the documents (for testing the site against a local GROQ mock).
const exportFile = process.argv.find((a) => a.startsWith("--export="))?.slice(9);
const dryRun = process.argv.includes("--dry-run") || !!exportFile;
const only = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "").split(",").map((x) => x.trim()).filter(Boolean);

if (!dryRun && (!projectId || !token)) {
  console.error(!projectId ? "Set the Sanity project ID (sanity/env.ts or NEXT_PUBLIC_SANITY_PROJECT_ID)." : "Set SANITY_WRITE_TOKEN (Editor token from sanity.io/manage > API > Tokens).");
  process.exit(1);
}

const client = createClient({ projectId: projectId || "dry-run", dataset, token, apiVersion: "2025-02-19", useCdn: false });

/* ---------- helpers ---------- */

let keyN = 0;
const key = () => `k${(keyN++).toString(36)}`;
const uploaded = new Map<string, string>();

async function asset(src: string) {
  if (uploaded.has(src)) return uploaded.get(src)!;
  const file = join(root, "public", src);
  if (!existsSync(file)) throw new Error(`Missing file: ${file}`);
  if (dryRun) {
    uploaded.set(src, `image-dry-${uploaded.size}`);
    return uploaded.get(src)!;
  }
  const doc = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
  uploaded.set(src, doc._id);
  process.stdout.write(".");
  return doc._id;
}

async function altImage(img?: Img) {
  if (!img) return undefined;
  return { _type: "altImage", alt: img.alt, asset: { _type: "reference", _ref: await asset(img.src) } };
}

type Obj = Record<string, unknown>;

/** Array item type names, per section and field (see sanity/schemaTypes/sections.ts). */
const ITEM: Record<string, Record<string, string>> = {
  homeHero: { slides: "heroSlide", cards: "heroCard", buttons: "button" },
  pageHero: { breadcrumb: "crumb", buttons: "button" },
  proof: { items: "proofItem" },
  benefits: { items: "benefit" },
  services: { items: "serviceCard" },
  projects: { items: "project" },
  insurance: { steps: "insStep" },
  reviews: { items: "review" },
  areaMap: { groups: "cityGroup", stats: "mapStat" },
  cities: { links: "link" },
  faq: { items: "faqItem" },
  stats: { items: "statItem" },
  capacity: { stats: "capStat" },
  contactMethods: { items: "contactMethod" },
  causes: { items: "cause" },
  steps: { items: "step" },
  coverage: { cards: "coverCard" },
};

async function section(s: Section): Promise<Obj> {
  const out: Obj = { _key: key() };
  for (const [k, v] of Object.entries(s as Obj)) {
    if (k === "_key") continue;
    const itemType = ITEM[s._type]?.[k];
    if (k === "image") out.image = await altImage(v as Img);
    else if (k === "button" && v) out.button = { _type: "button", ...(v as Obj) };
    else if (k === "form" && v) {
      const f = v as Obj & { fields?: Obj[] };
      out.form = { ...f, fields: f.fields?.map((x) => ({ _key: key(), _type: "formField", ...x })) };
    }
    else if (itemType && Array.isArray(v)) {
      out[k] = await Promise.all(
        (v as Obj[]).map(async (it) => {
          if (itemType === "heroSlide") {
            const { label, ...img } = it as Img & { label: string };
            return { _key: key(), _type: "heroSlide", label, image: await altImage(img) };
          }
          const o: Obj = { _key: key(), _type: itemType };
          for (const [ik, iv] of Object.entries(it)) o[ik] = ik === "image" ? await altImage(iv as Img) : iv;
          return o;
        }),
      );
    } else out[k] = v;
  }
  return out;
}

const seo = (s: { title: string; description: string; noIndex?: boolean }) => ({ _type: "seo", title: s.title, description: s.description, noIndex: !!s.noIndex });
const links = (list: { label: string; href: string }[]) => list.map((l) => ({ _key: key(), _type: "link", label: l.label, href: l.href }));
const pageId = (p: Page) => `page-${p.slug || "home"}`;

/* ---------- documents ---------- */

async function build() {
  const docs: Obj[] = [];
  const s = fallbackSettings;
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    name: s.name,
    tagline: s.tagline,
    phone: s.phone,
    phoneHref: s.phoneHref,
    email: s.email,
    street: s.street,
    city: s.city,
    region: s.region,
    postalCode: s.postalCode,
    latitude: s.latitude,
    longitude: s.longitude,
    hoursText: s.hoursText,
    areaServed: s.areaServed,
    logo: await altImage(s.logo),
    logoFull: await altImage(s.logoFull),
    menu: links(s.menu),
    trustLabel: s.trustLabel,
    trustBadges: s.trustBadges,
    footer: {
      ...s.footer,
      columns: s.footer.columns.map((c) => ({ _key: key(), _type: "footerColumn", heading: c.heading, ariaLabel: c.ariaLabel, links: links(c.links) })),
      companyLinks: links(s.footer.companyLinks),
      legalLinks: links(s.footer.legalLinks),
    },
  });

  for (const p of fallbackPages) {
    docs.push({
      _id: pageId(p),
      _type: "page",
      name: p.name,
      ...(p.slug ? { slug: { _type: "slug", current: p.slug } } : {}),
      kind: p.kind,
      order: p.order,
      sections: await Promise.all(p.sections.map(section)),
      footerLinkLabels: p.footerLinkLabels ? links(p.footerLinkLabels) : undefined,
      seo: seo(p.seo),
    });
  }

  for (const c of fallbackCategories) docs.push({ _id: `category-${c.slug}`, _type: "category", title: c.title, slug: { _type: "slug", current: c.slug }, wpId: c.wpId, seo: seo(c.seo) });
  for (const p of fallbackPosts)
    docs.push({
      _id: `post-${p.slug}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      date: p.date,
      category: { _type: "reference", _ref: `category-${p.category}` },
      excerpt: p.excerpt,
      image: await altImage(p.image),
      body: p.body,
      css: p.css,
      comments: !!p.comments,
      wpId: p.wpId,
      seo: seo(p.seo),
    });
  for (const t of fallbackTextPages)
    docs.push({ _id: `textPage-${t.slug}`, _type: "textPage", title: t.title, slug: { _type: "slug", current: t.slug }, body: t.body, wpId: t.wpId, seo: seo(t.seo) });

  return docs;
}

const clean = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(clean)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined && x !== "").map(([k, x]) => [k, clean(x)]))
      : v;

console.log(`Seeding ${projectId || "(no project)"}/${dataset}${force ? " (overwriting)" : " (keeping existing documents)"}${dryRun ? " [dry run]" : ""}. Uploading photos`);
const docs = (await build()).map((d) => clean(d) as { _id: string; _type: string }).filter((d) => !only.length || only.some((p) => d._id.startsWith(p)));
console.log(`\n${uploaded.size} photos ${dryRun ? "checked" : "uploaded"}. Writing ${docs.length} documents…`);
if (dryRun) {
  const counts = docs.reduce<Record<string, number>>((acc, d) => ((acc[d._type] = (acc[d._type] ?? 0) + 1), acc), {});
  console.log("Dry run, nothing written:", counts, `${Math.round(JSON.stringify(docs).length / 1024)} KB of content`);
  if (exportFile) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(exportFile, JSON.stringify({ docs, assets: [...uploaded].map(([src, _id]) => ({ _id, src })) }, null, 1));
    console.log(`Exported to ${exportFile}`);
  }
  if (projectId && token) {
    const existing = await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: docs.map((d) => d._id) });
    console.log(`${existing.length} of ${docs.length} documents already exist in Sanity${force ? " (overwrite would replace them)" : " (add-missing would keep them)"}.`);
  }
  process.exit(0);
}

// Small transactions keep each request well under Sanity's size limit.
for (let i = 0; i < docs.length; i += 10) {
  const tx = client.transaction();
  for (const d of docs.slice(i, i + 10)) {
    if (force) tx.createOrReplace(d);
    else tx.createIfNotExists(d);
  }
  await tx.commit({ visibility: "async" });
  process.stdout.write(`${Math.min(i + 10, docs.length)}/${docs.length} `);
}
console.log("\nDone. Open /cms to see the content.");
