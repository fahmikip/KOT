# TESTING — KPU Office Tools

> **STATUS: AKTIF.** Framework dipilih: **Vitest 5 + Testing Library + jsdom** (DEC-011).
> Phase 1 memiliki **82 test, semuanya lulus** pada 7 file.
>
> Cakupan saat ini **hanya application shell** — navigasi, routing, responsif, aksesibilitas,
> dan komponen UI. Test engine file processing belum ada karena engine-nya belum ada.

---

## Hasil Validasi Terakhir

```
Command                                        Hasil
────────────────────────────────────────────────────────────────
npx eslint .                                    PASS (0 error, 0 warning)
npx tsc --noEmit -p tsconfig.node.json          PASS
npx tsc --noEmit -p tsconfig.web.json           PASS
npx vitest run                                  PASS — 7 files, 82 tests
npm run build                                   PASS
Electron 44.5.1 (runtime nyata)                 PASS — 0 console error
```

Pemeriksaan runtime dilakukan dengan memuat hasil build di Electron sungguhan dan mengevaluasi
DOM: title, heading, 14 link navigasi, sidebar, footer disclaimer, versi header, token CSS
terresolve, navigasi hash, dan route 404. **0 console error, 0 renderer crash.**

### Sebaran test Phase 1

| File test | Test | Cakupan |
|-----------|------|---------|
| `integration/navigation.test.tsx` | 23 | Dashboard, seluruh route tool, 404, sidebar, interaksi menu |
| `unit/components.test.tsx` | 16 | Button, Badge, Card, Alert, Loading, FileDropZone |
| `integration/accessibility.test.tsx` | 10 | Landmark, struktur heading, accessible name, focus |
| `integration/shell.test.tsx` | 10 | Header/Sidebar/Footer, halaman Coming Soon |
| `unit/routes.test.ts` | 9 | Registry route: path unik, group, status, urutan |
| `integration/responsive.test.tsx` | 8 | Mobile + desktop, drawer, tabel |
| `unit/error-handling.test.tsx` | 6 | ErrorBoundary, pesan user vs teknis, app info |
| **Total** | **82** | **7 file** |

---

## 1. Prinsip

| Prinsip | Arti |
|---------|------|
| Test engine terpisah dari test UI | Engine harus diuji tanpa membuka window |
| Test harus punya fixture | Tidak membuat file on-the-fly di test, memakai `tests/fixtures/` |
| Test negatif wajib | Setiap tool wajib punya test untuk file rusak, kosong, dan salah format |
| Test batch wajib | Karena §19 adalah requirement, bukan bonus |
| Tidak ada test yang bergantung pada jaringan | Semua test harus offline (DEC-001) |
| Test tidak boleh mengubah file asli | Semua test menulis ke temp dir |
| Test menguji perilaku, bukan implementasi | Query lewat role & nama yang dibaca user |

> Lokasi file & konvensi penamaan sudah diterapkan:
> `tests/unit/*.test.ts(x)` dan `tests/integration/*.test.tsx`. Fixture `tests/fixtures/`
> disiapkan tetapi belum berisi apa-apa karena belum ada engine.

## 2. Lokasi

Struktur yang dipakai Phase 1:

```
tests/
├── setup.ts                  # jest-dom, auto-cleanup, stub matchMedia
├── helpers/renderApp.tsx     # render aplikasi dengan MemoryRouter
├── unit/
│   ├── routes.test.ts            9 test
│   ├── components.test.tsx      16 test
│   └── error-handling.test.tsx    6 test
└── integration/
    ├── navigation.test.tsx      23 test
    ├── shell.test.tsx           10 test
    ├── responsive.test.tsx       8 test
    └── accessibility.test.tsx   10 test
```

## 3. Fixture yang Wajib Dibuat

Folder `tests/fixtures/` harus berisi file berikut. **Belum ada — harus dibuat pada phase
implementasi**, bukan sekarang (karena tidak ada tool untuk membuatnya).

### Image

