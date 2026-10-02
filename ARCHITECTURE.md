# ARCHITECTURE — KPU Office Tools

> **STATUS: LOGICAL / STACK-AGNOSTIC.**
> Dokumen ini menjelaskan batas modul, aliran data, dan kontrak — bukan pilihan teknologi.
> Struktur folder konkret dan mekanisme IPC **menunggu keputusan tech stack (DEC-007)**.
> Tidak ada kode yang ada di repository saat dokumen ini dibuat.

---

## 1. Prinsip Arsitektur

1. **Local-first.** Tidak ada komponen yang mengirim file ke jaringan sebagai bagian dari
   alur normal.
2. **Pemisahan UI dan Engine.** UI collects intent dan menampilkan state. Engine melakukan
   pekerjaan file yang berat. Tidak ada proses berat di thread UI.
3. **Modular per tool.** Satu tool = satu modul dengan input, options, dan output yang
   jelas. Modul tidak saling bergantung kecuali lewat tipe data bersama.
4. **Deterministik.** Given input yang sama, output yang sama. Nama output dihitung, bukan
   ditebak.
5. **Gagal secara lokal.** Error pada satu file dicatat pada file tersebut; batch tetap
   berjalan.
6. **Tanpa state tersembunyi.** Tidak ada konfigurasi global yang tidak terdokumentasi.

## 2. Diagram Lapisan (konseptual)

```
┌──────────────────────────────────────────────────────────┐
│  SHELL / NAVIGATION        (Dashboard, sidebar, routing)  │
└──────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────┐
│  UI LAYER  (screens per tool, 5-step wizard, progress)   │
│  - state Collection only                                  │
│  - no heavy work, no direct fs write                     │
└──────────────────────────────────────────────────────────┘
                              │  (channel: typed request/response + progress events)
┌──────────────────────────────────────────────────────────┐
│  PROCESSING ENGINE                                         │
│  ┌────────────┬────────────┬────────────┬──────────────┐  │
│  │ image/*    │ pdf/*      │ convert/*  │ file/*       │  │
│  │ compress   │ compress   │ img2pdf    │ batchRename  │  │
│  │ resize     │ merge      │ pdf2img    │ zip          │  │
│  │ convert    │ split      │            │              │  │
│  │            │ rotate     │            │              │  │
│  └────────────┴────────────┴────────────┴──────────────┘  │
│  ┌──────────────────────────┬───────────────────────────┐  │
│  │ utility/*  (qr, date)    │ SHARED SERVICES           │  │
│  │                          │ - error mapping           │  │
│  │                          │ - output path resolver    │  │
│  │                          │ - progress reporter       │  │
│  │                          │ - file validation         │  │
│  └──────────────────────────┴───────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────┐
│  NATIVE LAYER  (imaging codec, PDF parser, zip, fs)       │
└──────────────────────────────────────────────────────────┘
```

> Bentuk implementasinya (IPC Electron / Rust command / subprocess / worker) bergantung
> pada DEC-007.

## 3. Struktur Folder (PROPOSED — menunggu DEC-007)

Tidak ada struktur folder yang sudah ditetapkan; repository kosong. Berikut bentuk yang
**disarankan** dan perlu dikonfirmasi setelah stack diputuskan.

```
KOT/
├── docs/                     # dokumentasi (jika dipisah dari root)
├── src/
│   ├── main/                 # shell / main process
│   ├── renderer/             # UI
│   │   ├── app/              # shell, routing, layout, navigasi
│   │   ├── components/       # komponen generik (Stepper, Dropzone, ProgressBar)
│   │   ├── features/         # satu folder per tool
│   │   └── shared/           # tipe & util UI yang dipakai >1 tool
│   ├── engine/               # processing engine (tanpa import UI sama sekali)
│   │   ├── modules/
│   │   │   ├── image/
│   │   │   ├── pdf/
│   │   │   ├── convert/
│   │   │   ├── file/
│   │   │   └── utility/
│   │   ├── shared/           # error, path resolver, progress, logging
│   │   └── contracts/        # tipe kontrak antar boundary
│   └── types/                # tipe yang dipakai engine dan UI
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/             # file contoh: valid, corrupt, zero-byte, protected
└── scripts/
```

