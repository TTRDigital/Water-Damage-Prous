import { CallIcon } from "@/components/ui/Icon";

/**
 * Phones: a call bar fixed to the bottom of the screen, so the number is one tap away on every page,
 * however far the visitor has scrolled (desktop keeps the call button in the header).
 * `data-design`: a design addition, not page content (the page comparisons leave it out).
 */
export function CallBar({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  return (
    <div className="wdp-callbar" data-design="callbar">
      <p className="wdp-callbar__label" aria-hidden="true">
        24/7 emergency line
        <b>{phone}</b>
      </p>
      <a className="wdp-btn wdp-btn--call wdp-callbar__btn" href={phoneHref} data-track="click_to_call" aria-label={`Call now, ${phone}`}>
        <CallIcon />
        Call now
      </a>
    </div>
  );
}
