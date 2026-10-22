/* Constants for the lead forms. public/api/lead.php repeats the field rules: keep them in sync. */

export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

export const ATTRIBUTION_STORAGE_KEY = "wdp_attribution";

/** Minimum time a human needs to fill the form. Faster submits are treated as suspect. */
export const MIN_FILL_MS = 2500;
