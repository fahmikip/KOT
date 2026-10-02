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
App version     : UNDEFINED  (belum ada build system)
```

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

> **STATUS: `UNDEFINED` — belum ada keputusan. Menunggu keputusan pengguna.**

Belum ada satu pun baris kode, `package.json`, atau konfigurasi build di repository.
Stack **tidak boleh dipilih oleh AI** (ZERO INVENTION RULE, §28). Pilihan yang dibutuhkan
beserta konsekuensinya:

| Opsi | Komponen | Implikasi |
|------|----------|-----------|
| **A** | Electron + TypeScript + React | Native file I/O, offline penuh, batch besar dengan progress mudah, distribusi installer `.exe`. Memori & footprint besar, hardening IPC wajib. |
| **B** | Tauri + TypeScript + React | Kemampuan sama seperti A, binary dan RAM jauh lebih kecil. Membutuhkan Rust toolchain. |
| **C** | Web app (browser + WASM) | Tanpa instalasi, tanpa dependency native. Batas memori browser, tidak bisa menulis struktur folder untuk ZIP, file 100MB+ bermasalah. |
| **D** | Python + PySide6/Qt | Library PDF dan imaging paling matang (Pillow, pikepdf, PyMuPDF). Packaging & installer untuk distribusi ke pegawai jauh lebih sulit. |

**Rekomendasi teknis (bukan keputusan):** opsi **A** atau **B**.

Dasar rekomendasi ini adalah requirement yang sudah ada, bukan preferensi:

- §7 privacy: seluruh proses harus lokal, bukan SaaS.
- §19 performance: batch 100+ file dengan progress dan UI tidak freeze → butuh proses
  terpisah dan akses file di sisi OS.
- §18 file safety: tidak overwrite, nama output jelas → butuh kontrol filesystem penuh.
- §20 accessibility + §15 navigasi tetap → butuh shell desktop yang stabil.

Catatan praktis: environment build yang terdeteksi adalah **Windows**. Opsi A dipilih bila
prioritas adalah kecepatan implementasi dan kematangan ekosistem library imaging/PDF di
Node. Opsi B dipilih bila prioritas adalah ukuran binary dan RAM pada mesin kantor lama.

**Phase 1 tidak dapat dimulai tanpa keputusan stack ini.**

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
| DEC-007 | **Tech stack** | UNDEFINED — wajib diputuskan sebelum Phase 1 |
| DEC-005 | OCR engine | DEFERRED / BLOCKED |
| DEC-006 | Bahasa UI | UNDEFINED (PROPOSED: Bahasa Indonesia) |
| DEC-008 | Engine/library PDF compression | UNDEFINED |
| DEC-009 | Tujuan output file (save dialog vs folder output vs ZIP hasil) | UNDEFINED |
| DEC-010 | Policy nama file duplikat (auto-suffix / skip / tanya) | UNDEFINED |
| DEC-011 | Testing framework | UNDEFINED (mengikuti stack) |
| DEC-012 | Distribusi: installer, code signing, auto-update | UNDEFINED |
| DEC-013 | Batas ukuran file maksimum | UNDEFINED |
| DEC-014 | PDF → Image: page size dan DPI default | UNDEFINED |
| DEC-015 | Image → PDF: page size default (A4/Letter/Fit) | UNDEFINED |
| DEC-016 | ZIP Creator: file saja atau folder penuh | UNDEFINED (spesifikasi ambigu) |
| DEC-017 | QR: dukungan SVG | CONDITIONAL (bergantung library) |
| DEC-018 | Persistensi preferences (folder terakhir, dan lain-lain) | UNDEFINED |
| DEC-019 | Inisialisasi git repository | UNDEFINED |
| DEC-020 | Nama folder project (`KOT`) | PROPOSED |

Rincian dan alasan: `DECISIONS.md`.
