/**
 * Water Damage Pro Sanity project. The project ID is public (it is in every
 * image URL); set it with NEXT_PUBLIC_SANITY_PROJECT_ID (.env.local, or the
 * SANITY_PROJECT_ID repository variable for the deploy workflow). Until it is
 * set, the site builds from the built-in content in lib/data.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-02-19";
