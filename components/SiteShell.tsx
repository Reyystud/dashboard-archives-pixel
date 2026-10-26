import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NavTabs, SearchTrigger } from "@/components/NavTabs";

export function SiteShell({ children, wide = true }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <header className="sticky top-0 z-30 px-3 pt-3">
        <div className="glass-strong mx-auto flex h-14 max-w-[1200px] items-center gap-3 rounded-full pl-4 pr-2">
          <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="PIXEL'25, beranda">
            <Logo height={24} id="hdr" />
            <span className="font-display text-[16px] font-bold tracking-wide">
              PIXEL<span className="text-sand">&apos;25</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <NavTabs variant="desktop" />
            <span className="hidden md:block">
              <SearchTrigger />
            </span>
            <span className="md:hidden">
              <SearchTrigger compact />
            </span>
          </div>
        </div>
      </header>
      <NavTabs variant="mobile" />
      <main className={`animate-[fade-in_300ms_ease-out] mx-auto w-full px-4 pb-28 pt-5 md:pb-10 md:pt-8 ${wide ? "max-w-[1200px]" : "max-w-[760px]"}`}>
        {children}
      </main>
      <footer className="mx-auto mb-24 max-w-[1200px] px-4 md:mb-0">
        <div className="glass flex flex-col gap-4 rounded-[22px] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo height={30} id="ftr" />
            <div>
              <p className="font-display text-[15px] font-semibold">PIXEL&apos;25 · HMIF ITB</p>
              <p className="text-[13px] text-muted">Arsip broadcast angkatan. Isi broadcast milik pengirim aslinya.</p>
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
            <Link href="/" className="hover:text-ink">Arsip</Link>
            <Link href="/kalender" className="hover:text-ink">Kalender</Link>
            <Link href="/momen" className="hover:text-ink">Momen</Link>
            <Link href="/aspirasi" className="hover:text-ink">Pojok Aspirasi</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler file .ics, bukan halaman */}
            <a href="/api/ics" className="hover:text-ink">Langganan .ics</a>
          </nav>
        </div>
        <p className="py-6 text-center font-mono text-[12px] text-muted">© {new Date().getFullYear()} PIXEL&apos;25</p>
      </footer>
    </>
  );
}
