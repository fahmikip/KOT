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

> Image Compressor, Image Resizer, dan Image Converter berstatus `IMPLEMENTED` (Phase 2–3).
>
> Phase 1 membangun shell aplikasi; Phase 2 menambahkan Image Compressor dan Image Resizer;
> Phase 3 menambahkan Image Converter. **Image → PDF tertahan** di Phase 3 karena DEC-015 dan
> pemilihan library PDF belum diputuskan — tidak ada kode, tombol, atau alur yang dibuat untuknya.

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
| DEC-014 | Default DPI & page size | PDF → Image |
| DEC-015 | Default page size, margin, DPI, orientasi EXIF **+ library generator PDF** | **Image → PDF** |
| DEC-016 | ZIP: file atau folder | ZIP Creator |

DEC-009, DEC-010, dan DEC-013 diputuskan untuk Image Tools Phase 2; keputusan itu belum otomatis berlaku bagi fitur lain.

---

## Ringkasan Modul

Kolom "Kode" menunjukkan apakah ada implementasi untuk fitur tersebut.

| # | Modul | Fitur | Status | Kode | Estimasi |
|---|-------|-------|--------|------|----------|
| 1 | Image Tools | Image Compressor | IMPLEMENTED | `src/main/imageEngine.ts` + feature UI | M |
| 2 | Image Tools | Image Resizer | IMPLEMENTED | `src/main/imageEngine.ts` + feature UI | M |
| 3 | Image Tools | Image Converter | IMPLEMENTED | `src/main/imageEngine.ts` + feature UI | S |
| 4 | PDF Tools | PDF Compressor | PARTIAL | — | L |
| 5 | PDF Tools | PDF Merge | SPECIFIED | — | M |
| 6 | PDF Tools | PDF Split | SPECIFIED | — | S |
| 7 | PDF Tools | PDF Rotate | SPECIFIED | — | S |
| 8 | Convert | Image → PDF | BLOCKED | — (sengaja tidak ada kode) | M |
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
- Quality Phase 2: JPEG/WEBP 10–100, default 80; PNG lossless.
- Apakah metadata (EXIF) dipertahankan? Butterfly: sebagian alatQgjpeg menghapus EXIF
  berisi lokasi dan waktu.
- Apakah ada batas dimensi (mis. resize otomatis jika melebihi 4000px)?

## 2. Image Resizer — `SPECIFIED`

| Field | Isi |
|-------|-----|
| Fungsi | resize by width, resize by height, percentage, maintain aspect ratio, batch |
| Koneksi internet | tidak |

`UNDEFINED`:

- Phase 2: aspect ratio dijaga dan upscale ditolak; lebar/tinggi/persentase berlaku untuk seluruh batch.

- Preset ukuran umum (mis. 4R, 3x4 cm, ukuran pas foto) perlu atau tidak? Preset seperti
  ini berguna untuk foto identitas, tetapi belum ada di spesifikasi.
- Batch: apakah opsi berlaku ke semua file sekaligus?

## 3. Image Converter — `IMPLEMENTED` (Phase 3)

Konversi yang disebut minimal:

```
JPG  → PNG
PNG  → JPG
WEBP → JPG
```

Implementasi Phase 3, mengikuti §21 instruksi phase:

| Field | Isi |
|-------|-----|
| Target | PNG, JPG, WEBP |
| Dimensi | tidak berubah — konversi format tidak mengubah width/height/aspect ratio (§11) |
| Mutu | PNG lossless; JPG/WEBP memakai default encoder Sharp (80), tanpa slider khusus |
| Batch | ya, sekuensial, maks 100 file; kegagalan per file |
| Output | `<nama-asli>-converted.<ext-tujuan>` di folder tujuan pilihan user (DEC-029) |
| Koneksi internet | tidak |

Perilaku yang perlu diketahui user:

| Situasi | Perilaku | Alasan |
|---------|----------|--------|
| Format sumber = format tujuan | status `skipped` beserta alasannya; opsi radio dinonaktifkan di UI | Konversi ke format yang sama bukan konversi (§8) |
| PNG/WEBP transparan → JPG | status `skipped` beserta alasannya, **tidak** di-flatten | Warna latar untuk alpha belum diputuskan; meratakan diam-diam merusak gambar (DEC-033) |
| Nama file sudah ada di folder tujuan | auto-suffix ` (2)`, ` (3)`, dst. | DEC-010 / DEC-029 |

Point yang sudah tidak `UNDEFINED` setelah Phase 3:

- ~~Apakah konversi ke WEBP diperlukan?~~ → Ya; WEBP menjadi salah satu target (§21).
- ~~Apakah transparency dipertahankan saat konversi ke JPG?~~ → Tidak ada opsi alpha di JPG.
  Warna latar tetap `UNDEFINED` (DEC-033); interim: file dilewati, bukan diubah.
- ~~Apakah size boleh diperkecil saat konversi?~~ → Tidak. Dimensi dan rasio aspek tidak
  diubah; pengurangan ukuran hanya efek samping format target (§11).

Masih `UNDEFINED` dan **tidak** ada kodenya:

- BMP/GIF/TIFF sebagai target atau output — tidak ada di spesifikasi.
- Kontrol kualitas JPG/WEBP khusus konversi — slider mutu hanya ada di Compressor (DEC-030).

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

## 8. Image → PDF — `BLOCKED` (Phase 3, tidak diimplementasikan)

| Field | Isi |
|-------|-----|
| Input | multiple images |
| Wajib | reorder, page size, orientation, margin |
| Output | satu PDF |
| Koneksi internet | tidak |

**Status `BLOCKED`.** Halaman `/convert/image-to-pdf` tetap `Coming Soon` dan tidak ada kode,
dependency, tombol, atau partial UI untuk fitur ini. Alasannya: membuat PDF memerlukan library
yang belum dipilih, dan default halaman belum diputuskan (DEC-015). Menebak salah satunya
berarti menghasilkan dokumen dengan ukuran halaman yang salah.

`UNDEFINED` (DEC-015 + pemilihan library):

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