| Fixture | Ukuran | Tujuan |
|---------|--------|--------|
| `valid-small.jpg` | ~10 KB, 100x100 | kasus sukses |
| `valid-small.png` | ~5 KB, 100x100 | kasus sukses |
| `valid-small.webp` | ~5 KB, 100x100 | kasus sukses |
| `zero-byte.jpg` | 0 byte | file kosong |
| `corrupt.jpg` | ~1 KB, header rusak | file corrupt |
| `not-an-image.jpg` | teks biasa | salah format |
| `huge.jpg` | ~15-20 MB, 8000x6000 | file besar |
| `has-exif.jpg` | dengan EXIF orientation | uji handling EXIF |
| `transparent.png` | PNG dengan alpha | uji konversi ke JPG |
| `batch/` | 20 file campuran | uji batch |

### PDF

| Fixture | Halaman | Tujuan |
|---------|--------|--------|
| `valid-1page.pdf` | 1 | kasus sukses |
| `valid-20page.pdf` | 20 | multi-page |
| `valid-text.pdf` | 2 | punya text layer |
| `valid-scan.pdf` | 1 | image-only, tanpa text layer |
| `corrupt.pdf` | - | header rusak / bukan PDF |
| `zero-byte.pdf` | 0 byte | file kosong |
| `password.pdf` | 1 | terenkripsi |
| `empty-pages.pdf` | 1 | satu halaman kosong |
| `mixed-sizes.pdf` | 2 | A4 + A5 dalam satu file |
| `huge.pdf` | 50 halaman | file besar |

### Batch Rename

| Fixture | Isi | Tujuan |
|---------|-----|--------|
| `rename/simple/` | `IMG_001.jpg` ... `IMG_003.jpg` | kasus dasar sesuai spesifikasi |
| `rename/spaces/` | `my file 1.jpg` | karakter spasi |
| `rename/unicode/` | nama dengan karakter Cyrillik & CJK (mis. `фото.jpg`, `報告.jpg`) | karakter unicode |
| `rename/dots/` | `a.b.c.jpg`, `v1.2.3.jpg` | titik pada nama |
| `rename/long/` | nama 250 karakter | batas panjang nama Windows |
| `rename/collision/` | `a.jpg` di 2 folder | nama duplikat setelah rename |
| `rename/invalid/` | nama dengan `?`, `*`, `:` (via hasil copy) | karakter invalid |

### QR

| Fixture | Isi | Tujuan |
|---------|-----|--------|
| `qr/short.txt` | "KPU" | input pendek |
| `qr/url.txt` | URL panjang ~500 char | input panjang |
| `qr/empty.txt` | 0 byte | input kosong |
| `qr/max.txt` | ~2900 byte | batas maksimum QR |

## 4. Test Matrix per Tool

### 4.1 Image Compressor

| ID | Kasus | Expected | Sumber |
|----|-------|----------|--------|
| IC-01 | JPG valid | output JPG, bisa dibuka, lebih kecil atau sama | §25 |
| IC-02 | PNG valid | output PNG valid | §25 |
| IC-03 | WEBP valid | output valid | §8 |
| IC-04 | File bukan gambar | gagal dengan pesan ramah, tidak crash | §25 |
| IC-05 | Zero-byte | ditolak, pesan jelas | §25 |
| IC-06 | Gambar besar (15MB) | berhasil, tidak OOM | §25 |
| IC-07 | Batch 20 file | semua sukses, summary benar | §25 |
| IC-08 | Batch dengan 1 file corrupt | 19 sukses, 1 gagal, **batch tidak berhenti** | §19 |
| IC-09 | Output benar-benar terbentuk | file ada di disk, size > 0 | §25 |
| IC-10 | File asli tidak berubah | hash asli sama setelah proses | §18 |
| IC-11 | Cancel di tengah batch | berhenti, file yang sudah selesai tetap ada | §19 |
| IC-12 | Nama output duplikat | ditangani sesuai DEC-010 | §18 |

### 4.2 Image Resizer

| ID | Kasus | Expected |
|----|-------|----------|
| IR-01 | Width saja | lebar sesuai, tinggi proporsional |
| IR-02 | Height saja | tinggi sesuai, lebar proporsional |
| IR-03 | Percentage 50% | kedua dimensi 50% |
| IR-04 | Rasio aspek tetap | rasio tetap dalam toleransi 1px |
| IR-05 | Upscale ke ukuran lebih besar | perilaku sesuai keputusan (DIPERLUKAN) |
| IR-06 | Batch 20 file | semua sukses |
| IR-07 | Rasio ekstrem (panorama 5000x200) | tidak error |

