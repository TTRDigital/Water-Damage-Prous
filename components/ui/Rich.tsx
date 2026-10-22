import { Fragment } from "react";

/** Inline content markup: `*text*` becomes the accent <span>, `[text](/page/)` a link, a line break <br>. */
export function Rich({ text }: { text?: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.split(/(\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, j) => {
            if (/^\*[^*]+\*$/.test(part)) return <span key={j}>{part.slice(1, -1)}</span>;
            const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
            if (link)
              return (
                <a key={j} href={link[2]}>
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
