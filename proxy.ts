/*
 * What public/.htaccess did that next.config redirects cannot: 410 Gone for WordPress-only paths, the old
 * ?page_id= / ?p= short links (query dropped), the old WordPress sitemaps and the old media-library addresses.
 * The lists are in lib/legacy-redirects.ts. Everything else passes straight through.
 */
import { NextResponse, type NextRequest } from "next/server";
import { movedPages, oldMenuPages, shortLinks, uploadFiles } from "@/lib/legacy-redirects";

const uploads = new Set(uploadFiles);
// Old menu IDs resolved through movedPages to the final page in one hop (e.g. alexandria-va > /alexandria/ > the Alexandria page).
const moved = new Map(movedPages);
const resolve = (to: string): string => {
  const next = moved.get(to.replace(/^\/|\/$/g, ""));
  return next && next !== to ? resolve(next) : to;
};
const pageIds: Record<string, string> = { ...Object.fromEntries(Object.entries(oldMenuPages).map(([id, slug]) => [id, resolve(`/${slug}/`)])), ...shortLinks };
const gone = new NextResponse("Gone", { status: 410 });
const go = (req: NextRequest, to: string) => NextResponse.redirect(new URL(to, req.url), 301);

const WP_GONE = [
  /^\/(?:wp-admin|wp-includes|wp-json|wp-content\/(?:themes|plugins|cache|languages|upgrade|elementor))(?:\/|$)/i,
  /^\/(?:wp-login|xmlrpc|wp-cron|wp-signup|wp-trackback|wp-comments-post|wp-links-opml|wp-mail)\.php$/i,
  /^\/(?:.+\/)?(?:feed|rss|rss2|atom|trackback|embed)\/?$/i,
  /^\/(?:metform-form|elementskit-content|elementskit_template|tag)(?:\/|$)/i,
  /^\/sitemap_index\.xsl$/i,
];
const OLD_SITEMAP = /^\/(?:sitemap_index|wp-sitemap|[a-z_-]+-sitemap\d*|wp-sitemap-[a-z0-9_-]+)\.xml$/i;
const GONE_QUERY = /(?:^|&)(?:rest_route|feed|elementskit_template|metform-form|attachment_id|preview_id)=/i;

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/" || pathname === "/index.php") {
    if (GONE_QUERY.test(search.slice(1))) return gone;
    const id = req.nextUrl.searchParams.get("page_id") ?? req.nextUrl.searchParams.get("p");
    if (id && /^\d+$/.test(id)) {
      const to = pageIds[id];
      return to ? go(req, to) : new NextResponse("Not found", { status: 404 });
    }
    if (pathname === "/index.php") return search ? NextResponse.next() : gone;
  }

  const m = pathname.match(/^\/wp-content\/uploads\/(.+)$/i);
  if (m) {
    const exact = m[1];
    const full = exact.replace(/-\d+x\d+(\.(?:jpe?g|png|webp))$/i, "$1");
    if (uploads.has(exact)) return go(req, `/images/uploads/${exact}`);
    if (uploads.has(full)) return go(req, `/images/uploads/${full}`);
    return gone;
  }
  if (OLD_SITEMAP.test(pathname)) return go(req, "/sitemap.xml");
  if (WP_GONE.some((r) => r.test(pathname))) return gone;
  return NextResponse.next();
}

// Skips Next's own files and the pages' static assets; the checks above are cheap string tests.
export const config = { matcher: ["/((?!_next/|images/|legacy/|api/|cms).*)"] };
