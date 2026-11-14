/*
 * TTR OS's "Suggest a change" bar, only on a Vercel PREVIEW build (the stable staging copy, branch ttr-staging-copy),
 * never on the live site. It does nothing unless the page was opened from the client's private review link
 * (a review token after #). The preview-only CSP in next.config.ts allows the portal's address.
 */
export function ReviewBar() {
  if (process.env.VERCEL_ENV !== "preview") return null;
  return <script defer src="https://ttr-portal.vercel.app/api/site/notes/bar" />;
}
