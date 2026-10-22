import { icons } from "@/lib/data/icons";

/** One of the old site's inline SVG icons (stroke styling comes from the section's CSS). */
export function Icon({ name }: { name: string }) {
  const svg = icons[name];
  if (!svg) return null;
  return <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/* Small fixed icons the old markup repeated in many places. */
export const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const PinIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const ShieldIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
  </svg>
);
export const PhoneOutlineIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19 19 0 0 1 3 4.1 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.7c.6 3 .6 3 .6 3a2 2 0 0 1-.5 2L8.1 9.9a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2-.5s0 0 3 .6A2 2 0 0 1 22 17z" />
  </svg>
);
export const ClockIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const LockIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
export const XIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
/** The call buttons' phone icon (drawn with its own stroke attributes in the old markup). */
export const CallIcon = () => (
  <svg className="wdp-btn__ico" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
