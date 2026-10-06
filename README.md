# KPU Office Tools (V1 — Lokal & Privat)

FASE     : Phase 3 — Image Converter (SELESAI); Phase 4 — Image → PDF (SELESAI)
STACK    : Electron 44 + TypeScript 5.9 + React 19  (DEC-007, Opsi A)
TEST     : 120 test lulus (Vitest + Testing Library)
BUILD    : out/ — bisa dijalankan
FITUR    : 4 dari 13 — Image Compressor + Image Resizer + Image Converter + Image → PDF

## Spesifikasi Asal

Berdasarkan spesifikasi: `SPECIFICATION.md`, `TECH_SPEC.md`, `SOURCES_OF_TRUTH.md`,
`SOURCE_OF_TRUTH.md`, `ARCHITECTURE.md`, `FEATURES.md`, `DECISIONS.md`,
`FUTURE_FEATURES.md`, `TESTING.md`, `MAPPING.md`, `PROJECT_SETUP.md`, `QUICK_START.md`,
`TROUBLESHOOTING.md`, `GETTING_STARTED.md`, `RUNNING.md`, `INSTALLATION.md`,
`CHANGELOG.md`, `README_TEMPLATE.md`, `TEST_SPEC.md`, dan `CONTRIBUTING.md`.

## Perintah Cepat

```bash
npm install          # instal dependency
npm run dev          # mode pengembangan (hot reload)
npm start            # jalankan hasil build produksi
npm test             # 120 test
npm run verify       # lint + typecheck + test + build
```

Struktur folder riil ada di `ARCHITECTURE.md` §3.

## Identitas Visual

Merah maron sebagai warna aksi utama dengan aksen emas pada garis pemisah, penanda menu aktif,
dan label status. Header dan sidebar memakai permukaan maron gelap; konten tetap terang agar
tetap nyaman dibaca. Token warna terpusat di `src/renderer/src/styles/tokens.css` (DEC-031).

Tokennya dipetakan ke peran (`chrome`, `accent-soft`/`accent-strong`, `*-muted`), hierarki
dibangun dari border dan whitespace, dan aksen emas tidak pernah dipakai sebagai warna teks di
atas emas. Ikon berupa SVG dekoratif, navigasi tetap link, dan rasio kontras teks serta batas
kontrol sudah dihitung (teks ≥ 4.5:1, non-teks ≥ 3:1) — rinciannya di DEC-034.

## Yang Belum Diputuskan

Keputusan yang tersisa menyangkut fitur, bukan fondasi.

| ID | Item |
|----|------|
| DEC-008 | Engine kompresi PDF (Ghostscript? render ulang? lisensi AGPL?) |
| DEC-012 | Distribusi & code signing |
| DEC-014 | Default PDF → Image (DPI, page size) |
| DEC-016 | ZIP: file saja atau folder |
| DEC-018 | Menyimpan preferences atau tidak |

Sudah diputuskan: DEC-007 (stack), DEC-011 (testing), DEC-019 (git), DEC-021 – DEC-026,
DEC-027 – DEC-031 (mesin gambar, aturan batch, output, palet warna), DEC-032 (kualitas
encoder konversi), DEC-034 (refinement visual + aksesibilitas), DEC-035 (library PDF & aturan
Image → PDF).
Rincian dan opsi lengkap di `DECISIONS.md`.

## Environment Developers

Lint, typecheck, unit/integration test, dan build wajib lolos sebelum commit.
