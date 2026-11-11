/*
 * Lead form handler (replaces public/api/lead.php, which cannot run on Vercel). The forms post here:
 * "quick" (name, phone, address, what happened), "message" (name, phone, email, address, message) and
 * "comment" (the blog posts' "Leave a Reply" form).
 *
 * Every lead goes to TTR OS only (POST <TTR_OS_URL>/api/site/form, needs the site key): Water Damage Pro has no
 * GoHighLevel and never will (Kia, Nov 11); the client's leads live in the TTR OS CRM. A comment arrives as a lead named
 * "Blog comment" so it is not lost. Success when TTR OS took it, else "call us".
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

const KINDS = {
  quick: "Request Immediate Help",
  message: "Send Us a Message",
  comment: "Leave a Reply",
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
  // one signal alone is delivered with a spam_check note.
  const trapFilled = text(input, "website_url", 200) !== "";
  const elapsed = typeof input.elapsed_ms === "number" ? input.elapsed_ms : null;
  const tooFast = elapsed !== null && elapsed < MIN_FILL_MS;
  if (trapFilled && tooFast) return reply(200, { ok: true }, comment);
  const spamCheck = trapFilled ? "suspect: hidden field filled" : tooFast ? `suspect: sent in ${elapsed} ms` : "ok";

  const referer = req.headers.get("referer") || "";
  const pick = (k: string) => text(input, k, 1000);

  const sends: Promise<boolean>[] = [];

  const siteKey = (process.env.NEXT_PUBLIC_TTR_SITE_KEY || process.env.TTR_SITE_KEY || "").trim();
  if (!siteKey) console.error("[lead] NEXT_PUBLIC_TTR_SITE_KEY is not set: nothing is sent.");
  else {
    const os = new URLSearchParams({
      k: siteKey,
      p: new URL(text(input, "page_url", 1000) || referer || SITE_ORIGIN + "/", SITE_ORIGIN).pathname,
      r: text(input, "referrer", 1000),
      u: text(input, "landing_page", 1000) || text(input, "page_url", 1000),
    });
    const keep: [string, string][] = [["name", lead.name], ["phone", lead.phone], ["email", lead.email], ["address", lead.address], ["message", lead.details],
      ["form", comment ? "Blog comment" : KINDS[form]], ["spam_check", spamCheck === "ok" ? "" : spamCheck],
      ...(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const).map((k): [string, string] => [k, pick(k)])];
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
