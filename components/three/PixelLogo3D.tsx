"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { PIXEL_PARTS, PIXEL_RING, PIXEL_VIEWBOX, type PixelFill } from "@/lib/brand/pixel";

const SCALE = 0.0029;
const DEPTH = 90;
const CX = PIXEL_VIEWBOX.w / 2;
const CY = PIXEL_VIEWBOX.h / 2;

type Part = { id: string; fill: PixelFill; geometry: THREE.ExtrudeGeometry; center: THREE.Vector3; seed: number };

// SVG path -> shape (sumbu y dibalik lewat transform agar tidak terbalik di ruang 3D) -> extrude bervelan.
function buildParts(): Part[] {
  const loader = new SVGLoader();
  return PIXEL_PARTS.map((p, i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="scale(1,-1) translate(${-CX},${-CY})"><path d="${p.d}"/></g></svg>`;
    const shapes = loader.parse(svg).paths.flatMap((sp) => SVGLoader.createShapes(sp));
    const geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 14,
      bevelSize: 10,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geometry.translate(0, 0, -DEPTH / 2);
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox!.getCenter(center);
    return { id: p.id, fill: p.fill, geometry, center, seed: i };
  });
}

function material(fill: PixelFill) {
  if (fill === "glass")
    return (
      // Tanpa `transmission`: itu memaksa render ulang seluruh scene ke render target (satu pass ekstra per frame).
      <meshPhysicalMaterial color="#7FA2DD" transparent opacity={0.9} roughness={0.14} metalness={0.05} clearcoat={1} />
    );
  if (fill === "sand") return <meshPhysicalMaterial color="#E8DCCB" metalness={0.65} roughness={0.28} clearcoat={0.6} />;
  return <meshPhysicalMaterial color="#205BC2" metalness={0.15} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />;
}

function Logo({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const parts = useMemo(() => buildParts(), []);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const ring = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);

  useEffect(() => () => parts.forEach((p) => p.geometry.dispose()), [parts]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    // Tunggu intro selesai supaya animasi perakitan terlihat.
    // Batas 3 detik sebagai pengaman bila penanda intro tidak pernah terpasang.
    if (born.current === null && (document.documentElement.dataset.intro === "done" || t > 3)) born.current = t;
    // Rakit: 0 = berserakan, 1 = tersusun. Scroll menceraikan lagi sedikit.
    const assemble = born.current === null ? 0 : THREE.MathUtils.smootherstep(t - born.current, 0, 1.6);
    const spread = (1 - assemble) * 1 + Math.min(scrollRef.current ?? 0, 1) * 0.55;

    const g = group.current;
    if (g) {
      const tx = state.pointer.y * -0.28 + Math.sin(t * 0.5) * 0.04;
      const ty = state.pointer.x * 0.45 + Math.sin(t * 0.35) * 0.12 - 0.18;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, dt);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4, dt);
      g.position.y = Math.sin(t * 0.8) * 0.06;
    }
    parts.forEach((p, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const dir = p.center.clone().normalize();
      m.position.set(dir.x * spread * 260, dir.y * spread * 260, (i % 2 ? 1 : -1) * spread * 380 + Math.sin(t * 1.2 + p.seed) * 6);
      m.rotation.set(spread * (i % 3 ? 0.6 : -0.5), spread * (i % 2 ? -0.8 : 0.7), 0);
    });
    if (ring.current) {
      ring.current.rotation.z = -t * 0.6;
      const s = assemble;
      ring.current.scale.setScalar(Math.max(s, 0.001));
      ring.current.position.z = DEPTH / 2 + 30 + spread * 420;
    }
  });

  return (
    <group ref={group}>
      <group scale={SCALE}>
        {parts.map((p, i) => (
          <mesh key={p.id} ref={(el) => void (meshes.current[i] = el)} geometry={p.geometry} castShadow>
            {material(p.fill)}
          </mesh>
        ))}
        <group ref={ring} position={[PIXEL_RING.cx - CX, -(PIXEL_RING.cy - CY), DEPTH / 2 + 30]}>
          <mesh>
            <torusGeometry args={[(PIXEL_RING.r + PIXEL_RING.inner) / 2, (PIXEL_RING.r - PIXEL_RING.inner) / 2 + 4, 32, 96]} />
            <meshPhysicalMaterial color="#E8DCCB" metalness={0.85} roughness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, -6]}>
            <circleGeometry args={[PIXEL_RING.inner, 48]} />
            <meshStandardMaterial color="#05070F" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function PixelLogo3D() {
  const wrap = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    const onScroll = () => (scroll.current = window.scrollY / window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 7.5], fov: 35 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        aria-hidden
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight position={[-4, -2, 3]} intensity={18} color="#4C7FF0" />
        {/* Bila FPS turun, turunkan resolusi render otomatis. */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <Logo scrollRef={scroll} />
        {/* Lingkungan dari lightformer lokal: tidak mengunduh HDR (CSP connect-src ketat). */}
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 2, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} scale={[2, 6, 1]} color="#4C7FF0" />
          <Lightformer form="rect" intensity={1.5} position={[5, -1, 2]} scale={[2, 6, 1]} color="#E8DCCB" />
          <Lightformer form="ring" intensity={2} position={[0, 0, -6]} scale={6} color="#205BC2" />
        </Environment>
      </Canvas>
    </div>
  );
}
