# FUTURE FEATURES — KPU Office Tools

Daftar ini berisi **ide fitur yang ditemukan atau muncul selama pengerjaan**, tetapi
**TIDAK BOLEH diimplementasikan** tanpa persetujuan eksplisit pengguna (ZERO INVENTION RULE,
§28).

Status yang dipakai:

| Status | Arti |
|--------|------|
| `PROPOSED` | Diajukan, menunggu keputusan |
| `NEEDS_SPEC` | Butuh spesifikasi lebih lanjut sebelum bisa dinilai |
| `BLOCKED` | Terhambat keputusan lain |
| `PARKED` | Tidak untuk V1, dicatat agar tidak lupa |

> Tidak ada satu pun item di bawah ini yang memiliki kode, folder, atau tombol di aplikasi.

---

## Format

```
Feature:
Reason:
Potential Benefit:
Potential Risk:
Dependencies:
Status:
```

---

## FF-001 — PDF Metadata Editor

```
Feature:        Edit title, author, subject, keywords PDF
Reason:         Metadata sering berisi data pribadi yang tidak ingin dibagikan saat
                dokumen dikirim ke pihak lain
Potential Benefit: Privasi lebih baik, dokumen lebih rapi untuk arsip
Potential Risk:  Menambah kompleksitas UI; niche dibanding tool lain
Dependencies:   DEC-007 (library PDF)
Status:         PROPOSED
```

## FF-002 — Image Crop

```
Feature:        Crop gambar interaktif sebelum resize/compress
Reason:         Request yang sangat umum; saat ini pengguna harus crop di aplikasi lain
Potential Benefit: Menghemat satu langkah pada alur kerja foto
Potential Risk:  Butuh UI kanvas interaktif — area yang besar untuk V1 yang
                mengutamakan UI sederhana. Risiko scope creep
Dependencies:   DEC-007
Status:         PROPOSED
```

## FF-003 — Image Rotate

```
Feature:        Rotasi gambar 90/180/270 dan flip
Reason:         Kebutuhan yang umum; foto sering terorientasi salah
Potential Benefit: Bisa digabung dengan Image Resizer
Potential Risk:  Rendah. Tinggal Canonicalkan dengan PDF Rotate
Dependencies:   DEC-007
Status:         PROPOSED
```

## FF-004 — Preset Ukuran Foto

```
Feature:        Preset resize untuk ukuran foto umum (pas foto 2x3/3x4 cm, 4R, 5R)
Reason:         Ukuran kertas yang umum dipakai untuk keperluan administrasi
Potential Benefit: Mengurangi input angka manual
Potential Risk:  Rendah
Dependencies:   DEC-007; perlu keputusan preset apa saja yang relevan
Status:         NEEDS_SPEC
```

## FF-005 — Batch Rename Versi Lanjutan

```
Feature:        Regex rename, replace string, suffix/prefix tambahan,
                rename berdasarkan metadata EXIF
Reason:         Pola rename yang muncul pada usage nyata sering lebih kompleks dari
                satu variabel {number}
Potential Risk:  Regex difficult explaining ke user non-teknis
Potential Benefit: Fleksibilitas tinggi
Dependencies:   DEC-007, DEC-010
Status:         NEEDS_SPEC
```

## FF-006 — Rename dari File Explorer (context menu)

```
Feature:        Integrasi shell context menu Windows
Reason:         User sering melakukan rename dalam workflow yang sama
Potential Risk:  Membutuhkan installer dengan hak admin, menambah friksi instalasi
Potential Benefit: Alur kerja jauh lebih cepat
Dependencies:   DEC-007, DEC-012
Status:         PARKED
```

## FF-007 — PDF Bookmarks & Metadata saat Merge

```
Feature:        Pertahankan atau buat bookmark/outline saat merge, gabungkan metadata
Reason:         Outline hilang saat merge sehingga menyulitkan navigasi dokumen besar
Potential Risk:  Alur kerja merge menjadi lebih rumit
Potential Benefit:  Output lebih profesional untuk dokumen banyak halaman
Dependencies:   DEC-007, library PDF
Status:         NEEDS_SPEC
```

## FF-008 — OCR

```
Feature:        OCR lokal (Tesseract), Bahasa Indonesia + English
Reason:          Auditan dan dokumen lama sering berupa hasil scan
Potential Benefit:  PDFs lama menjadi bisa dicari
Potential Risk:  Dependency besar (~15-30MB per language pack),
                output PDF hasil OCR sering lebih besar dari aslinya, kualitas
                teks tidak selalu akurat, menambah ukuran installer
Dependencies:   DEC-005, DEC-007, DEC-012
Status:         BLOCKED — menunggu keputusan engine
```

## FF-009 — PDF Password / Encryption

```
Feature:        Enkripsi output PDF dengan password
Reason:          Beberapa dokumen yang produced perlu dilindungi
Potential Risk:  Menambah kompleksitas; perlu library yang mendukung enkripsi
                (tidak semua library PDF mendukung)
Potential Benefit:  Draft dokumen yang belum final
Dependencies:   DEC-007, library PDF
Status:         NEEDS_SPEC
```

## FF-010 — Archive Format Lain (7z, tar.gz)

