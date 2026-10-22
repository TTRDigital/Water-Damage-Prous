/** Inline markup used in content: `*accent*` spans and line breaks. */
export const plainRich = (s: string) => s.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1").replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();
