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

Belum ada rilis. `0.1.0` akan dicatat setelah tech stack diputuskan dan aplikasi pertama
dapat dijalankan.
