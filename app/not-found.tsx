import { LegacyShell } from "@/components/legacy/LegacyShell";

/* The old site's "not found" page (its other template), word for word. */

export const metadata = { title: { absolute: "Page Not Found - Water Damage Pro" }, robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <LegacyShell bodyClass="error404">
      <main id="content" className="site-main">
        <div className="page-header">
          <h1 className="entry-title">The page can’t be found.</h1>
        </div>
        <div className="page-content">
          <p>It looks like nothing was found at this location.</p>
        </div>
      </main>
    </LegacyShell>
  );
}
