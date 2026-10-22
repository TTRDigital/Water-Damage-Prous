import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";

/*
 * Page sections. Each one is drawn by components/sections/Sections.tsx with the old site's
 * markup and styles. In headings, *asterisks* mark the red accent words and a new line is a line break.
 */

const RICH = "Wrap words in *asterisks* for the red accent; [text](/page/) makes a link; a new line is a line break.";

const head = (): FieldDefinition[] => [
  defineField({ name: "kicker", title: "Small label above the heading", type: "string" }),
  defineField({ name: "heading", type: "text", rows: 2, description: RICH }),
  defineField({ name: "intro", title: "Text under the heading", type: "text", rows: 3 }),
  defineField({ name: "headingHidden", title: "Heading for screen readers only", type: "boolean" }),
];
const layout = (): FieldDefinition[] => [
  defineField({ name: "anchor", title: "Anchor (for links like /#services)", type: "string" }),
  defineField({ name: "background", type: "string", options: { list: [{ title: "Light grey", value: "paper" }] } }),
];
const strings = (name: string, title: string) => defineField({ name, title, type: "array", of: [defineArrayMember({ type: "string" })] });
const texts = (name: string, title: string) => defineField({ name, title, type: "array", of: [defineArrayMember({ type: "text", rows: 4 })] });
const label = (title: string) => ({ prepare: () => ({ title }) });

export const homeHero = defineType({
  name: "homeHero",
  title: "Home hero (rotating photos)",
  type: "object",
  fields: [
    defineField({
      name: "slides",
      title: "Photos (rotate every 3 seconds)",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroSlide",
          fields: [defineField({ name: "image", type: "altImage" }), defineField({ name: "label", title: "Dot label", type: "string" })],
          preview: { select: { title: "label", media: "image" } },
        }),
      ],
    }),
    defineField({ name: "eyebrow", title: "Red label", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2, description: RICH }),
    defineField({ name: "lead", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "buttons", type: "array", of: [defineArrayMember({ type: "button" })] }),
    defineField({ name: "cardsLabel", title: "Cards label (screen readers)", type: "string" }),
    defineField({
      name: "cards",
      title: "Cards on the right",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroCard",
          fields: [
            defineField({ name: "big", title: "Big text", type: "string" }),
            defineField({ name: "sub", title: "Small text", type: "string" }),
            defineField({ name: "accent", title: "Red card", type: "boolean" }),
            defineField({ name: "google", title: "Google “G”", type: "boolean" }),
            defineField({ name: "stars", title: "Five stars", type: "boolean" }),
          ],
          preview: { select: { title: "big", subtitle: "sub" } },
        }),
      ],
    }),
    defineField({ name: "ariaLabel", title: "Section label (screen readers)", type: "string" }),
  ],
  preview: label("Home hero"),
});

export const pageHero = defineType({
  name: "pageHero",
  title: "Page hero",
  type: "object",
  fields: [
    defineField({ name: "variant", type: "string", options: { list: ["default", "commercial", "contact"] }, initialValue: "default" }),
    defineField({ name: "image", title: "Background photo", type: "altImage" }),
    defineField({
      name: "breadcrumb",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "crumb", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", title: "Link (empty for the current page)", type: "string" })], preview: { select: { title: "label", subtitle: "href" } } })],
    }),
    defineField({ name: "heading", title: "Heading (H1)", type: "text", rows: 2, description: RICH }),
    defineField({ name: "sub", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "buttons", type: "array", of: [defineArrayMember({ type: "button" })] }),
    strings("ticks", "Check marks"),
  ],
  preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: `Hero: ${String(title ?? "").replace(/\*/g, "")}`, media }) },
});

export const proof = defineType({
  name: "proof",
  title: "Proof bar (numbers)",
  type: "object",
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "proofItem",
          fields: [
            defineField({ name: "mark", type: "string", options: { list: [{ title: "Red check", value: "check" }, { title: "Gold star", value: "star" }] } }),
            defineField({ name: "value", type: "string" }),
            defineField({ name: "label", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({ name: "ariaLabel", title: "Section label (screen readers)", type: "string" }),
  ],
  preview: label("Proof bar"),
});

export const trust = defineType({
  name: "trust",
  title: "Trust strip (badges)",
  type: "object",
  fields: [defineField({ name: "note", title: "The badges are edited in Site settings", type: "string", readOnly: true })],
  preview: label("Trust strip (from Site settings)"),
});

const iconItem = (name: string) =>
  defineArrayMember({
    type: "object",
    name,
    fields: [defineField({ name: "icon", type: "iconName" }), defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "text", rows: 2 })],
    preview: { select: { title: "title", subtitle: "text" } },
  });

export const benefits = defineType({
  name: "benefits",
  title: "Benefits strip",
  type: "object",
  fields: [defineField({ name: "items", type: "array", of: [iconItem("benefit")] }), defineField({ name: "ariaLabel", title: "Section label (screen readers)", type: "string" })],
  preview: label("Benefits strip"),
});

