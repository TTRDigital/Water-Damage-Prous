import "./globals.css";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { Article } from "@/components/pages/Article";

export const metadata = { title: { absolute: "Page not found - Water Damage Pro" }, robots: { index: false } };

export default function NotFound() {
  return (
    <SiteShell solid>
      <Article title="Page not found">
        <p>The page you were looking for has moved or no longer exists.</p>
        <p>
          <Link href="/" prefetch={false}>
            Back to the home page
          </Link>
        </p>
      </Article>
    </SiteShell>
  );
}
