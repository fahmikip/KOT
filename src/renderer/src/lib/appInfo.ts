/**
 * Metadata aplikasi.
 *
 * Nilai versi di-inject oleh electron.vite.config.ts pada saat build
 * (define __APP_VERSION__), sehingga tidak perlu IPC/preload untuk_phase ini.
 */

export const APP_NAME = 'KPU Office Tools'

export const APP_VERSION = __APP_VERSION__

/**
 * Wajib tampil di aplikasi (DEC-003). Aplikasi ini bukan aplikasi resmi KPU.
 */
export const APP_DISCLAIMER =
  'KPU Office Tools adalah alat bantu internal. Bukan aplikasi resmi KPU dan bukan aplikasi kepemiluan.'

/** Major/minor version saja, untuk header. */
export const APP_SHORT_VERSION = APP_VERSION.split('.').slice(0, 2).join('.')