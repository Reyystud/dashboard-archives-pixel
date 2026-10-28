/** Muncul (fade + naik) lewat CSS murni: tanpa JS, tanpa opacity:0 yang menunggu hidrasi. */
export function Reveal({
  children, delay = 0, className, as: Tag = "div",
}: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" }) {
  return (
    <Tag className={`rise${className ? ` ${className}` : ""}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

/** Masuk berurutan untuk item list; delay dibatasi supaya halaman panjang tidak terasa lambat. */
export function StaggerItem({ children, index, className }: { children: React.ReactNode; index: number; className?: string }) {
  // CSS murni (class .rise): tanpa instance motion per kartu, dan kartu di luar layar dilewati (.cv-auto).
  return (
    <div className={`rise cv-auto ${className ?? ""}`} style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}>
      {children}
    </div>
  );
}