export const help = defineType({
  name: "help",
  title: "Form section",
  type: "object",
  fields: [
    defineField({ name: "anchor", title: "Anchor (help, message)", type: "string", initialValue: "help" }),
    defineField({ name: "kicker", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2, description: RICH }),
    defineField({ name: "lead", title: "Text", type: "text", rows: 3 }),
    strings("ticks", "Check marks"),
    defineField({
      name: "form",
      type: "object",
      fields: [
        defineField({
          name: "variant",
          title: "Fields",
          type: "string",
          options: { list: [{ title: "Name, phone, address, what happened", value: "quick" }, { title: "Name, phone, email, address, message", value: "message" }], layout: "radio" },
          initialValue: "quick",
        }),
        defineField({ name: "ratingValue", title: "Rating", type: "string" }),
        defineField({ name: "ratingText", title: "Rating text", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "sub", title: "Text under the title", type: "string" }),
        defineField({ name: "button", title: "Button", type: "string" }),
        defineField({ name: "safe", title: "Note under the button", type: "string" }),
        defineField({
          name: "fields",
          title: "Field labels and placeholders",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "formField",
              fields: [
                defineField({ name: "name", title: "Field", type: "string", options: { list: ["name", "phone", "email", "address", "issue", "message"] }, readOnly: true }),
                defineField({ name: "label", title: "Label (screen readers)", type: "string" }),
                defineField({ name: "placeholder", type: "string" }),
              ],
              preview: { select: { title: "placeholder", subtitle: "name" } },
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `Form: ${String(title ?? "").replace(/\*/g, "")}` }) },
});

export const services = defineType({
  name: "services",
  title: "Service cards",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceCard",
          fields: [
            defineField({ name: "icon", type: "iconName" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "text", type: "text", rows: 2 }),
            defineField({ name: "href", title: "Link (whole card)", type: "string" }),
            defineField({ name: "linkLabel", title: "Link text (screen readers)", type: "string" }),
            defineField({ name: "more", title: "“Learn more” text", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
    }),
    ...layout(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `Services: ${String(title ?? "")}` }) },
});

export const projects = defineType({
  name: "projects",
  title: "Recent jobs",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "project",
          fields: [
            defineField({ name: "image", type: "altImage" }),
            defineField({ name: "badge", type: "string" }),
            defineField({ name: "location", type: "string" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "text", type: "text", rows: 2 }),
            strings("meta", "Red notes"),
          ],
          preview: { select: { title: "title", subtitle: "location", media: "image" } },
        }),
      ],
    }),
    defineField({ name: "button", type: "button" }),
    ...layout(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `Recent jobs: ${String(title ?? "")}` }) },
});

export const insurance = defineType({
  name: "insurance",
  title: "Insurance band (green)",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "text", rows: 2 }),
    defineField({ name: "lead", title: "Text", type: "text", rows: 3 }),
    defineField({
      name: "steps",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "insStep", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "string" })], preview: { select: { title: "title", subtitle: "label" } } })],
    }),
    defineField({ name: "carriersLabel", title: "Carriers label", type: "string" }),
    defineField({ name: "carriers", type: "string" }),
    defineField({ name: "anchor", type: "string" }),
  ],
  preview: label("Insurance band"),
});

export const reviews = defineType({
  name: "reviews",
  title: "Reviews",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading (screen readers)", type: "string" }),
    defineField({ name: "rating", type: "string" }),
    defineField({ name: "sub", title: "Rating text", type: "string" }),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "review",
          fields: [
            defineField({ name: "text", type: "text", rows: 3 }),
            defineField({ name: "name", type: "string" }),
            defineField({ name: "initial", type: "string" }),
            defineField({ name: "meta", title: "Place · source", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "text" } },
        }),
      ],
    }),
    defineField({ name: "anchor", type: "string", initialValue: "reviews" }),
  ],
  preview: label("Reviews"),
});

export const areaMap = defineType({
  name: "areaMap",
  title: "City map (chips)",
  type: "object",
  fields: [
    defineField({ name: "kicker", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2 }),
    defineField({ name: "lead", title: "Text", type: "text", rows: 3 }),
    defineField({
      name: "groups",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "cityGroup", fields: [defineField({ name: "label", type: "string" }), strings("cities", "Cities")], preview: { select: { title: "label" } } })],
    }),
    defineField({ name: "mapTitle", title: "Map title (screen readers)", type: "string" }),
    defineField({
      name: "stats",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "mapStat", fields: [defineField({ name: "value", type: "string" }), defineField({ name: "label", type: "string" })], preview: { select: { title: "value", subtitle: "label" } } })],
    }),
    defineField({ name: "anchor", type: "string", initialValue: "locations" }),
  ],
  preview: label("City map"),
});

