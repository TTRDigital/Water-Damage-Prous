/*
 * Lead form handler (replaces public/api/lead.php, which cannot run on Vercel). The forms post here:
 * "quick" (name, phone, address, what happened), "message" (name, phone, email, address, message) and
 * "comment" (the blog posts' "Leave a Reply" form).
 *
 * Where a lead goes (Ben, Nov 11):
 * - Quick and message forms: TTR OS (the client's Leads page, POST <TTR_OS_URL>/api/site/form, needs the site key)
 *   AND the GoHighLevel inbound webhook (GHL_WEBHOOK_URL, same flat JSON as lead.php sent), so the existing
 *   workflow keeps working. The visitor sees success when either one took the lead.
 * - Comments: GoHighLevel only, as before (no new leads from comments).
 * GHL_WEBHOOK_URL is set on the Production scope only, so a preview deployment never posts to the real workflow.
 * Without JavaScript the browser posts the fields directly and is sent back with ?sent=1 or ?error=1.
 */
import { MIN_FILL_MS } from "@/lib/lead-options";

export const dynamic = "force-dynamic";

const OS_URL = (process.env.TTR_OS_URL || "https://portal.ttrdigitalmarketing.com").replace(/\/$/, "");
const SITE_ORIGIN = "https://waterdamageprous.com";
const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

type In = Record<string, unknown>;
const text = (i: In, k: string, max: number) => {
  const v = i[k];
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim().slice(0, max) : "";
};

/* Best-effort limit per server instance: 10 requests per 10 minutes per address. TTR OS limits again on its side. */
const seen = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  seen.set(ip, recent);
  if (seen.size > 5000) for (const [k, v] of seen) if (!v.some((t) => now - t < 600_000)) seen.delete(k);
  return recent.length > 10;
}

const ipOf = (req: Request) => (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();

function sameSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin || origin === "null") return true;
  try {
    return new URL(origin).host.toLowerCase() === (req.headers.get("host") || "").toLowerCase();
  } catch {
    return false;
  }
}

function back(req: Request, flag: "sent" | "error", comment: boolean) {
  let path = "/";
  try {
    const ref = new URL(req.headers.get("referer") || "");
    if (ref.host.toLowerCase() === (req.headers.get("host") || "").toLowerCase()) path = ref.pathname || "/";
  } catch {
    /* no referer: go home */
  }
  return new Response(null, { status: 303, headers: { ...NO_STORE, Location: `${path}?${flag}=1${comment ? "#respond" : "#help"}` } });
}

function e164(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d[0] === "1") return `+${d}`;
  return (raw.startsWith("+") ? "+" : "") + d;
}

const KINDS = {
  quick: ["Website emergency help form", "emergency-help-form", "Request Immediate Help"],
  message: ["Website contact form", "contact-form", "Send Us a Message"],
  comment: ["Website blog comment", "blog-comment", "Leave a Reply"],
} as const;

