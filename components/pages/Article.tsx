import type { ReactNode } from "react";

/** The old site's single post / page column (Hello Elementor .site-main with the guide posts' styles). */
export function Article({ title, children, className = "" }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className="single-post">
      <article className={`site-main ${className}`.trim()}>
        <div className="page-header">
          <h1 className="entry-title">{title}</h1>
        </div>
        <div className="page-content">{children}</div>
      </article>
    </div>
  );
}
