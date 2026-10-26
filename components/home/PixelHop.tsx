"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PixelDefs, fillOf } from "@/components/brand/PixelMark";
import { PIXEL_PARTS, PIXEL_RING, PIXEL_VIEWBOX, type PixelPart } from "@/lib/brand/pixel";

gsap.registerPlugin(useGSAP);

type Pt = { x: number; y: number };
type Pixel = { el: SVGRectElement; cx: number; cy: number; dist: number; diag: number };

const SVGNS = "http://www.w3.org/2000/svg";
const { w: VW, h: VH } = PIXEL_VIEWBOX;
const R = PIXEL_RING.r;
const HOME: Pt = { x: PIXEL_RING.cx, y: PIXEL_RING.cy };
const CENTER: Pt = { x: VW / 2, y: VH / 2 };
const WAVE = ["l1", "l2", "l3", "t", "x", "i", "e", "l"];
const SPARKS = 12;
// Ruang ekstra di atas untuk lintasan lompatan dan ring yang jatuh.
const VIEW = { x: -40, y: -380, w: VW + 80, h: VH + 420 };

// Titik pendaratan: ring berdiri di atas tile (pusat ring = tepi atas tile dikurangi jari-jari).
function onTop(id: string, x?: number, top?: number): Pt {
  const b = PIXEL_PARTS.find((p) => p.id === id)!.box;
  return { x: x ?? b.x + b.w / 2, y: (top ?? b.y) - R };
}

// Rute lompatan. `lift` = tinggi lompatan di atas titik tertinggi lintasan.
const ROUTE: { to: Pt; tile?: string; lift: number }[] = [
  { to: onTop("t"), tile: "t", lift: 160 },
  { to: onTop("l1"), tile: "l1", lift: 120 },
  { to: onTop("x", 908, 402), tile: "x", lift: 180 },
  { to: onTop("e"), tile: "e", lift: 120 },
  { to: onTop("l"), tile: "l", lift: 120 },
  { to: HOME, lift: 260 },
];

// Warna piksel per jenis tile. Sedikit variasi supaya terasa seperti piksel layar, bukan blok rata.
const SWATCH = {
  blue: ["#205BC2", "#2766D2", "#1B51AE", "#2A6BD8"],
  sand: ["#E8DCCB", "#DDCFBB", "#F0E4D3"],
  glassL: ["#6C8DC4", "#7697CC", "#6385BD"],
  glassR: ["#2A63C8", "#3069CF", "#245BBC"],
};
const pick = (a: string[], i: number) => a[i % a.length];

/** Pecah satu tile menjadi grid piksel. Sel dipakai bila cukup banyak titik sampelnya ada di dalam bentuk tile. */
function pixelsFor(part: PixelPart, cell: number, ctx: CanvasRenderingContext2D, layer: SVGGElement, out: Pixel[]) {
  const path = new Path2D(part.d);
  const { x, y, w, h } = part.box;
  const cols = Math.max(1, Math.round(w / cell));
  const rows = Math.max(1, Math.round(h / cell));
  const cw = w / cols;
  const ch = h / rows;
  const gap = Math.min(cw, ch) * 0.14;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = x + c * cw;
      const py = y + r * ch;
      let hit = 0;
      for (const sx of [0.2, 0.5, 0.8]) for (const sy of [0.2, 0.5, 0.8]) if (ctx.isPointInPath(path, px + cw * sx, py + ch * sy)) hit++;
      if (hit < 4) continue;
      const k = r * 7 + c * 3;
      const fill =
        part.fill === "sand"
          ? pick(SWATCH.sand, k)
          : part.fill === "glass"
            ? pick(px + cw / 2 < x + w / 2 ? SWATCH.glassL : SWATCH.glassR, k)
            : pick(SWATCH.blue, k);
      const el = document.createElementNS(SVGNS, "rect");
      el.setAttribute("x", String(px + gap / 2));
      el.setAttribute("y", String(py + gap / 2));
      el.setAttribute("width", String(cw - gap));
      el.setAttribute("height", String(ch - gap));
      el.setAttribute("rx", String(Math.min(cw, ch) * 0.18));
      el.setAttribute("fill", fill);
      layer.appendChild(el);
      const cx = px + cw / 2;
      const cy = py + ch / 2;
      out.push({ el, cx, cy, dist: Math.hypot(cx - CENTER.x, cy - CENTER.y), diag: cx + cy });
    }
  }
}

