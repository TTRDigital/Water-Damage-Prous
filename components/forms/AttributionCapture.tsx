"use client";

import { useEffect } from "react";
import { ATTRIBUTION_STORAGE_KEY, attributionKeys } from "@/lib/lead-options";

/**
 * Stores UTM parameters, click IDs, landing page and referrer in
 * sessionStorage on the first page of a visit, so the lead form can send
 * them along. Fails silently if storage is blocked.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl: Record<string, string> = {};
      for (const key of attributionKeys) {
        const v = params.get(key);
        if (v) fromUrl[key] = v.slice(0, 300);
      }
      const existing = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      // New campaign parameters win; otherwise keep the first touch of the session.
      if (existing && !Object.keys(fromUrl).length) return;
      const data = {
        landing_page: window.location.href.slice(0, 1000),
        referrer: document.referrer.slice(0, 1000),
        ...fromUrl,
      };
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: attribution is best effort */
    }
  }, []);
  return null;
}
