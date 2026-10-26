import { PIXEL_PARTS, PIXEL_RING, PIXEL_VIEWBOX } from "@/lib/brand/pixel";

/** Logo PIXEL'25 sebagai SVG inline. `id` membedakan gradien bila dirender beberapa kali di satu halaman. */
export function PixelMark({ height = 28, id = "pm", className }: { height?: number; id?: string; className?: string }) {
  const { w, h } = PIXEL_VIEWBOX;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      height={height}
      width={(height * w) / h}
      className={className}
      aria-hidden
      focusable="false"
    >
      <PixelDefs id={id} />
      {PIXEL_PARTS.map((p) => (
        <path key={p.id} d={p.d} fill={fillOf(p.fill, id)} />
      ))}
      <circle cx={PIXEL_RING.cx} cy={PIXEL_RING.cy} r={PIXEL_RING.r} fill={`url(#${id}-sand)`} />
      <circle cx={PIXEL_RING.cx} cy={PIXEL_RING.cy} r={PIXEL_RING.inner} fill="var(--color-bg)" />
    </svg>
  );
}

export function fillOf(f: "glass" | "blue" | "sand", id: string) {
  return f === "glass" ? `url(#${id}-glass)` : f === "sand" ? `url(#${id}-sand)` : "#205BC2";
}

export function PixelDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6C8DC4" />
        <stop offset="0.5" stopColor="#6C8DC4" />
        <stop offset="0.5" stopColor="#2A63C8" />
        <stop offset="1" stopColor="#205BC2" />
      </linearGradient>
      <linearGradient id={`${id}-sand`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#F0E2CE" />
        <stop offset="1" stopColor="#B3A797" />
      </linearGradient>
    </defs>
  );
}
