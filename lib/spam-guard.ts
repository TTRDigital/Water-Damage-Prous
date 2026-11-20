/*
 * Form spam guard (TTR-2496). The same file is used on every client site (Smiles by Jiveh, Beverly Hills Top Dentist,
 * Water Damage Pro, Capital Investment, Pro Wildlife Removal): change it in all of them together.
 *
 * Server (app/api/.../route): `const verdict = await guardLead({...})`
 *   - "drop": answer the usual ok reply and send nothing (hidden field filled, no fill time, sent too fast,
 *     reCAPTCHA token missing or rejected). A count line is logged with the reason, never the person's details.
 *   - "deliver": send the lead. When `possibleSpam` is true, put `SPAM_LABEL` first in the subject or tags so the
 *     team can filter it (links, Cyrillic or Chinese text, SEO / backlink / crypto / loan pitches, low reCAPTCHA score,
 *     Google not reachable). A doubtful lead is never thrown away.
 *   `rateLimited(ip)` is a separate per-address limit (5 per 10 minutes per server instance).
 *
 * reCAPTCHA v3 is optional: only when RECAPTCHA_SECRET_KEY and NEXT_PUBLIC_RECAPTCHA_SITE_KEY are both set is a token
 * required and checked with Google. Browser: `await recaptchaToken("lead")` (empty string when not set up).
 *
 * No imports, so `node --experimental-strip-types` can run the tests and both the browser and the server can use it.
 */

export const SPAM_LABEL = "Possible spam";

const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RECAPTCHA_DROP_BELOW = 0.3; // v3 score under this: dropped
const RECAPTCHA_FLAG_BELOW = 0.5; // under this: delivered as possible spam

/* ---------- Logging: one count line per refused submission, no personal data ---------- */

const refused = new Map<string, number>();
export function logRefused(reason: string): void {
  const n = (refused.get(reason) ?? 0) + 1;
  refused.set(reason, n);
  console.warn(`[spam-guard] refused reason=${reason} count=${n}`);
}

/* ---------- Per-address rate limit (memory of this server instance) ---------- */

const hits = new Map<string, number[]>();
export function rateLimited(ip: string, now = Date.now()): boolean {
  const key = ip || "unknown";
  const list = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  if (list.length > RATE_MAX) {
    logRefused("rate-limit");
    return true;
  }
  return false;
}