### 4.3 Image Converter

| ID | Kasus | Expected |
|----|-------|----------|
| CV-01 | JPG → PNG | output PNG valid |
| CV-02 | PNG → JPG | output JPG valid |
| CV-03 | WEBP → JPG | output JPG valid |
| CV-04 | PNG transparent → JPG | tidak crash, alpha ditangani (DIPERLUKAN) |
| CV-05 | Input = output format | ditolak atau di-handle jelas |
| CV-06 | File corrupt | gagal dengan pesan ramah |

### 4.4 PDF Compressor

| ID | Kasus | Expected | Sumber |
|----|-------|----------|--------|
| PC-01 | PDF valid | output valid, halaman utuh | §25 |
| PC-02 | PDF corrupt | gagal dengan pesan ramah | §25 |
| PC-03 | PDF password protected | pesan jelas "file dilindungi password" | §25 |
| PC-04 | PDF 20 halaman | semua halaman utuh, urutan benar | §25 |
| PC-05 | Output terbentuk | file ada, size > 0 | §25 |
| PC-06 | 3 mode menghasilkan ukuran berbeda | mode high quality ≥ balanced ≥ maximum | §9 |
| PC-07 | PDF sudah kecil | tidak lebih besar dari input, atau user diberi tahu | §9 |
| PC-08 | PDF image-only | bisa dikompres (tidak ada text layer untuk dirusak) | DEC-008 |
| PC-09 | PDF dengan text | **perilaku sesuai keputusan DEC-008** | DEC-008 |
| PC-10 | Tanpa estimasi palsu | UI tidak menampilkan perkiraan ukuran output | §9 |

### 4.5 PDF Merge

| ID | Kasus | Expected | Sumber |
|----|-------|----------|--------|
| PM-01 | 2 PDF | output berisi 2 dokumen, halaman benar | §25 |
| PM-02 | 5 PDF | semua masuk, urutan benar | §25 |
| PM-03 | 1 PDF saja | ditolak dengan pesan jelas |
| PM-04 | Salah satu PDF corrupt | gagal dengan pesan, tidak crash | §25 |
| PM-05 | Reorder via drag & drop | urutan halaman output mengikuti urutan baru | §9 |
| PM-06 | Remove dari list | file tidak masuk output | §9 |
| PM-07 | Duplicate filename | keduanya tetap terbaca (berbeda path) | §25 |
| PM-08 | PDF dengan ukuran halaman berbeda | output valid |
| PM-09 | 1 input corrupt di tengah batch | gagal, output lain tidak terganggu |

### 4.6 PDF Split

| ID | Kasus | Expected |
|----|-------|----------|
| PS-01 | Split by page (1 file per halaman) | jumlah output = jumlah halaman |
| PS-02 | Extract page range (mis. 3-5) | output berisi halaman 3,4,5 |
| PS-03 | Range melebihi jumlah halaman | error jelas |
| PS-04 | Range tidak valid (mis. 5-3) | error jelas |
| PS-05 | Password PDF | pesan jelas |
| PS-06 | Nama file output | unik per halaman |

### 4.7 PDF Rotate

| ID | Kasus | Expected |
|----|-------|----------|
| PR-01 | 90° | semua halaman rotasi 90° |
| PR-02 | 180° | semua halaman rotasi 180° |
| PR-03 | 270° | semua halaman rotasi 270° |
| PR-04 | Rotasi 4x360° | kembali ke orientasi awal |
| PR-05 | Orientasi landscape | tidak terpotong setelah rotasi |
| PR-06 | Jumlah halaman tetap | sama dengan input |

### 4.8 Image → PDF

| ID | Kasus | Expected |
|----|-------|----------|
| I2P-01 | 1 gambar | PDF 1 halaman |
| I2P-02 | 5 gambar | PDF 5 halaman, urutan benar |
| I2P-03 | Reorder | urutan halaman mengikuti urutan baru |
| I2P-04 | Page size A4 | ukuran halaman A4 |
| I2P-05 | Orientation landscape | halaman landscape |
| I2P-06 | Margin | margin diterapkan, gambar tidak keluar halaman |
| I2P-07 | Campuran orientasi gambar | sesuai opsi |
| I2P-08 | EXIF orientation | diterapkan (DIPERLUKAN keputusan) |
| I2P-09 | Gambar corrupt di tengah | gagal untuk file itu, halaman lain tetap |

