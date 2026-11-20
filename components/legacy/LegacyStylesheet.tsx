"use client";

/**
 * The old template's stylesheet, hoisted into <head> by React as before. It lives in a client component so
 * the server payload carries no preload hint for it: the 404 page's tree travels with every page, and as a
 * server-rendered <link> it made all 28 section pages download this 150 KB file at top priority.
 */
export function LegacyStylesheet({ href }: { href: string }) {
  return <link rel="stylesheet" href={href} precedence="legacy" />;
}
