/*
 * next/image loader for the static export (no image server on SiteGround). Only photos replaced in
 * Sanity go through next/image (the built-in photos print the old site's own <picture> markup,
 * components/ui/Photo.tsx): Sanity's image CDN resizes them. Anything else is served as it is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=${quality || 75}&fit=max&auto=format`;
  }
  // The #w fragment only tells next/image the width was handled (fragments are not sent to the server).
  return `${src}#w${width}`;
}
