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
| DEC-006 | Bahasa UI | PROPOSED |
| DEC-007 | **Tech stack: Electron + TypeScript + React** | **ACCEPTED** |
| DEC-008 | Engine kompresi PDF | UNDEFINED |
| DEC-009 | Tujuan output file | UNDEFINED |
| DEC-010 | Policy nama file duplikat | UNDEFINED |
| DEC-011 | **Testing framework: Vitest + Testing Library** | **ACCEPTED** |
| DEC-012 | Distribusi & installer | UNDEFINED |
| DEC-013 | Batas ukuran file maksimum | UNDEFINED |
| DEC-014 | PDF → Image: default DPI & page size | UNDEFINED |
| DEC-015 | Image → PDF: default page size | UNDEFINED |
| DEC-016 | ZIP Creator: file vs folder | UNDEFINED |
| DEC-017 | QR: dukungan SVG | CONDITIONAL |
| DEC-018 | Persistensi preferences | UNDEFINED |
| DEC-019 | **Inisialisasi git repository** | **ACCEPTED** |
| DEC-020 | Nama folder project | PROPOSED |
| DEC-021 | Routing memakai HashRouter | ACCEPTED (Phase 1) |
| DEC-022 | Design tokens & palet warna | ACCEPTED (Phase 1) |
| DEC-023 | Tidak ada preload / IPC di Phase 1 | ACCEPTED (Phase 1) |
| DEC-024 | Styling: CSS biasa + token | ACCEPTED (Phase 1) |
| DEC-025 | Registry route sebagai sumber tunggal | ACCEPTED (Phase 1) |
| DEC-026 | Folder features/ dan services/ belum dibuat | ACCEPTED (Phase 1) |

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
**Status:** ACCEPTED — dapat direvisi bila perlu

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