/** The visitor's address as Vercel passes it. */
export const clientIp = (req: Request) =>
  (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();

/* ---------- Content check (flags, never drops) ---------- */

// Whole words or phrases (regex pieces), matched without case.
const PITCHES = [
  "seo", "backlinks?", "back links?", "link building", "guest posts?", "domain authority", "first page of google", "page (?:1|one) of google",
  "rank(?:ing)? your (?:website|site|business)", "(?:website|web) traffic", "increase your traffic", "redesign your website", "website redesign",
  "web design services", "digital marketing services", "marketing agency", "lead generation", "outsourc\\w*", "virtual assistants?",
  "crypto\\w*", "bitcoin", "btc", "ethereum", "usdt", "blockchain", "forex", "binary options?", "nfts?", "casino", "betting",
  "business loans?", "business funding", "merchant cash advance", "loan offers?", "unsecured loans?", "funding approval",
  "viagra", "cialis", "unsubscribe", "ai chatbot",
];
const PITCH_RE = new RegExp(`\\b(?:${PITCHES.join("|")})\\b`, "i");
const LINK_RE = /\bhttps?:\/\/|\bwww\.|\[url=|<a\s/gi;
const CYRILLIC_RE = /[Ѐ-ӿ]/;
const CHINESE_RE = /[㐀-䶿一-鿿豈-﫿]/;

/** Reasons a lead looks like spam from its words alone (empty when it looks fine). */
export function contentFlags(texts: string[]): string[] {
  const all = texts.filter(Boolean).join("\n");
  const flags: string[] = [];
  if ((all.match(LINK_RE) ?? []).length > 1) flags.push("links");
  if (CYRILLIC_RE.test(all)) flags.push("cyrillic");
  if (CHINESE_RE.test(all)) flags.push("chinese");
  if (PITCH_RE.test(all)) flags.push("pitch");
  return flags;
}

/* ---------- reCAPTCHA v3 ---------- */

const siteKey = () => (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "").trim();
export const recaptchaEnabled = () => !!siteKey() && !!(process.env.RECAPTCHA_SECRET_KEY ?? "").trim();

type Verify = { kind: "pass" } | { kind: "drop"; reason: string } | { kind: "flag"; reason: string };

async function verifyRecaptcha(token: string, ip: string, fetchFn: typeof fetch): Promise<Verify> {
  if (!token) return { kind: "drop", reason: "recaptcha-missing" };
  let data: { success?: boolean; score?: number };
  try {
    const res = await fetchFn("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: (process.env.RECAPTCHA_SECRET_KEY ?? "").trim(), response: token, remoteip: ip }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    return { kind: "flag", reason: "recaptcha-unreachable" };
  }
  if (!data.success) return { kind: "drop", reason: "recaptcha-failed" };
  if (typeof data.score === "number") {
    if (data.score < RECAPTCHA_DROP_BELOW) return { kind: "drop", reason: "recaptcha-score" };
    if (data.score < RECAPTCHA_FLAG_BELOW) return { kind: "flag", reason: "recaptcha-low-score" };
  }
  return { kind: "pass" };
}

/* ---------- The guard ---------- */

export type GuardInput = {
  /** Value of the hidden field people never see. */
  trap: unknown;
  /** Milliseconds between the form showing and the submit, as the browser sent it. */
  elapsedMs: unknown;
  minFillMs: number;
  /** Free text the person typed (message, name, ...) for the content check. */
  texts: string[];
  recaptchaToken?: unknown;
  ip?: string;
  /** Tests only. */
  fetchFn?: typeof fetch;
};

export type GuardVerdict =
  | { action: "drop"; reason: string }
  | { action: "deliver"; possibleSpam: boolean; reasons: string[]; note: string };

export async function guardLead(g: GuardInput): Promise<GuardVerdict> {
  const drop = (reason: string): GuardVerdict => {
    logRefused(reason);
    return { action: "drop", reason };
  };

  if (typeof g.trap === "string" && g.trap.trim() !== "") return drop("hidden-field");
  if (typeof g.elapsedMs !== "number" || !Number.isFinite(g.elapsedMs)) return drop("no-timing");
  if (g.elapsedMs < g.minFillMs) return drop("too-fast");

  const reasons = contentFlags(g.texts);
  if (recaptchaEnabled()) {
    const token = typeof g.recaptchaToken === "string" ? g.recaptchaToken.trim().slice(0, 4000) : "";
    const v = await verifyRecaptcha(token, g.ip ?? "", g.fetchFn ?? fetch);
    if (v.kind === "drop") return drop(v.reason);
    if (v.kind === "flag") reasons.push(v.reason);
  }
  const possibleSpam = reasons.length > 0;
  return { action: "deliver", possibleSpam, reasons, note: possibleSpam ? `${SPAM_LABEL}: ${reasons.join(", ")}` : "ok" };
}

/* ---------- Browser: get a reCAPTCHA v3 token ---------- */

type Grecaptcha = { ready(cb: () => void): void; execute(key: string, o: { action: string }): Promise<string> };
let loading: Promise<Grecaptcha | null> | null = null;

function loadRecaptcha(key: string): Promise<Grecaptcha | null> {
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const w = window as unknown as { grecaptcha?: Grecaptcha };
    if (w.grecaptcha) return w.grecaptcha.ready(() => resolve(w.grecaptcha!));
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    s.async = true;
    s.onload = () => (w.grecaptcha ? w.grecaptcha.ready(() => resolve(w.grecaptcha!)) : resolve(null));
    s.onerror = () => {
      loading = null;
      resolve(null);
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Start loading reCAPTCHA early (on form focus or mount). Does nothing when no site key is set. */
export function preloadRecaptcha(): void {
  const key = siteKey();
  if (key && typeof window !== "undefined") void loadRecaptcha(key);
}

/** A token for the submit, or "" when reCAPTCHA is not set up or could not load. */
export async function recaptchaToken(action = "lead"): Promise<string> {
  const key = siteKey();
  if (!key || typeof window === "undefined") return "";
  try {
    const g = await Promise.race([loadRecaptcha(key), new Promise<null>((r) => setTimeout(() => r(null), 5000))]);
    return g ? await g.execute(key, { action }) : "";
  } catch {
    return "";
  }
}
