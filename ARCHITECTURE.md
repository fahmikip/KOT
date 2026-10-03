# ARCHITECTURE — KPU Office Tools

> **STATUS: Phase 3 — Image Converter selesai; Image → PDF tertahan di DEC-015.** Struktur folder di bawah
> adalah struktur **sesuai nyatanya**, bukan usulan. `src/preload/` dan engine gambar sudah ada
> sejak Phase 2. Lihat DEC-027–DEC-033.

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

> **Realisasi Phase 1:** dua lapisan teratas (shell + navigasi) sudah ada. Empat lapisan di
> bawahnya sudah ada untuk image tools (Phase 2–3): `features/image-tools/`, engine di
> `src/main/imageEngine.ts`, preload terbatas, dan native layer lewat libvips (Sharp).

### Kontrak IPC (nyata sejak Phase 2)

Bentuk IPC sudah diputuskan: **typed request/response + progress events** lewat Electron
`contextBridge`. Postur keamanan tidak berubah dari Phase 1:

| Prinsip | Nilai sekarang |
|---------|----------------|
| `contextIsolation` | `true` |
| `nodeIntegration` | `false` |
| `sandbox` | `true` |
| preload script | `src/preload/index.ts` — satu namespace `window.imageTools` (DEC-027) |
| Channel yang di-expose | hanya channel `image:*` |
| Renderer menyentuh fs langsung | tidak bisa, dan tidak dicoba |

Channel yang benar-benar ada:

```
image:choose        image:choose-folder    image:choose-destination
image:inspect       image:process           image:progress
```

Belum ada channel generik `tool:<toolId>:run`, `file:write`, atau `engine:progress:detail`.
Tool baru memakai namespace sendiri agar bridge yang sudah dipakai tidak perlu diperlebar.
Nama channel final untuk tool non-image masih `UNDEFINED`.

Otorisasi path ditegakkan di main process: `image:process` hanya menerima file yang sudah
dipilih user lewat dialog (`authorizedImages`) dan folder tujuan yang baru disetujui user
(`authorizedDestinations`). Renderer tidak boleh mengirim path bebas.

## 3. Struktur Folder (nyata — hasil Phase 1)

```
KOT/
├── src/
│   ├── main/
│   │   └── index.ts              # main process: window, siklus hidup, keamanan
│   └── renderer/
│       ├── index.html            # CSP meta, #root
│       └── src/
│           ├── main.tsx          # entry renderer
│           ├── app/
│           │   ├── App.tsx       # ErrorBoundary + HashRouter + Suspense
│           │   └── router.tsx    # peta route (generate dari registry)
│           ├── components/       # Button, Card, Badge, Alert, Loading,
│           │                     # ErrorBoundary, FileDropZone
│           ├── layouts/          # AppLayout, Header, Sidebar, Footer
│           ├── pages/            # Dashboard, ComingSoon, NotFound
│           ├── lib/
│           │   ├── routes.ts     # SUMBER TUNGGAL definisi tool & navigasi
│           │   ├── appInfo.ts    # nama, versi, disclaimer
│           │   └── cn.ts
│           ├── hooks/            # useMediaQuery, useIsDesktop
│           ├── types/            # tools.ts, globals.d.ts
│           └── styles/           # tokens.css, global.css
├── tests/
│   ├── setup.ts                  # jest-dom, cleanup, stub matchMedia
│   ├── helpers/renderApp.tsx     # render dengan MemoryRouter
│   ├── unit/                     # registry, komponen, error handling
│   └── integration/              # navigasi, shell, responsif, a11y
├── electron.vite.config.ts
├── vitest.config.ts
├── eslint.config.mjs
├── tsconfig.json / .node.json / .web.json
└── package.json
```

Folder yang **sengaja belum ada** dan alasannya:

| Folder | Alasan belum ada |
|--------|------------------|
| `src/engine/` | Engine gambar langsung di `src/main/imageEngine.ts` (DEC-027). Folder terpisah belum perlu karena baru ada satu engine. |
| `src/renderer/src/services/` | Renderer memanggil `window.imageTools` langsung; tidak ada service layer yang perlu abstraksi |
| `docs/` | Dokumentasi tetap di root repository |

Aturan yang berlaku:

- `engine/` **dilarang** meng-import dari `renderer/` atau `main/`.
- Tidak ada folder kosong. Struktur mengikuti tanggung jawab, bukan upacara (Phase 1 §4).
- Konvensi CSS: BEM-lite (`block__element--modifier`), satu file CSS per komponen.
- Alias `@/*` → `src/renderer/src/*` (renderer tidak boleh mengimpor `src/main`).

## 4. Kontrak Modul (Module Contract)

Setiap modul engine mengikuti bentuk ini. Bentuk ini sudah diimplementasikan oleh
`src/main/imageEngine.ts` (Phase 2–3) dengan penyesuaian minimum yang tercatat di bawah.
Batas tanggung jawabnya tidak berubah.

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
  - status: 'success' | 'failed' | 'skipped'
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

