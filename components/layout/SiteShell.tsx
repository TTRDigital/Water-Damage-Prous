import type { ReactNode } from "react";
import type { Link } from "@/lib/types";
import { getSiteSettings } from "@/lib/content";
import { businessSchema } from "@/lib/schema";
import { JsonLd } from "@/components/ui/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteScripts } from "@/components/layout/SiteScripts";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { Analytics } from "@/components/layout/Analytics";
import { AttributionCapture } from "@/components/forms/AttributionCapture";

/**
 * Header, footer and site-wide behaviors around a page. `footerLinkLabels`: footer links this page
 * labels differently (see Page.footerLinkLabels).
 */
export async function SiteShell({ children, onHome = false, footerLinkLabels }: { children: ReactNode; onHome?: boolean; footerLinkLabels?: Link[] }) {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={businessSchema(settings)} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header settings={settings} onHome={onHome} />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>
      <Footer settings={settings} linkLabels={footerLinkLabels} />
      <SiteScripts />
      <ChatWidget />
      <AttributionCapture />
      <Analytics />
    </>
  );
}
