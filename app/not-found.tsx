import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { PixelMark } from "@/components/brand/PixelMark";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <SiteShell wide={false}>
      <div className="glass flex flex-col items-center rounded-[26px] px-6 py-14 text-center">
        <PixelMark height={72} id="nf" className="opacity-80" />
        <p className="mt-6 font-display text-[64px] font-bold leading-none text-gradient">404</p>
        <h1 className="mt-3 text-[22px] font-semibold md:text-[26px]">Pixel ini hilang</h1>
        <p className="mt-2 max-w-sm text-ink-2">Halaman atau broadcast ini tidak ada, atau sudah disembunyikan.</p>
        <Link href="/" className={buttonClass("primary", "mt-6")}>Kembali ke beranda</Link>
      </div>
    </SiteShell>
  );
}