#### Penyimpangan yang sudah terjadi di `imageEngine.ts`

| Kontrak ideal | Kenyataan sekarang | Alasan |
|----------------|--------------------|--------|
| `EngineError` terpisah | Error dipetakan ke pesan user di dalam engine (`mapError`), status `failed` menyimpan `error` | Bentuk ini sudah dipakai dan diuji sejak Phase 2; menambah lapisan `EngineError` sekarang berarti menulis ulang kontrak tanpa diminta |
| `signal` / cancel | Belum ada channel cancel | `UNDEFINED` (§8) dan belum ada tool yang memerlukannya di V1 |
| `cancelled` | Tidak dipakai; digantikan `skipped` untuk file yang tidak diproses karena kondisi input (format sama, alpha → JPG) | `skipped` bukan kegagalan, dan alasannya ditampilkan ke user |
| `summary` terpisah | UI menghitung dari `results[]` | Batch selesai sinkron per file; tidak ada kebutuhan state summary terpisah |
| `onItemResult` streaming | `onProgress` menerima `result` per file (`ImageProgress.result`) | Bridge tetap sempit — satu channel progress |

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
| Tidak overwrite file asli | Output ditulis ke folder tujuan pilihan user, bukan ke folder input |
| Selalu hasil file baru | Suffix operasi: `-compressed`, `-resized`, `-converted` (DEC-029) |
| Nama output jelas | Pola `<nama-asli>-<operasi>[ (n)].<ext-tujuan>`, deterministik |
| Duplikat ditangani | Auto-suffix ` (2)`, ` (3)`, dst. lewat reservasi `open(..., 'wx')` (DEC-010/DEC-029) |
| Karakter invalid ditangani | Sanitasi nama file cross-platform (`<>:"/\|?*`, reserved Windows names) |
| File kosong ditangani | Validasi ukuran > 0 sebelum proses |
| File corrupt ditangani | Validasi signature/parse sebelum proses |
| File besar ditangani | Batas 100 MB per file, 100 file per batch, raster 100 megapixel (DEC-013) |

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

Daftar route yang tersedia. **Ini bukan usulan — ini route yang sudah diimplementasikan**
di Phase 1 dan diuji di `tests/unit/routes.test.ts`. Sumber tunggalnya
`src/renderer/src/lib/routes.ts` (DEC-025).

```
/                          Dashboard
/image/compress            /pdf/compress
/image/resize              /pdf/merge
/image/convert             /pdf/split
/convert/image-to-pdf      /pdf/rotate
/convert/pdf-to-image      /file/batch-rename
/utility/qr                /file/zip
/utility/date
*                          NotFound
```

Seluruhnya memakai HashRouter (DEC-021), jadi URL sebenarnya berbentuk
`file:///.../index.html#/pdf/merge`.

Perubahan dari versi dokumen sebelumnya: Date Calculator tadinya terdaftar sebagai
`utility/date-calculator`, kini `utility/date` mengikuti Phase 1 §13 dan sudah dikoreksi
di sini (DEC-025).

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

## 12. Yang Sudah Defined vs Belum Defined

### Sudah defined (Phase 1)

- Struktur folder riil — lihat §3
- Bentuk & nama route — lihat §9
- Routing: HashRouter (DEC-021)
- Bentuk IPC atas: typed request/response + progress events, `contextBridge`
- Batas folder: `engine/` tidak boleh import UI; `features/` tidak boleh import `engine/`
- Design tokens: palet warna, spacing, radius, typography (DEC-022)
- Konvensi CSS: BEM-lite, satu file CSS per komponen (DEC-024)
- Sumber tunggal navigasi: `lib/routes.ts` (DEC-025)
- Postur keamanan window: `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`,
  `setWindowOpenHandler` yang menolak navigasi keluar

### Belum defined

- ~~mekanisme IPC konkret~~ → sudah ada untuk image tools (Phase 2, DEC-027); channel untuk
  tool non-image belum final
- ~~struktur folder final~~ → sudah ada; `features/image-tools/` dipakai tiga tool gambar
- lokasi & format developer log
- mekanisme cancellation konkret (`AbortSignal` via IPC)
- timeout per file
- strategi worker pool / queue
- strategi preview untuk PDF (render halaman: perlu library, belum diputuskan)
- persistensi preferences (DEC-018)
- choice engine PDF (DEC-008) dan **library generator PDF untuk Image → PDF** — `package.json`
  belum punya dependency PDF sama sekali; ini ikut menghambat Image → PDF
- default page size, margin, DPI embedding, dan penanganan orientasi EXIF untuk Image → PDF
  (DEC-015) — **menghambat Phase 3**
- decrypt PDF terenkripsi (belum ada di spesifikasi produk)
- library archive/encryption untuk ZIP (belum ada di spesifikasi produk)
