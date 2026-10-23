import { Fragment, type ReactNode } from "react";
import type { PtBlock } from "@/lib/types";

/*
 * Blog / text page body (Portable Text from Sanity or lib/data), rendered with the old
 * WordPress block markup (wp-block-paragraph, wp-block-heading, wp-block-list, wp-block-quote).
 */

/** Inline text: neighbouring spans that share a mark share one element (<strong>a <a>link</a></strong>), as in the old HTML. */
function spans(b: PtBlock): ReactNode[] {
  const text = (t: string) => (t.includes("\n") ? t.split("\n").flatMap((x, i) => (i ? [<br key={`br${i}`} />, x] : [x])) : t);
  const wrap = (m: string, key: string, children: ReactNode[]): ReactNode => {
    const def = (b.markDefs ?? []).find((d) => d._key === m);
    if (def) return <a key={key} href={def.href}>{children}</a>;
    if (m === "strong") return <strong key={key}>{children}</strong>;
    if (m === "em") return <em key={key}>{children}</em>;
    return <Fragment key={key}>{children}</Fragment>;
  };
  // Marks are listed outermost first.
  const nest = (list: PtBlock["children"], depth: number): ReactNode[] => {
    const out: ReactNode[] = [];
    for (let i = 0; i < list.length; ) {
      const m = list[i].marks?.[depth];
      if (!m) {
        out.push(<Fragment key={list[i]._key}>{text(list[i].text ?? "")}</Fragment>);
        i++;
        continue;
      }
      let j = i;
      while (j < list.length && list[j].marks?.[depth] === m) j++;
      out.push(wrap(m, list[i]._key, nest(list.slice(i, j), depth + 1)));
      i = j;
    }
    return out;
  };
  return nest(b.children ?? [], 0);
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
