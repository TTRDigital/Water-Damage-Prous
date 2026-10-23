import { defineArrayMember, defineField, defineType } from "sanity";
import { iconNames } from "../../lib/data/icons";

/* Reusable objects: photo with alt text, link, button, SEO, Portable Text body. */

export const altImage = defineType({
  name: "altImage",
  title: "Photo",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text (describe the photo)",
      description: "Leave empty only for a decorative photo (as the old site did for the logo and the About page's top photo).",
      type: "string",
      validation: (r) => r.warning().custom((v) => (v ? true : "No alt text: screen readers skip this photo.")),
    }),
  ],
});

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Link (e.g. /contact/, #help, tel:+15712102498)", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const button = defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Link", type: "string", validation: (r) => r.required() }),
    defineField({ name: "style", type: "string", options: { list: [{ title: "Red", value: "primary" }, { title: "Glass (on photos)", value: "ghost" }], layout: "radio" }, initialValue: "primary" }),
    defineField({ name: "phoneIcon", title: "Phone icon", type: "boolean" }),
    defineField({ name: "pulse", title: "Pulse animation", type: "boolean" }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({ name: "title", title: "Page title (browser tab and Google)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Meta description", type: "text", rows: 3 }),
    defineField({ name: "noIndex", title: "Hide from search engines", type: "boolean", initialValue: false }),
    defineField({ name: "ogImage", title: "Share image (optional)", type: "altImage" }),
  ],
});

export const icon = defineType({
  name: "iconName",
  title: "Icon",
  type: "string",
  options: { list: iconNames.map((n) => ({ title: n, value: n })) },
});

export const body = defineType({
  name: "body",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Small heading", value: "h4" },
        { title: "Call-out box", value: "blockquote" },
        { title: "Small print", value: "small" },
      ],
      lists: [
        { title: "Bullets", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [defineField({ name: "href", title: "Link (e.g. /contact/ or tel:+15712102498)", type: "string", validation: (r) => r.required() })],
          },
        ],
      },
    }),
  ],
});

export const objectTypes = [altImage, link, button, seo, icon, body];
