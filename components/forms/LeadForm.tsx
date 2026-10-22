"use client";

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { HelpSection } from "@/lib/types";
import { ATTRIBUTION_STORAGE_KEY, attributionKeys } from "@/lib/lead-options";

type FieldName = "name" | "phone" | "email" | "address" | "issue" | "message";
type Field = { name: FieldName; label: string; placeholder: string; type: "text" | "tel" | "email" | "textarea"; required?: boolean; autoComplete?: string };

/* The old site's two forms, field for field (labels are screen-reader only, as before). */
const FIELDS: Record<HelpSection["form"]["variant"], Field[]> = {
  quick: [
    { name: "name", label: "Full name", placeholder: "Full name", type: "text", required: true, autoComplete: "name" },
    { name: "phone", label: "Phone number", placeholder: "Phone number", type: "tel", required: true, autoComplete: "tel" },
    { name: "address", label: "Property address", placeholder: "Property address", type: "text", autoComplete: "street-address" },
    { name: "issue", label: "What happened?", placeholder: "What happened? (burst pipe, flood…)", type: "text" },
  ],
  message: [
    { name: "name", label: "Full name", placeholder: "Full name", type: "text", required: true, autoComplete: "name" },
    { name: "phone", label: "Phone number", placeholder: "Phone number", type: "tel", required: true, autoComplete: "tel" },
    { name: "email", label: "Email address", placeholder: "Email address", type: "email", autoComplete: "email" },
    { name: "address", label: "Property address", placeholder: "Property address", type: "text", autoComplete: "street-address" },
    { name: "message", label: "How can we help?", placeholder: "How can we help? (burst pipe, flood, question…)", type: "textarea" },
  ],
};

const now = () => Date.now();

/* Client checks; public/api/lead.php checks the same on the server. */
function check(f: FieldName, v: string): string | undefined {
  const t = v.trim();
  if (f === "name") return t.length < 2 ? "Please enter your full name." : undefined;
  if (f === "phone") return !/^[0-9()#&+*\-=. ]+$/.test(t) || t.replace(/\D/g, "").length < 10 ? "Please enter a phone number with area code." : undefined;
  if (f === "email") return t && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? "Please enter a valid email address." : undefined;
  return v.length > 3000 ? "Please keep this under 3,000 characters." : undefined;
}

/**
 * "Request Immediate Help" / "Send Us a Message" form. Posts JSON to /api/lead.php (SiteGround PHP),
 * which forwards to GoHighLevel. Spam: hidden field + timing check. On success the form is replaced
 * by the old site's thank-you message.
 */
export function LeadForm({
  form,
  businessName,
  phone,
  phoneHref,
  trackPage,
  lockIcon,
}: {
  form: HelpSection["form"];
  businessName: string;
  phone: string;
  phoneHref: string;
  trackPage: string;
  lockIcon: ReactNode;
}) {
  const fields = FIELDS[form.variant].map((f) => {
    const own = form.fields?.find((x) => x.name === f.name);
    return own ? { ...f, label: own.label || f.label, placeholder: own.placeholder || f.placeholder } : f;
  });
  const uid = useId();
  const ref = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const [values, setValues] = useState<Partial<Record<FieldName, string>>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName | "consent", string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    startedAt.current = now();
    // Sent without JavaScript: /api/lead.php sends the visitor back with ?sent=1.
    const sentWithoutJs = () => {
      if (new URLSearchParams(window.location.search).get("sent") === "1") setStatus("done");
    };
    sentWithoutJs();
  }, []);

  const id = (f: string) => `${uid}-${f}`;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const next: Partial<Record<FieldName | "consent", string>> = {};
    for (const f of fields) {
      const msg = check(f.name, values[f.name] ?? "");
      if (msg) next[f.name] = msg;
    }
    if (!consent) next.consent = "Please agree so we can contact you.";
    setErrors(next);
    const bad = Object.keys(next);
    if (bad.length) {
      ref.current?.querySelector<HTMLElement>(`#${CSS.escape(id(bad[0]))}`)?.focus();
      return;
    }
    setStatus("sending");
    let attribution: Record<string, string> = {};
    try {
      attribution = JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? "{}");
    } catch {
      /* storage unavailable */
    }
    const honeypot = (ref.current?.elements.namedItem("website_url") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: form.variant,
          ...Object.fromEntries(fields.map((f) => [f.name, values[f.name] ?? ""])),
          consent: true,
          website_url: honeypot,
          elapsed_ms: now() - startedAt.current,
          page_url: window.location.href,
          landing_page: attribution.landing_page ?? "",
          referrer: attribution.referrer ?? document.referrer,
          ...Object.fromEntries(attributionKeys.map((k) => [k, attribution[k] ?? ""])),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
      const params = { form: form.variant, page: trackPage };
      if (w.gtag) w.gtag("event", "generate_lead", params);
      else w.dataLayer?.push({ event: "generate_lead", ...params });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done")
    return (
      <div className="wdp-form" role="status">
        <div className="wdp-form__done">
          <h3>Thank you, we got your message.</h3>
          <p>
            We will call you right back. For an emergency, call <a href={phoneHref}>{phone}</a>.
          </p>
        </div>
      </div>
    );

  return (
    <form ref={ref} className="wdp-form" method="post" action="/api/lead.php" noValidate onSubmit={onSubmit}>
      <p className="wdp-form__rating">
        <span className="stars" aria-hidden="true">
          ★★★★★
        </span>
        <b>{form.ratingValue}</b>
        <span>{form.ratingText}</span>
      </p>
      <h3>{form.title}</h3>
      <p className="wdp-form__sub">{form.sub}</p>
      {fields.map((f) => {
        const err = errors[f.name];
        const common = {
          id: id(f.name),
          name: f.name,
          className: "wdp-field",
          placeholder: f.placeholder,
          required: f.required,
          autoComplete: f.autoComplete,
          value: values[f.name] ?? "",
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? id(`${f.name}-err`) : undefined,
        };
        return (
          <Fragment key={f.name}>
            <label className="wdp-sr-only" htmlFor={id(f.name)}>
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
            ) : (
              <input
                {...common}
                type={f.type}
                inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            )}
            {err ? (
              <p className="wdp-form__error" id={id(`${f.name}-err`)}>
                {err}
              </p>
            ) : null}
          </Fragment>
        );
      })}
      <label className="wdp-consent" htmlFor={id("consent")}>
        <input
          id={id("consent")}
          name="consent"
          value="yes"
          type="checkbox"
          checked={consent}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? id("consent-err") : undefined}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setErrors((er) => ({ ...er, consent: undefined }));
          }}
        />
        <span>
          I agree to be contacted by {businessName} by phone, text or email about my request. Message and data rates may apply. Reply STOP to opt out.
        </span>
      </label>
      {errors.consent ? (
        <p className="wdp-form__error" id={id("consent-err")}>
          {errors.consent}
        </p>
      ) : null}
      <div className="wdp-honeypot" aria-hidden="true">
        <label htmlFor={id("website_url")}>Leave this field empty</label>
        <input id={id("website_url")} name="website_url" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" ? (
        <p className="wdp-form__error" role="alert">
          Sorry, something went wrong. Please call <a href={phoneHref}>{phone}</a>.
        </p>
      ) : null}
      <button type="submit" className="wdp-btn wdp-btn--primary wdp-form__submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : form.button}
      </button>
      <p className="wdp-form__safe">
        {lockIcon} {form.safe}
      </p>
    </form>
  );
}
