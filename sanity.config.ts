"use client";

/**
 * Sanity Studio, embedded at /cms. Brand red and navy, grouped sidebar, a site settings
 * singleton that cannot be duplicated or deleted.
 */
import { buildLegacyTheme, defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { StudioIcon } from "./sanity/StudioIcon";

const theme = buildLegacyTheme({
  "--black": "#0a1826",
  "--white": "#ffffff",
  "--gray": "#5a6b7b",
  "--gray-base": "#5a6b7b",
  "--component-bg": "#ffffff",
  "--component-text-color": "#0a1826",
  "--brand-primary": "#d10000",
  "--default-button-color": "#5a6b7b",
  "--default-button-primary-color": "#d10000",
  "--default-button-success-color": "#1f9d55",
  "--default-button-warning-color": "#c58a1b",
  "--default-button-danger-color": "#d0342c",
  "--state-info-color": "#0e2a3b",
  "--state-success-color": "#1f9d55",
  "--state-warning-color": "#c58a1b",
  "--state-danger-color": "#d0342c",
  "--main-navigation-color": "#0a1826",
  "--main-navigation-color--inverted": "#ffffff",
  "--focus-color": "#d10000",
});

export default defineConfig({
  name: "water-damage-pro",
  title: "Water Damage Pro",
  basePath: "/cms",
  projectId: projectId || "missing",
  dataset,
  icon: StudioIcon,
  theme,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType) ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : input,
  },
});
