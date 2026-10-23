/** Google Maps embed (no API key), as the old site used: ?q=Fairfax,+VA&z=12&output=embed */
export function mapEmbedUrl(query: string, zoom: number) {
  const q = encodeURIComponent(query).replace(/%20/g, "+").replace(/%2C/gi, ",");
  return `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
}
