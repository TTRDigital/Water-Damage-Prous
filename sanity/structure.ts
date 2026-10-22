import type { StructureResolver } from "sanity/structure";
import { Cog, FileText, Folder, Home, MapPin, Newspaper, Wrench } from "lucide-react";

/** Sidebar: Site settings, Pages (company, services, service areas), Blog, Text pages. */
export const structure: StructureResolver = (S) => {
  const pages = (title: string, filter: string, icon: React.ComponentType) =>
    S.listItem()
      .title(title)
      .icon(icon)
      .child(S.documentList().title(title).filter(filter).defaultOrdering([{ field: "order", direction: "asc" }]));
  return S.list()
    .title("Water Damage Pro")
    .items([
      S.listItem().title("Site settings").id("siteSettings").icon(Cog).child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
      S.divider(),
      pages("Home, About, Contact", '_type == "page" && kind in ["home", "company"]', Home),
      pages("Services", '_type == "page" && kind == "service"', Wrench),
      pages("Service areas", '_type == "page" && kind == "location"', MapPin),
      S.listItem().title("Text pages").icon(FileText).child(S.documentTypeList("textPage").title("Text pages")),
      S.divider(),
      S.listItem().title("Blog posts").icon(Newspaper).child(S.documentTypeList("post").title("Blog posts").defaultOrdering([{ field: "date", direction: "desc" }])),
      S.listItem().title("Blog categories").icon(Folder).child(S.documentTypeList("category").title("Blog categories")),
    ]);
};