Aturan yang berlakuJHIDUP nilai ini:

- `engine/` **dilarang** meng-import dari `renderer/` atau `main/`.
- `features/<tool>/` hanya boleh memakai komponen generik dan `shared/`.
- `tests/fixtures/` berisi file yang sengaja rusak/terproteksi untuk menguji error path.

> `UNDEFINED`: nama folder, konvensi penamaan, modul bundler, dan lokasi test akan
> mengikuti toolchain yang dipilih.

## 4. Kontrak Modul (Module Contract)

Setiap modul engine mengikuti bentuk ini. Bentuk ini **belum final** sampai stack diputuskan,
tetapi batas tanggung jawabnya sudah tetap.

```
Input:
  - sourceFiles: FileRef[]        # path absolut + nama + ukuran, TIDAK memuat isi file
  - options: <ToolOptions>        # sudah divalidasi oleh UI
  - destination: OutputTarget     # lihat DEC-009
  - signal: CancellationSignal

Output:
  - results: ItemResult[]         # satu entri per input
  - summary: { total, succeeded, failed, cancelled }
  - errors: EngineError[]         # teknis, untuk log

Progress:
  - onProgress(completed: number, total: number, currentFile: string)
  - onItemResult(item: ItemResult)   # streaming, agar UI tidak menunggu batch selesai

ItemResult:
  - source
  - status: 'success' | 'failed' | 'cancelled'
  - outputPath?      # hanya jika sukses
  - error?           # EngineError (technical), bukan teks untuk user
```

Aturan kontrak:

- Modul **tidak** memutuskan sendiri di mana menyimpan file. `OutputTarget` diberikan dari luar.
- Modul **tidak** membuat dialog. Tidak ada UI coupling sama sekali.
- Modul **tidak** melempar error yang sudah diformat untuk user. Modul mengembalikan
  `EngineError`; pemetaan ke pesan user terjadi di UI layer.
- Modul harus menghormati `signal`. Cancel harus menghentikan pekerjaan dan tidak meninggalkan
  file output setengah jadi.

## 5. Alur Data — 5 Langkah (§16)

Semua tool pemroses file mengikuti urutan yang sama:

```
1. SELECT FILES
   - pilih file (dialog) atau drag & drop
   - validasi tipe & ukuran
   - validasi awal untuk mendeteksi file corrupt / zero-byte bila memungkinkan

2. OPTIONS
   - opsi tool, default dari spesifikasi
   - opsi dengan default belum diputuskan ditandai UNDEFINED di FEATURES.md

3. PREVIEW
   - daftar item, urutan, estimasi
   - pratinjau visual bila relevan (image, halaman PDF)
   - WAJIB untuk Batch Rename (§11)

4. PROCESSING
   - progress: total, completed, file saat ini
   - partial result tampil seketika
   - cancel tersedia
   - 1 file gagal ≠ batch berhenti

5. RESULT
   - ringkasan: berhasil / gagal
   - daftar output dengan path
   - aksi: buka folder, jalankan lagi, kembali
```

> On-screen: `SELECT FILES → OPTIONS → PREVIEW → PROCESSING → RESULT`

## 6. Error Model (§17)

Dua lapis, dipisahkan tegas.

### Lapis 1 — Technical (`EngineError`)

Bentuk konseptual:

```
EngineError {
  code:        'E_INVALID_FILE' | 'E_CORRUPT' | 'E_PASSWORD_PROTECTED' | 'E_UNSUPPORTED'
             | 'E_OUT_OF_MEMORY' | 'E_PERMISSION' | 'E_DISK_FULL' | 'E_CANCELLED' | ...
  message:     string        # teknis, untuk log
  cause?:      unknown
  file?:       string
}
```

### Lapis 2 — User Message

Harus ditulis dalam bahasa manusia, menyebut apa yang terjadi + apa yang bisa dilakukan.
Dilarang menampilkan stack trace atau nama exception.

Buruk:

```
TypeError: Cannot read properties of undefined
```

Baik:

```
File tidak dapat diproses.

Kemungkinan penyebab:
- file rusak
- format tidak didukung
- file terlalu besar

Silakan pilih file lain.
```

Aturan tambahan:

