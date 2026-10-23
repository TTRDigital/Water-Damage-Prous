# Water Damage Pro website

Next.js 16 (App Router, static export) + Sanity Studio embedded at `/cms`, Tailwind CSS v4, hosted on **SiteGround** as plain files. Rebuild of the WordPress + Elementor site at https://waterdamageprous.com, on the same architecture as the Diamond Dental Group and Beverly Hills Top Dentist sites.

**The site is a copy of the live site as it is today**: same pages at the same URLs, same text, same photos, same markup and styles, same quirks. Checked element by element (computed styles and positions) against the live pages at 1440 px and 390 px.

- **Design:** the main pages use the old site's own stylesheet (the `wdp-*` design system) verbatim (`app/styles/wdp.css`), with the Elementor kit and Hello theme rules around it (`kit.css`, `reset.css`). The blog posts, the category pages, the Alexandria page and the 404 page used the old site's other template (an ElementsKit header and Elementor footer); they use it here too, with its header and footer markup as the old site printed it (`lib/data/legacy.ts`) and the old site's own stylesheets (`public/legacy/legacy.css`, built from the live files; unused rules removed).
- **Photos:** the old media library's own files (`public/images/uploads/`, metadata stripped, pixels unchanged), with the old `<picture>` markup (WebP source, srcset, sizes, loading hints) and alt text.
- **Content:** the old site's text word for word, with the same page titles and meta descriptions. Everything is editable in `/cms`. Until Sanity has content (or when a field is left empty), the site shows the built-in copy in `lib/data`, so it never breaks.
- **Forms:** the lead forms and the posts' "Leave a Reply" form post to `/api/lead.php` (PHP on SiteGround), which forwards to a GoHighLevel inbound webhook once one is configured.

## Pages (trailing slash, same URLs as before)

| URL | What |
|---|---|
| `/` | home: rotating photo hero, benefits, form, trust strip, services, recent jobs, insurance, reviews, city map, FAQ |
| `/about/`, `/contact/` | company pages |
| `/water-damage-restoration/`, `/water-extraction/`, `/fire-damage-restoration/`, `/storm-damage-restoration/`, `/commercial-water-damage/`, `/emergency-water-damage/`, `/insurance-claims/`, `/sewage-cleanup/` | 8 service pages |
| `/vienna/`, `/mclean/`, `/tysons/`, `/falls-church/`, `/fairfax/`, `/reston/`, `/arlington/`, `/ashburn/`, `/leesburg/`, `/washington-dc/`, `/bethesda/`, `/rockville/`, `/silver-spring/`, `/frederick/`, `/winchester/`, `/fredericksburg/`, `/martinsburg/` | 17 service-area pages |
| `/water-damage-restoration-alexandria-va/` | the Alexandria page (`/alexandria/` 301s here, as on the old site) |
| `/<post>/` (5) | blog posts, at the root as before |
| `/category/water-damage-guides/`, `/category/uncategorized/` | category archives |
| `/sitemap.xml`, `/robots.txt` | generated |
| `/cms` | Sanity Studio |

Section pages (home, company, services, areas) are one template: a list of sections (`components/sections/Sections.tsx`), each drawn with the old markup and class names. Posts, categories, the Alexandria page and the 404 page use `components/legacy`. All routes are static (`generateStaticParams`, `dynamicParams = false`).

## What is different from the live site

Only what cannot be seen on the page, or what the brief asked for:

