# FEATURES — KPU Office Tools V1

Sumber: spesifikasi §8–§13, §15, §16. **Daftar ini adalah scope V1 yang lengkap.**
Fitur di luar daftar ini tidak boleh diimplementasikan (ZERO INVENTION RULE, §28).

Status legend:

| Status | Arti |
|--------|------|
| `SPECIFIED` | Ada di spesifikasi, siap diimplementasikan |
| `PARTIAL` | Ada di spesifikasi, tetapi sebagian detailnya belum ditentukan |
| `DEFERRED` | Ditunda; tidak diimplementasikan di V1 sampai ada keputusan |
| `BLOCKED` | Tidak bisa dikerjakan karena ketergantungan yang belum diputuskan |

> **Tidak ada satu pun fitur yang berstatus `IMPLEMENTED`.**
>
> Phase 1 sudah membangun **shell tempat semua fitur ini akan hidup**: window aplikasi,
> navigasi, routing, design system, dan responsif layout. Jadi dari sudut pandang kode,
> setiap tool sudah punya *tempat* dan *tempat masuk* di navigasi — tetapi belum punya
> fungsi apa pun. Halaman yang tampil untuk setiap tool adalah "Coming Soon" yang jujur.
> Yang diimplementasikan Phase 1 adalah `FileDropZone` dan komponen UI dasar, bukan fitur.

### Prasyarat yang sudah satisfied di Phase 1

| Prasyarat | Status |
|-----------|--------|
| Tech stack (DEC-007) | ACCEPTED |
| Testing framework (DEC-011) | ACCEPTED |
| Struktur folder | Ada (`ARCHITECTURE.md` §3) |
| Routing untuk 13 tool | Ada, semua dapat dinavigasi |
| Design tokens & komponen dasar | Ada (DEC-022) |

### Prasyarat yang masih hilang

Tidak ada satu pun tool yang bisa dikerjakan sebelum keputusan ini tersedia:

| ID | Yang dibutuhkan | Tool yang tertahan |
|----|-----------------|---------------------|
| DEC-008 | Engine kompresi PDF | PDF Compressor |
| DEC-009 | Tujuan output file | Semua tool |
| DEC-010 | Policy nama file duplikat | Semua tool yang menulis file |
| DEC-013 | Batas ukuran file | Semua tool |
| DEC-014 | Default DPI & page size | PDF → Image |
| DEC-015 | Default page size | Image → PDF |
| DEC-016 | ZIP: file atau folder | ZIP Creator |

Phase 2 perlu memutuskan DEC-009 dan DEC-013 lebih dulu, karena keduanya memengaruhi
kontrak `OutputTarget` dan validasi input — bukan hanya UI.

---

## Ringkasan Modul

Kolom "Kode" menunjukkan apakah ada implementasi untuk fitur tersebut.

| # | Modul | Fitur | Status | Kode | Estimasi |
|---|-------|-------|--------|------|----------|
| 1 | Image Tools | Image Compressor | SPECIFIED | — | S |
| 2 | Image Tools | Image Resizer | SPECIFIED | — | S |
| 3 | Image Tools | Image Converter | SPECIFIED | — | S |
| 4 | PDF Tools | PDF Compressor | PARTIAL | — | L |
| 5 | PDF Tools | PDF Merge | SPECIFIED | — | M |
| 6 | PDF Tools | PDF Split | SPECIFIED | — | S |
| 7 | PDF Tools | PDF Rotate | SPECIFIED | — | S |
| 8 | Convert | Image → PDF | PARTIAL | — | M |
| 9 | Convert | PDF → Image | PARTIAL | — | M |
| 10 | File Tools | Batch Rename | SPECIFIED | — | M |
| 11 | File Tools | ZIP Creator | PARTIAL | — | S |
| 12 | Utilities | QR Generator | PARTIAL | — | S |
| 13 | Utilities | Date Calculator | PARTIAL | — | S |
| 14 | OCR | OCR | DEFERRED | — | — |

Estimasi: `S` kecil, `M` sedang, `L` besar. Ini perkiraan kasar, bukan commitment.
Kolom "Kode" kosong untuk semua fitur: yang ada baru shell-nya, bukan logikanya.

---

## 1. Image Compressor — `SPECIFIED`

Format input: JPG, JPEG, PNG, WEBP.