### 4.9 PDF → Image

| ID | Kasus | Expected |
|----|-------|----------|
| P2I-01 | Export semua halaman | jumlah output = jumlah halaman |
| P2I-02 | Export halaman terpilih | hanya halaman terpilih |
| P2I-03 | Output JPG | JPG valid, tidak hitam |
| P2I-04 | Output PNG | PNG valid |
| P2I-05 | Halaman kosong | output valid, tidak error |
| P2I-06 | PDF password | pesan jelas |
| P2I-07 | DPI | sesuai keputusan DEC-014 |

### 4.10 Batch Rename

| ID | Kasus | Expected | Sumber |
|----|-------|----------|--------|
| BR-01 | Pattern `Dokumentasi_Rapat_{number}` 3 file | `Dokumentasi_Rapat_001.jpg` s/d `_003.jpg` | §11 |
| BR-02 | Preview sebelum rename | preview akurat 100% dengan hasil | §11 |
| BR-03 | Cancel sebelum eksekusi | tidak ada file yang berubah | §25 |
| BR-04 | Nama duplikat setelah rename | ditangani sesuai DEC-010 | §25 |
| BR-05 | Nama dengan spasi | spasi dipertahankan |
| BR-06 | Nama unicode | dipertahankan |
| BR-07 | Karakter invalid | disanitasi |
| BR-08 | Nama > 255 char | dipotong aman |
| BR-09 | Ekstensi berbeda | `{ext}` mengikuti tiap file |
| BR-10 | Jumlah digit berbeda | 1 file → `_1` atau `_001` sesuai keputusan |
| BR-11 | Sort order | penomoran mengikuti urutan yang dipilih |
| BR-12 | Pattern invalid | error sebelum eksekusi |
| BR-13 | Ekstensi hilang | tidak error fatal |
| BR-14 | 100 file | batch performant, progress benar |
| BR-15 | Batalkan saat sudah berjalan | file yang sudah diproses tidak setengah jadi |

### 4.11 ZIP Creator

| ID | Kasus | Expected |
|----|-------|----------|
| ZC-01 | 5 file | ZIP valid, 5 entry |
| ZC-02 | 1 file | ZIP valid |
| ZC-03 | Nama duplikat dalam ZIP | tidak menimpa diam-diam |
| ZC-04 | File dengan nama unicode | nama entry benar |
| ZC-05 | Integritas | ZIP bisa dibuka dan isinya cocok |
| ZC-06 | Folder (jika DEC-016 = B) | struktur dipertahankan |
| ZC-07 | File 0 byte di dalam | tidak error |
| ZC-08 | Nama path panjang | tidak error |

### 4.12 QR Generator

| ID | Kasus | Expected |
|----|-------|----------|
| QR-01 | Teks pendek | PNG valid, bisa di-scan |
| QR-02 | URL | PNG valid, isi URL terbaca |
| QR-03 | Input kosong | validation error, tidak crash |
| QR-04 | Teks sangat panjang | error jelas bila melebihi kapasitas |
| QR-05 | SVG output | valid (hanya bila DEC-017 = ya) |
| QR-06 | Unicode | dapat di-encode |

### 4.13 Date Calculator

| ID | Kasus | Expected |
|----|-------|----------|
| DC-01 | Selisih 2 tanggal | selisih benar |
| DC-02 | Tanggal sama | 0 hari |
| DC-03 | Tanggal terbalik | handle benar (absolut atau negatif, sesuai keputusan) |
| DC-04 | Tambah N hari | tanggal benar, termasuk pergantian bulan |
| DC-05 | Kurang N hari | tanggal benar |
| DC-06 | Leap year (29 Feb) | benar |
| DC-07 | Akhir bulan | benar |
| DC-08 | Tanggal tidak valid | validation error |

## 5. Test Lintas-Modul (Wajib untuk Semua Tool)

