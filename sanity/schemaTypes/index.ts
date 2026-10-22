import { objectTypes } from "./objects";
import { sectionTypes } from "./sections";
import { documentTypes } from "./documents";

export const schemaTypes = [...objectTypes, ...sectionTypes, ...documentTypes];

/** Documents with exactly one copy (no create/duplicate/delete). */
export const singletonTypes = new Set(["siteSettings"]);
