// Tests for lib/spam-guard.ts (TTR-2496). Run: node --experimental-strip-types --no-warnings --test lib/spam-guard.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { contentFlags, guardLead, rateLimited, SPAM_LABEL } from "./spam-guard.ts";

const human = { trap: "", elapsedMs: 9000, minFillMs: 2500, texts: ["Jane Doe", "Hi, I would like an appointment next week."] };
const quiet = () => {
  const warn = console.warn;
  console.warn = () => {};
  return () => (console.warn = warn);
};

test("a normal lead is delivered with no mark", async () => {
  const v = await guardLead(human);
  assert.deepEqual(v, { action: "deliver", possibleSpam: false, reasons: [], note: "ok" });
});

test("hidden field, missing timing and too fast are each dropped on their own", async () => {
  const restore = quiet();
  assert.deepEqual(await guardLead({ ...human, trap: "http://x.ru" }), { action: "drop", reason: "hidden-field" });
  assert.deepEqual(await guardLead({ ...human, elapsedMs: undefined }), { action: "drop", reason: "no-timing" });
  assert.deepEqual(await guardLead({ ...human, elapsedMs: "9000" }), { action: "drop", reason: "no-timing" });
  assert.deepEqual(await guardLead({ ...human, elapsedMs: 800 }), { action: "drop", reason: "too-fast" });
  restore();
});

test("the refused count is logged with the reason and no personal data", async () => {
  const lines: string[] = [];
  const warn = console.warn;
  console.warn = (m: string) => lines.push(m);
  await guardLead({ ...human, texts: ["secret@example.com"], elapsedMs: 10 });
  console.warn = warn;
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[spam-guard\] refused reason=too-fast count=\d+$/);
});

test("content check flags but still delivers", async () => {
  const v = await guardLead({ ...human, texts: ["We offer SEO and backlinks to get you on the first page of Google"] });
  assert.equal(v.action, "deliver");
  assert.ok(v.action === "deliver" && v.possibleSpam && v.note.startsWith(SPAM_LABEL));
  assert.deepEqual(contentFlags(["see https://a.com and https://b.com"]), ["links"]);
  assert.deepEqual(contentFlags(["one link https://a.com is fine"]), []);
  assert.deepEqual(contentFlags(["Привет"]), ["cyrillic"]);
  assert.deepEqual(contentFlags(["你好"]), ["chinese"]);
  assert.deepEqual(contentFlags(["Get a business loan today"]), ["pitch"]);
  assert.deepEqual(contentFlags(["Earn with crypto trading"]), ["pitch"]);
  // Ordinary words that contain a pitch word are not flagged.
  assert.deepEqual(contentFlags(["I live in Seoul and my tooth hurts", "raccoon in the attic, can you see it?"]), []);
});

test("rate limit: 5 per 10 minutes per address", () => {
  const restore = quiet();
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(rateLimited("1.2.3.4", t + i), false);
  assert.equal(rateLimited("1.2.3.4", t + 10), true);
  assert.equal(rateLimited("5.6.7.8", t + 10), false);
  assert.equal(rateLimited("1.2.3.4", t + 11 * 60 * 1000), false);
  restore();
});

test("reCAPTCHA: skipped without keys, strict with keys", async () => {
  const restore = quiet();
  const reply = (body: object, ok = true) => (async () => ({ ok, status: ok ? 200 : 500, json: async () => body })) as unknown as typeof fetch;
  const down = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;

  delete process.env.RECAPTCHA_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  assert.equal((await guardLead({ ...human, fetchFn: down })).action, "deliver");

  process.env.RECAPTCHA_SECRET_KEY = "test-secret";
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = "test-site";
  try {
    assert.deepEqual(await guardLead({ ...human, fetchFn: down }), { action: "drop", reason: "recaptcha-missing" });
    assert.deepEqual(await guardLead({ ...human, recaptchaToken: "t", fetchFn: reply({ success: false }) }), { action: "drop", reason: "recaptcha-failed" });
    assert.deepEqual(await guardLead({ ...human, recaptchaToken: "t", fetchFn: reply({ success: true, score: 0.1 }) }), { action: "drop", reason: "recaptcha-score" });
    const low = await guardLead({ ...human, recaptchaToken: "t", fetchFn: reply({ success: true, score: 0.4 }) });
    assert.ok(low.action === "deliver" && low.possibleSpam && low.reasons.includes("recaptcha-low-score"));
    const good = await guardLead({ ...human, recaptchaToken: "t", fetchFn: reply({ success: true, score: 0.9 }) });
    assert.ok(good.action === "deliver" && !good.possibleSpam);
    const unreachable = await guardLead({ ...human, recaptchaToken: "t", fetchFn: down });
    assert.ok(unreachable.action === "deliver" && unreachable.possibleSpam && unreachable.note === `${SPAM_LABEL}: recaptcha-unreachable`);
    const err500 = await guardLead({ ...human, recaptchaToken: "t", fetchFn: reply({}, false) });
    assert.ok(err500.action === "deliver" && err500.possibleSpam);
  } finally {
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    restore();
  }
});