/**
 * Logo PIXEL'25 sebagai pertunjukan berulang (satu master timeline GSAP):
 * 1. Ratusan piksel beterbangan lalu menyusun logo.
 * 2. Piksel mengunci dengan gelombang diagonal, lalu berubah jadi tile utuh sambil disapu cahaya.
 * 3. Ring jatuh dari atas, memantul, memercikkan partikel.
 * 4. Ring melompat dari tile ke tile (antisipasi, squash & stretch, lintasan melengkung).
 * 5. X berputar penuh, tile L terbalik berurutan, mata ring melirik.
 * 6. Gelombang tile, kedip, lalu logo pecah kembali menjadi piksel yang berjatuhan.
 * Parallax mengikuti kursor di perangkat bermouse. Dijeda saat di luar layar; statis untuk reduced motion.
 */
export function PixelHop({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const pxLayer = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          small: "(max-width: 767px)",
          fine: "(hover: hover) and (pointer: fine)",
        },
        (mctx) => {
          const { motion, small, fine } = mctx.conditions as { motion: boolean; small: boolean; fine: boolean };
          if (!motion) return;

          // ---------- Bangun piksel ----------
          const canvas = document.createElement("canvas").getContext("2d");
          const layer = pxLayer.current;
          if (!canvas || !layer) return;
          const pixels: Pixel[] = [];
          const cell = small ? 58 : 38;
          for (const p of PIXEL_PARTS) pixelsFor(p, cell, canvas, layer, pixels);
          const els = pixels.map((p) => p.el);
          gsap.set(els, { transformOrigin: "50% 50%", opacity: 0 });

          const maxDist = Math.max(...pixels.map((p) => p.dist));
          const minDiag = Math.min(...pixels.map((p) => p.diag));
          const maxDiag = Math.max(...pixels.map((p) => p.diag));
          const byDist = (amount: number, inward = false) => (i: number) =>
            (inward ? 1 - pixels[i].dist / maxDist : pixels[i].dist / maxDist) * amount;
          const byDiag = (amount: number) => (i: number) => ((pixels[i].diag - minDiag) / (maxDiag - minDiag)) * amount;
          const byX = (amount: number) => (i: number) => (pixels[i].cx / VW) * amount;
          const rnd = gsap.utils.random;

          const mover = ".hop-mover";
          const body = ".hop-body";
          const pupil = ".hop-pupil";
          const sparks = gsap.utils.toArray<SVGRectElement>(".hop-spark");
          gsap.set([body, "[data-part]"], { transformOrigin: "50% 100%" });
          gsap.set(pupil, { transformOrigin: "50% 50%" });
          gsap.set('[data-part="x"]', { svgOrigin: "670 669.5" });
          gsap.set(".hop-reveal", { transformOrigin: "0% 50%" });
          gsap.set(sparks, { transformOrigin: "50% 50%", opacity: 0 });
          // Keadaan awal dipasang sebelum timeline mulai supaya logo utuh tidak berkedip sesaat.
          gsap.set(".hop-solid", { opacity: 0 });
          gsap.set(".hop-reveal", { scaleX: 0 });
          gsap.set(mover, { autoAlpha: 0, y: -720 });

          const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, delay: 0.3 });

          // Percikan partikel kotak dari satu titik.
          const burst = (at: Pt, pos: string | number, power = 1) => {
            tl.fromTo(
              sparks,
              { x: at.x, y: at.y, scale: 1, rotation: 0, opacity: 1 },
              {
                x: (i: number) => at.x + Math.cos((i / SPARKS) * Math.PI * 2) * rnd(90, 170) * power,
                y: (i: number) => at.y + Math.sin((i / SPARKS) * Math.PI * 2) * rnd(40, 90) * power - 40 * power,
                rotation: () => rnd(-180, 180),
                scale: 0,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
                immediateRender: false,
              },
              pos,
            );
          };

          // ---------- 1. Susun dari piksel ----------
          tl.set(".hop-solid", { opacity: 0 })
            .set(".hop-reveal", { scaleX: 0 })
            .set(mover, { autoAlpha: 0, x: 0, y: -720 })
            .set(body, { scale: 1 })
            .fromTo(
              els,
              {
                x: () => rnd(-700, 700),
                y: () => rnd(-650, 450),
                rotation: () => rnd(-220, 220),
                scale: 0,
                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "expo.out",
                stagger: { each: small ? 0.006 : 0.0032, from: "random" },
              },
            )
            .addLabel("locked")
            // ---------- 2. Kunci: denyut diagonal, lalu jadi tile utuh ----------
            .to(els, { scale: 0.55, duration: 0.16, ease: "power2.in", yoyo: true, repeat: 1, stagger: byDiag(0.55) }, "locked")
            .addLabel("solid", ">-0.05")
            .to(".hop-reveal", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "solid")
            .set(".hop-solid", { opacity: 1 }, "solid")
            .fromTo(".hop-scan", { x: -140, opacity: 1 }, { x: VW + 60, duration: 0.8, ease: "power2.inOut" }, "solid")
            .to(els, { opacity: 0, scale: 0.6, duration: 0.25, ease: "power1.in", stagger: byX(0.65) }, "solid")
            .set(".hop-scan", { opacity: 0 })
            // ---------- 3. Ring jatuh ----------
            .set(mover, { autoAlpha: 1 })
            .to(mover, { y: 0, duration: 0.5, ease: "power2.in" })
            .addLabel("drop")
            .to(body, { scaleX: 1.35, scaleY: 0.62, duration: 0.09, ease: "power2.out" }, "drop")
            .to(body, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" }, "drop+=0.09")
            .to("[data-part]", { y: 18, duration: 0.08, ease: "power2.out", yoyo: true, repeat: 1, stagger: { each: 0.03, from: 0 } }, "drop");
          burst({ x: HOME.x, y: HOME.y + R }, "drop", 1.3);
          tl.to({}, { duration: 0.35 });

          // ---------- 4. Lompat dari tile ke tile ----------
          let from = HOME;
          ROUTE.forEach(({ to, tile, lift }, i) => {
            const dist = Math.hypot(to.x - from.x, to.y - from.y);
            const flight = gsap.utils.clamp(0.4, 0.75, 0.32 + dist / 2200);
            const apex = Math.min(from.y, to.y) - lift - HOME.y;
            const air = `air${i}`;
            const land = `land${i}`;
            tl.to(body, { scaleX: 1.18, scaleY: 0.78, duration: 0.14, ease: "power1.in" })
              .addLabel(air)
              .to(body, { scaleX: 0.88, scaleY: 1.14, duration: flight * 0.35, ease: "power1.out" }, air)
              .to(body, { scaleX: 1, scaleY: 1, duration: flight * 0.3, ease: "sine.inOut" }, `${air}+=${flight * 0.35}`)
              .to(mover, { x: to.x - HOME.x, duration: flight, ease: "none" }, air)
              .to(mover, { y: apex, duration: flight / 2, ease: "power2.out" }, air)
              .to(mover, { y: to.y - HOME.y, duration: flight / 2, ease: "power2.in" }, `${air}+=${flight / 2}`)
              .addLabel(land)
              .to(body, { scaleX: 1.22, scaleY: 0.76, duration: 0.08, ease: "power2.out" }, land)
              .to(body, { scaleX: 1, scaleY: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" }, `${land}+=0.08`);
            if (tile) {
              const el = `[data-part="${tile}"]`;
              tl.to(el, { y: 24, scaleY: 0.95, duration: 0.08, ease: "power2.out" }, land).to(
                el,
                { y: 0, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" },
                `${land}+=0.08`,
              );
            }
            burst({ x: to.x, y: to.y + R }, land, tile ? 0.8 : 1.1);
            tl.to({}, { duration: 0.12 });
            from = to;
          });
          // ---------- 5. X berputar, L terbalik, mata melirik ----------
          tl.addLabel("spin", "+=0.15")
            .to('[data-part="x"]', { rotation: "+=360", duration: 1.2, ease: "back.inOut(1.4)" }, "spin")
            .to(
              ['[data-part="l1"]', '[data-part="l2"]', '[data-part="l3"]'],
              { scaleX: 0, duration: 0.18, ease: "power2.in", yoyo: true, repeat: 1, stagger: 0.12 },
              "spin+=0.1",
            )
            .to(['[data-part="i"]', '[data-part="e"]', '[data-part="l"]'], { y: -30, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, stagger: 0.08 }, "spin+=0.5")
            .to(pupil, { x: 22, duration: 0.25, ease: "power2.out" }, "spin+=0.1")
            .to(pupil, { x: -22, duration: 0.35, ease: "power2.inOut" }, "spin+=0.55")
            .to(pupil, { x: 0, duration: 0.25, ease: "power2.out" }, "spin+=1.05")
            // ---------- 6. Gelombang, kilau, kedip ----------
            .to("[data-part]", { y: -36, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, stagger: 0.05 }, "+=0.1")
            .fromTo(".hop-scan", { x: -140, opacity: 0.8 }, { x: VW + 60, duration: 0.7, ease: "power1.inOut", immediateRender: false }, "<")
            .set(".hop-scan", { opacity: 0 })
            .to(pupil, { scaleY: 0.1, duration: 0.07, ease: "power1.in", yoyo: true, repeat: 1 }, "+=0.3")
            .to(pupil, { scaleY: 0.1, duration: 0.07, ease: "power1.in", yoyo: true, repeat: 1 }, "+=0.12")
            // ---------- 7. Pecah jadi piksel ----------
            .addLabel("shatter", "+=0.9")
            .to(body, { scale: 0, duration: 0.45, ease: "back.in(2)" }, "shatter")
            .set(els, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }, "shatter+=0.3")
            .set(".hop-solid", { opacity: 0 }, "shatter+=0.3")
            .to(
              els,
              {
                x: () => rnd(-260, 260),
                y: () => rnd(420, 900),
                rotation: () => rnd(-200, 200),
                scale: () => rnd(0.2, 0.7),
                opacity: 0,
                duration: 1,
                ease: "power2.in",
                stagger: byDist(0.5, true),
              },
              "shatter+=0.32",
            );

          // Hemat baterai: jeda saat logo tidak terlihat.
          const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
          io.observe(root.current!);

          // Parallax: tile dan ring bergeser beda jarak mengikuti kursor.
          const svg = root.current!;
          let onMove: ((e: PointerEvent) => void) | undefined;
          let onLeave: (() => void) | undefined;
          if (fine) {
            const tX = gsap.quickTo(".hop-par-tiles", "x", { duration: 0.6, ease: "power3" });
            const tY = gsap.quickTo(".hop-par-tiles", "y", { duration: 0.6, ease: "power3" });
            const rX = gsap.quickTo(".hop-par-ring", "x", { duration: 0.8, ease: "power3" });
            const rY = gsap.quickTo(".hop-par-ring", "y", { duration: 0.8, ease: "power3" });
            onMove = (e) => {
              const b = svg.getBoundingClientRect();
              const nx = (e.clientX - b.left) / b.width - 0.5;
              const ny = (e.clientY - b.top) / b.height - 0.5;
              tX(nx * 30);
              tY(ny * 30);
              rX(nx * 80);
              rY(ny * 80);
            };
            onLeave = () => {
              tX(0);
              tY(0);
              rX(0);
              rY(0);
            };
            window.addEventListener("pointermove", onMove, { passive: true });
            document.documentElement.addEventListener("pointerleave", onLeave);
          }

          return () => {
            io.disconnect();
            if (onMove) window.removeEventListener("pointermove", onMove);
            if (onLeave) document.documentElement.removeEventListener("pointerleave", onLeave);
            for (const el of els) el.remove();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const parts = [...PIXEL_PARTS].sort((a, b) => WAVE.indexOf(a.id) - WAVE.indexOf(b.id));
  return (
    <svg ref={root} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className={className} aria-hidden focusable="false">
      <PixelDefs id="hop" />
      <defs>
        {/* Emboss neumorphism: bayangan gelap kanan bawah, pantulan terang kiri atas. */}
        <filter id="hop-emboss" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="14" dy="14" stdDeviation="14" floodColor="#060A1A" floodOpacity="0.85" />
          <feDropShadow dx="-10" dy="-10" stdDeviation="12" floodColor="#36488A" floodOpacity="0.45" />
        </filter>
        <clipPath id="hop-reveal-clip">
          <rect className="hop-reveal" x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} />
        </clipPath>
        <clipPath id="hop-shape-clip">
          {PIXEL_PARTS.map((p) => (
            <path key={p.id} d={p.d} />
          ))}
        </clipPath>
        <linearGradient id="hop-scan-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F0E4D3" stopOpacity="0" />
          <stop offset="0.5" stopColor="#F0E4D3" stopOpacity="0.75" />
          <stop offset="1" stopColor="#F0E4D3" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="hop-par-tiles">
        <g className="hop-emboss">
          <g className="hop-solid" clipPath="url(#hop-reveal-clip)">
            {parts.map((p) => (
              <path key={p.id} data-part={p.id} d={p.d} fill={fillOf(p.fill, "hop")} />
            ))}
          </g>
        </g>
        <g ref={pxLayer} className="hop-pixels" />
        <g clipPath="url(#hop-shape-clip)">
          <rect className="hop-scan" x={0} y={-20} width={140} height={VH + 40} fill="url(#hop-scan-grad)" opacity={0} />
        </g>
      </g>

      <g className="hop-par-ring">
        <g>
          {Array.from({ length: SPARKS }, (_, i) => (
            <rect key={i} className="hop-spark" x={-11} y={-11} width={22} height={22} rx={5} fill={i % 3 ? "#E8DCCB" : "#4C7FF0"} opacity={0} />
          ))}
        </g>
        <g className="hop-mover hop-emboss">
          <g className="hop-body">
            <circle cx={HOME.x} cy={HOME.y} r={R} fill="url(#hop-sand)" />
            <circle className="hop-pupil" cx={HOME.x} cy={HOME.y} r={PIXEL_RING.inner} fill="var(--color-bg)" />
          </g>
        </g>
      </g>
    </svg>
  );
}