| Field | Isi |
|-------|-----|
| Input | JPG, JPEG, PNG, WEBP |
| Fungsi | compression, quality control, batch processing |
| Output | file baru, format sama dengan input (kecuali `UNDEFINED`) |
| Koneksi internet | tidak |

`UNDEFINED` yang perlu diputuskan:

- Apakah hasil selalu format yang sama, atau ada opsi ubah format sekalian?
- Rentang quality step (mis. 10–100 dengan step 1, atau 5 preset)?
- Apakah metadata (EXIF) dipertahankan? Butterfly: sebagian alatQgjpeg menghapus EXIF
  berisi lokasi dan waktu.
- Apakah ada batas dimensi (mis. resize otomatis jika melebihi 4000px)?

## 2. Image Resizer — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Fungsi | resize by width, resize by height, percentage, maintain aspect ratio, batch |
| Koneksi internet | tidak |

`UNDEFINED`:

- Apakah wajib maintain aspect ratio, atau ada opsi free-stretch?
- Resize ke lebih besar (upscaling) diizinkan atau ditolak?
- Preset ukuran umum (mis. 4R, 3x4 cm, ukuran pas foto) perlu atau tidak? Preset seperti
  ini berguna untuk foto identitas, tetapi belum ada di spesifikasi.
- Batch: apakah opsi berlaku ke semua file sekaligus?

## 3. Image Converter — `SPECIFIED`

Konversi yang disebut minimal:

```
JPG  → PNG
PNG  → JPG
WEBP → JPG
```

`UNDEFINED`:

- Apakah konversi ke WEBP dan ke BMP/GIF/TIFF diperlukan? (hanya tiga arah di atas yang
  disebut)
- Apakah transparency PNG dipertahankan saat konversi ke JPG? (JPG tidak mendukung alpha —
  perlu warna latar)
- Apakah size boleh diperkecil saat konversi?

## 4. PDF Compressor — `PARTIAL` (butuh DEC-008)

| Field | Isi |
|-------|-----|
| Tujuan | mengurangi ukuran PDF, menjaga kualitas sebisa mungkin |
| Mode | Maximum Compression, Balanced, High Quality |
| Larangan | **tidak boleh menampilkan estimasi ukuran output sebelum proses** jika tidak dapat dihitung akurat (§9) |
| Konsekuensi | Umumnya kompresi PDF dicapai dengan merender ulang halaman menjadi gambar lalu membangun ulang PDF. Ini **mematikan** kemampuan pencarian dan selections teks pada output. Belum diputuskan apakah itu dapat diterima |
| Koneksi internet | tidak |

`UNDEFINED` (penting, lihat DEC-008):

- Engine/library apa yang dipakai?
- **Apakah output boleh kehilangan kemampuan pencarian teks (text layer)?** Ini konsekuensi
  terbesar dan harus diputuskan oleh pengguna, bukan diasumsikan.
- Bagaimana menangani PDF yang sudah terenkripsi/password?
- Apakah metadata dipertahankan?
- Batas jumlah halaman / ukuran file yang diproses?
- Bagaimana/beberapa mode dibedakan secara teknis (DPI, JPEG quality, grayscale)?

## 5. PDF Merge — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Fungsi | menggabungkan beberapa PDF |
| Wajib | drag & drop, reorder, remove, merge |
| Input | beberapa PDF |
| Output | satu PDF |
| Koneksi internet | tidak |

Catatan implementasi: urutan file = urutan halaman di PDF output. Reorder wajib bekerja
dengan drag & drop **dan** minimal satu mekanisme alternatif yang dapat diakses keyboard
(§20).

`UNDEFINED`:

- Apakah ada opsi page range per file sebelum merge (misalnya "hanya halaman 1-3")?
- Apakah ukuran halaman disparate (A4 dan A5 digabung) otomatis dinormalisasi?
- Apakah bookmark/annotation/metadata digabung atau dibuang?
- Batas jumlah file? Halaman?

## 6. PDF Split — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Fungsi | split by page, page range |
| Koneksi internet | tidak |

`UNDEFINED`:

- Split satu file besar menjadi banyak file kecil, atau satu range diekstrak dari satu file?
  (spesifikasi menyebut keduanya: "split by page" dan "page range")
