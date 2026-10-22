"use client";

import { useEffect } from "react";
import { chatWidgetId } from "@/lib/chat";

/**
 * GoHighLevel (LeadConnector) website chat. Loads after the first interaction
 * or 4 seconds, so it never slows the first paint. Hidden (nothing loads)
 * until NEXT_PUBLIC_GHL_CHAT_WIDGET_ID is set.
 */
export function ChatWidget() {
  useEffect(() => {
    if (!chatWidgetId) return;
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      const s = document.createElement("script");
      s.src = "https://widgets.leadconnectorhq.com/loader.js";
      s.async = true;
      s.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
      s.dataset.widgetId = chatWidgetId;
      document.body.appendChild(s);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    const t = window.setTimeout(load, 4000);
    return () => {
      window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, []);
  return null;
}
