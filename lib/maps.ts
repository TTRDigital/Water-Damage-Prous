/** Google Maps embed (no API key), as the old site used: ?q=Fairfax,+VA&z=12&output=embed */
export function mapEmbedUrl(query: string, zoom: number) {
  const q = encodeURIComponent(query).replace(/%20/g, "+").replace(/%2C/gi, ",");
  return `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
}

const STATE: Record<string, string> = {
  "Washington DC": "DC",
  Bethesda: "MD",
  Rockville: "MD",
  "Silver Spring": "MD",
  Frederick: "MD",
  Martinsburg: "WV",
};

/** "Bethesda" -> "Bethesda, MD". The old map labelled every city except DC as ", VA". */
export function cityLabel(city: string) {
  if (city === "Washington DC") return "Washington, DC";
  return `${city}, ${STATE[city] ?? "VA"}`;
}

/** The service-area page for a city chip. */
export function cityHref(city: string) {
  const slug = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return slug === "alexandria" ? "/water-damage-restoration-alexandria-va/" : `/${slug}/`;
}
