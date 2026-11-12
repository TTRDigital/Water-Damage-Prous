/*
 * Old WordPress addresses, moved from public/.htaccess (generated from it on Nov 11; edit here from now on).
 * Simple moves go in next.config.ts redirects(); the rest (410s, ?page_id= short links, old sitemaps and
 * media files) is handled in proxy.ts, which can read the query and answer 410.
 */
export const movedPages: [string, string][] = [
 [
  "alexandria",
  "/water-damage-restoration-alexandria-va/"
 ],
 [
  "about-us",
  "/about/"
 ],
 [
  "contact-us",
  "/contact/"
 ],
 [
  "services",
  "/"
 ],
 [
  "reviews",
  "/"
 ],
 [
  "home",
  "/"
 ],
 [
  "sample-page",
  "/"
 ],
 [
  "water-damage-clean-up",
  "/water-damage-restoration/"
 ],
 [
  "mold-damage-restoration",
  "/water-damage-restoration/"
 ],
 [
  "flood-damage-in-basement",
  "/water-extraction/"
 ],
 [
  "storm-damage-cleanup",
  "/storm-damage-restoration/"
 ],
 [
  "fire-damage-cleanup",
  "/fire-damage-restoration/"
 ],
 [
  "mclean-va",
  "/mclean/"
 ],
 [
  "sterling-va",
  "/ashburn/"
 ],
 [
  "leesburg-va",
  "/leesburg/"
 ],
 [
  "ashburn-va",
  "/ashburn/"
 ],
 [
  "vienna-va",
  "/vienna/"
 ],
 [
  "alexandria-va",
  "/alexandria/"
 ],
 [
  "arlington-va",
  "/arlington/"
 ],
 [
  "water-damage",
  "/water-damage-restoration/"
 ],
 [
  "fire-damage",
  "/fire-damage-restoration/"
 ],
 [
  "storm-damage",
  "/storm-damage-restoration/"
 ],
 [
  "commercial",
  "/commercial-water-damage/"
 ],
 [
  "emergency",
  "/emergency-water-damage/"
 ],
 [
  "insurance",
  "/insurance-claims/"
 ],
 [
  "pompano-beach-fl",
  "/"
 ],
 [
  "fort-lauderdale-fl",
  "/"
 ],
 [
  "hollywood-fl",
  "/"
 ],
 [
  "hialeah-fl",
  "/"
 ],
 [
  "miami-beach-fl",
  "/"
 ],
 [
  "pembroke-pines-fl",
  "/"
 ],
 [
  "kendall-fl",
  "/"
 ]
];

/** ?page_id=N or ?p=N on / or /index.php: 301 to the page, query dropped. Any other number is a 404. */
export const shortLinks: Record<string, string> = {
 "9001": "/about/",
 "9002": "/alexandria/",
 "9003": "/arlington/",
 "9004": "/ashburn/",
 "9005": "/bethesda/",
 "9006": "/commercial-water-damage/",
 "9007": "/contact/",
 "9008": "/emergency-water-damage/",
 "9009": "/fairfax/",
 "9010": "/falls-church/",
 "9011": "/fire-damage-restoration/",
 "9012": "/frederick/",
 "9013": "/fredericksburg/",
 "9014": "/",
 "9015": "/insurance-claims/",
 "9016": "/leesburg/",
 "9017": "/martinsburg/",
 "9018": "/mclean/",
 "9019": "/reston/",
 "9020": "/rockville/",
 "9021": "/sewage-cleanup/",
 "9022": "/silver-spring/",
 "9023": "/storm-damage-restoration/",
 "9024": "/tysons/",
 "9025": "/vienna/",
 "9026": "/washington-dc/",
 "9028": "/water-extraction/",
 "9029": "/winchester/",
 "9099": "/water-damage-restoration/",
 "9200": "/why-does-my-basement-flood-when-it-rains/",
 "9201": "/what-to-do-when-your-basement-floods/",
 "9202": "/does-homeowners-insurance-cover-water-damage/",
 "9215": "/burst-pipe-what-to-do-first-hour/",
 "9219": "/flooded-basement-cleanup-what-happens-next/",
 "9221": "/water-damage-restoration-alexandria-va/",
 // The old WordPress page ids the legacy template's header menu still links to (lib/data/legacy.ts),
 // sent where movedPages sends the same old pages.
 "13": "/",
 "122": "/about/",
 "124": "/",
 "125": "/",
 "126": "/contact/",
 "131": "/water-damage-restoration/",
 "132": "/water-damage-restoration/",
 "133": "/water-extraction/",
 "134": "/storm-damage-restoration/",
 "136": "/fire-damage-restoration/",
 "141": "/mclean/",
 "142": "/ashburn/",
 "143": "/leesburg/",
 "144": "/ashburn/",
 "149": "/alexandria/",
 "150": "/vienna/",
 "154": "/arlington/",
 "527": "/",
 "544": "/",
 "549": "/",
 "574": "/",
 "586": "/",
 "591": "/",
 "599": "/"
};