- Setiap kode error wajib punya pesan user yang sudah ditulis dan di-review.
- Detail teknis tetap masuk developer log.
- Tidak ada error yang boleh muncul sebagai `undefined`, kosong, atau string kode mentah.

> `UNDEFINED`: file lokasi developer log, level log, dan format rotasi log.

## 7. File Safety (§18)

Aturan yang wajib berlaku di semua modul:

| Aturan | Implementasi yang diharapkan |
|--------|------------------------------|
| Tidak overwrite file asli | Output dipisahkan dari input; `OutputTarget` berbeda |
| Selalu hasil file baru | Prefix/suffix default pada nama output |
| Nama output jelas | Pola nama <nama-asli>[-suffix].<ext>, deterministik |
| Duplikat ditangani | Lihat DEC-010 — belum diputuskan |
| Karakter invalid ditangani | Sanitasi nama file cross-platform (`<>:"/\|?*`, reserved Windows names) |
| File kosong ditangani | Validasi ukuran > 0 sebelum proses |
| File corrupt ditangani | Validasi signature/parse sebelum proses |
| File besar ditangani | Lihat DEC-013 — batas belum diputuskan |

Sanitasi nama file Windows wajib menyertakan reserved names: `CON`, `PRN`, `AUX`, `NUL`,
`COM1`–`COM9`, `LPT1`–`LPT9`, dan nama yang berakhir dengan titik atau spasi.

## 8. Batch Processing Contract (§19)

Wajib berlaku di semua modul yang memproses lebih dari satu file:

- Non-blocking: engine berjalan di luar thread UI.
- Progress wajib: `completed / total` + nama file saat ini.
- Counter wajib: berhasil vs gagal.
- Isolasi error: satu file gagal → dicatat → lanjut ke file berikutnya.
- Partial result: UI menampilkan hasil per file **selama** proses berjalan.
- Cancel: berhenti pada batas file berikutnya, file yang sudah selesai tetap tersimpan.
- Timeout per file: `UNDEFINED` — perlu ditetapkan agar satu file macet tidak membekukan
  seluruh batch.

Contoh output yang disyaratkan spesifikasi:

```
Processing...

37 / 100

36 berhasil
1 gagal
```

## 9. Navigasi (§15)

```
Dashboard
├── Image Tools
│   ├── Compress
│   ├── Resize
│   └── Convert
├── PDF Tools
│   ├── Compress
│   ├── Merge
│   ├── Split
│   └── Rotate
├── Convert
│   ├── Image → PDF
│   └── PDF → Image
├── File Tools
│   ├── Batch Rename
│   └── ZIP Creator
└── Utilities
    ├── QR Generator
    └── Date Calculator
```

Route ID yang perlu tersedia (nama final mengikuti konvensi stack):

```
image/compress        image/resize        image/convert
pdf/compress          pdf/merge           pdf/split         pdf/rotate
convert/image-to-pdf  convert/pdf-to-image
file/batch-rename     file/zip
utility/qr            utility/date-calculator
```

Tidak ada route lain. Menu lain menunggu persetujuan.

## 10. Performance Budget

> Angka berikut **PROPOSED**, bukan hasil benchmark. Perlu diukur setelah stack diputuskan.

| Item | Target |
|------|--------|
| Startup time aplikasi | < 3 detik |
| Memori idle | < 250 MB |
| UI tetap responsif saat batch 100 file | 60 fps, tanpa freeze |
| Preview image | < 200 ms per file |
| Pembatalan (cancel) terasa | < 500 ms |

## 11. Dependency Policy

- Dependency baru harus punya alasan teknis tertulis di `DECISIONS.md`.
- Pilih versi yang actively maintained; catat versinya.
- Hindari wrapper berlapis. Panggil library langsung.
- Semua library pemroses file harus dapat berjalan sepenuhnya lokal, tanpa koneksi network
  saat runtime.

## 12. Yang Belum Defined dalam Arsitektur

- mekanisme IPC konkret (menunggu DEC-007)
- struktur folder final (menunggu DEC-007)
- lokasi & format developer log
- mekanisme cancellation konkret
- timeout per file
- strategi worker pool / queue
- strategi preview untuk PDF (render halaman: perlu library, belum diputuskan)
- persistensi preferences (DEC-018)
