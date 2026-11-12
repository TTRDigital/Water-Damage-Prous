import { getPages, getPosts, getSiteSettings } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

/**
 * /llms.txt (llmstxt.org): a short plain-text guide to the site for AI crawlers. Built from the same
 * settings and pages as the sitemap, so it stays in step with Sanity edits. Not linked from any page.
 */
export async function GET() {
  const [s, pages, posts] = await Promise.all([getSiteSettings(), getPages(), getPosts()]);
  const live = pages.filter((p) => !p.seo.noIndex).sort((a, b) => a.order - b.order);
  const line = (path: string, name: string, about: string) => `- [${name}](${absoluteUrl(path)})${about ? `: ${about}` : ""}`;
  const group = (kinds: string[]) => live.filter((p) => kinds.includes(p.kind)).map((p) => line(p.slug ? `/${p.slug}/` : "/", p.name, p.seo.description));

  const body = [
    `# ${s.name}`,
    "",
    `> ${s.footer.description}`,
    "",
    `Phone: ${s.phone}. Email: ${s.email}. Address: ${s.street}, ${s.city}, ${s.region} ${s.postalCode}. Hours: ${s.hoursText}.`,
    `Areas served: ${s.areaServed.join(", ")}.`,
    "",
    "## Main pages",
    ...group(["home", "company"]),
    "",
    "## Services",
    ...group(["service"]),
    "",
    "## Service areas",
    ...group(["location"]),
    "",
    "## Guides",
    ...posts.filter((p) => !p.seo.noIndex).map((p) => line(`/${p.slug}/`, p.title, p.seo.description)),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
