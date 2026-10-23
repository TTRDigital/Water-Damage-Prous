import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionMembers } from "./sections";

/* Documents: site settings (singleton), section pages, blog posts, categories, text pages. */

const slug = (source: string) => defineField({ name: "slug", title: "Address (URL)", type: "slug", options: { source }, validation: (r) => r.required() });
const strings = (name: string, title: string) => defineField({ name, title, type: "array", of: [defineArrayMember({ type: "string" })] });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "business", title: "Business", default: true },
    { name: "header", title: "Header" },
    { name: "trust", title: "Trust strip" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({ name: "name", title: "Business name", type: "string", group: "business" }),
    defineField({ name: "phone", title: "Phone (as shown)", type: "string", group: "business" }),
    defineField({ name: "phoneHref", title: "Phone link (tel:+1...)", type: "string", group: "business" }),
    defineField({ name: "email", type: "string", group: "business" }),
    defineField({ name: "street", type: "string", group: "business" }),
    defineField({ name: "city", type: "string", group: "business" }),
    defineField({ name: "region", title: "State", type: "string", group: "business" }),
    defineField({ name: "postalCode", title: "ZIP", type: "string", group: "business" }),
    defineField({ name: "latitude", type: "number", group: "business" }),
    defineField({ name: "longitude", type: "number", group: "business" }),
    defineField({ name: "hoursText", title: "Hours (footer)", type: "string", group: "business" }),
    strings("areaServed", "Service area (schema)"),
    defineField({ name: "tagline", title: "Tagline under the name", type: "string", group: "header" }),
    defineField({ name: "logo", title: "Logo mark", type: "altImage", group: "header" }),
    defineField({ name: "logoFull", title: "Full logo (search engines)", type: "altImage", group: "header" }),
    defineField({ name: "menu", title: "Main menu", type: "array", of: [defineArrayMember({ type: "link" })], group: "header" }),
    defineField({ name: "trustLabel", title: "Label", type: "string", group: "trust" }),
    defineField({
      name: "trustBadges",
      title: "Badges",
      description: "“IICRC” and “We Bill Insurance” get the shield, “5.0 Google” the G and star, “Yelp” is red, “Licensed…” gets a check.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "trust",
    }),
    defineField({
      name: "footer",
      type: "object",
      group: "footer",
      fields: [
        defineField({ name: "ctaHeading", title: "Call band heading", type: "string" }),
        defineField({ name: "ctaText", title: "Call band text", type: "string" }),
        defineField({ name: "description", type: "text", rows: 3 }),
        strings("badges", "Badges"),
        defineField({
          name: "columns",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "footerColumn",
              fields: [
                defineField({ name: "heading", type: "string" }),
                defineField({ name: "ariaLabel", title: "Label (screen readers)", type: "string" }),
                defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }),
              ],
              preview: { select: { title: "heading" } },
            }),
          ],
        }),
        defineField({ name: "companyHeading", type: "string" }),
        defineField({ name: "companyLinks", type: "array", of: [defineArrayMember({ type: "link" })] }),
        defineField({ name: "copyright", type: "string" }),
        defineField({ name: "legalLinks", type: "array", of: [defineArrayMember({ type: "link" })] }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name (breadcrumbs, sitemap)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Address (URL; empty for the home page)", type: "slug", options: { source: "name" } }),
    defineField({
      name: "kind",
      type: "string",
      options: { list: [{ title: "Home", value: "home" }, { title: "Company", value: "company" }, { title: "Service", value: "service" }, { title: "Service area", value: "location" }] },
    }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "sections", type: "array", of: sectionMembers }),
    defineField({
      name: "footerLinkLabels",
      title: "Footer links labelled differently on this page",
      description: "A footer link (same address) shown with another label on this page only.",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "slug.current" }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? `/${subtitle}/` : "/" }) },
});

export const category = defineType({
  name: "category",
  title: "Blog category",
  type: "document",
  fields: [defineField({ name: "title", type: "string", validation: (r) => r.required() }), slug("title"), defineField({ name: "seo", type: "seo" }), defineField({ name: "wpId", title: "Old WordPress ID", description: "Kept from the old site (page classes, comment form). Leave as is.", type: "number", readOnly: true })],
});

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug("title"),
    defineField({ name: "date", type: "date", validation: (r) => r.required() }),
    defineField({ name: "category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "excerpt", title: "Excerpt (category pages)", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Photo (category pages and sharing)", type: "altImage" }),
    defineField({ name: "body", type: "body" }),
    defineField({ name: "comments", title: "Show the “Leave a Reply” form", type: "boolean", initialValue: true }),
    defineField({ name: "css", title: "Article style (CSS)", description: "The post's own style block, printed above the text as on the old site.", type: "text", rows: 6 }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "wpId", title: "Old WordPress ID", description: "Kept from the old site (page classes, comment form). Leave as is.", type: "number", readOnly: true }),
  ],
  orderings: [{ title: "Newest", name: "date", by: [{ field: "date", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "date", media: "image" } },
});

export const textPage = defineType({
  name: "textPage",
  title: "Text page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug("title"),
    defineField({ name: "body", type: "body" }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "wpId", title: "Old WordPress ID", description: "Kept from the old site (page classes, comment form). Leave as is.", type: "number", readOnly: true }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const documentTypes = [siteSettings, page, category, post, textPage];
