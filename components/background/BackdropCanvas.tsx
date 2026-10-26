"use client";

import { useEffect, useRef } from "react";

/**
 * Latar hidup di satu <canvas>: elemen neumorphism melayang (parallax saat scroll), bit berkelip,
 * cahaya lembut, dan Pac-Man yang lewat memakan barisan bit beberapa kali tiap 10 detik.
 * Sprite neumorphism dirender sekali ke canvas offscreen lalu cukup di-drawImage tiap frame.
 * Reduced motion: hanya menggambar satu frame statis tanpa Pac-Man.
 */

const BG = "#161F3C";
const DARK = "rgba(6, 10, 26, 0.85)";
const LIGHT = "rgba(54, 74, 132, 0.45)";
const SAND = "#E8DCCB";
const PAC = "#FFD84D";
const GHOSTS = ["#FF6B8B", "#5EE6FF", "#FFB25E", "#C08BFF"];

type Kind = "raised" | "well" | "ring" | "plus" | "cluster" | "brand";
type Floater = { img: HTMLCanvasElement; x: number; y: number; vx: number; vy: number; depth: number; rot: number; vr: number; bob: number; size: number };
type Bit = { x: number; y: number; s: number; phase: number; speed: number; color: string };
type Dot = { x: number; eaten: boolean; pellet: boolean };
type Crumb = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Popup = { x: number; y: number; text: string; life: number };
type Run = {
  y: number;
  dir: 1 | -1;
  x: number;
  r: number;
  speed: number;
  age: number;
  dots: Dot[];
  ghost: { color: string; scared: boolean } | null;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const choice = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Satu sprite neumorphism dengan padding untuk bayangan. */
function makeSprite(kind: Kind, size: number, dpr: number): HTMLCanvasElement {
  const pad = Math.ceil(size * 0.45);
  const full = size + pad * 2;
  const c = document.createElement("canvas");
  c.width = Math.ceil(full * dpr);
  c.height = Math.ceil(full * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.translate(pad, pad);
  const off = Math.max(3, size * 0.09);
  const blur = Math.max(8, size * 0.22);
  const r = size * 0.24;

  // Bentuk dasar, digambar dua kali dengan bayangan gelap dan terang, lalu wajahnya.
  const shape = (draw: () => void, face: string | CanvasGradient) => {
    ctx.save();
    ctx.shadowColor = DARK;
    ctx.shadowOffsetX = off;
    ctx.shadowOffsetY = off;
    ctx.shadowBlur = blur;
    ctx.fillStyle = face;
    draw();
    ctx.fill("evenodd");
    ctx.shadowColor = LIGHT;
    ctx.shadowOffsetX = -off * 0.8;
    ctx.shadowOffsetY = -off * 0.8;
    ctx.fill("evenodd");
    ctx.restore();
    ctx.fillStyle = face;
    draw();
    ctx.fill("evenodd");
  };
  const faceGrad = (a: string, b: string) => {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  };

  if (kind === "raised") {
    shape(() => roundRect(ctx, 0, 0, size, size, r), faceGrad("#1C2749", "#141C37"));
  } else if (kind === "brand") {
    shape(() => roundRect(ctx, 0, 0, size, size, r), faceGrad("#3F74E4", "#1C52B4"));
  } else if (kind === "well") {
    // Cekung: isi warna dasar, lalu bayangan dalam dari bingkai di luar bentuk.
    ctx.fillStyle = BG;
    roundRect(ctx, 0, 0, size, size, r);
    ctx.fill();
    ctx.save();
    roundRect(ctx, 0, 0, size, size, r);
    ctx.clip();
    const frame = () => {
      ctx.beginPath();
      ctx.rect(-size, -size, size * 3, size * 3);
      ctx.roundRect(0, 0, size, size, r);
    };
    ctx.shadowBlur = blur * 0.8;
    ctx.fillStyle = BG;
    ctx.shadowColor = DARK;
    ctx.shadowOffsetX = off;
    ctx.shadowOffsetY = off;
    frame();
    ctx.fill("evenodd");
    ctx.shadowColor = LIGHT;
    ctx.shadowOffsetX = -off;
    ctx.shadowOffsetY = -off;
    frame();
    ctx.fill("evenodd");
    ctx.restore();
  } else if (kind === "ring") {
    const cx = size / 2;
    shape(() => {
      ctx.beginPath();
      ctx.arc(cx, cx, size / 2, 0, Math.PI * 2);
      ctx.arc(cx, cx, size * 0.32, 0, Math.PI * 2);
    }, faceGrad("#F0E2CE", "#B3A797"));
  } else if (kind === "plus") {
    const t = size * 0.34;
    const a = (size - t) / 2;
    shape(() => {
      ctx.beginPath();
      ctx.roundRect(a, 0, t, size, t / 3);
      ctx.roundRect(0, a, size, t, t / 3);
    }, faceGrad("#3368DA", "#1A4BA3"));
    // Isi ulang tanpa evenodd supaya pusat plus tidak bolong.
    ctx.fillStyle = faceGrad("#3368DA", "#1A4BA3");
    ctx.beginPath();
    ctx.roundRect(a, 0, t, size, t / 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(0, a, size, t, t / 3);
    ctx.fill();
  } else {
    // Gugus piksel seperti potongan logo: 2x2 dengan satu sel kosong.
    const s = size * 0.46;
    const gap = size * 0.08;
    const cells = [
      [0, 0, "#6C8DC4"],
      [s + gap, 0, "#2A63C8"],
      [0, s + gap, "#205BC2"],
    ] as const;
    for (const [x, y, col] of cells) shape(() => roundRect(ctx, x, y, s, s, s * 0.22), col);
  }
  return c;
}

export function BackdropCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);

    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ---------- Elemen melayang ----------
    const kinds: Kind[] = ["raised", "well", "ring", "plus", "cluster", "raised", "well", "brand", "ring", "cluster"];
    const count = small ? 9 : 18;
    const spriteCache = new Map<string, HTMLCanvasElement>();
    const sprite = (k: Kind, s: number) => {
      const key = `${k}-${s}`;
      if (!spriteCache.has(key)) spriteCache.set(key, makeSprite(k, s, dpr));
      return spriteCache.get(key)!;
    };
    const floaters: Floater[] = Array.from({ length: count }, (_, i) => {
      const kind = kinds[i % kinds.length];
      const size = Math.round(rand(small ? 22 : 26, small ? 54 : 84) / 4) * 4;
      return {
        img: sprite(kind, size),
        size,
        x: rand(0, 1),
        y: rand(0, 1),
        vx: rand(-6, 6),
        vy: rand(-5, 5),
        depth: rand(0.15, 0.6),
        rot: rand(-0.4, 0.4),
        vr: kind === "ring" || kind === "plus" ? rand(-0.25, 0.25) : rand(-0.06, 0.06),
        bob: rand(0, Math.PI * 2),
      };
    });
    // Posisi dalam piksel. Rentang Y diperpanjang supaya parallax scroll tetap punya elemen.
    for (const f of floaters) {
      f.x *= W;
      f.y *= H * 1.6;
    }

    // ---------- Bit berkelip ----------
    const bits: Bit[] = Array.from({ length: small ? 40 : 90 }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      s: choice([2, 2, 3, 4]),
      phase: rand(0, Math.PI * 2),
      speed: rand(4, 14),
      color: choice([SAND, "#7BA3FF", "#4C7FF0", "#C3D5FF"]),
    }));

    // ---------- Pac-Man ----------
    const runs: Run[] = [];
    const crumbs: Crumb[] = [];
    const popups: Popup[] = [];
    let nextRun = 0.8;
    const spawnRun = () => {
      const r = small ? 13 : 17;
      // Jalur baru tidak boleh menumpuk dengan jalur yang sedang berjalan.
      let y = 0;
      for (let tries = 0; tries < 8; tries++) {
        y = rand(90, H - 60);
        if (runs.every((o) => Math.abs(o.y - y) > r * 5)) break;
      }
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const gap = small ? 26 : 32;
      const dots: Dot[] = [];
      const n = Math.floor(W / gap);
      const pelletAt = Math.floor(rand(n * 0.35, n * 0.7));
      for (let i = 1; i < n; i++) dots.push({ x: i * gap, eaten: false, pellet: i === pelletAt });
      runs.push({
        y,
        dir,
        x: dir === 1 ? -r * 3 : W + r * 3,
        r,
        speed: rand(small ? 170 : 230, small ? 220 : 300),
        age: 0,
        dots,
        ghost: Math.random() < 0.45 ? { color: choice(GHOSTS), scared: false } : null,
      });
    };

    const drawPac = (x: number, y: number, r: number, dir: 1 | -1, t: number) => {
      const mouth = (0.04 + 0.22 * Math.abs(Math.sin(t * 16))) * Math.PI;
      ctx.save();
      ctx.translate(x, y);
      if (dir === -1) ctx.scale(-1, 1);
      ctx.shadowColor = "rgba(255, 216, 77, 0.45)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = PAC;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#161F3C";
      ctx.beginPath();
      ctx.arc(r * 0.15, -r * 0.5, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawGhost = (x: number, y: number, r: number, color: string, scared: boolean, dir: 1 | -1, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      const body = scared ? "#2E5BFF" : color;
      ctx.shadowColor = body;
      ctx.shadowBlur = 12;
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r, Math.PI, 0);
      ctx.lineTo(r, r * 0.9);
      // Rok bergelombang di bawah.
      const waves = 4;
      const shift = Math.sin(t * 18) > 0 ? 0.5 : 0;
      for (let i = waves; i >= 0; i--) {
        const wx = -r + ((i + shift) / waves) * r * 2;
        ctx.lineTo(Math.max(-r, Math.min(r, wx)), r * (i % 2 ? 0.62 : 0.9));
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      if (scared) {
        ctx.fillStyle = "#FFE3D1";
        ctx.fillRect(-r * 0.4, -r * 0.3, r * 0.2, r * 0.2);
        ctx.fillRect(r * 0.2, -r * 0.3, r * 0.2, r * 0.2);
      } else {
        for (const ex of [-0.38, 0.38]) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.ellipse(ex * r, -r * 0.2, r * 0.26, r * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1B3FA8";
          ctx.beginPath();
          ctx.arc(ex * r + dir * r * 0.11, -r * 0.16, r * 0.13, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    // Cahaya lembut yang bergerak pelan.
    const lights = [
      { hue: "rgba(51, 104, 218, 0.20)", ax: 0.15, ay: 0.25, rx: 0.12, ry: 0.1, sp: 0.07 },
      { hue: "rgba(32, 91, 194, 0.18)", ax: 0.85, ay: 0.15, rx: 0.1, ry: 0.12, sp: 0.05 },
      { hue: "rgba(232, 220, 203, 0.07)", ax: 0.6, ay: 0.9, rx: 0.15, ry: 0.08, sp: 0.06 },
    ];

    let t = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const scroll = window.scrollY;

      ctx.clearRect(0, 0, W, H);

      // Cahaya
      for (const l of lights) {
        const x = (l.ax + Math.sin(t * l.sp * 6.28) * l.rx) * W;
        const y = (l.ay + Math.cos(t * l.sp * 5.1) * l.ry) * H;
        const rad = Math.max(W, H) * 0.45;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, l.hue);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Bit berkelip, naik perlahan
      for (const b of bits) {
        b.y -= b.speed * dt;
        if (b.y < -5) {
          b.y = H + 5;
          b.x = rand(0, W);
        }
        const a = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2 + b.phase));
        ctx.globalAlpha = a;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.s, b.s);
      }
      ctx.globalAlpha = 1;

      // Elemen melayang dengan parallax scroll
      const span = H * 1.6;
      for (const f of floaters) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += f.vr * dt;
        const pad = f.img.width / dpr;
        if (f.x < -pad) f.x = W + pad;
        if (f.x > W + pad) f.x = -pad;
        let y = (((f.y - scroll * f.depth) % span) + span) % span;
        y -= pad;
        y += Math.sin(t * 0.8 + f.bob) * 6;
        ctx.save();
        ctx.translate(f.x, y);
        ctx.rotate(f.rot);
        ctx.globalAlpha = 0.55 + f.depth * 0.6;
        ctx.drawImage(f.img, -pad / 2, -pad / 2, pad, pad);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Pac-Man
      nextRun -= dt;
      if (nextRun <= 0 && runs.length < 3) {
        spawnRun();
        nextRun = rand(2.6, 4); // sekitar 3 kali per 10 detik
      }
      for (let i = runs.length - 1; i >= 0; i--) {
        const run = runs[i];
        run.age += dt;
        run.x += run.dir * run.speed * dt;
        const fadeIn = Math.min(1, run.age / 0.5);

        // Bit di jalur
        for (const d of run.dots) {
          if (d.eaten) continue;
          const reached = run.dir === 1 ? run.x >= d.x - run.r * 0.3 : run.x <= d.x + run.r * 0.3;
          if (reached) {
            d.eaten = true;
            const color = d.pellet ? PAC : SAND;
            for (let k = 0; k < (d.pellet ? 10 : 3); k++) {
              crumbs.push({ x: d.x, y: run.y, vx: rand(-60, 60), vy: rand(-90, -20), life: rand(0.35, 0.6), color });
            }
            if (d.pellet) {
              popups.push({ x: d.x, y: run.y - run.r * 1.6, text: "+50", life: 0.9 });
              if (run.ghost) run.ghost.scared = true;
            }
            continue;
          }
          const s = d.pellet ? run.r * 0.55 : run.r * 0.28;
          const pulse = d.pellet ? 1 + 0.2 * Math.sin(t * 10) : 1;
          ctx.globalAlpha = fadeIn * (d.pellet ? 1 : 0.85);
          ctx.fillStyle = d.pellet ? PAC : SAND;
          if (d.pellet) {
            ctx.shadowColor = PAC;
            ctx.shadowBlur = 12;
          }
          ctx.fillRect(d.x - (s * pulse) / 2, run.y - (s * pulse) / 2, s * pulse, s * pulse);
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;

        drawPac(run.x, run.y, run.r, run.dir, t);
        if (run.ghost) {
          // Hantu ketakutan tertinggal makin jauh.
          const lag = run.ghost.scared ? run.r * 6 + (run.age % 1) * 4 : run.r * 3.6;
          drawGhost(run.x - run.dir * lag, run.y, run.r, run.ghost.color, run.ghost.scared, run.dir, t);
        }

        const out = run.dir === 1 ? run.x > W + run.r * 10 : run.x < -run.r * 10;
        if (out) runs.splice(i, 1);
      }

      // Remah dan skor
      for (let i = crumbs.length - 1; i >= 0; i--) {
        const c = crumbs[i];
        c.life -= dt;
        if (c.life <= 0) {
          crumbs.splice(i, 1);
          continue;
        }
        c.vy += 260 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        ctx.globalAlpha = Math.min(1, c.life * 2);
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, 3, 3);
      }
      ctx.font = `600 ${small ? 12 : 14}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i];
        p.life -= dt;
        if (p.life <= 0) {
          popups.splice(i, 1);
          continue;
        }
        p.y -= 30 * dt;
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = PAC;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      resize();
      if (reduce) frame(performance.now());
    };
    window.addEventListener("resize", onResize);
    if (reduce) frame(performance.now());
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