- Pola nama file hasil split belum ditentukan.
- Apakah hasil split dienkripsi? (tidak ada di spesifikasi)

## 7. PDF Rotate — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Sudut | 90°, 180°, 270° |
| Koneksi internet | tidak |

`UNDEFINED`:

- Rotate seluruh dokumen atau hanya halaman terpilih?
- Apakah halaman tertentu bisa di-exclude?

## 8. Image → PDF — `PARTIAL`

| Field | Isi |
|-------|-----|
| Input | multiple images |
| Wajib | reorder, page size, orientation, margin |
| Output | satu PDF |
| Koneksi internet | tidak |

`UNDEFINED` (DEC-015):

- Default page size: A4 atau Letter atau "Fit to image"? (kritikal untuk dokumen Indonesia)
- Margin default: 0 mm atau nilai lain?
- Apakah halaman PDF boleh diekspor dengan ukuran gambar asli?
- Apakah gambar di-rotate otomatis berdasarkan EXIF orientation? (foto HP sering salah
  orientasi)
- Unit yang dipakai: mm atau inch atau pixel?
- Resolusi gambar yang di-embed (DPI) — default 72/96/300?

## 9. PDF → Image — `PARTIAL`

| Field | Isi |
|-------|-----|
| Fungsi | export selected pages |
| Format | JPG, PNG |
| Koneksi internet | tidak |

`UNDEFINED` (DEC-014):

- Resolusi / DPI default?
- Page size output: ukuran asli halaman, atau ukuran tetap (mis. A4)? "Export selected
  pages" bisa berarti dua hal: **pilih halaman mana yang di-export**, atau **pilih ukuran
  halaman**. Keduanya belum dipastikan. Mohon konfirmasi.
- Transparent atau background putih untuk PNG?
- Quality JPEG dapat diatur atau fixed?

## 10. Batch Rename — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Contoh input | `IMG_001.jpg`, `IMG_002.jpg`, `IMG_003.jpg` |
| Pattern | `Dokumentasi_Rapat_{number}` |
| Contoh output | `Dokumentasi_Rapat_001.jpg`, `Dokumentasi_Rapat_002.jpg`, `Dokumentasi_Rapat_003.jpg` |
| Wajib | preview sebelum rename |
| Koneksi internet | tidak |

Sintaks pattern yang perlu didukung (disederhanakan dari contoh spesifikasi):

- `{name}` — nama file asli tanpa ekstensi
- `{number}` — nomor urut, dengan opsi padding
- `{ext}` — ekstensi
- `{date}` / `{time}` — `UNDEFINED`, belum ada di spesifikasi

`UNDEFINED`:

- Berapa digit untuk `{number}`? Contoh memakai 3 digit (`001`), tetapi nilai aslinya tidak
  dinyatakan eksplisit di spesifikasi — hanya terlihat dari contoh.
- Mulai dari 1 atau 0? (contoh mulai dari 001)
- Padding: `001` atau `1` atau `0001`?
- Urutan penomoran: mengikuti urutan file di list, atau urutan alfabetis? (perlu Sort Order
  — urutan drag & drop, nama, tanggal, atau ukuran)
- Bagaimana menangani nama duplikat setelah rename? (DEC-010)
- Bagaimana menangani karakter tidak valid di pattern?
- Apakah rename dilakukan **di tempat** (mengubah file asli) atau **copy ke folder lain**?
  §18 melarang overwrite file asli secara default, tetapi rename pada dasarnya memindahkan.
  **Ini butuh keputusan eksplisit.**
- Apakah ada mode "undo" / daftar undo? Tidak ada di spesifikasi.

## 11. ZIP Creator — `PARTIAL` (spesifikasi ambigu)

| Field | Isi |
|-------|-----|
| Fungsi | memilih banyak file, membuat ZIP |
| Catatan spesifikasi | "mempertahankan struktur folder **jika diperlukan oleh spesifikasi**" — kalimat ini sendiri tidak konklusif |
| Koneksi internet | tidak |

`UNDEFINED` (DEC-016):

- Sumber input: file yang dipilih satu per satu (flat), atau folder penuh (tree)?
  Jika folder penuh, struktur internal folder ikut dipertahankan atau di-ratakan?
