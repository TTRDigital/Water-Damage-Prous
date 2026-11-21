import { movedPages } from "./legacy-redirects.ts";

/*
 * Internal links straight to their final address. A link saved before a page moved (in Sanity or in
 * lib/data) still points at the old address, which costs visitors and crawlers a 301. Every `href`
 * field in the content goes through this, so the link reaches the page the redirect would send it to,
 * with the same label and the same destination: nothing a visitor sees changes.
 */
const moved = new Map(movedPages.map(([from, to]) => [`/${from.replace(/\/$/, "")}/`, to]));
const OWN_HOST = /^https?:\/\/(www\.)?waterdamageprous\.com(?=\/|$)/i;

/** The final address of an internal link; anything else (other sites, tel:, mailto:, #anchors) as it is. */
export function finalHref(href: string): string {
  const own = OWN_HOST.test(href);
  const rel = own ? href.replace(OWN_HOST, "") || "/" : href;
  if (!rel.startsWith("/") || rel.startsWith("//")) return href;
  const m = rel.match(/^([^?#]*)(.*)$/)!;
  let path = m[1].endsWith("/") ? m[1] : `${m[1]}/`;
  // Follow chains (e.g. /alexandria-va/ to /alexandria/ to the Alexandria page), at most a few hops.
  for (let i = 0; i < 5 && moved.has(path); i++) path = moved.get(path)!;
  if (path === (m[1].endsWith("/") ? m[1] : `${m[1]}/`)) return href;
  return `${path}${m[2]}`;
}

/** finalHref() on every `href` field, at any depth (footer links, section links, Portable Text link marks). */
export function withFinalHrefs<T>(v: T): T {
  if (Array.isArray(v)) return v.map(withFinalHrefs) as T;
  if (!v || typeof v !== "object") return v;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "href" && typeof x === "string" ? finalHref(x) : withFinalHrefs(x)])) as T;
}
