/** Inline markup used in content: `*accent*` spans and line breaks. */
export const plainRich = (s: string) => s.replace(/\[([^\]]+)\]\([^)\s]+(?: "[^"]*")?\)/g, "$1").replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();

/** Short headings read as uppercase statements in the design (a CSS class only: the text is unchanged). */
export const statement = (text?: string) => (text && plainRich(text).length <= 32 ? "is-statement" : undefined);
