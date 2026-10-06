# DECISIONS — KPU Office Tools

Format setiap keputusan:

```
## DEC-NNN

Tanggal:
Keputusan:
Alasan:
Alternatif:
Dampak:
Status:
```

Status yang dipakai:

| Status | Arti |
|--------|------|
| `ACCEPTED` | Sudah diputuskan dan mengikat |
| `PROPOSED` | Diajukan, menunggu persetujuan pengguna |
| `UNDEFINED` | Belum diputuskan; menghambat progress |
| `DEFERRED` | Sengaja ditunda |
| `REJECTED` | Pertimbangkan lalu ditolak; dicatat agar tidak diulang |
| `SUPERSEDED` | Digantikan keputusan lain |

---

## Ringkasan

| ID | Judul | Status |
|----|-------|--------|
| DEC-001 | Local-first processing | ACCEPTED |
| DEC-002 | Scope V1 ditutup pada 13 fitur | ACCEPTED |
| DEC-003 | Disclaimer: bukan aplikasi resmi KPU | ACCEPTED |
| DEC-004 | Larangan fitur: akun, telemetry, iklan, subscription | ACCEPTED |
| DEC-005 | OCR ditunda sampai engine diputuskan | DEFERRED |
| DEC-006 | Bahasa UI | ACCEPTED (Phase 2) |
| DEC-007 | **Tech stack: Electron + TypeScript + React** | **ACCEPTED** |
| DEC-008 | Engine kompresi PDF | UNDEFINED |
| DEC-009 | Tujuan output file | ACCEPTED (Phase 2: samping sumber, salin ke folder pilihan) |
| DEC-010 | Policy nama file duplikat | ACCEPTED (Phase 2: suffix otomatis) |
| DEC-011 | **Testing framework: Vitest + Testing Library** | **ACCEPTED** |
| DEC-012 | Distribusi & installer | UNDEFINED |
| DEC-013 | Batas ukuran file maksimum | ACCEPTED (Phase 2: 100 MB/file, batch 100) |
| DEC-014 | PDF → Image: default DPI & page size | UNDEFINED |
| DEC-015 | Image → PDF: default page size | UNDEFINED |
| DEC-016 | ZIP Creator: file vs folder | UNDEFINED |
| DEC-017 | QR: dukungan SVG | CONDITIONAL |
| DEC-018 | Persistensi preferences | UNDEFINED |
| DEC-019 | **Inisialisasi git repository** | **ACCEPTED** |
| DEC-020 | Nama folder project | PROPOSED |
| DEC-021 | Routing memakai HashRouter | ACCEPTED (Phase 1) |
| DEC-022 | Design tokens & palet warna | ACCEPTED (Phase 1; warna direvisi DEC-031) |
| DEC-023 | Tidak ada preload / IPC di Phase 1 | ACCEPTED (Phase 1) |
| DEC-024 | Styling: CSS biasa + token | ACCEPTED (Phase 1) |
| DEC-025 | Registry route sebagai sumber tunggal | ACCEPTED (Phase 1) |
| DEC-026 | Folder features/ dan services/ belum dibuat | ACCEPTED (Phase 1) |
| DEC-027 | Image engine: Sharp di main process | ACCEPTED (Phase 2) |
| DEC-028 | Resize: aspect ratio, tanpa upscale, batch sekuensial | ACCEPTED (Phase 2) |
| DEC-029 | Output: suffix `-compressed`/`-resized`, duplikat auto-suffix | ACCEPTED (Phase 2) |
| DEC-030 | Default kualitas kompresi 80, PNG lossless | ACCEPTED (Phase 2) |
| DEC-031 | **Palet warna: merah maron + aksen emas** | **ACCEPTED** |
| DEC-032 | Kualitas encoder untuk Image Converter | ACCEPTED (Phase 3) |
| DEC-033 | Alpha → JPG saat Image Converter | PARTIAL (Phase 3: interim dilewati) |

---

## DEC-001

**Tanggal:** 2026-10-02
**Keputusan:** Seluruh pemrosesan file dilakukan secara lokal di perangkat pengguna. Tidak
ada upload ke server. Tidak ada panggilan API jaringan di jalur pemrosesan normal.
**Alasan:** Ditetapkan langsung oleh spesifikasi §7 (privacy). Aplikasi adalah alat
administrasi untuk dokumen internal yang sensitif.
**Alternatif:** Hybrid — bisa fallback ke cloud bila file terlalu besar. **Ditolak** karena
bertentangan langsung dengan §3 dan §7.
**Dampak:** Semua library yang dipakai harus bisa berjalan offline. Tidak boleh ada
dependency yang butuh koneksi saat runtime. UI cukup menampilkan indikator bila suatu fitur
ternyata butuh internet.
**Status:** ACCEPTED

---

## DEC-002

**Tanggal:** 2026-10-02
**Keputusan:** Scope V1 mencakup tepat 13 fitur seperti tertera di `FEATURES.md`. Tidak ada
fitur, menu, atau tombol lain.
**Alasan:** §8–§12 menentukan daftar modul; §3 melarang penambahan fitur; §15 melarang
menu tambahan; §15 menyatakan "Jangan menambahkan menu lain tanpa persetujuan."
**Alternatif:** Menambahkan fitur yang terlihat berguna sekalian. **Ditolak** — melanggar
ZERO INVENTION RULE.
**Dampak:** Ide fitur baru hanya masuk `FUTURE_FEATURES.md` dengan status PROPOSED.
**Status:** ACCEPTED

---

## DEC-003

**Tanggal:** 2026-10-02
**Keputusan:** Aplikasi menampilkan disclaimer bahwa ini **bukan** aplikasi resmi KPU dan
**bukan** aplikasi kepemiluan. Tidak menggunakan logo, lambang, atau aset visual resmi KPU.
**Alasan:** §1 menyatakan hal ini eksplisit. Menggunakan logo resmi KPU menimbulkan risiko
keliru ditafsirkan sebagai produk resmi.
**Alternatif:** Menggunakan logo KPU untuk pengenalan. **Ditolak.**
**Dampak:** Naming harus netral. `KPU Office Tools` diperbolehkan karena memang nama
proyek, tetapi harus disertai disclaimer tegas. Layar About wajib ada.
**Status:** ACCEPTED

