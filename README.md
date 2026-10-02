# KPU Office Tools

Aplikasi productivity toolkit untuk membantu pekerjaan administratif harian pegawai —
khususnya pekerjaan yang terkait dengan **foto, PDF, dokumen, dan file**.

> **KPU Office Tools BUKAN aplikasi kepemiluan dan BUKAN pengganti aplikasi resmi KPU.**
> Aplikasi ini adalah alat bantu/internal productivity, bukan produk resmi.

---

## Status Project

```
FASE     : Phase 2 — Image Tools (SELESAI)
STACK    : Electron 44 + TypeScript 5.9 + React 19  (DEC-007, Opsi A)
TEST     : 92 test lulus (Vitest + Testing Library)
BUILD    : out/ — bisa dijalankan
FITUR    : 2 dari 13 — Image Compressor + Image Resizer
```

**Image Compressor dan Image Resizer memproses gambar secara lokal.** Sebelas tool lainnya masih Coming Soon.

Detail di `SOURCE_OF_TRUTH.md` dan `CHANGELOG.md`.

## Menjalankan

Prasyarat: Node.js 20+ dan npm.

```bash
npm install          # pasang dependency
npm run dev          # mode pengembangan (hot reload)
npm start            # jalankan hasil build produksi
npm test             # 92 test
npm run verify       # lint + typecheck + test + build
```

Build produksi menghasilkan folder `out/`, termasuk preload terbatas untuk image IPC.

## Prinsip

| Prinsip | Arti |
|---------|------|
| **Local-first** | File diproses di perangkat pengguna. Tidak ada upload, tidak ada server |
| **No tracking** | Tidak ada analytics, telemetry, akun, iklan, atau subscription |
| **File aman** | Tidak menimpa file asli. Selalu menghasilkan file baru |
| **Jujur soal error** | Error presented dalam Bahasa manusia, tanpa dump teknis |
| **Tidak mengarang** | Fitur di luar spesifikasi tidak diimplementasikan. Lihat `FUTURE_FEATURES.md` |

## Modul V1

| Modul | Fitur |
|-------|-------|
| Image Tools | Image Compressor |
| Image Tools | Image Resizer |
| Image Tools | Image Converter |
| PDF Tools | PDF Compressor |
| PDF Tools | PDF Merge |
| PDF Tools | PDF Split |
| PDF Tools | PDF Rotate |
| Convert | Image → PDF |
| Convert | PDF → Image |
| File Tools | Batch Rename |
| File Tools | ZIP Creator |
| Utilities | QR Generator |
| Utilities | Date Calculator |

OCR **tidak** termasuk V1 — ditunda menunggu keputusan engine. Lihat `DECISIONS.md` (DEC-005).

Rincian lengkap di `FEATURES.md`.

## Dokumentasi

| Berkas | Isi |
|--------|-----|
| `SOURCE_OF_TRUTH.md` | **Pusat kebenaran proyek.** Baca ini lebih dulu |
| `ARCHITECTURE.md` | Batas modul, aliran data, kontrak, aturan batch & file safety |
| `FEATURES.md` | Rincian tiap fitur + hal yang belum ditentukan |
| `DECISIONS.md` | Catatan keputusan. 31 entri (DEC-001 s/d DEC-031) |
| `FUTURE_FEATURES.md` | Ide fitur yang **tidak** diimplementasikan |
| `TESTING.md` | Strategi test, fixture yang dibutuhkan, test matrix |
| `CHANGELOG.md` | Riwayat perubahan |

## Arsitektur Ringkas

```
SHELL / NAVIGATION     ← SUDAH ADA (Phase 1)
      ↓
UI LAYER (5 langkah)   ← SUDAH ADA untuk Image Tools (Phase 2)
      ↓
PROCESSING ENGINE      ← SUDAH ADA untuk gambar (Sharp, main process)
      ↓
NATIVE LAYER           ← libvips via Sharp
```

Struktur folder riil ada di `ARCHITECTURE.md` §3.

## Identitas Visual

Merah maron sebagai warna aksi utama dengan aksen emas pada garis pemisah, penanda menu aktif,
dan label status. Header dan sidebar memakai permukaan maron gelap; konten tetap terang agar
tetap nyaman dibaca. Token warna terpusat di `src/renderer/src/styles/tokens.css` (DEC-031).

## Yang Belum Diputuskan

Phase 1 **tidak lagi terblokir**. Keputusan yang tersisa menyangkut fitur, bukan fondasi:

| ID | Item |
|----|------|
| DEC-008 | Engine kompresi PDF (Ghostscript? render ulang? lisensi AGPL?) |
| DEC-012 | Distribusi & code signing |
| DEC-014 | Default PDF → Image (DPI, page size) |
| DEC-015 | Default Image → PDF (page size) |
| DEC-016 | ZIP: file saja atau folder |
| DEC-018 | Menyimpan preferences atau tidak |

Sudah diputuskan: DEC-007 (stack), DEC-011 (testing), DEC-019 (git), DEC-021 – DEC-026,
dan DEC-027 – DEC-031 (mesin gambar, aturan batch, output, palet warna).
Rincian dan opsi lengkap di `DECISIONS.md`.

## Environment Developers

Terdeteksi pada mesin build:

```
OS      : Windows 10/11
Node    : v24.18.0
npm     : 11.16.0
Python  : 3.12.10
Git     : 2.55.0
```

> Environment di atas **hanya informasi**. Toolchain yang dipakai project: Node + npm,
> dengan Electron 44, TypeScript 5.9, React 19, electron-vite 5, Vitest 5, ESLint 10.

## Kontribusi

Tidak ada kontribusi eksternal. Development dilakukan internal, mengikuti keputusan di
`DECISIONS.md`. Aturan berlaku: baca `SOURCE_OF_TRUTH.md` dulu, jangan menambah fitur di luar
scope, dokumentasikan setiap keputusan.
