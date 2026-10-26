export const CATEGORIES = [
  { key: "magang", label: "Magang", color: "#4ADE80", hint: "lowongan internship, program magang perusahaan/startup/lab" },
  { key: "loker", label: "Loker", color: "#2DD4BF", hint: "lowongan kerja full-time/part-time/freelance, bukan magang" },
  { key: "akademik", label: "Akademik", color: "#60A5FA", hint: "kuliah, jadwal kelas, ujian, nilai, tugas, dosen, prodi, perwalian, KRS, wisuda" },
  { key: "proker_hmif", label: "Proker HMIF", color: "#34D399", hint: "program kerja atau kegiatan yang diselenggarakan HMIF ITB" },
  { key: "kegiatan_angkatan", label: "Kegiatan Angkatan", color: "#E8DCCB", hint: "acara internal satu angkatan: makrab, bukber, foto angkatan, iuran angkatan" },
  { key: "kegiatan_eksternal", label: "Kegiatan External", color: "#FBBF24", hint: "acara dari luar HMIF: webinar, seminar, workshop, event unit/kampus lain, perusahaan" },
  { key: "perlombaan", label: "Perlombaan", color: "#FB923C", hint: "lomba, kompetisi, hackathon, CTF, call for team" },
  { key: "merch", label: "Merch", color: "#C084FC", hint: "penjualan merchandise, PO jaket/kaos/stiker, danusan" },
  { key: "beasiswa", label: "Beasiswa", color: "#FACC15", hint: "beasiswa, bantuan dana pendidikan, pendaftaran beasiswa" },
  { key: "lainnya", label: "Lainnya", color: "#94A3B8", hint: "tidak cocok dengan kategori lain" },
] as const;
export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [CategoryKey, ...CategoryKey[]];
export const categoryOf = (k: string) => CATEGORIES.find((c) => c.key === k) ?? CATEGORIES[9];
