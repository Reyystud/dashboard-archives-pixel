import { PixelMark } from "@/components/brand/PixelMark";

export function Logo({ height = 28, id = "logo" }: { height?: number; id?: string }) {
  return <PixelMark height={height} id={id} />;
}