```
Feature:        Output 7z dan tar.gz selain ZIP
Reason:          7z memberi rasio kompresi lebih baik
Potential Risk:  Menambah dependency, scope creep
Potential Benefit:  Hemat ukuran untukarsip besar
Dependencies:   DEC-007, DEC-016
Status:         PROPOSED
```

## FF-011 — Drag & Drop dari Windows Explorer ke Dashboard

```
Feature:        Drop file langsung ke area Dashboard, lalu tool dideteksi otomatis
Reason:          Alur paling natural untuk user non-teknis
Potential Risk:  Otomatisasi deteksi tool bisa salah memilih
Potential Benefit:  UX sangat baik
Dependencies:   DEC-007
Status:         PROPOSED
```

## FF-012 — Riwayat Proses (Log Viewer di UI)

```
Feature:        Panel yang menampilkan 50 proses terakhir beserta hasilnya
Reason:          User sering salah pilih file dan ingin menemukan output sebelumnya
Potential Risk:  Menyimpan daftar path di IndexedDB/registry — perlu privacy review
                agar tidak dianggap sebagai tracking (§3)
Potential Benefit:  User tidak kehilangan hasil yang salah tempat
Dependencies:   DEC-018 (preferences)
Status:         NEEDS_SPEC
```

## FF-013 — Ekspor ke Format Lain (HEIC, AVIF, BMP, TIFF)

```
Feature:        Dukungan input/output HEIC, AVIF, BMP, TIFF
Reason:          HEIC adalah format default iPhone — banyakPegawai memakai iPhone
Potential Benefit:  Workflow foto lebih lengkap
Potential Risk:  Codec HEIC/AVIF tidak tersedia di semua build library
Dependencies:   DEC-007, library imaging
Status:         NEEDS_SPEC
```

## FF-014 — Watermark

```
Feature:        Tambah watermark teks ke gambar dan PDF
Reason:          Menandai dokumen draf / internal
Potential Risk:  Scope besar untuk PDF
Potential Benefit:  Cegah penggunaan dokumen internal
Dependencies:   DEC-007
Status:         PROPOSED
```

## FF-015 — Command Line Interface

```
Feature:        CLI untuk otomasi (mis. batch harian)
Reason:          Pegawai IT mungkin menjalankanUtilities terjadwal
Potential Risk:  Dua kali jumlah string UI untuk translasi dan review
Potential Benefit:  Otomasi
Dependencies:   DEC-007
Status:         PARKED
```

## FF-016 — Multi-language UI (EN)

```
Feature:        Toggle Bahasa Indonesia / Inggris
Reason:          Ada kemungkinan staf yang lebih nyaman dengan Bahasa Inggris
Potential Risk:  Dua kali jumlah string UI untuktranslation & review
Potential Benefit:  Fleksibilitas
Dependencies:   DEC-006
Status:         PROPOSED
```

## FF-017 — Preview PDF dengan Halaman Before/After (Compressor)

```
Feature:        Perbandingan visual sebelum/sesudah kompresi PDF
Reason:          User perlu reassured bahwa output masih terbaca
Potential Risk:  Butuh render halaman, mahal untuk PDF besar
Potential Benefit:  Kepercayaan user naik
Dependencies:   DEC-008
Status:         NEEDS_SPEC
```

## FF-018 — Estimasi Ukuran Output PDF

```
Feature:        Tampilkan estimasi ukuran output sebelum proses
Reason:          User ingin tahu-hasil sebelum commit
Potential Risk:  §9 MELARANG klaim ukuran output sebelum proses jika tidak dapat
                dihitung akurat. Fitur ini hanya boleh ada jika estimasinya
                benar-benar reliable, dan itu sulit dijamin
Potential Benefit:  Transparansi
Dependencies:   DEC-008
Status:         NEEDS_SPEC — PERLU KONFIRMASI karena bersinggungan dengan §9
```

## FF-019 — Konversi PDF ⇄ Word/Excel (docx, xlsx)

```
Feature:        Konversi ke/from format office
Reason:         Sering dibutuhkan untuk keperluan administrasi
Potential Risk:  **SANGAT BESAR.** Konversi fidelity docx sangat rendah, layout
                rusak hampir pasti. Ini proyek tersendiri
Potential Benefit:  —
Dependencies:   —
Status:         PARKED — tidak direkomendasikan. Sudah tercatat di NON-GOALS
```

## FF-020 — Pencarian Teks dalam Batch (Filter/Search)

```
Feature:        Cari cepat file dari daftar panjang
Reason:          Batch 500 file sulit dinavigasi
Potential Risk:  —
Potential Benefit:  —
Dependencies:   —
Status:         NEEDS_SPEC — kemungkinan besar harus jadi bagian Review, bukan fitur
```

---

## Catatan

- Tidak ada item di atas yang memengaruhi scope V1.
- FF-008 (OCR) tetap `BLOCKED` sampai DEC-005 diputuskan.
- FF-019 sengajaMasuk daftar agar terlihat bahwa opsi ini **sudah dipertimbangkan dan
  ditolak** — bukan sekadar belum dipikirkan.
- Jika ada ide baru: tambahkan di sini dengan format yang sama, **jangan** langsung
  diimplementasikan.
