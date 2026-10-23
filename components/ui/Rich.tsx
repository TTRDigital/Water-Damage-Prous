import { Fragment, type CSSProperties } from "react";

/** `color:red;font-weight:700` -> { color: "red", fontWeight: "700" } (custom properties kept as written). */
function styleOf(css?: string): CSSProperties | undefined {
  if (!css) return undefined;
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 1) continue;
    const prop = decl.slice(0, i).trim();
    out[prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = decl.slice(i + 1).trim();
  }
  return out as CSSProperties;
}

const LINK = /^\[([^\]]+)\]\(([^)\s]+)(?: "([^"]*)")?\)$/;

/**
 * Inline content markup: `*text*` becomes the accent <span>, `[text](/page/)` a link
 * (`[text](/page/ "color:…")` with an inline style, as one of the old pages had), a line break <br>.
 */
export function Rich({ text }: { text?: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.split(/(\*[^*]+\*|\[[^\]]+\]\([^)\s]+(?: "[^"]*")?\))/g).map((part, j) => {
            if (/^\*[^*]+\*$/.test(part)) return <span key={j}>{part.slice(1, -1)}</span>;
            const link = part.match(LINK);
            if (link)
              return (
                <a key={j} href={link[2]} style={styleOf(link[3])}>
                  {link[1]}
                </a>
              );
            return <Fragment key={j}>{part}</Fragment>;
          })}
        </Fragment>
      ))}
    </>
  );
}