- Apakah drag & drop folder harus didukung? (browser/web tidak bisa; desktop bisa)
- Level kompresi dapat diatur atau fixed?
- Apakah password / enkripsi ZIP perlu? **TIDAK ada di spesifikasi** → jangan diimplementasikan.
- Apakah ada output lain selain ZIP? (mis. .7z, .tar) **TIDAK ada** → jangan.

## 12. QR Generator — `PARTIAL`

| Field | Isi |
|-------|-----|
| Input | text, URL |
| Output | PNG, SVG (jika library mendukung dengan baik) |
| Koneksi internet | tidak |

`UNDEFINED`:

- Dimensi / ukuran modul QR dapat diatur? (px atau cm)
- Error correction level (L/M/Q/H) — perlu atau default saja?
- Margin/quiet zone — default library atau konfigurabel?
- Apakah foreground color dan background color dapat diatur? Umumnya tool QR populer
  menyediakan opsi kustom warna.
- Ukuran data maksimum (QR standar sekitar 2953 byte pada error correction level L, dan
  sekitar 1273 byte pada level H).
- Versi QR otomatis atau dapat dipilih?
- Batch generate dari daftar? (tidak ada di spesifikasi)

## 13. Date Calculator — `PARTIAL`

| Field | Isi |
|-------|-----|
| Fungsi dasar | selisih tanggal, tambah hari, kurang hari |
| Larangan | **tidak boleh** membuat fitur kalender sendiri (§12) |
| Koneksi internet | tidak |

`UNDEFINED`:

- Tanggal acuan (hari ini) memakai zona waktu lokal mesin atau GMT?
- Library tanggal (date-fns, dayjs, Temporal, atau lain) — mengikuti stack.
- Apakah hari kerja / hari libur dihitung? (tidak ada di spesifikasi → jangan)

## 14. OCR — `DEFERRED` / `BLOCKED`

Spesifikasi §13:

> OCR adalah fitur lanjutan. **Jangan implementasikan OCR sebelum arsitektur dan
> dependency ditentukan.** Jika OCR membutuhkan external API, cloud service, atau paid API:
> STOP dan laporkan. Prioritaskan OCR lokal bila memungkinkan.

Status: **tidak ada yang diimplementasikan.** Lihat DEC-005.

Yang perlu diputuskan sebelum OCR bisa masuk scope:

1. Engine apa? (Tesseract lokal via WASM/native — opsi utama yang memenuhi "local")
2. Apakah language pack Bahasa Indonesia + English perlu diunduh saat build atau dibundel?
3. Ukuran bahasa pack dan Dampaknya ke ukuran installer.
4. Apakah output OCR berupa searchable PDF, teks, atau gambar dengan teks overlay? (tidak
   ada di spesifikasi — harus diputuskan)
5. Bagaimana menangani PDF yang sudah punya text layer (satu-satunya kasus di mana OCR
   benar-benar dibutuhkan)?

> Yang perlu dicatat: Tesseract adalah **dependency besar** (WASM ~15–30MB per language
> pack). Menambahkannya bukan keputusan sepihak.

---

## Cross-Cutting Requirements (berlaku untuk SEMUA fitur)

| Requirement | Sumber |
|-------------|--------|
| 5-step UI: Select Files → Options → Preview → Processing → Result | §16 |
| Error message ramah, tanpa dump teknis | §17 |
| Developer log menyimpan detail teknis | §17 |
| Tidak overwrite file asli, output file baru | §18 |
| Nama file duplikat & karakter invalid tertangani | §18 |
| File kosong, corrupt, besar tertangani | §18 |
| Batch: progress, counter, file saat ini, continue-on-error | §19 |
| Keyboard navigation, visible focus, kontras, responsif | §20 |
| Pemrosesan lokal, tanpa upload | §7 |
| UI menjelaskan bila butuh koneksi internet | §7 |
| Tidak ada tombol tanpa fungsi, tidak ada mock | §29 |

## Di Luar Scope V1

Sudah ditetapkan sebagai NON-GOALS di `SOURCE_OF_TRUTH.md`. Ringkas:

OCR, PDF editor, konversi docx/xlsx/pptx, PDF → Word, watermark, OCR batch folder, file
encryption, PDF metadata editor, image crop, image rotate, background removal, color
picker, format factory, CLI, dan semua fitur AI.

Yang masuk daftar tapi belum diputuskan ada di `FUTURE_FEATURES.md`.
