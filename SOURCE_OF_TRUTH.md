# SOURCE OF TRUTH — KPU Office Tools

Berkas ini adalah **pusat kebenaran proyek**. Setiap keputusan penting harus tercatat di
sini. Urutan sumber kebenaran:

1. Dokumen spesifikasi proyek
2. File konfigurasi proyek
3. Struktur folder yang telah ditetapkan
4. Keputusan pengguna
5. Instruksi phase yang sedang dikerjakan
6. Dokumentasi library resmi
7. Asumsi teknis seminimal mungkin

Jika suatu hal tidak ditentukan: tandai `UNDEFINED`. **Jangan mengarang.**

---

## PROJECT NAME

KPU Office Tools

Versi produk awal: **KPU Office Tools V1**

Aplikasi productivity toolkit untuk membantu pekerjaan administratif harian pegawai,
khususnya pekerjaan yang terkait dengan foto, PDF, dokumen, dan file.

Aplikasi ini **BUKAN aplikasi kepemiluan** dan **BUKAN pengganti aplikasi resmi KPU**.

> Wajib: aplikasi harus menampilkan disclaimer ini pada halaman About / saat pertama
> dijalankan. (lihat DEC-003)

## VERSION

```
Product version : V1
App version     : 0.1.0   (dari package.json, di-inject saat build)
```

Phase 1 membangun application shell; Phase 2 menambahkan Image Compressor dan Image Resizer.

## PURPOSE

Mengurangi pekerjaan manual yang berulang dan membantu pegawai memproses file dengan
lebih cepat, mudah, aman, dan konsisten.

## TARGET USER

Pegawai yang membutuhkan alat bantu sederhana untuk pekerjaan file dan dokumen.

- Kompetensi teknis: non-teknis / pengguna umum
- Frekuensi: harian, sering
- Platform: Windows

> `UNDEFINED`: apakah target user hanya pegawai KPU atau lebih luas, dan apakah aplikasi
> dipasang per individu atau didistribusikan terpusat oleh unit TI.

## TECH STACK

> **STATUS: `ACCEPTED` — Opsi A dipilih pengguna pada 2026-10-02 (DEC-007).**

| Bagian | Pilihan |
|--------|---------|
| Runtime | **Electron 44.5.1** |
| Bahasa | **TypeScript 5.9.3** |
| UI | **React 19.3** |
| Routing | **react-router-dom 7** (HashRouter — DEC-021) |
| Build | **electron-vite 5** + **Vite 7** |
| Test | **Vitest 5** + Testing Library + jsdom (DEC-011) |
| Lint | **ESLint 10** + typescript-eslint + eslint-plugin-react-hooks |
| Styling | CSS biasa + CSS custom properties (DEC-024) |
| Package manager | npm |

### Struktur

```
src/
├── main/index.ts          # main process: window, siklus hidup, keamanan
└── renderer/
    ├── index.html
    └── src/
        ├── app/           # App root + peta route
        ├── components/    # komponen reusable
        ├── layouts/       # shell: Header, Sidebar, Footer, AppLayout
        ├── pages/         # Dashboard, ComingSoon, NotFound
        ├── lib/           # routes.ts (sumber tunggal), appInfo, cn
        ├── hooks/         # useMediaQuery
        ├── types/         # tipe bersama
        └── styles/        # tokens.css, global.css
```

`features/` dan `services/` **belum dibuat** — Phase 1 tidak punya logika fitur maupun IPC
(DEC-026). `engine/` dan `preload/` muncul pada phase yang membutuhkannya.

### Batasan versi yang harus diketahui

Dua versi terbaru **sengaja tidak dipakai**:

- **TypeScript 7.x ditolak** oleh `typescript-eslint@8` (`typescript >=4.8.4 <6.1.0`).
- **Vite 8.x ditolak** oleh `electron-vite@5` (`vite ^5 || ^6 || ^7`).

