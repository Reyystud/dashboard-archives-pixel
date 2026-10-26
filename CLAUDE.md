@AGENTS.md

## Skills wajib untuk pekerjaan UI

Skill berikut ada di `.claude/skills/` dan HARUS dipakai pada setiap tugas yang menyentuh UI, styling, layout, atau animasi di repo ini, tanpa menunggu diminta:

- `ui-ux-pro-max`: keputusan UI/UX, palet, tipografi, aksesibilitas, layout. Termasuk preset GSAP di datanya.
- `frontend-design`: arah estetika dan menghindari tampilan template default.
- `motion`: animasi React dengan Framer Motion (komponen, gesture, scroll, spring).
- `gsap-core`, `gsap-react`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`: skill resmi GSAP. Dipakai untuk timeline, animasi scroll, dan efek kompleks. Di React/Next.js selalu pakai `useGSAP` (lihat `gsap-react`) agar cleanup benar.
- Preset GSAP tambahan ada di `ui-ux-pro-max` (`data/motion.csv`).

Urutan kerja: panggil skill terkait lewat Skill tool sebelum menulis kode UI, lalu implementasikan sesuai panduannya.