---

## DEC-004

**Tanggal:** 2026-10-02
**Keputusan:** Tidak ada sistem akun/login, cloud sync, analytics, telemetry, iklan, atau
subscription di V1.
**Alasan:** §3 dan §7 melarangnya secara eksplisit.
**Alternatif:** Tidak ada yang dipertimbangkan.
**Dampak:** Tidak ada endpoint jaringan sama sekali di aplikasi. Tidak ada yang perlu
diasahkan dari sisi privasi data pengguna.
**Status:** ACCEPTED

---

## DEC-005

**Tanggal:** 2026-10-02
**Keputusan:** OCR **tidak diimplementasikan** pada V1 awal. Ditunda sampai engine,
arsitektur, dan dependency ditetapkan.
**Alasan:** §13: jangan implementasikan OCR sebelum arsitektur dan dependency ditentukan.
Jika OCR membutuhkan external API, cloud service, atau paid API, harus STOP dan laporkan.
**Alternatif:**
- Tesseract lokal (WASM atau native) — satu-satunya opsi yang memenuhi syarat "lokal", tapi
  menambah ~15–30MB per language pack dan menambah kompleksitas.
- Cloud OCR API (Google Vision, Azure OCR, AWS Textract) — **ditolak**, melanggar §7 dan §13.
- Paid API — **ditolak**, tidak ada anggaran dan tidak ada persetujuan.
**Dampak:** Menu OCR tidak ada di navigasi V1. Butuh keputusan terpisah sebelum masuk scope.
**Status:** DEFERRED

---

## DEC-006

**Tanggal:** 2026-10-02
**Keputusan:** Bahasa UI = Bahasa Indonesia.
**Alasan:** Seluruh spesifikasi ditulis dalam Bahasa Indonesia, contoh pesan error di §17
dalam Bahasa Indonesia, dan target user adalah pegawai Indonesia.
**Alternatif:** Bahasa Inggris, atau dwibahasa dengan toggle. **Ditolak** untuk V1 —
tidak ada dalam spesifikasi dan menambah beban pemeliharaan.
**Dampak:** Semua string UI dalam Bahasa Indonesia. Nama variabel, kode, dan dokumentasi
teknis tetap dalam Bahasa Inggris. Struktur ini berarti: user-facing = ID, developer-facing =
EN.
**Status:** PROPOSED — perlu konfirmasi karena tidak dinyatakan eksplisit di spesifikasi.

---

## DEC-007

**Tanggal:** 2026-10-02 (dipilih 2026-10-02, diterapkan di Phase 1)
**Keputusan:** **Opsi A — Electron 44 + TypeScript + React 19.**
Build tool `electron-vite` 5, bundler Vite 7, router `react-router-dom` 7,
test runner Vitest 5 + Testing Library + jsdom.

Matriks versi yang dipakai, dan alasannya:

| Paket | Versi | Alasan |
|-------|--------|--------|
| electron | 44.5.1 | Versi stabil terkini saat keputusan diambil |
| electron-vite | 5.0.0 | Build tool standar untuk Electron + Vite |
| vite | **7.3.6** | `electron-vite@5` mensyaratkan `vite ^5 \|\| ^6 \|\| ^7`. **Vite 8 tidak kompatibel.** |
| @vitejs/plugin-react | **5.2.0** | `@vitejs/plugin-react@6` mensyaratkan `vite ^8`. V5 mendukung Vite 7. |
| typescript | **5.9.3** | `typescript-eslint@8` mensyaratkan `typescript >=4.8.4 <6.1.0`. **TypeScript 7 tidak kompatibel.** |
| react / react-dom | 19.3.0 | Ringkas, current |
| react-router-dom | 7.18.4 | Routing deklaratif, mendukung nested layout |
| vitest | 5.0.3 | Mendukung Vite 7 |
| eslint | 10.11.0 | supported oleh typescript-eslint dan eslint-plugin-react-hooks |

**Alasan:** Opsi A dipilih pengguna atas rekomendasi teknis (local-first §7, batch 100+
file tanpa freeze §19, kontrol filesystem penuh §18).

**Alternatif:** Tauri (DIPILIH TIDAK), Web app (DIPILIH TIDAK), Python + Qt (DIPILIH TIDAK).

**Catatan versi penting:** dua versi terbaru sengaja **tidak** dipakai karena tidak kompatibel:
TypeScript 7.0.2 ditolak oleh `typescript-eslint`, dan Vite 8.3.2 ditolak oleh `electron-vite@5`.
Naik ke salah satu dari keduanya memerlukan migrasi toolchain tersendiri.

**Dampak:** Struktur project memakai `src/main` + `src/renderer` (bukan `src/app` di root
sepertiPhase 1 §4, karena renderer Electron harus berada di dalam renderer process). Test
framework dan konvensi build mengikuti stack ini.
**Status:** ACCEPTED

---

## DEC-008

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — engine/library untuk kompresi PDF belum dipilih.
**Alasan:** Kompresi PDF yang benar-benar efektif membutuhkan proses di luar lingkup
aplikasi: Ghostscript, render ulang halaman, atau re-encoding objek gambar. Setiap opsi punya
konsekuensi berbeda dan tidak boleh dipilih sepihak.
**Alternatif & konsekuensi:**

