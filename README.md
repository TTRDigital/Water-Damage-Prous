# Water Damage Pro website

Next.js 16 (App Router, static export) + Sanity Studio embedded at `/cms`, Tailwind CSS v4, hosted on **SiteGround** as plain files. Rebuild of the WordPress + Elementor site at https://waterdamageprous.com, on the same architecture as the Diamond Dental Group and Beverly Hills Top Dentist sites.

- **Design:** the old site's own stylesheet (the `wdp-*` design system) is used verbatim (`app/styles/wdp.css`), together with the Elementor kit and Hello theme rules that styled the pages around it (`kit.css`, `reset.css`), so every page renders as before. Checked element by element against the live pages at 1440 px and 390 px.
- **Content:** the old site's text word for word, with the same page titles and meta descriptions. Everything is editable in `/cms`. Until Sanity has content (or when a field is left empty), the site shows the built-in copy in `lib/data`, so it never breaks.
- **Forms:** both forms post to `/api/lead.php` (PHP on SiteGround), which forwards to a GoHighLevel inbound webhook once one is configured.

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
| `/sitemap/` | HTML sitemap (new: the footer linked to it) |
| `/privacy/`, `/accessibility/` | new pages with `[PLACEHOLDER]` text: noindex and not in the sitemap until the text is in |
| `/sitemap.xml`, `/robots.txt` | generated |
| `/cms` | Sanity Studio |

Section pages (home, company, services, areas) are one template: a list of sections (`components/sections/Sections.tsx`), each drawn with the old markup and class names. All routes are static (`generateStaticParams`, `dynamicParams = false`).

## Changes from the live site (approved in the audit)

