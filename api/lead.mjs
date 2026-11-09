// Vercel function: port of public/api/lead.php (Vercel runs no PHP). /api/lead.php is rewritten to /api/lead
// in vercel.json. The GoHighLevel webhook comes from the GHL_WEBHOOK_URL environment variable in Vercel
// (never in code). Keep the field rules in sync with lib/lead-options.ts and components/forms/LeadForm.tsx.
const hits = new Map(); // best-effort per-instance rate limit: 10 per 10 minutes per IP

const cut = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function parseBody(req) {
  const type = String(req.headers["content-type"] || "");
  let b = req.body;
  if (typeof b === "string") {
    try { b = type.includes("json") ? JSON.parse(b) : Object.fromEntries(new URLSearchParams(b)); } catch { b = null; }
  }
  return { isJson: type.startsWith("application/json"), body: b && typeof b === "object" ? b : null };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const { isJson, body } = parseBody(req);
  const back = (flag, isComment) => {
    let path = "/";
    try { const r = new URL(req.headers.referer || ""); if (r.host === req.headers.host) path = r.pathname; } catch {}
    res.statusCode = 303;
    res.setHeader("Location", `${path}?${flag}=1${isComment ? "#respond" : "#help"}`);
    res.end();
  };
  const reply = (status, out) => {
    if (!isJson && req.method === "POST") return back(out.ok ? "sent" : "error", body && "comment" in body);
    res.status(status).json(out);
  };

  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(405, { ok: false, error: "Method not allowed." }); }
  const origin = req.headers.origin;
  if (origin && origin !== "null") { try { if (new URL(origin).host !== req.headers.host) return reply(403, { ok: false, error: "Forbidden." }); } catch { return reply(403, { ok: false, error: "Forbidden." }); } }

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > 10) return reply(429, { ok: false, error: "Too many requests. Please call us instead." });

  if (!body) return reply(400, { ok: false, error: "Invalid request." });
  const input = { ...body };
  if (!isJson) {
    input.consent = input.consent === "yes";
    input.form = "comment" in input ? "comment" : "message" in input || "email" in input ? "message" : "quick";
    if (input.form === "comment") { input.name = input.author || ""; input.message = input.comment || ""; input.website = input.url || ""; }
  }
  let form = cut(input.form, 20);
  if (form !== "message" && form !== "comment") form = "quick";
  const lead = {
    name: cut(input.name, 120), phone: cut(input.phone, 40), email: cut(input.email, 200), address: cut(input.address, 300),
    details: form === "quick" ? cut(input.issue, 3000) : cut(input.message, 3000), website: cut(input.website, 200),
  };
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const errors = {};
  if (form === "comment") {
    if (!lead.details) errors.comment = "Please type your comment text.";
    if (!lead.name) errors.author = "Please fill the required fields.";
    if (!validEmail(lead.email)) errors.email = "Please enter a valid email address.";
  } else {
    if (lead.name.length < 2) errors.name = "Please enter your full name.";
    if (!/^[0-9()#&+*\-=. ]+$/.test(lead.phone) || lead.phone.replace(/\D/g, "").length < 10) errors.phone = "Please enter a phone number with area code.";
    if (lead.email && !validEmail(lead.email)) errors.email = "Please enter a valid email address.";
    if (input.consent !== true) errors.consent = "Please agree so we can contact you.";
  }
  if (Object.keys(errors).length) return reply(422, { ok: false, error: "Please check the form.", fields: errors });

  const trapFilled = cut(input.website_url, 200) !== "";
  const elapsed = Number.isInteger(input.elapsed_ms) ? input.elapsed_ms : null;
  const tooFast = elapsed !== null && elapsed < 2500;
  if (trapFilled && tooFast) return reply(200, { ok: true });
  const spamCheck = trapFilled ? "suspect: hidden field filled" : tooFast ? `suspect: sent in ${elapsed} ms` : "ok";

  const webhook = (process.env.GHL_WEBHOOK_URL || "").trim().replace(/^["']|["']$/g, "");
  if (!/^https:\/\//.test(webhook)) {
    console.error("[lead] GHL_WEBHOOK_URL missing or not https: request accepted but NOT sent.");
    return reply(200, { ok: true, delivered: false });
  }

  const digits = lead.phone.replace(/\D/g, "");
  const phone = digits.length === 10 ? "+1" + digits : digits.length === 11 && digits[0] === "1" ? "+" + digits : (lead.phone.startsWith("+") ? "+" : "") + digits;
  const parts = lead.name.split(/\s+/);
  const kinds = {
    quick: ["Website emergency help form", "emergency-help-form", "Request Immediate Help"],
    message: ["Website contact form", "contact-form", "Send Us a Message"],
    comment: ["Website blog comment", "blog-comment", "Leave a Reply"],
  };
  const tags = ["website-lead", kinds[form][1]];
  if (spamCheck !== "ok") tags.push("suspected-spam");
  const t = (k) => cut(input[k], 1000);
  const fields = [
    ["name", "Name", lead.name], ["phone", "Phone", phone], ["email", "Email", lead.email],
    ["first_name", "First name", parts[0]], ["last_name", "Last name", parts.slice(1).join(" ")],
    ["phone_raw", "Phone (as typed)", lead.phone], ["address", "Property address", lead.address],
    ["message", "Message", lead.details], ["website", "Website", lead.website],
    ["form_name", "Form", cut(input.form_name, 100) || kinds[form][2]], ["form", "Form type", form],
    ["source", "Source", kinds[form][0]], ["page_url", "Page", t("page_url") || String(req.headers.referer || "")],
    ["landing_page", "Landing page", t("landing_page")], ["referrer", "Referrer", t("referrer")],
    ["utm_source", "UTM source", t("utm_source")], ["utm_medium", "UTM medium", t("utm_medium")],
    ["utm_campaign", "UTM campaign", t("utm_campaign")], ["utm_term", "UTM term", t("utm_term")],
    ["utm_content", "UTM content", t("utm_content")], ["gclid", "Google click ID (gclid)", t("gclid")],
    ["fbclid", "Facebook click ID (fbclid)", t("fbclid")],
    ["consent", "Agreed to be contacted", form === "comment" ? "No" : "Yes"], ["spam_check", "Spam check", spamCheck],
    ["tags", "Tags", tags.join(", ")], ["submitted_at", "Submitted (UTC)", new Date().toISOString().slice(0, 19).replace("T", " ")],
  ];
  const payload = Object.fromEntries(fields.map(([k, , v]) => [k, v]));
  payload.response = fields.map(([, l, v]) => `${l}: ${v === "" ? "Not provided" : v}`).join("\n");

  for (let attempt = 0; attempt < 2; attempt++) {
    let status = 0;
    try {
      const r = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
      status = r.status;
    } catch {}
    if (status >= 200 && status < 300) return reply(200, { ok: true, delivered: true });
    console.error(`[lead] GoHighLevel webhook answered ${status}`);
    if (status !== 0 && status !== 429 && status < 500) break;
    await new Promise((r) => setTimeout(r, 600));
  }
  return reply(502, { ok: false, error: "We could not send your request. Please call us instead." });
}