| Opsi | Mekanisme | Konsekuensi |
|------|-----------|-------------|
| Ghostscript (subprocess) | Downsample + re-encode gambar | Hasil terbaik. Butuh binary eksternal, lisensi **AGPL** pada sebagian build, harus di-bundle |
| Render ulang via renderer | Halaman → gambar → PDF baru | Menghancurkan text layer. Tidak ada dependency native, tapi kualitas teks turun drastis |
| Lossless object-level | Kompres stream, optimalkan objek | Kualitas terjaga, text layer utuh, tapi penghematan kecil (biasanya 10–30%) |
| pikepdf/qpdf | Optimasi struktur & stream | Cepat, teks utuh, hemat sedang. Tidak mengecilkan gambar yang sudah besar |

**Pertanyaan yang harus dijawab pengguna:**

1. Apakah output boleh kehilangan kemampuan pencarian teks? Ini pertanyaan paling penting.
   Spesifikasi §9 hanya menyebut "mempertahankan kualitas sebisa mungkin" — tidak menyebut
   text layer.
2. Bolehkan aplikasi menjalankan binary eksternal (Ghostscript)? Ini memengaruhi distribusi,
   ukuran installer, dan deteksi antivirus.
3. Bolehkan lisensi AGPL dipakai di aplikasi internal kantor?

**Dampak:** PDF Compressor adalah fitur paling berisiko di V1. Menundanya lebih aman daripada
membuat keputusan lisensi secara sepihak.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-009

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — tidak ditentukan ke mana file output ditulis.
**Alasan:** §18 mensyaratkan "tidak overwrite file asli" dan "nama output yang jelas",
tetapi tidak menyebutkan mekanisme penyimpanan output.
**Alternatif:**

| Opsi | Deskripsi | Trade-off |
|------|-----------|-----------|
| A | Save dialog per hasil (ribet untuk batch) | User tetap punya kontrol penuh, tapi 100 file = 100 dialog. Tidak layak. |
| B | User pilih satu folder output di awal | Sekali pilih, semua file masuk ke sana. Batch-friendly. **Rekomendasi teknis.** |
| C | Folder output default otomatis (mis. `Dokumen/KPU Output/`) | Paling cepat, tapi path bisa tidak jelas |
| D | Hasil di-ZIP otomatis lalu diunduh | Praktis untuk web, buruk untuk desktop (user harus ekstrak) |

**Dampak:** Menentukan API `OutputTarget` di `ARCHITECTURE.md` dan UX langkah RESULT.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-010

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — belum ada policy untuk nama file duplikat.
**Alasan:** §18 mewajibkan "menangani filename duplicate" tetapi tidak menyatakan bagaimana.
**Alternatif:**

| Opsi | Deskripsi | Trade-off |
|------|-----------|-----------|
| A | Auto-suffix: `file.pdf` → `file (2).pdf` | Tidak pernah gagal, tidak perlu interaksi. **Rekomendasi teknis.** |
| B | Lewati file yang bentrok, tampilkan di daftar gagal | Data hilang tanpa jejak. Buruk. |
| C | Minta pengguna setiap kali bentrok | Batch besar jadi sangat lambat. |
| D | Gagal total sebelum mulai | Paling aman, tapi membosankan untuk rename pattern. |

Catatan: opsi A hampir pasti dibutuhkan sebagai fallback, tapi apakah pengguna diberi
kendali atasnya belum diputuskan.

**Dampak:** Berlaku untuk semua tool yang menulis output, dan terutama Batch Rename.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-011

**Tanggal:** 2026-10-02
**Keputusan:** Testing framework = **Vitest 5** (test runner) + **@testing-library/react 16**
(render & query) + **jsdom 30** (DOM environment) + **@testing-library/jest-dom** (assertion).
Unit test dan integration test memakai runner yang sama; tidak ada framework kedua.
**Alasan:** Mengikuti DEC-007. Vitest berjalan di atas pipeline Vite yang sama dengan build,
sehingga tidak ada konfigurasi transform terpisah. Testing Library menguji perilaku yang
penting bagi user (nama yang bisa dibaca, role, interaksi keyboard), bukan implementasi internal.
**Alternatif:** Jest (transform terpisah, lambat, tidak perlu karena sudah di Vite),
Playwright E2E (menambah browser download dan waktu setup; belum diperlukan di Phase 1),
React Native Testing Library (tidak relevan).
**Dampak:** 82 test aktif pada Phase 1. Struktur `tests/unit` dan `tests/integration`
sesuai ARCHITECTURE.md. E2E browser **belum** ada — lihat FUTURE_FEATURES.md FF-021.
**Status:** ACCEPTED

---

## DEC-012

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — strategi distribusi belum ditentukan.
**Alasan:** Tidak ada di spesifikasi, tapi berdampak besar pada arsitektur.
**Pertanyaan:**

1. Format distribusi: `.exe` installer (NSIS/Squirrel), MSI, atau portable zip?
2. Code signing? Tanpa signing, Windows SmartScreen akan menampilkan peringatan
   "Windows protecting your PC" setiap kali dijalankan — friksi besar untuk user non-teknis.
3. Auto-update? Wajib ada atau pengguna meng-install manual?
4. Instalasi per-mesin atau per-user?
5. Siapa yang membangun dan memvalidasi rilis? Apakah ada proses review internal?

**Dampak:** Code signing adalah keputusan biaya, bukan teknis. Tidak dapat diasumsikan.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-013

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — batas ukuran file dan jumlah file belum ditetapkan.
**Alasan:** §18 mewajibkan "menangani ukuran file besar" tetapi tidak memberi angka.
**Catatan:** Batas ini **berbeda** antar stack. Web app akan mentok di memori tab; desktop
bisa jauh lebih tinggi. DEC-007 sudah ACCEPTED (Electron), jadi hambat technologicalnya
sudah hilang — yang tersisa adalah angka kebijakan, bukan keterbatasan toolchain.
**Dampak:** Perlu juga strategi *streaming* vs *load-all-in-memory* untuk setiap tool.
Electron: renderer tidak boleh memegang file besar di memori; pemrosesan terjadi di main/
engine (§19).
**Status:** UNDEFINED — perlu angka; sekarang bisa diputuskan di Phase 2