- **Blog posts, categories and the Alexandria page** used an old header/footer copied from another site (Florida cities, "Water Damager Pro Virginia", 24 dead `?page_id=` links, 72 links to the parked domain waterdamageprodmv.com, forced Title Case). They now use the main site's header and footer; the text is unchanged, in its normal case, with the guide posts' own article style.
- **"Based right here in <City>"**: on the 16 service-area pages other than Vienna, three phrases now say Vienna, where the business is: the hero check mark "Based in <City>" → "Based in Vienna, VA"; "Water Damage Pro is based right here in <City, ST>." → "Water Damage Pro is based nearby in Vienna, VA."; the first FAQ answer "We're based right here in <City> and…" → "We're based nearby in Vienna, VA and…". Nothing else was reworded ("Your <City> Neighbors", "Right here in <City>." under the map and "Your local <City> team" are unchanged).
- **Missing pages linked from every footer:** `/sitemap/` built; `/privacy/` and `/accessibility/` exist with `[PLACEHOLDER]` text (noindex); `/projects/` ("See all recent jobs") and `/reviews/` 301 to `/#recent-projects` and `/#reviews`, and the links point there.
- **Rendering defects fixed:** the home hero's headline, text and buttons were drawn above the top of the page on phones; the phone menu button was an empty red box; "Get Help Now" and the other glass buttons had dark text on the dark photo; the home map labelled Bethesda, Rockville, Silver Spring, Frederick and Martinsburg as ", VA" and its city link was `#` until clicked; the emergency page's four-step grid stayed four columns on phones and pushed the page sideways; on the 16 service-area pages the footer's "Vienna" link was labelled with the page's own city.
- **Photos:** the old media library was scrambled (a slot's WebP often showed a different photo than its JPG and its alt text, and desktop and phone showed different photos). Each slot now shows the photo its alt text describes, e.g. the About "team" photo is the team in front of the storefront (on the live site desktop shows the team, phones a flooded house). 17 distinct client photos, metadata stripped, WebP at the needed widths. The only alt text written new: the About hero background, the burst-pipe and basement-rain posts' photos; "a Arlington/Ashburn" → "an".
- **Header menu:** switches to the phone menu below 980 px (between 901 and 979 px the old menu squeezed the logo).
- **Schema:** one LocalBusiness entity site-wide (address, phone, email, 24/7 hours, the site's own service-area list; no rating, no price range), BreadcrumbList on inner pages, FAQPage from the visible FAQs word for word (the old schema text did not match the pages).
- **Forms:** same fields, labels and placeholders as each live form, plus a consent checkbox; posts to `/api/lead.php` instead of WordPress admin-ajax.
- Kept as they render today: system font for most text (the theme's Poppins/Roboto never loaded), Plus Jakarta Sans / Inter where the design used them, the red-box slide dots, dark text on red buttons, the grey trust strip.
- Not carried over: WordPress comments, the unused MetForm "Contact form", the ElementsKit header templates.

## Old URLs (`public/.htaccess`)

Generated from the old site's data (`?page_id`/`?p` IDs, media library, Rank Math redirects):

- `/alexandria/`, `/about-us/`, `/contact-us/`, `/services/`, `/reviews/`, `/projects/`, `/home/`, the old theme's slugs (`/water-damage-clean-up/`, `/mold-damage-restoration/`, `/flood-damage-in-basement/`, `/storm-damage-cleanup/`, `/fire-damage-cleanup/`, `/mclean-va/`, `/sterling-va/`…), the 7 Florida city slugs, `/author/…` → 301 to their page.
- `?page_id=` / `?p=` for every page and post (and the old theme's dead menu IDs) → 301.
- Every old upload (191 files and every WordPress size, e.g. `-300x200`) → 301 to the new file showing the same photo; old stock photos the site no longer uses, placeholders and a stray HTML archive → 410.
- WordPress sitemaps → `/sitemap.xml`; `wp-admin`, `wp-includes`, `wp-json`, `wp-login.php`, `xmlrpc.php`, feeds, MetForm and ElementsKit template URLs, `?rest_route=`, `?feed=` → 410 Gone.
- One address: `www.` and `*.sg-host.com` → `https://waterdamageprous.com`; http → https; missing trailing slash → 301.
- Security headers + CSP (GA4, Google Maps embeds, Sanity images, the GoHighLevel chat), caching (hashed files 1 year, photos 1 month, pages revalidate), gzip including `text/javascript`, real 404 status.

Keep added redirects above the trailing-slash rule.

## Setup

1. **Sanity project:** set its ID as the repository **variable** `SANITY_PROJECT_ID` (Settings > Secrets and variables > Actions > Variables), or as the default in `sanity/env.ts`. Dataset: `production`.
2. **CORS:** sanity.io/manage > project > API > CORS origins: add `https://waterdamageprous.com`, `https://www.waterdamageprous.com` and `http://localhost:3000`, each with "Allow credentials".
3. **Load the content into Sanity (once), in the browser:**
   1. sanity.io/manage > project > API > Tokens > Add API token (Editor).
   2. GitHub: Settings > Secrets and variables > Actions > New repository secret `SANITY_WRITE_TOKEN`.
   3. Actions > "Load content into Sanity" > Run workflow, mode **add-missing**: uploads 19 photos and writes 39 documents (site settings, 28 pages, 5 posts, 2 categories, 3 text pages). **overwrite** replaces the CMS with the built-in content; **dry-run** checks without writing. The **only** box limits a run to document IDs starting with the given text, e.g. `page-vienna,post-`.
   4. Delete or rotate the token afterwards.

   On a computer: put `SANITY_WRITE_TOKEN` (and `NEXT_PUBLIC_SANITY_PROJECT_ID`) in `.env.local`, then `npm install && npm run seed` (`-- --force` to overwrite, `-- --dry-run` to check).
4. **Run:** `npm run dev`, then http://localhost:3000 and http://localhost:3000/cms.

## Hosting on SiteGround

`npm run build` writes the whole site to `out/`: HTML pages, `_next/` scripts, `_img/` WebP photos, `images/`, `api/lead.php` and `.htaccess`. `.github/workflows/deploy-siteground.yml` runs lint, typecheck and the build on every push to this branch or `main`, when Sanity publishes and from Actions > "Deploy to SiteGround" > Run workflow, and uploads over FTPS into `./public_html/` (only changed files). Until the FTP secrets exist it only builds (the site zip is kept as a run artifact for 14 days).

| Secret | Value |
|---|---|
| `SG_FTP_SERVER` | FTP host (Site Tools > Site > FTP Accounts > Manage > FTP credentials) |
| `SG_FTP_USERNAME` / `SG_FTP_PASSWORD` | an FTP account whose home folder contains the site's `public_html` |
| `GHL_WEBHOOK_URL` | the forms' GoHighLevel inbound webhook. Not set yet: **until it is, the forms accept requests but do not forward them** (the PHP error log says so). The workflow writes it to `api/lead-config.php` on SiteGround only (never served). |

Repository **variables**: `SANITY_PROJECT_ID`; `GHL_CHAT_WIDGET_ID` (shows the GoHighLevel chat, loaded after the first interaction or 4 s; not set yet); `GA_ID` (defaults to the old site's GA4 tag `G-F3JQ9WQY4G`; `off` removes it); `GTM_ID` (the old site had none); `SG_FTP_DIR` (default `./public_html/`).

**Publish → live:** sanity.io/manage > API > Webhooks: URL `https://api.github.com/repos/TTRDigital/Water-Damage-Prous/dispatches`, POST, create/update/delete, projection `{"event_type": "sanity-publish"}`, headers `Authorization: Bearer <GitHub fine-grained token with Contents: read and write on this repo>` and `Accept: application/vnd.github+json`.

**Go-live:** turn on Site Tools > Security > SSL Manager (Let's Encrypt) and HTTPS Enforce, then point DNS at SiteGround (A record for `@`, CNAME for `www`); keep the email MX/TXT records as they are.

## The forms

Same fields as each live form (most pages: Full name*, Phone*, Property address, What happened?; About: "How can we help?"; Commercial: "Business / property address"; Contact: Full name*, Phone*, Email, Property address, message), plus a consent checkbox. Client and server validation, hidden honeypot field plus timing check (dropped only when both say spam; one signal alone is delivered tagged `suspected-spam`), per-IP rate limit, UTM/gclid attribution, then the old site's thank-you message. Without JavaScript the browser posts the form and comes back with the thank-you message. Payload: flat JSON with `name`, `first_name`, `last_name`, `email`, `phone` (E.164), `phone_raw`, `address`, `message`, `form` (`quick`/`message`), `consent`, `tags`, `spam_check`, `page_url`, `landing_page`, `referrer` and the UTM fields. Each lead also sends a `generate_lead` event to GA4; call links send `click_to_call`.

## Editing in /cms

- **Site settings:** business details, header menu, logos, trust strip badges, footer (columns, badges, links).
- **Pages:** Home / About / Contact, Services, Service areas: each a list of sections that can be edited, reordered, added or removed (heroes, proof bar, form, service cards, recent jobs, insurance band, reviews, city map, map, city links, FAQ, text + photo, numbers band, equipment band, contact cards, icon lists, steps, covered/not covered). In headings `*asterisks*` make the red accent words and `[text](/page/)` makes a link.
- **Text pages** (Alexandria, privacy, accessibility), **Blog posts**, **Blog categories**.

## Development

```bash
npm run dev        # local site
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # WebP copies + static export to out/
```

- `lib/data/*`: built-in content (fallbacks and seed source), generated from the old pages. `pages.ts` (28 section pages), `posts.ts` (posts, categories, Alexandria as Portable Text), `site.ts` (header, footer, business details), `icons.ts` (the old inline SVG icons).
- `lib/content.ts`: GROQ queries and the merge over the fallbacks. `SANITY_API_URL` (build time, normally unset) points the queries at another host; it was used to build the site against a local GROQ mock of the seed and confirm all 41 pages render identically from the CMS and from the built-in content.
- Builds in an environment that already sets another project's Sanity variables: `env -u NEXT_PUBLIC_SANITY_PROJECT_ID -u NEXT_PUBLIC_SANITY_DATASET npm run build`.