Naik ke salah satunya memerlukan migrasi toolchain tersendiri, bukan upgrade versi biasa.

### Yang belum ada di stack

- **Belum ada preload / IPC** (DEC-023). Versi aplikasi di-inject saat build lewat `define`.
- **Belum ada `electron-builder`** atau mekanisme installer apa pun — DEC-012 masih UNDEFINED,
  dan menambahkan packaging berarti membuat keputusan distribusi sepihak.
- **Belum ada library imaging/PDF** — masuk Phase 2 sesuai urutan tool.

## SUPPORTED FEATURES

Rincian di `FEATURES.md` (sumber: §8–§13).

| Modul | Fitur | Status |
|-------|-------|--------|
| Image Tools | Image Compressor | SPECIFIED |
| Image Tools | Image Resizer | SPECIFIED |
| Image Tools | Image Converter | SPECIFIED |
| PDF Tools | PDF Compressor | SPECIFIED |
| PDF Tools | PDF Merge | SPECIFIED |
| PDF Tools | PDF Split | SPECIFIED |
| PDF Tools | PDF Rotate | SPECIFIED |
| Convert | Image → PDF | SPECIFIED |
| Convert | PDF → Image | SPECIFIED |
| File Tools | Batch Rename | SPECIFIED |
| File Tools | ZIP Creator | SPECIFIED |
| Utilities | QR Generator | SPECIFIED |
| Utilities | Date Calculator | SPECIFIED |
| OCR | OCR | **DEFERRED** — lihat §13 dan DEC-005 |

> Tidak ada fitur lain. Tidak boleh ada tombol, menu, atau modul di luar tabel ini.

### IMAGE TOOLS STATUS (Phase 2)

| Tool | Status | Detail |
|------|--------|--------|
| Image Compressor | IMPLEMENTED | Lokal via Sharp; JPG/JPEG/PNG/WEBP; quality JPEG/WEBP default 80; PNG lossless |
| Image Resizer | IMPLEMENTED | Lebar/tinggi/persentase; rasio dijaga; upscale ditolak |

Image Tools menerima maksimal 100 file, ukuran maksimal 100 MB per file, dan batas raster
100 megapixel. Batch berjalan sekuensial. User memilih satu folder output per batch. Output memakai suffix `-compressed` atau `-resized`; benturan diberi suffix ` (2)`, ` (3)`, dan seterusnya. Output tidak menimpa input. Implementasi memakai preload
IPC terbatas dan Sharp pada main process; tidak ada upload atau panggilan jaringan.

## NON-GOALS

Fitur berikut secara eksplisit **tidak boleh** ada di V1:

- akun, login, cloud sync, account system
- analytics, telemetry, tracking
- iklan
- subscription, pembayaran
- dashboard/project management
- konversi dokumen proprietary (docx, xlsx, pptx)
- editing isi dokumen (hanya transformasi file)
- fitur AI tambahan yang tidak diminta
- pemrosesan file lewat server eksternal
- kalender sendiri (Date Calculator hanya selisih, tambah, kurang hari)

## UI PRINCIPLES

- professional, clean, modern, minimal, fast, accessible
- **dihindari**: gradient berlebihan, glassmorphism berlebihan, animasi berlebihan, neon,
  card berlebihan, dashboard penuh statistik, tampilan seperti template AI generator
- pola 5 langkah konsisten untuk semua tool pemroses file (§16):
  `SELECT FILES → OPTIONS → PREVIEW → PROCESSING → RESULT`
- navigasi tetap (§15): Dashboard, Image Tools, PDF Tools, Convert, File Tools, Utilities
- bahasa UI: `UNDEFINED` — lihat DEC-006
- minimum accessibility (§20): keyboard navigation, visible focus state, label tombol
  jelas, kontras memadai, pesan error jelas, layout responsif

## SECURITY PRINCIPLES

- aplikasi tidak mengirim file pengguna ke server mana pun (§7)
- tidak ada koneksi jaringan yang tidak perlu; jika suatu fitur butuh internet, UI harus
  menyatakannya