---

## DEC-014

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — default DPI dan page size untuk PDF → Image belum ditetapkan.
**Alasan:** §10 hanya menyebut "export selected pages", "JPG", "PNG". Tidak ada default.
**Alternatif untuk page size:** (a) ukuran asli halaman PDF, (b) ukuran tetap (A4/FHD),
(c) ukuran yang dapat dipilih user.
**Catatan interpretasi:** "Export selected pages" ambigu — bisa berarti "pilih halaman mana yang
diekspor" (kemungkinan besar) atau "pilih ukuran halaman". Asumsi pertama lebih masuk akal
tetapi **tidak diasumsikan**.
**Dampak:** Menentukan kualitas output dan ukuran file hasil.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-015

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — default page size untuk Image → PDF belum ditetapkan.
**Alasan:** §10 menyebut "page size" sebagai opsi, tetapi tidak menyebut default.
**Alternatif:** A4, Letter, atau "Fit to image" (ukuran halaman mengikuti gambar).
**Catatan:** Untuk dokumen administrasi Indonesia, A4 hampir pasti menjadi standar. Tapi
"hampir pasti" bukan "ditentukan", dan opsi ini menentukan dokumen resmi pada beberapa kasus —
default yang salah merusak hasil. Butuh konfirmasi.
**Pertanyaan terkait:** margin default, DPI embedding, dan apakah EXIF orientation diterapkan.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-016

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — sumber input ZIP Creator belum jelas.
**Alasan:** §11 menulis "mempertahankan struktur folder **jika diperlukan oleh
spesifikasi**" — kalimat ini sendiri tidak konklusif dan tidak dapat dianggap sebagai
requirement.
**Alternatif:**

| Opsi | Deskripsi | Trade-off |
|------|-----------|-----------|
| A | Hanya file yang dipilih (flat) | Sederhana, sesuai "memilih banyak file" |
| B | File dan/atau folder penuh, struktur dipertahankan | Lebih berguna, tapi membuat UI lebih rumit dan perlu penanganan path bersarang |

**Catatan:** Opsi B **tidak mungkin** di web app untuk drag & drop folder, tetapi mudah di
desktop. Ini salah satu alasan stack (DEC-007) memengaruhi fitur.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-017

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — dukungan SVG untuk QR Generator bersifat kondisional.
**Alasan:** §12 menyatakan "SVG **jika library mendukung dengan baik**". Ini permission
bersyarat, bukan requirement. Library yang dipilih (DEC-007) menentukan hasilnya.
**Rencana:** PNG dipastikan ada. SVG hanya diterapkan jika library yang dipilih menghasilkan
SVG yang valid tanpa workaround. Jika tidak, PNG saja — dan keputusannya dicatat di sini.
**Dampak:** Jika library tidak mendukung, ini **bukan** kegagalan scope.
**Status:** CONDITIONAL — menunggu DEC-007

---

## DEC-018

**Tanggal:** 2026-10-02
**Keputusan:** `UNDEFINED` — apakah aplikasi menyimpan preferences.
**Alasan:** Tidak ada di spesifikasi. §3 melarang analytics/tracking, tetapi preferences
lokal (folder terakhir yang dipakai) bukan analytics.
**Alternatif:**

| Opsi | Deskripsi | Trade-off |
|------|-----------|-----------|
| A | Tidak ada preferences sama sekali | Paling sederhana dan paling aman dari sisi privasi, tapi user harus memilih folder tiap kali |
| B | Simpan preferensi lokal saja (folder terakhir, opsi terakhir) | UX lebih baik. **Rekomendasi teknis.** Tetap 100% lokal, tanpa telemetry. |
| C | Profil pengguna yang bisa disimpan/dit-import | Lebih fitur, tapi mulai mendekati "account system" |

**Batasan keras:** jika B dipilih, data hanya boleh disimpan di `%APPDATA%`, tidak boleh
mengandung isi file, dan tidak boleh dikirim ke mana pun.
**Status:** UNDEFINED — menunggu keputusan pengguna

---

## DEC-019

**Tanggal:** 2026-10-02
**Keputusan:** Repository **diinisialisasi sebagai git**, branch `main`, remote
`https://github.com/fahmikip/KOT`.
**Alasan:** Pengguna memberi instruksi eksplisit "commit dan push ke github". Commit pertama
`d30a2ac` berisi dokumen fondasi.
**Alternatif:** (b) tunggu instruksi eksplisit — tidak lagi berlaku karena instruksi diberikan.
**Dampak:** Ada riwayat perubahan dan rollback per phase. `.gitignore` dibuat bersamaan.
**Status:** ACCEPTED

---

## DEC-020

**Tanggal:** 2026-10-02
**Keputusan:** Nama folder project = `KOT` (direktori kerja saat ini).
**Alasan:** Direktori kerja yang diberikan adalah `D:\DEV\OPENCODE\KOT`.
**Alternatif:** `kpu-office-tools` (lebih deskriptif). Tidak ada instruksi untuk memindahkan.
**Dampak:** Nama folder tidak memengaruhi aplikasi, hanya repository. Tidak diubah tanpa
persetujuan.
**Status:** PROPOSED — perlu konfirmasi

---

# KEPUTUSAN PHASE 1

Entri di bawah dibuat saat Phase 1 (Project Foundation & Application Shell) dikerjakan.
Semua pertains pada implementasi shell; tidak mengubah scope produk.

## DEC-021

**Tanggal:** 2026-10-02
**Keputusan:** Routing memakai **HashRouter** (`react-router-dom`), bukan BrowserRouter.
**Alasan:** Pada build produksi, renderer dimuat lewat `loadFile()` dengan skema `file://`.
BrowserRouter tidak dapat bekerja pada skema tersebut karena history API butuh origin HTTP.
HashRouter bekerja tanpa konfigurasi server tambahan — pilihan paling sederhana sesuai
Phase 1 §13.
**Alternatif:**
- BrowserRouter + custom protocol (`app://`) — lebih bersih secara teoritis, tetapi menambah
  registrasi protocol di main process tanpa manfaat nyata di Phase 1.