| ID | Kasus | Expected | Sumber |
|----|-------|----------|--------|
| X-01 | File asli tidak pernah berubah | hash sama sebelum/sesudah | §18 |
| X-02 | Tidak ada nama file invalid di output | sanitasi berlaku | §18 |
| X-03 | Nama duplikat ditangani | tidak ada file tertimpa | §18 |
| X-04 | Error tidak pernah berupa string kosong | assertion | §17 |
| X-05 | Error tidak pernah menampilkan stack trace | assertion | §17 |
| X-06 | File corrupt menghasilkan `EngineError` dengan kode, bukan crash | assertion | §17 |
| X-07 | Batch dengan 1 file gagal tetap menyelesaikan sisa | assertion | §19 |
| X-08 | Progress report accurate | `completed` tidak pernah melebihi `total` | §19 |
| X-09 | Cancel tidak meninggalkan file output setengah jadi | assertion | §19 |
| X-10 | Tidak ada file yang keluar dari direktori temp | assertion | §7 |
| X-11 | Tidak ada koneksi jaringan saat runtime | assertion | §7 |

> X-01 sampai X-11 sebaiknya diimplementasikan sebagai **test helper yang dipakai ulang**,
> bukan test yang ditulis ulang 13 kali. Ini satu-satunya abstraksi yang dibenarkan (§29).

## 6. Test Manual / Exploratory

Tidak semuanya bisa diotomatisasi. Wajib dilakukan manual:

| Item | Metode |
|------|--------|
| Drag & drop reorder | Manual — simulasi drag di test runner sangat rapuh |
| 5-step wizard flow | Manual, minimal 3 tool |
| Cancel di tengah proses | Manual (test otomatis bisa, tapi verifikasi UX perlu mata) |
| Visible focus state | Manual — perlu diperiksa visually |
| Kontras warna | Manual — perlu tool contrast checker |
| Layout responsif | Manual — resize window ke beberapa ukuran |
| Error message tone | Manual — baca ulang, pastikan tidak teknis |

## 7. Definition of Done (§26)

Sebuah fitur dianggap selesai hanya jika **SEMUA** ini terpenuhi:

```
[ ] requirement terpenuhi
[ ] UI selesai
[ ] error handling tersedia
[ ] test tersedia
[ ] test berhasil
[ ] tidak merusak fitur lain
[ ] dokumentasi diperbarui
[ ] tidak ada fitur tambahan yang tidak diminta
```

Test dianggap "tersedia" bila minimal mencakup: kasus sukses, kasus file invalid, kasus
batch, dan kasus error file per-item.

## 8. Status

| Item | Status |
|------|--------|
| Strategi test | DOKUMENTED |
| Framework | **AKTIF — Vitest 5 + Testing Library + jsdom** (DEC-011) |
| Test files | **7 file, 82 test, semua lulus** (Phase 1) |
| Cakupan | Application shell saja: routing, navigasi, responsif, a11y, komponen |
| Test engine / processing | **BELUM ADA** — engine-nya belum ada |
| Fixture files | BELUM ADA — butuh tool untuk membuatnya (phase engine) |
| E2E / browser test | BELUM ADA |
| CI | UNDEFINED — belum ada konfigurasi CI |

### Yang sudah diverifikasi otomatis di Phase 1

- Seluruh 13 route terbuka dan menampilkan halaman Coming Soon yang jujur
- Route tak dikenal → 404
- Drawer mobile/tablet: toggle, tutup via Escape, tutup via navigasi, tutup via backdrop
- Sidebar desktop selalu terlihat
- Landmark & heading structure benar
- Nama accessible pada semua kontrol interaktif
- Visible focus state
- ErrorBoundary: pesan user !== pesan teknis
- Tidak ada console error di runtime Electron nyata

### Yang belum bisa diverifikasi otomatis

Sisa baris di §6 tetap manual, termasuk inspection visual focus state dan kontras warna.
Yang **telah** dilakukan manual di Phase 1: verifikasi runtime Electron (0 console error,
DOM ter-render benar, token CSS resolve, hash routing bekerja, 404 bekerja).
Verifikasi visual pada beberapa ukuran window masih perlu dilakukan manusia.

## 9. Yang Belum Defined

- struktur penamaan file test untuk `features/` dan `engine/` (menunggu ada isinya)
- lokasi & format developer log yang diakses test
- strategi untuk test batch besar (fixture di-generate saat test run vs di-commit)
- mock filesystem atau temp dir asli
- threshold timeout per test
- apakah ada CI, dan di mana
- E2E untuk alur wizard 5 langkah (perlukan tool browser, lihat FUTURE_FEATURES.md FF-021)
