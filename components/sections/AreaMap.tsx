"use client";

import { Fragment, useState } from "react";
import type { AreaMapSection } from "@/lib/types";
import { Rich } from "@/components/ui/Rich";
import { PinIcon } from "@/components/ui/Icon";
import { mapEmbedUrl } from "@/lib/maps";

/*
 * As the old page's script did it: every city is labelled ", VA" except Washington DC (", DC"),
 * the city link starts as "#" and becomes /<city>/ once a chip is clicked.
 */
const label = (name: string) => name + (name === "Washington DC" ? ", DC" : ", VA");
const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

/** Home page "Click your city": the chips move the Google map and the link to that city's page. */
export function AreaMap({ s }: { s: AreaMapSection }) {
  const first = s.groups[0]?.cities[0] ?? "Vienna";
  // null: the first view (wider area, zoom 10); a clicked city zooms in (11).
  const [picked, setPicked] = useState<string | null>(null);
  const city = picked ?? first;
  const src = picked ? `https://www.google.com/maps?q=${encodeURIComponent(label(picked))}&z=11&output=embed` : mapEmbedUrl(label(first), 10);
  return (
    <section className="wdp-area wdp-section" id={s.anchor ?? "locations"} aria-labelledby="wdp-area-heading">
      <div className="wdp-container wdp-area__grid">
        <div>
          {s.kicker ? <p className="wdp-kicker">{s.kicker}</p> : null}
          <h2 id="wdp-area-heading">
            <Rich text={s.heading} />
          </h2>
          {s.lead ? (
            <p className="wdp-area__lead">
              <Rich text={s.lead} />
            </p>
          ) : null}
          <div className="wdp-reggrp">
            {s.groups.map((g, i) => (
              <Fragment key={i}>
                <p className="wdp-rl">{g.label}</p>
                <div className="wdp-chips">
                  {g.cities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="wdp-chip"
                      data-city={c}
                      aria-pressed={c === city}
                      onClick={() => setPicked(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div>
          <iframe className="wdp-mapframe" id="wdpMap" title={s.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={src} />
          <div className="wdp-mapdetail">
            <p className="wdp-mapdetail__city">
              <PinIcon /> <span id="wdpCityName">{label(city)}</span>
            </p>
            <div className="wdp-mapdetail__stats">
              {s.stats.map((st, i) => (
                <div key={i}>
                  <b>{st.value}</b>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
            <a className="wdp-mapdetail__link" href={picked ? `/${slugify(picked)}/` : "#"} id="wdpCityLink">
              View {city} water damage page →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
