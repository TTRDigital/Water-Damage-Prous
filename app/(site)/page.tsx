import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SectionPage, pageImage } from "@/components/pages/SectionPage";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("");
  return page ? pageMetadata(page.seo, "/", pageImage(page)) : {};
}

export default async function HomePage() {
  const page = await getPage("");
  if (!page) notFound();
  return <SectionPage page={page} />;
}
