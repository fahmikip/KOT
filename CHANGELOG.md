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

- **82 test pada 7 file, semuanya lulus.**
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

- **Tidak ada fitur yang diimplementasikan.** 13 tool masih `COMING SOON` yang jujur.
- Tidak ada upload, tidak ada analytics, tidak ada webfont — semua lokal (DEC-001).
- Tidak ada folder `features/`, `services/`, `engine/`, atau `preload/` karena belum ada
  consumer (DEC-026, DEC-023).
- Peringatan build `preload config is missing` **diharapkan**, bukan error.
- Test engine/processing belum ada karena engine-nya belum ada.
