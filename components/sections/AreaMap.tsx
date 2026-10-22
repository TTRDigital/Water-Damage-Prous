"use client";

import { Fragment, useState } from "react";
import type { AreaMapSection } from "@/lib/types";
import { Rich } from "@/components/ui/Rich";
import { PinIcon } from "@/components/ui/Icon";
import { cityHref, cityLabel, mapEmbedUrl } from "@/lib/maps";

/** Home page "Click your city": the chips move the Google map and the link to that city's page. */
export function AreaMap({ s }: { s: AreaMapSection }) {
  const first = s.groups[0]?.cities[0] ?? "Vienna";
  const [city, setCity] = useState(first);
  // The first view is the wider area (zoom 10), as before; a chosen city zooms in (11).
  const [zoom, setZoom] = useState(10);
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
                      onClick={() => {
                        setCity(c);
                        setZoom(11);
                      }}
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
          <iframe className="wdp-mapframe" title={s.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl(cityLabel(city), zoom)} />
          <div className="wdp-mapdetail">
            <p className="wdp-mapdetail__city">
              <PinIcon /> <span>{cityLabel(city)}</span>
            </p>
            <div className="wdp-mapdetail__stats">
              {s.stats.map((st, i) => (
                <div key={i}>
                  <b>{st.value}</b>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
            <a className="wdp-mapdetail__link" href={cityHref(city)}>
              View {city} water damage page →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
