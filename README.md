# KPU Office Tools

Aplikasi productivity toolkit untuk membantu pekerjaan administratif harian pegawai —
khususnya pekerjaan yang terkait dengan **foto, PDF, dokumen, dan file**.

> **KPU Office Tools BUKAN aplikasi kepemiluan dan BUKAN pengganti aplikasi resmi KPU.**
> Aplikasi ini adalah alat bantu/internal productivity, bukan produk resmi.

---

## Status Project

```
FASE     : Fondasi / dokumentasi
KODE     : 0 baris
STACK    : BELUM DIPILIH  (menunggu keputusan pengguna)
TEST     : belum ada
BUILD    : belum ada
```

**Project belum dapat dijalankan.** Repository ini saat ini hanya berisi dokumentasi
fondasi. Detail di `SOURCE_OF_TRUTH.md`.

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
| `DECISIONS.md` | Catatan keputusan. 20 entri, 12 di antaranya belum diputuskan |
| `FUTURE_FEATURES.md` | Ide fitur yang **tidak** diimplementasikan |
| `TESTING.md` | Strategi test, fixture yang dibutuhkan, test matrix |
| `CHANGELOG.md` | Riwayat perubahan |

## Arsitektur Ringkas

```
SHELL / NAVIGATION
      ↓
UI LAYER          — 5 langkah: Select Files → Options → Preview → Processing → Result
      ↓
PROCESSING ENGINE — satu modul per tool, tanpa coupling ke UI
      ↓
NATIVE LAYER      — imaging codec, PDF parser, zip, filesystem
```

Bentuk konkret (IPC, struktur folder, library) **menunggu keputusan tech stack (DEC-007)**.

## Yang Belum Diputuskan

Project **terblokir** pada beberapa keputusan. Ringkas:

| ID | Item |
|----|------|
| DEC-007 | **Tech stack** — blocker utama |
| DEC-008 | Engine kompresi PDF (Ghostscript? render ulang? lisensi AGPL?) |
| DEC-009 | Ke mana file output ditulis |
| DEC-010 | Policy nama file duplikat |
| DEC-012 | Distribusi & code signing |
| DEC-013 | Batas ukuran file |
| DEC-014 | Default PDF → Image (DPI, page size) |
| DEC-015 | Default Image → PDF (page size) |
| DEC-016 | ZIP: file saja atau folder |
| DEC-018 | Menyimpan preferences atau tidak |
| DEC-019 | Inisialisasi git repository |

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

> Environment di atas **hanya informasi**, bukan keputusan stack. Belum ada toolchain yang
> dipilih untuk project ini.

## Kontribusi

Tidak ada kontribusi eksternal. Development dilakukan internal, mengikuti keputusan di
`DECISIONS.md`. Aturan berlaku: baca `SOURCE_OF_TRUTH.md` dulu, jangan menambah fitur di luar
scope, dokumentasikan setiap keputusan.
