@AGENTS.md
# Water Damage Pro website

Next.js 16 on Vercel (was a static export for SiteGround) + Sanity Studio at /cms. See README.md for pages, redirects, setup and the changes from the old WordPress site.

- Built-in content lives in `lib/data` (generated from the old pages); Sanity values merge over it in `lib/content.ts`.
- The text, links, headings, SEO tags and photos are the live site's: do not change them without being asked. The look is the redesign (branch claude/redesign-staging): tokens and every section in `app/styles/design.css` (Instrument Serif + Manrope, warm light backgrounds, one navy band colour, gold accent with `--wdp-gold-ink` for text on light, red only for call/emergency cues).
- Section markup is in `components/sections/Sections.tsx` (wdp-* class names, one component per CMS section type). Design-only additions carry `data-design` (the "24/7" tag on the header call button, the phone call bar `components/layout/CallBar.tsx`).
- Emergency rules: the call button (desktop header) or call bar (phones) is always on screen; scroll reveals (`components/layout/SiteScripts.tsx`) never touch a link, button or form; no backdrop-filter over a first-screen photo.
- Posts, categories, the Alexandria page and the 404 page use the old site's other template (`components/legacy`, `lib/data/legacy.ts`, `public/legacy/legacy.css`), restyled by `public/legacy/theme.css` (bump its `?v=` in LegacyShell when it changes).
- Photos are the old media library files in `public/images/uploads/` with the old `<picture>` markup (`components/ui/Photo.tsx`).
- Never commit tokens, FTP credentials or the GoHighLevel webhook; the webhook only goes into `api/lead-config.php` on SiteGround via the deploy workflow.
- This cloud environment sets another project's `NEXT_PUBLIC_SANITY_PROJECT_ID` (TTR Digital's own site): unset it for builds and seeds here.
