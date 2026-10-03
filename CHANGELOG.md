# CHANGELOG

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).
Nomor versi mengikuti [Semantic Versioning](https://semver.org/).

Status versi:

- `MAJOR` — perubahan yang tidak kompatibel
- `MINOR` — fitur baru
- `PATCH` — perbaikan bug

---

## [Unreleased]

### Fase: Fondasi Dokumentasi

Tidak ada kode aplikasi. Tahap ini hanya membangun dasar Keputusan.

#### Added

- **`SOURCE_OF_TRUTH.md`** — pusat kebenaran project: identitas, tujuan, target user, tech
  stack (masih `UNDEFINED`), fitur yang didukung, non-goals, prinsip UI/security/privacy,
  aturan arsitektur, dan daftar keputusan terbuka
- **`ARCHITECTURE.md`** — arsitektur logis yang stack-agnostic: 3 lapis (UI / Engine /
  Native), struktur folder yang usulan, kontrak modul, alur data 5 langkah, model error dua
  lapis, aturan file safety, kontrak batch processing, struktur navigasi, performance budget,
  dan dependency policy
- **`FEATURES.md`** — rincian 13 fitur V1 (2 di antaranya `PARTIAL` dengan daftar hal yang
  belum ditentukan) + OCR `DEFERRED` + tabel requirement cross-cutting
- **`DECISIONS.md`** — 20 entri keputusan (DEC-001 s/d DEC-020):
  - 5 `ACCEPTED` dari spesifikasi: local-first, scope V1, disclaimer KPU, larangan fitur
   (regulasi), OCR ditunda
  - 1 `PROPOSED`: bahasa UI Bahasa Indonesia
  - 12 `UNDEFINED`: tech stack, engine kompresi PDF, output destination, duplicate filename
    policy, test framework, distribusi, batas file, default DPI/page size, ZIP source,
    preferences, git init, nama folder
  - 1 `CONDITIONAL`: dukungan SVG untuk QR
- **`FUTURE_FEATURES.md`** — 20 ide fitur (`PROPOSED` / `NEEDS_SPEC` / `PARKED` /
  `BLOCKED`), termasuk OCR yang tetap blocked. **Tidak ada satu pun yang diimplementasikan**
- **`TESTING.md`** — strategi test: prinsip, lokasi, 9 tabel fixture yang akan dibuat,
  test matrix ~140 kasus untuk 13 tool, 11 test lintas-modul, 7 item test manual,
  Definition of Done
- **`README.md`** — ringkasan project, status, prinsip, modul, dokumentasi, arsitektur
  ringkas, daftar keputusan terbuka, environment developers

#### Catatan penting

- **Tech stack belum dipilih** (DEC-007) dan ini memblokir seluruh Phase 1. Struktur folder,
  test framework, mekanisme IPC, dan pilihan library semuanya bergantung padanya.
- **Tidak ada satu baris kode pun** yang ditulis pada tahap ini.
- **Tidak ada fitur** yang diimplementasikan, termasuk yang paling sederhana.
- Environment developers terdeteksi (Node 24, npm 11, Python 3.12, Windows) tetapi ini
  **bukan** keputusan stack.
- Repository **belum** diinisialisasi sebagai git (DEC-019, menunggu instruksi).

---

## Catatan Versi

`0.1.0` adalah fondasi yang bisa dijalankan, **bukan** rilis fitur. Rilis pertama yang
memang berguna pengguna belum ada — itu menunggu implementasi tool.

## [0.1.0] — 2026-10-02

### Fase: Phase 1 — Project Foundation & Application Shell

Aplikasi desktop pertama yang bisa dijalankan. **Belum ada fitur processing apa pun.**

#### Added — Toolchain

- **StackElectron 44.5.1 + TypeScript 5.9.3 + React 19.3** sesuai DEC-007 (Opsi A, dipilih
  pengguna). Build `electron-vite` 5 / Vite 7, router `react-router-dom` 7, test `Vitest` 5,
  lint `ESLint` 10.
- Konfigurasi: `electron.vite.config.ts`, `vitest.config.ts`, `eslint.config.mjs`,
  `tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.json`.
- Versi aplikasi di-inject saat build (`define`), sehingga renderer tidak perlu preload.
- Script `dev`, `build`, `start`, `test`, `lint`, `typecheck`, `verify`.

#### Added — Application Shell

- Main process: pembuatan window dengan `sandbox: true`, `contextIsolation: true`,
  `nodeIntegration: false`, `setWindowOpenHandler` menolak navigasi keluar,
  `webContents.setWindowOpenHandler` membuka tautan eksternal lewat shell.
- `src/renderer/index.html` dengan Content Security Policy eksplisit
  (`default-src 'self'`, `connect-src 'self' ws: http://localhost:*`, `object-src 'none'`).
- Layout: `AppLayout`, `Header`, `Sidebar`, `Footer`.
- Navigasi responsif: sidebar permanen di desktop, drawer di tablet/mobile dengan toggle,
  tutup via Escape, backdrop, atau navigasi.
- Halaman: `Dashboard` (13 tool dikelompokkan, Honestya belum ada fitur), `ComingSoon`,
  `NotFound`.
- Registry route tunggal `src/renderer/src/lib/routes.ts` (DEC-025) yang dipakai
  router, sidebar, dan Dashboard agar sinkron.

#### Added — Design System

- `src/renderer/src/styles/tokens.css`: palet warna, spacing 4–64, radius 4/8/12, tipografi
  system stack, focus ring, reduced-motion (DEC-022).
- Komponen: `Button`, `Card`, `Badge`, `Alert`, `Loading`, `ErrorBoundary`, `FileDropZone`.
- `FileDropZone` menangani state click/drag/terpilih **tanpa membaca isi file** dan tanpa
  memproses apa pun (sesuai §28).
- `ErrorBoundary` menampilkan pesan ramah ke user, detail teknis hanya ke `console.error`.

#### Added — Tests

- Phase 1: 82 test pada 7 file. Phase 2: 92 test pada 8 file, semuanya lulus.
- Cakupan: registry route, semua route dapat dinavigasi, 404, shell, responsif & drawer,
  aksesibilitas (landmark, heading, accessible name, focus), komponen, error handling.
- `tests/setup.ts` dengan stub `matchMedia`; `tests/helpers/renderApp.tsx` memakai
  MemoryRouter untuk navigasi terisolasi.

#### Fixed

- `package.json` `main` diarahkan ke `out/main/index.js` agar sesuai output electron-vite.
- Binary Electron 44.5.1 yang gagal terunduh karena npm memblokir postinstall script.

#### Changed (dokumentasi)

- `SOURCE_OF_TRUTH.md` — tech stack dari `UNDEFINED` menjadi `ACCEPTED`.
- `ARCHITECTURE.md` — struktur folder dari usulan menjadi struktur riil; route
  `utility/date-calculator` dikoreksi menjadi `utility/date` (DEC-025); kontrak IPC ditulis
  sebagai rancangan.
- `DECISIONS.md` — DEC-007 dan DEC-019 menjadi `ACCEPTED`; DEC-021 – DEC-026 ditambahkan.
- `TESTING.md` — status dari strategi menjadi aktif, berisi hasil validasi.
- `README.md` — status, cara menjalankan, arsitektur, keputusan terbuka.

#### Catatan

- **Pada Phase 1 tidak ada fitur yang diimplementasikan.** 13 tool masih `COMING SOON` yang
  jujur; Image Compressor dan Image Resizer menyusul pada Phase 2.
- Tidak ada upload, tidak ada analytics, tidak ada webfont — semua lokal (DEC-001).
- Folder `features/`, `services/`, dan `engine/` tidak dibuat karena belum ada consumer
  (DEC-026). Preload terbatas baru muncul pada Phase 2 untuk IPC image tools (DEC-027).


## Phase 2 — Image Tools

- Mengimplementasikan Image Compressor dan Image Resizer lokal untuk JPG/JPEG/PNG/WEBP.
- Menambahkan quality slider, resize lebar/tinggi/persentase, progress batch, ringkasan, error per file, dan simpan hasil.
- Memproses file satu per satu dengan batas 100 MB per file, 100 file, dan 100 megapixel.
- Menambahkan Sharp pada main process dan preload IPC terbatas.
- Mencatat keputusan Phase 2 di DEC-027 sampai DEC-030.

## UI Redesign — Maroon & Gold

- Palet warna direvisi dari biru corporate menjadi **merah maron + aksen emas** (DEC-031,
  menggantikan nilai warna pada DEC-022). Seluruh nilai warna tetap terpusat di `tokens.css`.
- Header memakai permukaan maron dengan garis emas di bawahnya dan bar emas di samping nama
  aplikasi; sidebar memakai maron lebih gelap dengan penanda aktif berupa bar emas.
- Permukaan konten tetap terang; status tool yang siap memakai badge emas, yang belum tersedia
  memakai badge netral — Dashboard tidak lagi menandai tool aktif sebagai "Coming Soon".
- `src/renderer/src/styles/tokens.css` — palet baru (maron `#7a1f2b` sebagai aksi utama, emas
  `#d4af37` sebagai aksen), token `chrome`/`chrome-deep` untuk header dan sidebar, skala
  elevation (`--shadow-sm/md/lg`), radius pill untuk badge, token border semantik.
- Header: latar maron, garis emas 3 px di bawah, bar aksen di samping nama aplikasi, versi
  emas, tagline baru `APP_TAGLINE`, dan focus ring emas di permukaan gelap.
- Sidebar: latar maron gelap, label grup emas, item aktif ditandai bar emas (tanpa menggeser
  layout), badge diselaraskan dengan permukaan gelap, hairline pemisah di bawah Dashboard.
- Footer: garis emas tipis sebagai penutup halaman.
- Halaman Dashboard, Coming Soon, dan Not Found memakai panel berpermukaan putih dengan garis
  aksen emas di atas dan judul bertracking rapat; eyebrow memakai segmen emas.
- Komponen: tombol mendapat state `:active` dan focus ring eksplisit, badge mendapat tone
  `accent`, alert memakai garis kiri sesuai tone, card dan section memakai elevation halus,
  drop zone memakai gaya maron, status file menjadi label pill.
- Form di Image Tools memakai border 3:1, radius konsisten, dan nilai quality tampil sebagai
  label emas.
- Teks bahasa Inggris "Choose Files" diganti "Pilih File" agar konsisten dengan DEC-006.
- Test diperbarui untuk label tersebut; total tetap 92 test lulus.
- `DECISIONS.md` — DEC-031 ditambahkan; DEC-022 ditandai sudah direvisi warnanya.

## Phase 3 — Image Converter (Image → PDF tertahan)

- Image Converter selesai diimplementasikan di `/image/convert`: target PNG, JPG, WEBP untuk
  input JPG/JPEG/PNG/WEBP, diproses lokal dengan Sharp.
- Alur 5 langkah dipertahankan (pilih → opsi → pratinjau → proses → hasil) memakai komponen
  yang sama dengan Compressor dan Resizer, tanpa menambah halaman atau komponen baru.
- Konversi tidak mengubah dimensi maupun rasio aspek; nama output `<nama>-converted.<ext>`,
  benturan mendapat ` (2)`, ` (3)`, dst. File asli tidak pernah disentuh.
- Status hasil `skipped` baru: file dengan format sumber = format tujuan, dan file ber-alpha
  yang ditargetkan ke JPG, dilewati dengan alasan tertulis — tidak di-flatten diam-diam
  (DEC-033).
- Opsi radio format tujuan menonjol sebagai kartu pilihan; opsi yang sama dengan format seluruh
  gambar dinonaktifkan, dan jumlah gambar transparan diperingatkan sebelum proses berjalan.
- `image:inspect` sekarang mengembalikan `hasAlpha`; bridge, tipe global, dan IPC main
serta operasi `convert`. Tidak ada dependency baru.
- **Image → PDF tidak diimplementasikan.** Halaman tetap `Coming Soon`; DEC-015 (page size,
  margin, DPI, orientasi EXIF) dan pemilihan library PDF belum diputuskan, jadi tidak ada
  kode, tombol, atau partial UI yang dibuat.
- Test: `tests/unit/image-engine.test.ts` 10 → 21 test, plus `tests/integration/image-convert.test.tsx`
  5 test. Total 108 test pada 9 file, semuanya lulus; lint, typecheck, dan build hijau.
- `tests/setup.ts` — mock bridge diselaraskan dengan bridge sebenarnya (`chooseDestination`
  menggantikan `saveResults` yang tidak pernah ada).
- Dokumentasi diperbarui: `SOURCE_OF_TRUTH.md`, `ARCHITECTURE.md`, `FEATURES.md`,
  `DECISIONS.md` (DEC-032, DEC-033), `TESTING.md`, `README.md`, dan dokumen ini.
- `ARCHITECTURE.md` — byte rusak pada baris `DEC-027`–`DEC-030` dipulihkan menjadi UTF-8 valid.