export const map = defineType({
  name: "map",
  title: "Map",
  type: "object",
  fields: [
    ...head(),
    defineField({ name: "query", title: "Place (e.g. Fairfax, VA)", type: "string" }),
    defineField({ name: "zoom", type: "number", initialValue: 12 }),
    defineField({ name: "title", title: "Map title (screen readers)", type: "string" }),
    defineField({ name: "framed", title: "Fixed 400px frame (service area pages)", type: "boolean" }),
    ...layout(),
  ],
  preview: { select: { title: "query" }, prepare: ({ title }) => ({ title: `Map: ${title ?? ""}` }) },
});

export const cities = defineType({
  name: "cities",
  title: "City links",
  type: "object",
  fields: [...head(), defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }), ...layout()],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `City links: ${title ?? ""}` }) },
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "faqItem", fields: [defineField({ name: "question", type: "string" }), defineField({ name: "answer", type: "text", rows: 4 })], preview: { select: { title: "question" } } })],
    }),
    ...layout(),
  ],
  preview: { select: { title: "kicker" }, prepare: ({ title }) => ({ title: `FAQ: ${title ?? ""}` }) },
});

export const split = defineType({
  name: "split",
  title: "Text + photo",
  type: "object",
  fields: [
    defineField({ name: "variant", type: "string", options: { list: [{ title: "Default", value: "default" }, { title: "Square team photo", value: "team" }] }, initialValue: "default" }),
    defineField({ name: "kicker", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2 }),
    defineField({ name: "paragraphs", title: "Paragraphs", description: "[text](/page/) makes a link.", type: "array", of: [defineArrayMember({ type: "text", rows: 4 })] }),
    defineField({ name: "image", type: "altImage" }),
    ...layout(),
  ],
  preview: { select: { title: "heading", media: "image" } },
});

export const stats = defineType({
  name: "stats",
  title: "Numbers band (dark)",
  type: "object",
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "statItem",
          fields: [
            defineField({ name: "mark", type: "string", options: { list: [{ title: "Red number", value: "accent" }, { title: "Gold star", value: "star" }] } }),
            defineField({ name: "value", type: "string" }),
            defineField({ name: "label", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({ name: "ariaLabel", title: "Section label (screen readers)", type: "string" }),
  ],
  preview: label("Numbers band"),
});

export const capacity = defineType({
  name: "capacity",
  title: "Equipment band (dark)",
  type: "object",
  fields: [
    defineField({ name: "image", type: "altImage" }),
    defineField({ name: "kicker", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2 }),
    texts("paragraphs", "Paragraphs"),
    defineField({
      name: "stats",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "capStat", fields: [defineField({ name: "value", type: "string" }), defineField({ name: "label", type: "string" })], preview: { select: { title: "value", subtitle: "label" } } })],
    }),
    defineField({ name: "button", type: "button" }),
  ],
  preview: { select: { title: "heading", media: "image" } },
});

export const contactMethods = defineType({
  name: "contactMethods",
  title: "Contact cards",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "contactMethod",
          fields: [
            defineField({ name: "icon", type: "iconName" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "value", type: "string" }),
            defineField({ name: "href", title: "Link (optional)", type: "string" }),
            defineField({ name: "note", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "value" } },
        }),
      ],
    }),
    ...layout(),
  ],
  preview: label("Contact cards"),
});

export const causes = defineType({
  name: "causes",
  title: "Icon list (neighborhoods, causes, property types)",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "cause", fields: [defineField({ name: "icon", type: "iconName" }), defineField({ name: "title", type: "string" })], preview: { select: { title: "title", subtitle: "icon" } } })],
    }),
    ...layout(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `Icon list: ${title ?? ""}` }) },
});

export const steps = defineType({
  name: "steps",
  title: "Process steps",
  type: "object",
  fields: [
    ...head(),
    defineField({ name: "columns", title: "Columns on wide screens", type: "number", options: { list: [5, 4] }, initialValue: 5 }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "step", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "string" })], preview: { select: { title: "title", subtitle: "text" } } })],
    }),
    ...layout(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: `Steps: ${title ?? ""}` }) },
});

export const coverage = defineType({
  name: "coverage",
  title: "Covered / not covered",
  type: "object",
  fields: [
    ...head(),
    defineField({
      name: "cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "coverCard",
          fields: [defineField({ name: "tone", type: "string", options: { list: [{ title: "Covered (green)", value: "yes" }, { title: "Not covered (red)", value: "no" }] } }), defineField({ name: "title", type: "string" }), strings("items", "Items")],
          preview: { select: { title: "title", subtitle: "tone" } },
        }),
      ],
    }),
    defineField({ name: "note", type: "text", rows: 2 }),
    ...layout(),
  ],
  preview: label("Covered / not covered"),
});

export const sectionTypes = [homeHero, pageHero, proof, trust, benefits, help, services, projects, insurance, reviews, areaMap, map, cities, faq, split, stats, capacity, contactMethods, causes, steps, coverage];
export const sectionMembers = sectionTypes.map((t) => defineArrayMember({ type: t.name }));
