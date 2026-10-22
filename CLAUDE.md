@AGENTS.md
# Water Damage Pro website

Static Next.js 16 export for SiteGround + Sanity Studio at /cms. See README.md for pages, redirects, setup and the changes from the old WordPress site.

- Built-in content lives in `lib/data` (generated from the old pages); Sanity values merge over it in `lib/content.ts`.
- Section markup in `components/sections/Sections.tsx` mirrors the old `wdp-*` markup; the old stylesheet is `app/styles/wdp.css` (verbatim). Put changes in `app/styles/fixes.css`.
- Never commit tokens, FTP credentials or the GoHighLevel webhook; the webhook only goes into `api/lead-config.php` on SiteGround via the deploy workflow.
- This cloud environment sets another project's `NEXT_PUBLIC_SANITY_PROJECT_ID` (TTR Digital's own site): unset it for builds and seeds here.