export async function POST(req: Request) {
  const json = (req.headers.get("content-type") || "").toLowerCase().startsWith("application/json");
  const reply = (status: number, body: Record<string, unknown>, comment = false) =>
    json ? Response.json(body, { status, headers: NO_STORE }) : back(req, body.ok ? "sent" : "error", comment);

  if (!sameSite(req)) return reply(403, { ok: false, error: "Forbidden." });
  if (limited(ipOf(req))) return reply(429, { ok: false, error: "Too many requests. Please call us instead." });

  let input: In = {};
  try {
    if (json) {
      const raw = await req.text();
      if (raw.length > 64 * 1024) return reply(400, { ok: false, error: "Invalid request." });
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
      input = parsed as In;
    } else {
      const f = await req.formData();
      for (const [k, v] of f) if (typeof v === "string") input[k] = v;
      input.consent = input.consent === "yes";
      input.form = "comment" in input ? "comment" : "message" in input || "email" in input ? "message" : "quick";
      if (input.form === "comment") {
        // The "Leave a Reply" form keeps WordPress's field names.
        input.name = input.author ?? "";
        input.message = input.comment ?? "";
        input.website = input.url ?? "";
      }
    }
  } catch {
    return reply(400, { ok: false, error: "Invalid request." });
  }

  const formRaw = text(input, "form", 20);
  const form: keyof typeof KINDS = formRaw === "message" || formRaw === "comment" ? formRaw : "quick";
  const comment = form === "comment";
  const lead = {
    name: text(input, "name", 120),
    phone: text(input, "phone", 40),
    email: text(input, "email", 200),
    address: text(input, "address", 300),
    details: form === "quick" ? text(input, "issue", 3000) : text(input, "message", 3000),
    website: text(input, "website", 200),
  };

  // Same checks as the form in the browser (components/forms/LeadForm.tsx).
  const errors: Record<string, string> = {};
  if (comment) {
    if (!lead.details) errors.comment = "Please type your comment text.";
    if (!lead.name) errors.author = "Please fill the required fields.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = "Please enter a valid email address.";
  } else {
    if (lead.name.length < 2) errors.name = "Please enter your full name.";
    if (!/^[0-9()#&+*\-=. ]+$/.test(lead.phone) || lead.phone.replace(/\D/g, "").length < 10) errors.phone = "Please enter a phone number with area code.";
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = "Please enter a valid email address.";
    if (input.consent !== true) errors.consent = "Please agree so we can contact you.";
  }
  if (Object.keys(errors).length) return reply(422, { ok: false, error: "Please check the form.", fields: errors }, comment);

  // Spam: drop only when both signals agree (hidden field filled AND sent faster than a person can type);
  // one signal alone is delivered with a "suspected-spam" tag.
  const trapFilled = text(input, "website_url", 200) !== "";
  const elapsed = typeof input.elapsed_ms === "number" ? input.elapsed_ms : null;
  const tooFast = elapsed !== null && elapsed < MIN_FILL_MS;
  if (trapFilled && tooFast) return reply(200, { ok: true }, comment);
  const spamCheck = trapFilled ? "suspect: hidden field filled" : tooFast ? `suspect: sent in ${elapsed} ms` : "ok";

  const parts = lead.name.split(/\s+/);
  const phone = e164(lead.phone);
  const tags = ["website-lead", KINDS[form][1], ...(spamCheck === "ok" ? [] : ["suspected-spam"])];
  const referer = req.headers.get("referer") || "";
  // One payload for every form, so one GoHighLevel workflow handles them all (same keys and order as lead.php).
  const fields: [string, string, string][] = [
    ["name", "Name", lead.name],
    ["phone", "Phone", phone],
    ["email", "Email", lead.email],
    ["first_name", "First name", parts[0] ?? ""],
    ["last_name", "Last name", parts.slice(1).join(" ")],
    ["phone_raw", "Phone (as typed)", lead.phone],
    ["address", "Property address", lead.address],
    ["message", "Message", lead.details],
    ["website", "Website", lead.website],
    ["form_name", "Form", text(input, "form_name", 100) || KINDS[form][2]],
    ["form", "Form type", form],
    ["source", "Source", KINDS[form][0]],
    ["page_url", "Page", text(input, "page_url", 1000) || referer],
    ["landing_page", "Landing page", text(input, "landing_page", 1000)],
    ["referrer", "Referrer", text(input, "referrer", 1000)],
    ["utm_source", "UTM source", text(input, "utm_source", 1000)],
    ["utm_medium", "UTM medium", text(input, "utm_medium", 1000)],
    ["utm_campaign", "UTM campaign", text(input, "utm_campaign", 1000)],
    ["utm_term", "UTM term", text(input, "utm_term", 1000)],
    ["utm_content", "UTM content", text(input, "utm_content", 1000)],
    ["gclid", "Google click ID (gclid)", text(input, "gclid", 1000)],
    ["fbclid", "Facebook click ID (fbclid)", text(input, "fbclid", 1000)],
    ["consent", "Agreed to be contacted", comment ? "No" : "Yes"],
    ["spam_check", "Spam check", spamCheck],
    ["tags", "Tags", tags.join(", ")],
    ["submitted_at", "Submitted (UTC)", new Date().toISOString().slice(0, 19).replace("T", " ")],
  ];
  const payload: Record<string, string> = {};
  for (const [k, , v] of fields) payload[k] = v;
  payload.response = fields.map(([, label, v]) => `${label}: ${v === "" ? "Not provided" : v}`).join("\n");

  const sends: Promise<boolean>[] = [];

  const hook = (process.env.GHL_WEBHOOK_URL || "").trim().replace(/^["']|["']$/g, "");
  // https only; plain http is allowed for a local test webhook (localhost), as lead.php did.
  if (/^https:\/\//.test(hook) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(hook)) {
    sends.push(
      (async () => {
        // One retry for rate limits, server errors and network failures.
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
            if (r.ok) return true;
            console.error(`[lead] GoHighLevel webhook answered ${r.status}`);
            if (r.status !== 429 && r.status < 500) return false;
          } catch (e) {
            console.error("[lead] GoHighLevel webhook failed:", String(e).slice(0, 160));
          }
          await new Promise((r) => setTimeout(r, 600));
        }
        return false;
      })(),
    );
  } else {
    console.error("[lead] GHL_WEBHOOK_URL is not set: nothing is sent to GoHighLevel.");
  }

  const siteKey = (process.env.NEXT_PUBLIC_TTR_SITE_KEY || process.env.TTR_SITE_KEY || "").trim();
  if (!comment && siteKey) {
    const os = new URLSearchParams({
      k: siteKey,
      p: new URL(text(input, "page_url", 1000) || referer || SITE_ORIGIN + "/", SITE_ORIGIN).pathname,
      r: text(input, "referrer", 1000),
      u: text(input, "landing_page", 1000) || text(input, "page_url", 1000),
    });
    const keep: [string, string][] = [["name", lead.name], ["phone", lead.phone], ["email", lead.email], ["address", lead.address], ["message", lead.details],
      ["form", KINDS[form][2]], ["utm_source", String(payload.utm_source)], ["utm_medium", String(payload.utm_medium)], ["utm_campaign", String(payload.utm_campaign)],
      ["utm_term", String(payload.utm_term)], ["utm_content", String(payload.utm_content)], ["gclid", String(payload.gclid)], ["fbclid", String(payload.fbclid)]];
    for (const [k, v] of keep) if (v) os.set(`f_${k}`, v);
    sends.push(
      fetch(`${OS_URL}/api/site/form`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": req.headers.get("user-agent") || "Mozilla/5.0 (waterdamageprous.com form)", "x-forwarded-for": ipOf(req), origin: SITE_ORIGIN },
        body: os,
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.status < 500).catch(() => false),
    );
  }

  const results = await Promise.all(sends);
  if (!results.some(Boolean)) {
    // Nothing took it: say so, so the visitor can call instead.
    return reply(502, { ok: false, error: "We could not send your request. Please call us instead." }, comment);
  }
  return reply(200, { ok: true, delivered: true }, comment);
}

export function GET() {
  return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: "POST" } });
}
