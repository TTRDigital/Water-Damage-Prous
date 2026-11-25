import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/content";
import { businessSchema } from "@/lib/schema";
import { legacyFooter, legacyHeader, legacyStylesheet } from "@/lib/data/legacy";
import { LegacyStylesheet } from "@/components/legacy/LegacyStylesheet";
import { JsonLd } from "@/components/ui/JsonLd";
import { LegacyScripts } from "@/components/legacy/LegacyScripts";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { Analytics } from "@/components/layout/Analytics";
import { AttributionCapture } from "@/components/forms/AttributionCapture";
import { CallBar } from "@/components/layout/CallBar";

/** The redesign over this template (public/legacy/theme.css). Change the version when the file changes: /legacy/ is cached for a year. */
const themeStylesheet = "/legacy/theme.css?v=20261125b";

/** The theme classes the old site put on <body> of every page in this template. */
const THEME = "wp-custom-logo wp-embed-responsive wp-theme-hello-elementor jkit-color-scheme hello-elementor-default elementor-default elementor-kit-8";

/**
 * The old template used by the blog posts, the category pages and the Alexandria page: the
 * ElementsKit header and Elementor footer exactly as the old site printed them (lib/data/legacy.ts),
 * on the old site's own stylesheets (public/legacy/legacy.css), with the redesign over them
 * (public/legacy/theme.css). The phone call bar is added for phones.
 * `bodyClass`: the old page's own body classes, here on the wrapper.
 */
export async function LegacyShell({ bodyClass, children }: { bodyClass: string; children: ReactNode }) {
  const settings = await getSiteSettings();
  const { class: footerClass, ...footerAttrs } = legacyFooter.attrs;
  return (
    <div className={`${bodyClass} ${THEME} wdp-legacy`}>
      <LegacyStylesheet href={legacyStylesheet} />
      <LegacyStylesheet href={themeStylesheet} />
      <JsonLd data={businessSchema(settings)} />
      <a className="skip-link screen-reader-text" href="#content">
        Skip to content
      </a>
      <div className={legacyHeader.className} dangerouslySetInnerHTML={{ __html: legacyHeader.html }} />
      {children}
      <footer {...footerAttrs} className={footerClass} dangerouslySetInnerHTML={{ __html: legacyFooter.html }} />
      <CallBar phone={settings.phone} phoneHref={settings.phoneHref} />
      <LegacyScripts />
      <ChatWidget />
      <AttributionCapture />
      <Analytics />
    </div>
  );
}
