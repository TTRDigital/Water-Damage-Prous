import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/content";
import { businessSchema } from "@/lib/schema";
import { legacyFooter, legacyHeader, legacyStylesheet } from "@/lib/data/legacy";
import { JsonLd } from "@/components/ui/JsonLd";
import { LegacyScripts } from "@/components/legacy/LegacyScripts";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { Analytics } from "@/components/layout/Analytics";
import { AttributionCapture } from "@/components/forms/AttributionCapture";

/** The theme classes the old site put on <body> of every page in this template. */
const THEME = "wp-custom-logo wp-embed-responsive wp-theme-hello-elementor jkit-color-scheme hello-elementor-default elementor-default elementor-kit-8";

/**
 * The old template used by the blog posts, the category pages and the Alexandria page: the
 * ElementsKit header and Elementor footer exactly as the old site printed them (lib/data/legacy.ts),
 * styled by the old site's own stylesheets (public/legacy/legacy.css, built from the live files).
 * `bodyClass`: the old page's own body classes, here on the wrapper.
 */
export async function LegacyShell({ bodyClass, children }: { bodyClass: string; children: ReactNode }) {
  const settings = await getSiteSettings();
  const { class: footerClass, ...footerAttrs } = legacyFooter.attrs;
  return (
    <div className={`${bodyClass} ${THEME}`}>
      <link rel="stylesheet" href={legacyStylesheet} precedence="legacy" />
      <JsonLd data={businessSchema(settings)} />
      <a className="skip-link screen-reader-text" href="#content">
        Skip to content
      </a>
      <div className={legacyHeader.className} dangerouslySetInnerHTML={{ __html: legacyHeader.html }} />
      {children}
      <footer {...footerAttrs} className={footerClass} dangerouslySetInnerHTML={{ __html: legacyFooter.html }} />
      <LegacyScripts />
      <ChatWidget />
      <AttributionCapture />
      <Analytics />
    </div>
  );
}