- Hash manual parsing — menduplikasi fungsi yang sudah ada di router.
**Dampak:** URL tampil sebagai `file:///.../index.html#/pdf/merge`. Tidak masalah untuk aplikasi
desktop. Tidak perlu dialog router.
**Status:** ACCEPTED

## DEC-022

**Tanggal:** 2026-10-02
**Keputusan:** Palet warna, skala spacing, skala radius, dan skala typography ditetapkan
dengan nilai konkret pertama kali, disimpan di `src/renderer/src/styles/tokens.css`.
**Alasan:** Phase 1 §10 mengizinkan nilai sementara bila implementasi membutuhkan, dengan
syarat proposal dicatat di sini. Shell memang membutuhkan nilai konkret agar bisa dinilai.
**Nilai yang ditetapkan:**

| Token | Nilai | Catatan |
|-------|-------|---------|
| background | `#f4f6f8` | Abu muda dingin |
| surface | `#ffffff` | |
| surface-muted | `#eaeef2` | |
| border | `#d3dae2` | |
| border-strong | `#b3bfcc` | Untuk kontrol formulir |
| text-primary | `#16191d` | |
| text-secondary | `#4f5b6a` | |
| primary | `#1f5f9e` | Biru tenang, satu-satunya warna aksen |
| primary-hover | `#17497a` | |
| success | `#1a6b45` | |
| warning | `#7d5200` | |
| danger | `#a8261d` | |

Aturan yang berlaku bersama palet ini:

- Tanpa gradient, tanpa neon, satu warna aksen saja (§14).
- Font memakai system font stack. **Tidak ada webfont** — tidak ada permintaan jaringan,
  konsisten dengan DEC-001.
- Semua pasangan teks/latar Designed memenuhi WCAG AA (rasio kontras ≥ 4.5:1 untuk teks normal).
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Radius dibatasi tiga nilai: 4, 8, 12 px.
- Dark mode **tidak** dibuat (Phase 1 §21 melarang; ada di FUTURE_FEATURES.md).

**Alternatif:** Palet netral murni tanpa warna aksen (terlalu datar untuk state fokus);
biru corporate lebih terang (kontras teks putih menurun).
**Dampak:** Warna di seluruh aplikasi wajib diambil dari token. Nilai Literal di komponen
menyimpang dari token dianggap pelanggaran.
**Status:** ACCEPTED — nilai warna direvisi oleh DEC-031, skala spacing/radius/typography tetap berlaku

## DEC-023

**Tanggal:** 2026-10-02
**Keputusan:** **Tidak ada preload script dan tidak ada IPC pada Phase 1.**
**Alasan:** Tidak ada satu pun operasi yang perlu diekspos ke renderer. Satu-satunya data yang
 dibutuhkan renderer — versi aplikasi — di-inject saat build melalui `define`, sehingga tidak
memerlukan bridge.
**Alternatif:** Membuat preload dengan `contextBridge` sejak awal "siap dipakai nanti" —
ditolak karena itu kode tanpa consumer (melawan §29).
**Dampak:** `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`. Electron
mencetak peringatan "preload config is missing" saat build — **ini diharapkan**, bukan error.
Preload baru dibuat pada phase yang benar-benar memproses file.
**Status:** ACCEPTED

## DEC-024

**Tanggal:** 2026-10-02
**Keputusan:** Styling memakai **CSS biasa** dengan custom properties. Tidak memakai Tailwind,
CSS-in-JS, maupun CSS Modules.
**Alasan:** Volume styling Phase 1 kecil dan statis. CSS biasa + token memenuhi kebutuhan tanpa
dependency tambahan dan tanpa build step tambahan. Token sudah terpisah di `tokens.css`, sehingga
pindah ke pendekatan lain tetap mudah bila-required.
**Alternatif:**
- Tailwind — produktivitas bagus, tapi menambah dependency dan konvensi utilitas yang
 perlu dipelajari.
- CSS Modules — scoping otomatis, tapi menambah nama file dan kompleksi routing tanpa
manfaat yang jelas di Phase 1.
- CSS-in-JS — runtime cost, tidak perlu.
**Dampak:** Satu file CSS per komponen, BEM-lite (`block__element--modifier`). Konvensi ini
wajib dijaga agar konsisten.
**Status:** ACCEPTED

## DEC-025

**Tanggal:** 2026-10-02
**Keputusan:** Seluruh definisi tool, path, label, dan grup navigasi berada di **satu berkas**:
`src/renderer/src/lib/routes.ts`. Sidebar, Dashboard, dan router ketiganya mengimpor dari sana.
**Alasan:** Mencegah navigasi dan routing berbeda — sumber kegagalan yang mudah terjadi.
**Alternatif:** Menulis route thrice di tiga tempat (router, sidebar, dashboard) — ditolak,
mengganggu aturan no-duplication.
**Dampak:** Menambah tool = menambah satu entri di `routes.ts`. Test `routes.test.ts` menjaga
path tetap unik dan lengkap.

### Konflik yang ditemukan dan diselesaikan

`ARCHITECTURE.md` §9 mendaftarkan route QR Generator sebagai `utility/qr` dan Date Calculator
sebagai `utility/date-calculator`. Phase 1 §13 listing route `utility/qr` dan `utility/date`.

**Penyelesaian:** yang dipakai `utility/date`, sesuai Phase 1 §13, dan `ARCHITECTURE.md` §9
sudah dikoreksi agar sama. `/utility/date` juga lebih konsisten dengan label tool
"Date Calculator" tanpa mengulang kata "calculator" di URL.

## DEC-026

