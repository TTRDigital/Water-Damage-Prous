# Water Damage Pro staging copy (TTR-1942)

This branch (`ttr-staging-copy`) is a full copy of the production branch `claude/magical-heisenberg-35ur38`, kept only so Vercel builds one stable preview of the whole site at `water-damage-prous-git-ttr-staging-copy-ttr15.vercel.app`, with TTR OS's editing bar (Vercel preview builds only). It is not the live site and nothing from it goes live.

What differs from production (preview builds only, production text unchanged):
- `components/preview/ReviewBar.tsx`: the bar script, only when `VERCEL_ENV` is `preview`.
- `next.config.ts`: on previews the CSP also allows `https://ttr-portal.vercel.app` (script-src, connect-src) and `https://*.blob.vercel-storage.com` (img-src); `portal.ttrdigitalmarketing.com` is already allowed in production for the visit tracker. Previews are already sent `X-Robots-Tag: noindex, nofollow` (every host except waterdamageprous.com).

To bring it up to date after each production merge: `git checkout ttr-staging-copy && git merge origin/claude/magical-heisenberg-35ur38 && git push`. Never merge this branch into production.
