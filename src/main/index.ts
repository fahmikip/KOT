import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'

/**
 * Main process — Phase 1.
 *
 * Kewajiban Phase 1 ini hanya: membuka window, mengatur siklus hidup aplikasi, dan
 * menerapkan posture keamanan dasar. TIDAK ada pemrosesan file, TIDAK ada IPC, dan
 * karena itu TIDAK ada preload (context bridge) — tidak ada yang perlu diekspos ke
 * renderer. Berkas preload baru dibuat pada phase yang benar-benar membutuhkan IPC.
 *
 * Lihat ARCHITECTURE.md dan SOURCE_OF_TRUTH.md § SECURITY PRINCIPLES.
 */

const isDev = process.env.NODE_ENV === 'development'

/** Nama window di taskbar dan daftar aplikasi. */
const APP_WINDOW_TITLE = 'KPU Office Tools'

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 480,
    show: false,
    title: APP_WINDOW_TITLE,
    backgroundColor: '#f4f6f8',
    webPreferences: {
      // Posture keamanan renderer (DEC-007 / SECURITY PRINCIPLES).
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      // Tidak ada akses remote dari renderer.
      webviewTag: false
    }
  })

  // Tampilkan window hanya setelah siap digambar agar tidak ada flash putih.
  window.once('ready-to-show', () => {
    window.show()
  })

  // Renderer hanya boleh memuat konten dari file lokal. Navigasi keluar dari
  // aplikasi tidak boleh dimuat di dalam window aplikasi.
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    const currentUrl = window.webContents.getURL()
    if (url !== currentUrl) {
      event.preventDefault()
    }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // Perilaku macOS: klik ikon dock saat tidak ada window aktif.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})