**Tanggal:** 2026-10-02
**Keputusan:** Folder `features/` dan `services/` **tidak** dibuat pada Phase 1.
**Alasan:** Phase 1 §4 memerintahkan "Jangan membuat folder jika stack atau arsitektur yang
dipilih tidak membutuhkannya". Phase 1 tidak punya logika fitur apa pun dan tidak punya
service (belum ada IPC atau engine), sehingga kedua folder tersebut akan kosong.
**Alternatif:** Membuat kedua folder sekarang untuk "men.prepare" — ditolak karena
folder kosong tanpa isi adalah ceremony.
**Dampak:** `features/<tool>/` dibuat satu per satu pada phase implementasi tool tersebut.
`services/` muncul saat IPC/engine pertama ada. Struktur final ada di `ARCHITECTURE.md`.
**Status:** ACCEPTED

## DEC-027

**Tanggal:** 2026-10-02
**Keputusan:** Image Compressor menggunakan `sharp` (libvips) di Electron main process.
Input JPG/JPEG, PNG, dan WEBP mempertahankan format. Quality 10–100 (default 80) hanya
diterapkan pada JPEG/WEBP. PNG memakai encoder lossless (compression level 9 + palette).
**Alasan:** Stack Phase 1 tidak memiliki codec gambar; Sharp memproses ketiga codec secara
lokal tanpa API eksternal dan berjalan di luar UI renderer.
**Alternatif:** Canvas renderer (menahan bitmap/file dalam renderer dan dukungan PNG lossless
terbatas); ImageMagick/Ghostscript subprocess (binary tambahan); konversi format (di luar scope).
**Dependency:** `sharp` — codec decode/encode JPG/JPEG/PNG/WEBP dan resize lokal. Lisensi
Apache-2.0; binary libvips native per platform disediakan paket Sharp. Alternatif: browser
canvas atau binary eksternal, keduanya memiliki batasan/biaya distribusi lebih besar.
**Dampak:** Native module memerlukan distribusi binary yang cocok dengan platform/arsitektur
Electron. Runtime Phase 2 diverifikasi pada Windows x64 dengan Electron/Sharp yang terpasang.
**Status:** ACCEPTED

## DEC-028

**Tanggal:** 2026-10-02
**Keputusan:** Image Resizer menjaga aspect ratio aktif dan mencegah upscale. Mode width,
height, dan percentage tersedia; batch menerapkan opsi yang sama per file. Batas 100 file
diproses sekuensial, maksimum 100 MP per gambar.
**Alasan:** Pilihan ini menjaga proporsi, mengurangi risiko penggunaan memori, dan memberi
aturan batch yang deterministik.
**Dampak:** Target dimensi di atas ukuran sumber ditolak. Tidak ada opsi free-stretch atau
upscale.
**Status:** ACCEPTED

## DEC-029

**Tanggal:** 2026-10-02
**Keputusan:** Hasil default ditulis di samping file sumber memakai suffix `-compressed` atau
`-resized`; benturan nama mendapat suffix ` (2)`, ` (3)`, dan seterusnya. Tombol Simpan hasil
menyalin output ke folder yang dipilih user tanpa overwrite.
**Alasan:** Output otomatis per-file mendukung batch tanpa dialog satu per hasil dan menjaga
file asli. Pemilihan folder tujuan tambahan tetap tersedia setelah proses.
**Dampak:** Folder sumber harus dapat ditulis. File input dari media read-only gagal dengan
pesan ramah; tidak ada fallback lokasi tersembunyi.
**Status:** ACCEPTED

## DEC-030

**Tanggal:** 2026-10-02
**Keputusan:** Default Image Compressor quality = 80 pada skala integer 10–100. PNG selalu
menggunakan lossless encoding dan mengabaikan kontrol quality.
**Alasan:** Angka eksplisit dibutuhkan agar UI bisa memberi kontrol nyata; nilai tengah-atas
menjadi default seimbang untuk JPEG/WebP. Format PNG tidak mendefinisikan lossy quality pada
jalur lossless ini.
**Status:** ACCEPTED

## DEC-031

**Tanggal:** 2026-10-02
**Keputusan:** Palet warna direvisi ke identitas **merah maron + aksen emas**, menggantikan
biru corporate pada DEC-022. Maron menjadi warna aksi utama; emas HANYA aksen (garis pemisah,
penanda aktif, ornamen dekoratif). Header dan sidebar memakai permukaan maron gelap dengan
garis emas, konten tetap pada latar netral terang.
**Alasan:** Permintaan pengguna. Nuansa maron-emas adalah identitas visual yang diharapkan untuk
alat kerja di lingkungan kantor resmi, dan maron/emas terbaca sebagai warna institusional yang
terbuka dan profesional dibandingkan biru generik.
**Nilai yang ditetapkan:**

| Token | Nilai | Catatan |
|-------|-------|---------|
| background | `#f6f4f2` | Netral hangat |
| surface | `#ffffff` | |
| surface-muted | `#f0ecea` | |
| border | `#e6ded9` | Garis rambut |
| border-strong | `#9c8c86` | Kontrol formulir, kontras ≥ 3:1 |
| text-primary | `#1d1618` | |
| text-secondary | `#56494c` | |
| primary | `#7a1f2b` | Merah maron, warna aksi utama |
| primary-hover | `#631722` | |
| primary-active | `#4f1019` | |
| primary-muted | `#f6e9eb` | |
| accent | `#d4af37` | Emas, hanya pada permukaan gelap/ornamen |
| accent-strong | `#8a6a12` | Emas teks di latar terang |
| accent-muted | `#fbf3df` | |
| chrome | `#6d1b26` | Header |
| chrome-deep | `#551420` | Sidebar |
| success | `#1a6b45` | |
| warning | `#7d5200` | |
| danger | `#a8261d` | |

Aturan yang berlaku bersama palet ini:

- Emas tidak pernah menjadi warna tombol, latar besar, atau teks panjang. Perannya hanya
  ornamen: garis 3 px, penanda item aktif, dan label status singkat.
