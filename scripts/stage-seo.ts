/**
 * Stages the Nov 21 health-check fixes in Sanity as DRAFTS. It never publishes: an editor reviews each
 * draft in /cms and presses Publish (or discards it).
 *
 *   npm run stage-seo                # dry run: prints what would change, writes nothing
 *   npm run stage-seo -- --write     # writes the drafts (needs SANITY_WRITE_TOKEN)
 *
 * What it changes, and only where Sanity differs from the code:
 * - seo.title / seo.description of the pages and post the health check flagged: set to the code's value
 *   (lib/data, 60 characters or fewer for titles, 155 or fewer for descriptions).
 * - every `href` that points at an address which redirects (e.g. /alexandria/): set to the final address,
 *   in Site settings and on every page and post. The site already does this when it renders
 *   (lib/links.ts); this makes the CMS say the same.
 * A document that already has a draft gets the change in that draft (other unpublished edits are kept).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { fallbackPages } from "../lib/data/pages.ts";
import { fallbackPosts } from "../lib/data/posts.ts";
import { finalHref } from "../lib/links.ts";

const root = new URL("..", import.meta.url).pathname;
if (existsSync(join(root, ".env.local"))) {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const { dataset, projectId } = await import("../sanity/env.ts");
const write = process.argv.includes("--write");
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Set SANITY_WRITE_TOKEN (Editor token). A dry run reads the published documents too, so it needs it as well.");
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false, perspective: "raw" });

// The pages and post Nora's Nov 21 health check flagged (title over 60 or description over 160 characters).
const SEO_SLUGS = { page: ["", "fire-damage-restoration", "storm-damage-restoration", "water-damage-restoration", "emergency-water-damage", "water-extraction", "sewage-cleanup", "commercial-water-damage", "insurance-claims"], post: ["flooded-basement-cleanup-what-happens-next"] };
const codeSeo = new Map<string, { title: string; description: string }>([
  ...SEO_SLUGS.page.map((s) => [`page-${s || "home"}`, fallbackPages.find((p) => p.slug === s)!.seo] as const),
  ...SEO_SLUGS.post.map((s) => [`post-${s}`, fallbackPosts.find((p) => p.slug === s)!.seo] as const),
]);

type Doc = Record<string, unknown> & { _id: string; _type: string };
const changes: string[] = [];

function fixHrefs(v: unknown, id: string, path = ""): unknown {
  if (Array.isArray(v)) return v.map((x, i) => fixHrefs(x, id, `${path}[${(x as Doc)?._key ?? i}]`));
  if (!v || typeof v !== "object") return v;
  return Object.fromEntries(
    Object.entries(v).map(([k, x]) => {
      if (k === "href" && typeof x === "string" && finalHref(x) !== x) {
        changes.push(`${id} ${path}.href: ${x} -> ${finalHref(x)}`);
        return [k, finalHref(x)];
      }
      return [k, fixHrefs(x, id, `${path}.${k}`)];
    }),
  );
}

const published = await client.fetch<Doc[]>(`*[_type in ["siteSettings", "page", "post", "textPage"] && !(_id in path("drafts.**"))]`);
const drafts = new Map((await client.fetch<Doc[]>(`*[_id in path("drafts.**")]`)).map((d) => [d._id, d]));

const tx = client.transaction();
let n = 0;
for (const pub of published) {
  const draftId = `drafts.${pub._id}`;
  const base = drafts.get(draftId) ?? pub;
  const before = changes.length;
  const next = fixHrefs(base, pub._id) as Doc;
  const want = codeSeo.get(pub._id);
  const seo = (next.seo ?? {}) as Record<string, unknown>;
  if (want) {
    for (const f of ["title", "description"] as const) {
      if (seo[f] !== want[f]) {
        changes.push(`${pub._id} seo.${f} (${String(seo[f] ?? "").length} -> ${want[f].length}): "${seo[f] ?? ""}" -> "${want[f]}"`);
        seo[f] = want[f];
      }
    }
    next.seo = { _type: "seo", ...seo };
  }
  if (changes.length === before) continue;
  const { _rev, _createdAt, _updatedAt, ...body } = next;
  void _rev; void _createdAt; void _updatedAt;
  tx.createOrReplace({ ...body, _id: draftId } as Doc);
  n++;
}

console.log(changes.length ? changes.join("\n") : "Nothing to change: Sanity already matches.");
if (write && n) {
  await tx.commit();
  console.log(`\nWrote ${n} draft(s). Nothing was published: review and publish them in /cms.`);
} else if (n) console.log(`\nDry run: ${n} draft(s) would be written. Run with --write to stage them.`);