/** Files in public/images/uploads (relative), so old wp-content/uploads addresses go to the same file. */
export const uploadFiles: string[] = ["2025/04/1200x800.jpg", "2025/04/1_UmnAYxPdxV7NVIRsYgb4lQ.jpg", "2025/04/5eddfc7cb203c.jpg", "2025/04/AdobeStock_123400658.webp", "2025/04/AdobeStock_20903474.webp", "2025/04/Asset-13-1-1.png", "2025/04/Asset-13-1-removebg-preview-1-150x150.png", "2025/04/Asset-13-1-removebg-preview-1.png", "2025/04/Asset-13-1-removebg-preview.png", "2025/04/Asset-13-1.png", "2025/04/Chapter-4-CCHA-8.jpg", "2025/04/Ecosan-Flood-Water-Damage-Restoration-01.webp", "2025/04/Mold-Remove.jpg", "2025/04/Water-Damage-Restoration-Services.webp", "2025/04/WaterDamage-1920w.webp", "2025/04/WhatsApp-Image-2023-10-16-at-00.33.53-1.jpeg", "2025/04/XXXL.webp", "2025/04/bd576937894507.574fb5f22b175-scaled-1.jpg", "2025/04/channels4_profile.jpg", "2025/04/floor.jpg", "2025/04/h1_4555.jpg", "2025/04/incendio-em-condominio-1.38279bf.060e83a13ae88ca67383eba9ec31df06.jpg", "2025/04/placeholder-1.png", "2025/04/placeholder-2.png", "2025/04/placeholder-3.png", "2025/04/placeholder-4.png", "2025/04/placeholder.png", "2025/04/stock-photo-burnt-out-house-with-charred-roof-trusses-and-burnt-furniture-1-1.webp", "2026/07/capacity-fleet-1200-1.jpg", "2026/07/capacity-fleet-1200-1.webp", "2026/07/capacity-fleet-1200-2.jpg", "2026/07/capacity-fleet-1200-2.webp", "2026/07/capacity-fleet-1200.jpg", "2026/07/capacity-fleet-1200.webp", "2026/07/capacity-fleet-800-1.jpg", "2026/07/capacity-fleet-800-1.webp", "2026/07/capacity-fleet-800-2.jpg", "2026/07/capacity-fleet-800.jpg", "2026/07/capacity-fleet-800.webp", "2026/07/hero-fire-1448-1.jpg", "2026/07/hero-fire-1448-1.webp", "2026/07/hero-fire-1448.jpg", "2026/07/hero-fire-1448.webp", "2026/07/hero-fire-960-1.jpg", "2026/07/hero-fire-960-1.webp", "2026/07/hero-fire-960.jpg", "2026/07/hero-fire-960.webp", "2026/07/hero-flood-1448-1.jpg", "2026/07/hero-flood-1448-1.webp", "2026/07/hero-flood-1448.jpg", "2026/07/hero-flood-1448.webp", "2026/07/hero-flood-960-1.webp", "2026/07/hero-flood-960-2.webp", "2026/07/hero-flood-960.jpg", "2026/07/hero-flood-960.webp", "2026/07/hero-storm-1448-1.jpg", "2026/07/hero-storm-1448.jpg", "2026/07/hero-storm-1448.png", "2026/07/hero-storm-1448.webp", "2026/07/hero-storm-960-1.jpg", "2026/07/hero-storm-960-1.webp", "2026/07/hero-storm-960.jpg", "2026/07/hero-storm-960.webp", "2026/07/logo-icon.png", "2026/07/logo-icon.webp", "2026/07/phero-about-1448-1.jpg", "2026/07/phero-about-1448-1.webp", "2026/07/phero-about-1448.jpg", "2026/07/phero-about-1448.webp", "2026/07/phero-about-960-1.jpg", "2026/07/phero-about-960-1.webp", "2026/07/phero-about-960.jpg", "2026/07/phero-about-960.webp", "2026/07/phero-commercial-1448-1.jpg", "2026/07/phero-commercial-1448-2.jpg", "2026/07/phero-commercial-1448.jpg", "2026/07/phero-commercial-1448.webp", "2026/07/phero-commercial-960-1.jpg", "2026/07/phero-commercial-960-1.webp", "2026/07/phero-commercial-960.jpg", "2026/07/phero-commercial-960.webp", "2026/07/phero-emergency-1448-1.webp", "2026/07/phero-emergency-1448.jpg", "2026/07/phero-emergency-1448.webp", "2026/07/phero-emergency-960.jpg", "2026/07/phero-emergency-960.webp", "2026/07/phero-extract-1448.jpg", "2026/07/phero-extract-1448.webp", "2026/07/phero-extract-960.jpg", "2026/07/phero-extract-960.webp", "2026/07/phero-fire-1448-1.jpg", "2026/07/phero-fire-1448.jpg", "2026/07/phero-fire-1448.webp", "2026/07/phero-fire-960.jpg", "2026/07/phero-fire-960.webp", "2026/07/phero-insurance-1448-1.jpg", "2026/07/phero-insurance-1448-300x200.jpg", "2026/07/phero-insurance-1448-600x400.jpg", "2026/07/phero-insurance-1448-768x512.jpg", "2026/07/phero-insurance-1448.jpg", "2026/07/phero-insurance-1448.webp", "2026/07/phero-insurance-960.jpg", "2026/07/phero-insurance-960.webp", "2026/07/phero-sewage-1448.jpg", "2026/07/phero-sewage-1448.webp", "2026/07/phero-sewage-960.jpg", "2026/07/phero-sewage-960.webp", "2026/07/phero-storm-1448-1.jpg", "2026/07/phero-storm-1448.jpg", "2026/07/phero-storm-1448.webp", "2026/07/phero-storm-960-1.webp", "2026/07/phero-storm-960.jpg", "2026/07/phero-storm-960.webp", "2026/07/phero-water-1448.jpg", "2026/07/phero-water-1448.webp", "2026/07/phero-water-960-1.jpg", "2026/07/phero-water-960.jpg", "2026/07/phero-water-960.webp", "2026/07/proj-comm-1-480-1.webp", "2026/07/proj-comm-1-480.jpg", "2026/07/proj-comm-1-480.webp", "2026/07/proj-comm-1-800-1.webp", "2026/07/proj-comm-1-800.jpg", "2026/07/proj-comm-1-800.webp", "2026/07/proj-comm-2-480-1.webp", "2026/07/proj-comm-2-480.jpg", "2026/07/proj-comm-2-480.webp", "2026/07/proj-comm-2-800.jpg", "2026/07/proj-comm-2-800.webp", "2026/07/proj-comm-3-480.jpg", "2026/07/proj-comm-3-480.webp", "2026/07/proj-comm-3-800.jpg", "2026/07/proj-comm-3-800.webp", "2026/07/proj-fire-480.jpg", "2026/07/proj-fire-480.webp", "2026/07/proj-fire-800.jpg", "2026/07/proj-fire-800.webp", "2026/07/proj-storm-480-1.webp", "2026/07/proj-storm-480.jpg", "2026/07/proj-storm-480.webp", "2026/07/proj-storm-800.jpg", "2026/07/proj-storm-800.webp", "2026/07/proj-water-480-1.jpg", "2026/07/proj-water-480.jpg", "2026/07/proj-water-480.webp", "2026/07/proj-water-800-1.jpg", "2026/07/proj-water-800.jpg", "2026/07/proj-water-800.webp", "2026/07/split-commercial-1448.jpg", "2026/07/split-commercial-1448.webp", "2026/07/split-commercial-960.jpg", "2026/07/split-commercial-960.webp", "2026/07/split-emergency-1448.jpg", "2026/07/split-emergency-1448.webp", "2026/07/split-emergency-960-1.jpg", "2026/07/split-emergency-960.jpg", "2026/07/split-emergency-960.webp", "2026/07/split-extract-1448-1.webp", "2026/07/split-extract-1448-1024x768.jpg", "2026/07/split-extract-1448-300x225.jpg", "2026/07/split-extract-1448-600x450.jpg", "2026/07/split-extract-1448-768x576.jpg", "2026/07/split-extract-1448.jpg", "2026/07/split-extract-1448.webp", "2026/07/split-extract-960-1.webp", "2026/07/split-extract-960-300x225.jpg", "2026/07/split-extract-960-600x450.jpg", "2026/07/split-extract-960-768x576.jpg", "2026/07/split-extract-960.jpg", "2026/07/split-extract-960.webp", "2026/07/split-fire-1448-1.jpg", "2026/07/split-fire-1448.jpg", "2026/07/split-fire-1448.webp", "2026/07/split-fire-960.jpg", "2026/07/split-fire-960.webp", "2026/07/split-flood-1448-1-300x199.jpg", "2026/07/split-flood-1448-1.jpg", "2026/07/split-flood-1448.jpg", "2026/07/split-flood-1448.webp", "2026/07/split-flood-960.jpg", "2026/07/split-flood-960.webp", "2026/07/split-insurance-1448.jpg", "2026/07/split-insurance-1448.webp", "2026/07/split-insurance-960-1.webp", "2026/07/split-insurance-960.jpg", "2026/07/split-insurance-960.webp", "2026/07/split-sewage-1448.jpg", "2026/07/split-sewage-1448.webp", "2026/07/split-sewage-960.jpg", "2026/07/split-sewage-960.webp", "2026/07/split-storm-1448-1.jpg", "2026/07/split-storm-1448.jpg", "2026/07/split-storm-1448.webp", "2026/07/split-storm-960-1.webp", "2026/07/split-storm-960.jpg", "2026/07/split-storm-960.webp", "2026/07/team-480-1.jpg", "2026/07/team-480.jpg", "2026/07/team-480.webp", "2026/07/team-760-1.webp", "2026/07/team-760.jpg", "2026/07/team-760.webp"];
