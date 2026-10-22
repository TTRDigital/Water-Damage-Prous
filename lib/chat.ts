/**
 * GoHighLevel chat widget ID (public). Not set yet: the chat stays hidden until
 * NEXT_PUBLIC_GHL_CHAT_WIDGET_ID is set at build time ("off" also hides it).
 */
const envId = process.env.NEXT_PUBLIC_GHL_CHAT_WIDGET_ID;
export const chatWidgetId = envId && envId !== "off" ? envId : "";