- Tidak ada warna ketiga non-semantik; success/warning/danger tetap terpisah dari maron.
- Rasio kontras tetap diverifikasi: putih di `#7a1f2b` = 10.2:1, teks utama di latar = 7.8:1,
  `#8a6a12` di `#fbf3df` = 4.6:1, emas di `#551420` = 6.6:1.
- Dark mode penuh **tidak** dibuat (§21); maron gelap pada header/sidebar bukan dark mode.
**Alternatif:** Biru corporate (DEC-022) — ditolak karena tidak sesuai identitas yang diminta;
maron dengan emas sebagai warna tombol utama — ditolak karena emas akan berkonflik dengan
kontras teks putih dan terlalu berat untuk aksi utama; netral tanpa aksen — ditolak karena
kurang khas.
**Dampak:** Semua komponen memakai token warna yang baru. Komponen `Badge` mendapat tone
`accent` untuk status tool yang sudah siap; sidebar dan header memakai token `chrome`.
**Status:** ACCEPTED

## DEC-032

**Tanggal:** 2026-10-03
**Keputusan:** Image Converter memakai quality encoder default Sharp (80) untuk target JPG dan
WEBP, dan lossless untuk PNG. Tidak ada slider kualitas khusus di halaman konversi.
**Alasan:** §21 instruksi phase hanya menyebut "format tujuan" — tidak menyebut kontrol
mutu. Menambah slider berarti membuat default yang tidak diminta; memakai default encoder
adalah pilihan paling minim asumsi. Angka 80 juga sudah menjadi default Image Compressor
(DEC-030), sehingga tidak ada dua angka berbeda untuk hal yang sama.
**Alternatif:** (a) slider kualitas dengan default 80 — ditolak karena UI dan defaultnya tidak
diperintahkan; (b) selalu lossless — mustahil untuk JPG lossy; (c) kualitas 100 — hasil besar
tanpa alasan.
**Dampak:** PNG → JPG bersifat lossy; hasilnya tidak identik dengan sumber. Konversi ke PNG
lossless. **Belum decided:** apakah user butuh kontrol kualitas per konversi. Bila ya, slider
dapat ditambahkan tanpa mengubah engine.
**Status:** ACCEPTED (Phase 3) — cabut bila user meminta kontrol kualitas.

## DEC-033

**Tanggal:** 2026-10-03
**Keputusan:** PNG/WEBP yang memiliki alpha **tidak boleh** diam-diam flatten saat konversi ke
JPG. Pada Phase 3 file tersebut berstatus `skipped` dengan alasan yang ditampilkan ke user, dan
UI memperingatkan jumlahnya sebelum proses berjalan. Konversi ke PNG dan WEBP tidak dibatasi alpha.
**Alasan:** `FEATURES.md` §3 menanyakan warna latar untuk alpha dan `TESTING.md` CV-04
menandai kasus ini sebagai `(DIPERLUKAN)`. Memakai putih atau hitam secara sepihak berisiko
menghapus logo, watermark transparan, atau area yang seharusnya kosong.
**Alternatif & konsekuensi:**

| Opsi | Mekanisme | Konsekuensi |
|------|-----------|-------------|
| A | Latar putih otomatis | Risiko: transparansi dianggap "kotor" dan hilang tanpa jejak |
| B | Latar hitam otomatis | Risiko lebih tinggi untuk logo/watermark gelap |
| C | User memilih warna latar | Butuh UI tambahan dan keputusan default-nya |
| D | Lewati file, beri tahu | Tidak merusak data; user tahu persis apa yang terjadi |

**Dampak:** Batch campuran PNG-transparan + JPG ke target JPG menghasilkan beberapa `skipped`.
Ringkasan hasil menampilkan jumlah "dilewati" agar tidak terlihat seperti kegagalan.
**Status:** PARTIAL — opsi A/B/C masih `UNDEFINED`; implementasi saat ini memakai D sebagai
interim yang tidak merusak data. Segera setelah user memilih opsi, DEC-033 ditutup.

## DEC-034

**Tanggal:** 2026-10-05
**Keputusan:** Redefinisi visual menyeluruh (pass kedua) pada identitas maron + emas DEC-031.
Tiga hal yang dikunci:

1. **Palet dipetakan ke peran, bukan ke nama warna.** Token dipisah menjadi `chrome` /
   `chrome-deep` (header dan sidebar), `accent-soft` / `accent-strong` (emas terang untuk
   permukaan gelap, emas gelap untuk teks di permukaan terang), dan pasangan
   `*-muted` untuk setiap tone. Nilai hex lama dipertahankan sebagai rujukan, tetapi tidak lagi
   dipakai langsung di komponen.
2. **Hierarki lewat whitespace dan border, bukan shadow.** `elevation-1` hanya `border` +
   `box-shadow` 1 px; `elevation-2` menambah blur 6 px tanpa offset Y. Kartu dashboard memakai
   aksen emas 2 px di sisi atas, bukan kartu berbayang berat.
3. **Aksen emas tidak pernah jadi warna teks di atas warna emas.** Untuk itu ada
   `accent-strong` (`#856512`, 4.95:1 di atas `accent-muted`), sedangkan emas terang hanya
   dipakai di atas maron. Kontras diuji dengan rasio WCAG, bukan perkiraan mata.

Tambahan struktural: tipografi memakai skala fluid (`clamp()`) dengan `tabular-nums` untuk angka
ukuran file, komponen `Icon` (inline SVG dekoratif, `aria-hidden`, `focusable="false"`) +
peta ikon per tool di `lib/toolIcons.ts`, komponen `PageHeader` bersama untuk semua halaman,
utility `.link-button` supaya navigasi tetap link (bukan button) meski tampil seperti tombol,
dan sidebar memakai penanda status berbentuk titik dengan teks `.sr-only`.