- **Forms:** same fields, labels and placeholders as each live form, plus a consent checkbox on the lead forms (the brief); they post to `/api/lead.php` instead of WordPress. The "Leave a Reply" form (on the two posts where comments were open) looks the same and sends the comment to `/api/lead.php` as a lead tagged `blog-comment`; WordPress's own comment system is gone, so comments are not published on the page (the visitor sees "Your comment is awaiting moderation.").
- **Schema:** one LocalBusiness entity site-wide (address, phone, email, 24/7 hours, the site's own service-area list; no rating, no price range), BreadcrumbList on inner pages, FAQPage from the visible FAQs word for word (the old schema text did not match the pages).
- **Old WordPress URLs:** answered by `.htaccess` (below) instead of WordPress, with the same results where WordPress had a page or redirect.
- **Speed:** fonts self-hosted, scripts deferred, unused stylesheet rules left out.

Everything else is as the live site shows it today, including what looks wrong there. Known examples, left as they are: on phones the home hero's headline and buttons sit above the top of the page and the menu button is an empty red box; "Get Help Now" and the other glass buttons have dark text on the dark photo; the home map labels every city ", VA" except DC and its city link is `#` until a city is clicked; the emergency page's four-step grid stays four columns on phones; on 16 service-area pages the footer's "Vienna" link carries the page's own city name and "based right here in <City>"; the footer links to `/privacy/`, `/sitemap/`, `/accessibility/` and "See all recent jobs" links to `/projects/`, all "not found" on the live site too; the posts' header and footer come from another site (Florida cities, "Water Damager Pro Virginia", `?page_id=` links that are not found, links to waterdamageprodmv.com and its broken placeholder image in the phone menu).

## Old URLs (`public/.htaccess`)

Generated from the old site's data (`?page_id`/`?p` IDs, media library, Rank Math redirects) and checked one by one against the live site:

- `/alexandria/`, `/about-us/`, `/contact-us/`, `/services/`, `/reviews/`, `/home/`, `/sample-page/`, the old theme's slugs (`/water-damage-clean-up/`, `/mold-damage-restoration/`, `/flood-damage-in-basement/`, `/storm-damage-cleanup/`, `/fire-damage-cleanup/`, `/mclean-va/`, `/sterling-va/`…) and the 7 Florida city slugs → 301, to the same place as on the live site.
- `?page_id=` / `?p=` for every page and post → 301 to the page; other IDs (the old theme's menu) → 404, as on the live site.
- Every old upload (191 files) → 301 to the same file in `/images/uploads/`; WordPress's resized copies (e.g. `-300x200`) → 301 to the full-size file.
- WordPress sitemaps → `/sitemap.xml`; `wp-admin`, `wp-includes`, `wp-json`, `wp-login.php`, `xmlrpc.php`, feeds, MetForm and ElementsKit template URLs, `?rest_route=`, `?feed=` → 410 Gone.
- One address: `www.` and `*.sg-host.com` → `https://waterdamageprous.com`; http → https; missing trailing slash → 301.
- Security headers + CSP (GA4, Google Maps embeds, Sanity images, the GoHighLevel chat), caching (hashed files 1 year, photos 1 month, pages revalidate), gzip including `text/javascript`, real 404 status (the old "The page can’t be found." page).

Keep added redirects above the trailing-slash rule.

## Setup

1. **Sanity project:** `q30nj6mr`, dataset `production` (defaults in `sanity/env.ts`; the repository variable `SANITY_PROJECT_ID` overrides them).
2. **CORS:** sanity.io/manage > project > API > CORS origins: add `https://waterdamageprous.com`, `https://www.waterdamageprous.com` and `http://localhost:3000`, each with "Allow credentials".
3. **Load the content into Sanity (once), in the browser:**
   1. sanity.io/manage > project > API > Tokens > Add API token (Editor).
   2. GitHub: Settings > Secrets and variables > Actions > New repository secret `SANITY_WRITE_TOKEN`.
   3. Actions > "Load content into Sanity" > Run workflow, mode **add-missing**: uploads 32 photos (the old site's files) and writes 37 documents (site settings, 28 pages, 5 posts, 2 categories, the Alexandria text page). **overwrite** replaces the CMS with the built-in content; **dry-run** checks without writing. The **only** box limits a run to document IDs starting with the given text, e.g. `page-vienna,post-`.
   4. Delete or rotate the token afterwards.

   On a computer: put `SANITY_WRITE_TOKEN` (and `NEXT_PUBLIC_SANITY_PROJECT_ID`) in `.env.local`, then `npm install && npm run seed` (`-- --force` to overwrite, `-- --dry-run` to check).
4. **Run:** `npm run dev`, then http://localhost:3000 and http://localhost:3000/cms.

## Hosting on SiteGround

`npm run build` writes the whole site to `out/`: HTML pages, `_next/` scripts, `images/uploads/` (the old media library files), `legacy/` (the old template's stylesheet and icon fonts), `api/lead.php` and `.htaccess`. `.github/workflows/deploy-siteground.yml` runs lint, typecheck and the build on every push to this branch or `main`, when Sanity publishes and from Actions > "Deploy to SiteGround" > Run workflow, and uploads over FTPS into `./public_html/` (only changed files). Until the FTP secrets exist it only builds (the site zip is kept as a run artifact for 14 days).

| Secret | Value |
|---|---|
| `SG_FTP_SERVER` | FTP host (Site Tools > Site > FTP Accounts > Manage > FTP credentials) |
| `SG_FTP_USERNAME` / `SG_FTP_PASSWORD` | an FTP account whose home folder contains the site's `public_html` |
| `GHL_WEBHOOK_URL` | the forms' GoHighLevel inbound webhook. Not set yet: **until it is, the forms accept requests but do not forward them** (the PHP error log says so). The workflow writes it to `api/lead-config.php` on SiteGround only (never served). |

Repository **variables**: `SANITY_PROJECT_ID` (optional override); `GHL_CHAT_WIDGET_ID` (shows the GoHighLevel chat, loaded after the first interaction or 4 s; not set yet); `GA_ID` (defaults to the old site's GA4 tag `G-F3JQ9WQY4G`; `off` removes it); `GTM_ID` (the old site had none); `SG_FTP_DIR` (default `./public_html/`).

**Publish → live:** sanity.io/manage > API > Webhooks: URL `https://api.github.com/repos/TTRDigital/Water-Damage-Prous/dispatches`, POST, create/update/delete, projection `{"event_type": "sanity-publish"}`, headers `Authorization: Bearer <GitHub fine-grained token with Contents: read and write on this repo>` and `Accept: application/vnd.github+json`.

**Go-live:** turn on Site Tools > Security > SSL Manager (Let's Encrypt) and HTTPS Enforce, then point DNS at SiteGround (A record for `@`, CNAME for `www`); keep the email MX/TXT records as they are.

## The forms

Same fields as each live form (most pages: Full name*, Phone*, Property address, What happened?; About: "How can we help?"; Commercial: "Business / property address"; Contact: Full name*, Phone*, Email, Property address, message), plus a consent checkbox. Client and server validation, hidden honeypot field plus timing check (dropped only when both say spam; one signal alone is delivered tagged `suspected-spam`), per-IP rate limit, UTM/gclid attribution, then the old site's thank-you message. Without JavaScript the browser posts the form and comes back with the thank-you message. Payload: flat JSON with `name`, `first_name`, `last_name`, `email`, `phone` (E.164), `phone_raw`, `address`, `message`, `form` (`quick`/`message`), `consent`, `tags`, `spam_check`, `page_url`, `landing_page`, `referrer` and the UTM fields. Each lead also sends a `generate_lead` event to GA4; call links send `click_to_call`.

The posts' "Leave a Reply" form (comment*, name*, email*, website; "Save my name…" keeps them in the browser) sends the same payload with `form: "comment"`, `website`, `consent: false` and the tag `blog-comment`; without JavaScript the browser posts it and comes back with "Your comment is awaiting moderation.".

## Editing in /cms

- **Site settings:** business details, header menu, logos, trust strip badges, footer (columns, badges, links).
- **Pages:** Home / About / Contact, Services, Service areas: each a list of sections that can be edited, reordered, added or removed (heroes, proof bar, form, service cards, recent jobs, insurance band, reviews, city map, map, city links, FAQ, text + photo, numbers band, equipment band, contact cards, icon lists, steps, covered/not covered). In headings `*asterisks*` make the red accent words and `[text](/page/)` makes a link.
- **Text pages** (the Alexandria page), **Blog posts** (text, photo, excerpt, the "Leave a Reply" switch, the post's own style block), **Blog categories**.
- Photos: the built-in photos are the old site's files, printed with the old `<picture>` markup. Replacing a photo in Sanity serves the new one from Sanity's image CDN instead; changing only the alt text keeps the old file and markup.
- Not in Sanity: the old template's header and footer (posts, categories, Alexandria, 404), kept as the old site printed them in `lib/data/legacy.ts`.

## Development

```bash
npm run dev        # local site
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # static export to out/
```

- `lib/data/*`: built-in content (fallbacks and seed source), generated from the old pages. `pages.ts` (28 section pages), `posts.ts` (posts, categories, Alexandria as Portable Text), `site.ts` (header, footer, business details), `icons.ts` (the old inline SVG icons), `legacy.ts` (the old template's header and footer HTML).
- `public/legacy/legacy.css`: the old site's stylesheets for that template, in the order the old pages loaded them (Font Awesome, Elementor, ElementsKit, JKit, Hello theme, block library, the Elementor kit/header/footer CSS), with rules no old page used left out; fonts in `public/legacy/assets/`.
- `lib/content.ts`: GROQ queries and the merge over the fallbacks. `SANITY_API_URL` (build time, normally unset) points the queries at another host; it was used to build the site against a local GROQ mock of the seed and confirm all 41 pages render identically from the CMS and from the built-in content.
- Builds in an environment that already sets another project's Sanity variables: `env -u NEXT_PUBLIC_SANITY_PROJECT_ID -u NEXT_PUBLIC_SANITY_DATASET npm run build`.