- tidak ada eksekusi command dari input pengguna tanpa sanitasi
- IPC antar proses harus sempit scope dan divalidasi
- developer log boleh menyimpan detail teknis; **UI tidak boleh** (§17)
- tidak menyimpan secret atau API key di repository
- dependency baru hanya dengan alasan teknis tertulis di `DECISIONS.md`

## PRIVACY PRINCIPLES

- **DEFAULT = LOCAL PROCESSING.** Jika bisa diproses di perangkat pengguna, harus lokal.
- tidak ada telemetry, tidak ada upload, tidak ada pihak ketiga.
- tidak ada file yang keluar dari mesin tanpa persetujuan eksplisit per fitur.
- tidak ada pengumpulan data penggunaan.

## ARCHITECTURE RULES

Rincian di `ARCHITECTURE.md`. Aturan inti:

1. Pisahkan **UI layer** dan **processing engine**. UI tidak melakukan proses berat.
2. Proses batch wajib melaporkan progress, jumlah file, file saat ini, dan error per file.
   **Satu file gagal tidak boleh menghentikan seluruh batch** (§19).
3. Output selalu file baru. Tidak ada overwrite file asli secara default (§18).
4. Nama file output harus deterministik dan menangani duplikat serta karakter invalid.
5. Error handling dua lapis: `UserMessage` (ramah) + `TechnicalLog` (developer). Lihat §17.
6. Jangan menambahkan abstraksi, wrapper, atau dependency tanpa kebutuhan (§29).
7. Processing engine harus dapat diuji tanpa UI.
8. Modular: setiap tool adalah modul dengan kontrak input/output yang jelas.

---

## OPEN / UNDEFINED DECISIONS

Daftar ini menghambat pengerjaan phase berikutnya.

| ID | Item | Status |
|----|------|--------|
| DEC-007 | ~~Tech stack~~ | **ACCEPTED — Electron + TS + React (DEC-007)** |
| DEC-005 | OCR engine | DEFERRED / BLOCKED |
| DEC-006 | ~~Bahasa UI~~ | ACCEPTED (Bahasa Indonesia; Phase 2) |
| DEC-008 | Engine/library PDF compression | UNDEFINED |
| DEC-009 | Tujuan output file | ACCEPTED (Phase 2; lihat DEC-029) |
| DEC-010 | Policy nama file duplikat | ACCEPTED (Phase 2; auto-suffix, lihat DEC-029) |
| DEC-011 | ~~Testing framework~~ | **ACCEPTED — Vitest + Testing Library (DEC-011)** |
| DEC-012 | Distribusi: installer, code signing, auto-update | UNDEFINED |
| DEC-013 | Batas ukuran file | ACCEPTED untuk Image Tools: 100 MB/file, batch 100 (Phase 2) |
| DEC-014 | PDF → Image: page size dan DPI default | UNDEFINED |
| DEC-015 | Image → PDF: page size default (A4/Letter/Fit) | UNDEFINED |
| DEC-016 | ZIP Creator: file saja atau folder penuh | UNDEFINED (spesifikasi ambigu) |
| DEC-017 | QR: dukungan SVG | CONDITIONAL (bergantung library) |
| DEC-018 | Persistensi preferences (folder terakhir, dan lain-lain) | UNDEFINED |
| DEC-019 | ~~Inisialisasi git repository~~ | **ACCEPTED** |
| DEC-020 | Nama folder project (`KOT`) | PROPOSED |

Sudah diputuskan pada Phase 1 dan tidak lagi menghambat: DEC-021 (HashRouter), DEC-022
(design tokens), DEC-023 (tanpa preload/IPC), DEC-024 (CSS biasa), DEC-025 (registry route),
DEC-026 (folder `features/` dan `services/` belum dibuat).

Rincian dan alasan: `DECISIONS.md`.
