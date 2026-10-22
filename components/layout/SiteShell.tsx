import type { ReactNode } from "react";
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
 * Header, footer and site-wide behaviors around a page. `solid`: the page has no dark photo hero,
 * so the header starts solid and the content starts below it.
 */
export async function SiteShell({ children, onHome = false, solid = false }: { children: ReactNode; onHome?: boolean; solid?: boolean }) {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={businessSchema(settings)} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header settings={settings} onHome={onHome} solid={solid} />
      <main id="main" tabIndex={-1} className={solid ? "wdp-solid-top" : undefined} style={{ outline: "none" }}>
        {children}
      </main>
      <Footer settings={settings} />
      <SiteScripts />
      <ChatWidget />
      <AttributionCapture />
      <Analytics />
    </>
  );
}
