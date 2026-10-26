// Geometri logo PIXEL'25 (diukur dari "LOGO ANGKATAN.png", viewBox 1317x1010).
// Dipakai bersama oleh PixelMark (SVG), IntroLoader (animasi) dan PixelLogo3D.

export const PIXEL_VIEWBOX = { w: 1317, h: 1010 } as const;

export type PixelFill = "glass" | "blue" | "sand";
export type PixelPart = { id: string; d: string; fill: PixelFill; box: { x: number; y: number; w: number; h: number } };

function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}
const box = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });

// Penghubung cekung antara kotak sudut dan pusat huruf X.
const X_JOINTS = [
  "M605 535Q612 612 680 618L619 618L619 680Q612 612 535 604L560 560Z",
  "M852 560L877 604Q800 612 793 680L793 618L732 618Q800 612 807 535Z",
  "M560 851L535 806Q612 799 619 731L619 793L680 793Q612 799 605 876Z",
  "M807 876Q800 799 732 793L793 793L793 731Q800 799 877 806L852 851Z",
].join("");

export const PIXEL_PARTS: PixelPart[] = [
  { id: "l1", d: rrect(0, 0, 294, 294, 36), fill: "glass", box: box(0, 0, 294, 294) },
  { id: "l2", d: rrect(0, 331, 294, 294, 36), fill: "glass", box: box(0, 331, 294, 294) },
  { id: "l3", d: rrect(0, 662, 294, 294, 36), fill: "glass", box: box(0, 662, 294, 294) },
  { id: "t", d: rrect(331, 20, 274, 274, 36), fill: "blue", box: box(331, 20, 274, 274) },
  {
    id: "x",
    d:
      rrect(331, 331, 274, 273, 36) +
      rrect(807, 402, 202, 202, 36) +
      rrect(402, 806, 202, 202, 36) +
      rrect(807, 806, 202, 202, 36) +
      "M619 618H793V793H619Z" +
      X_JOINTS,
    fill: "blue",
    box: box(331, 331, 678, 677),
  },
  { id: "i", d: rrect(331, 634, 104, 144, 36), fill: "sand", box: box(331, 634, 104, 144) },
  {
    id: "e",
    d:
      "M1011 634H1062V778H1011Q975 778 975 742V670Q975 634 1011 634Z" +
      rrect(1040, 634, 88, 34, 17) +
      rrect(1040, 688, 88, 34, 17) +
      rrect(1040, 744, 88, 34, 17),
    fill: "blue",
    box: box(975, 634, 153, 144),
  },
  {
    id: "l",
    d: "M1201 778H1233Q1269 778 1269 814V922H1201Q1165 922 1165 886V814Q1165 778 1201 778Z" + rrect(1230, 887, 87, 35, 17),
    fill: "blue",
    box: box(1165, 778, 152, 144),
  },
];

export const PIXEL_RING = { cx: 311, cy: 307, r: 88, inner: 60 } as const;