**Alasan:** Pass pertama (DEC-031) sudah benar warna, tetapi hierarki masih bergantung pada
shading dan abu-abu netral yang terasa seperti template sehingga identitas maron terasa lemah,
kartu tool terlihat datar, dan lima langkah Image Tool tidak terbaca sebagai alur. Pemeriksaan
DOM juga menunjukkan overlay full-bleed membuat `scrollWidth > clientWidth`, dan rasio kontras
`--color-border-strong` di permukaan muted hanya 2.72:1 (di bawah 3:1 untuk batas kontrol).
Dua-duanya diperbaiki: `dashboard__tool-list` sekarang memakai `padding-inline` alih-alih
margin negatif pada anaknya, dan `border-strong` digelapkan dari `#9c8f8a` ke `#948780`.

**Alternatif & konsekuensi:**

| Opsi | Konsekuensi |
|------|-------------|
| A | Ganti identitas warna lagi — ditolak, warna maron + emas adalah pilihan user (DEC-031) |
| B | Glassmorphism / gradient | Berlawanan dengan §9 SOURCE_OF_TRUTH (tanpa gradient) dan menurunkan kontras teks |
| C | Bayangan tebal untuk hierarki | Terlihat seperti template dan menambah bobot visual di chrome yang sudah gelap |
| D | **Border + spacing + satu aksen** (dipilih) | Hierarki terbaca, chrome tetap ringan, kontras non-teks lebih mudah dijaga ≥3:1 |

**Dampak:** Tidak ada perubahan perilaku, teks yang diuji, maupun kontrak IPC. Semua label
tetap Bahasa Indonesia (DEC-006) dan navigasi tetap berupa link. Total test 108 → 109.
Bukti objektif yang dikumpulkan: 24 pasangan warna lolos (rasio teks terendah 4.95:1,
rasio non-teks terendah 3.02:1), layout diukur pada 1584 px (tiga kolom), 1264 px (dua kolom),
dan 404 px (drawer), lalu alur lima langkah dijalankan sampai halaman hasil pada Compressor,
Resizer, dan Converter memakai bridge palsu — tanpa overflow horizontal, tanpa teks terpotong,
dan tanpa overlap antar langkah.

**Status:** ACCEPTED — pass visual berikutnya harus menambah fitur, bukan gaya.

## DEC-035

**Tanggal:** 2026-10-05
**Keputusan:** Library PDF yang dipilih adalah **pdf-lib v1.17.1** (MIT). Membaca kelebihan:

- Murni JavaScript, tidak butuh native build (cocok dengan Electron + distribusi portable).
- Dapat menyisipkan JPEG apa adanya tanpa rekompresi (hal ini menjaga kualitas sumber).
- Bisa menyisipkan PNG (non-transparan). Tidak ada dependency berlapis berlebihan.
- Teruji untuk kasus "gambar jadi halaman" (drawImage).
- Alternatif pdfkit juga MIT, tapi API-nya streaming/canvas-style dan lebih banyak boilerplate.

**Aturan untuk Image → PDF (Phase 4):**

1. `pageSize`: "wajib pilih tiap kali" (A4, Letter, atau "Ikuti gambar"). Tidak ada default
   agar tidak ada asumsi yang menyesatkan untuk dokumen resmi (DEC-015).
2. `Orientasi` per gambar: halaman mengikuti sisi terpanjang gambar (`landscape` jika
   lebar > tinggi, sebaliknya `portrait`). Eksplisit tidak memaksa portrait.
3. Tidak ada margin (0). Gambar difit (scale) dengan menjaga rasio aspek, dipusatkan. Hal ini
   membuat "Ikuti gambar" identik dengan 1 px = 1 pt.
4. `EXIF orientation` **tidak** diputar ulang di PDF. pdf-lib embed image bytes apa adanya;
   viewer PDF tidak akan menerapkan EXIF. Oleh karena itu, untuk foto HP yang "miring", proses
   butuh pipeline (rotate sebelum embed) — tetapi Phase 4 saat ini tidak menambah rotate
   opsional. Keputusan ini dibuat berdasarkan data: sampel dengan EXIF orientation masih
   ditampilkan miring di beberapa viewer bila hanya di-embed; bila user butuh perbaikan,
   mereka bisa pakai Image Converter/Resize (yang sudah punya `.rotate()`). Dicatat sebagai
   `PARKED` untuk kemungkinan penambahan "Koreksi orientasi EXIF" sederhana.
5. **Transparansi dan WEBP.** PDF tidak mendukung kanal alpha dan tidak menerima WEBP natively.
   - PNG ber-transparansi → di-flatten ke latar putih (`flatten({ background: '#ffffff' }`) lalu
     di-encode ulang sebagai JPEG dengan kualitas `PDF_FALLBACK_QUALITY = 92`.
   - WEBP → diubah ke JPEG 92 (flatten ke putih jika ber-alpha).
   - JPEG dan PNG opak → di-embed apa adanya (lossless reference).
6. Batasan: maksimal 100 gambar, total 250 MB. 250 MB adalah trade-off RAM (pdf-lib di memori)
   dengan kebutuhan penggunaan lokal.
7. Nama output: `nama-gambar-pertama.pdf` dengan penambah ` (n)` jika konflik.
8. UI: reorder halaman (naik/turun), peringatan jumlah gambar yang akan di-flatten, "1 halaman"
   per entri, dan status page size wajib dipilih.

**Alasan:** Membatasi keputusan ke tiga saja (size, orientasi per gambar, margin 0) menghindari
over-spec. Fokus pada hasil yang dapat diprediksi dan tidak merusak kualitas. Tidak add
placeholder library (tidak ada pdfkit digunakan).

**Dampak:** Halaman `/convert/image-to-pdf` berstatus `READY` (dari sebelumnya COMING_SOON),
ada engine terpisah `pdfEngine.ts`, operasi `toPdf` di main/preload/renderer, 11 test unit
untuk pdfEngine, test integration terbarui. Total test 109 → 120.
**Status:** ACCEPTED
