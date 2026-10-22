import { Fragment, type ReactNode } from "react";
import type { PtBlock } from "@/lib/types";

/*
 * Blog / text page body (Portable Text from Sanity or lib/data), rendered with the old
 * WordPress block markup (wp-block-paragraph, wp-block-heading, wp-block-list, wp-block-quote).
 */

function spans(b: PtBlock): ReactNode[] {
  return (b.children ?? []).map((c) => {
    const text = c.text ?? "";
    let node: ReactNode = text.includes("\n")
      ? text.split("\n").flatMap((t, i) => (i ? [<br key={`br${i}`} />, t] : [t]))
      : text;
    for (const m of c.marks ?? []) {
      const def = (b.markDefs ?? []).find((d) => d._key === m);
      if (def) node = <a href={def.href}>{node}</a>;
      else if (m === "strong") node = <strong>{node}</strong>;
      else if (m === "em") node = <em>{node}</em>;
    }
    return <Fragment key={c._key}>{node}</Fragment>;
  });
}

export function PortableBody({ blocks }: { blocks: PtBlock[] }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.listItem) {
      const items: PtBlock[] = [];
      while (i < blocks.length && blocks[i].listItem === b.listItem) items.push(blocks[i++]);
      i--;
      const Tag = b.listItem === "number" ? "ol" : "ul";
      out.push(
        <Tag key={b._key} className="wp-block-list">
          {items.map((it) => (
            <li key={it._key}>{spans(it)}</li>
          ))}
        </Tag>,
      );
    } else if (b.style === "blockquote") {
      const quote: PtBlock[] = [];
      while (i < blocks.length && blocks[i].style === "blockquote" && !blocks[i].listItem) quote.push(blocks[i++]);
      i--;
      out.push(
        <blockquote key={b._key} className="wp-block-quote">
          {quote.map((q) => (
            <p key={q._key} className="wp-block-paragraph">
              {spans(q)}
            </p>
          ))}
        </blockquote>,
      );
    } else if (b.style === "h2" || b.style === "h3" || b.style === "h4") {
      const H = b.style;
      out.push(
        <H key={b._key} className="wp-block-heading">
          {spans(b)}
        </H>,
      );
    } else {
      out.push(
        <p key={b._key} className={b.style === "small" ? "has-small-font-size wp-block-paragraph" : "wp-block-paragraph"}>
          {spans(b)}
        </p>,
      );
    }
  }
  return <>{out}</>;
}
