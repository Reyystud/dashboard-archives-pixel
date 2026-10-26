// Intro hanya diputar sekali per sesi. Skrip ini jalan sebelum paint supaya overlay
// tidak berkedip untuk pengunjung yang sudah melihatnya atau yang memilih reduced motion.
export const INTRO_KEY = "pixel:intro";

export const INTRO_BOOT_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="done"}catch(e){document.documentElement.dataset.intro="done"}`;
