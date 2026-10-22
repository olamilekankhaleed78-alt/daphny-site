import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/* ── Brand mark: a clay pot with steam ── */
export function IconLogoMark(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.5}>
      <path d="M4.2 11.4h15.6c0 4.4-3.5 8-7.8 8s-7.8-3.6-7.8-8Z" />
      <path d="M3 11.4h18" />
      <path d="M6.6 11.4c-.9-1.5-.6-2.6.4-3.4" />
      <path d="M17.4 11.4c.9-1.5.6-2.6-.4-3.4" />
      <path d="M10.1 5.6c-.7-1-.7-1.7 0-2.6M13.9 5.6c-.7-1-.7-1.7 0-2.6" />
    </svg>
  );
}

export function IconBasket(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.4 8.6h17.2l-1.7 9.1a2.2 2.2 0 0 1-2.2 1.8H7.3a2.2 2.2 0 0 1-2.2-1.8L3.4 8.6Z" />
      <path d="m8 8.6 2.3-5.1M16 8.6l-2.3-5.1" />
      <path d="M9.6 12.4v3.2M14.4 12.4v3.2" />
    </svg>
  );
}

export function IconWhatsApp(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.3 3.5h2.4l1.5 3.7-1.9 1.3a10.7 10.7 0 0 0 5.2 5.2l1.3-1.9 3.7 1.5v2.4a2 2 0 0 1-2.2 2A15.6 15.6 0 0 1 4.3 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s6.6-5.3 6.6-10.2A6.6 6.6 0 0 0 5.4 10.8C5.4 15.7 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.8s.9 3-1.5 5.3C8 10.5 6.6 12 6.6 14.5A5.4 5.4 0 0 0 12 20a5.4 5.4 0 0 0 5.4-5.5c0-3.6-3-5.1-3-7.6 0 0-1.6.9-2.4 2.6-.4-2.4 0-4.4 0-6.7Z" />
    </svg>
  );
}

export function IconChilli(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13.2 5.6c2.6.5 4.4 2.6 4.4 5.2 0 4.6-4.2 8.4-9.2 8.4-1.7 0-3-.4-4-1.1 3.6-.6 5.8-2.3 7-4.6.9-1.8 1.2-3.9 1-6Z" />
      <path d="M13.2 5.6c-.4-1.3-.2-2.2.7-2.8.9-.6 1.9-.5 2.6.3" />
    </svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.6 19.4C3 15 5.3 8.9 11 6.3c2.6-1.2 5.6-1.4 8.4-1-.3 3-.9 6-2.5 8.5-2.8 4.5-8.5 6.6-12.3 5.6Z" />
      <path d="M5.6 18.4C9 14.6 13 11.4 18 9.4" />
    </svg>
  );
}

export function IconScooter(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5.4" cy="17.4" r="2.6" />
      <circle cx="18.4" cy="17.4" r="2.6" />
      <path d="M8 17.4h7.8" />
      <path d="M15.8 17.4 14 6.8h-2.4" />
      <path d="M5.4 17.4 7 12.2h5.2" />
      <path d="M9.4 9.4h4" />
    </svg>
  );
}

export function IconMortar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.6 12.4h14.8c0 3.9-3.3 7-7.4 7s-7.4-3.1-7.4-7Z" />
      <path d="M13.8 12.4 18.6 4" />
      <path d="M17.4 3.2 19.8 5" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4 4" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M5.5 12h13" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.8 6.6h14.4" />
      <path d="M9.2 6.6V4.9h5.6v1.7" />
      <path d="M6.6 6.6 7.5 19a1.6 1.6 0 0 0 1.6 1.5h5.8a1.6 1.6 0 0 0 1.6-1.5l.9-12.4" />
      <path d="M10.4 10v6.4M13.6 10v6.4" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="m4.8 12.6 4.6 4.6L19.4 7" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.8}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconBars(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.8}>
      <path d="M4 7h16M4 12h16M4 17h11" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2.9 14.8 9l6.7.7-5 4.5 1.4 6.6L12 17.5 6.1 20.8l1.4-6.6-5-4.5L9.2 9 12 2.9Z" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.6 12h14.2" />
      <path d="m13.4 6.6 5.4 5.4-5.4 5.4" />
    </svg>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4.6v14.2" />
      <path d="m6.6 13.4 5.4 5.4 5.4-5.4" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.8}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </svg>
  );
}

export function IconQuote(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M9.4 5.6c-3 1.6-4.9 4.4-4.9 8.1 0 3 1.6 4.9 3.9 4.9 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.2-3-3.2-.3 0-.6 0-.8.1.4-1.7 1.6-3.2 3.2-4.2l-1.9-2.3Zm9.3 0c-3 1.6-4.9 4.4-4.9 8.1 0 3 1.6 4.9 3.9 4.9 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.2-3-3.2-.3 0-.6 0-.8.1.4-1.7 1.6-3.2 3.2-4.2l-1.9-2.3Z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="1.6" />
      <path d="m3.8 6.6 8.2 6 8.2-6" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.6" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5l-1 3Z" />
      <path d="m14.8 7.2 2 2" />
    </svg>
  );
}

export function IconSave(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.4 4.5h10.2L19.5 8.4v11.1H5.4V4.5Z" />
      <path d="M8.4 4.5v4.2h6V4.5" />
      <rect x="8.4" y="12.6" width="7.2" height="6.9" />
    </svg>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3.4h12v17.2l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 20.6V3.4Z" />
      <path d="M9.2 8h5.6M9.2 11.6h5.6M9.2 15.2h3.4" />
    </svg>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.6 7.4h9.2M17.8 7.4h1.6M4.6 16.6h1.6M10.2 16.6h9.2" />
      <circle cx="15.8" cy="7.4" r="2" />
      <circle cx="8.2" cy="16.6" r="2" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.8" y="3.8" width="7" height="7" rx="1.2" />
      <rect x="13.2" y="3.8" width="7" height="7" rx="1.2" />
      <rect x="3.8" y="13.2" width="7" height="7" rx="1.2" />
      <rect x="13.2" y="13.2" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4.2 21 19.4H3L12 4.2Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.4 13.7 9 19.4 10.7 13.7 12.4 12 18.1 10.3 12.4 4.6 10.7 10.3 9 12 3.4Z" />
      <path d="M18.4 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.4 6.4h10.2v10.2H3.4z" />
      <path d="M13.6 9.8h3.6l3 3v3.8h-6.6" />
      <circle cx="7.2" cy="18" r="1.9" />
      <circle cx="17" cy="18" r="1.9" />
    </svg>
  );
}
