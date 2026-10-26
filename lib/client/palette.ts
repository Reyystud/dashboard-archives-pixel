// Dipisah dari CommandPalette.tsx supaya NavTabs/Hero tidak menarik cmdk ke bundle awal.
export const PALETTE_EVENT = "pixel:cmdk";
export const openCommandPalette = () => window.dispatchEvent(new Event(PALETTE_EVENT));
