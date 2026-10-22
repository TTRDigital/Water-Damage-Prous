/**
 * Water Damage Pro Sanity project. The project ID is public (it is in every
 * image URL). NEXT_PUBLIC_SANITY_PROJECT_ID (.env.local, or the
 * SANITY_PROJECT_ID repository variable for the workflows) overrides it.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "q30nj6mr";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-02-19";
