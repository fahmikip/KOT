import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { basename, join, resolve } from 'node:path'
import { readdir, stat } from 'node:fs/promises'
import { MAX_BATCH_FILES, isAllowedImagePath, processImage, processImagesToPdf, validateImageFile, type PdfRequest, type ProcessRequest } from './imageEngine'
import { isPdfPageSize } from './pdfEngine'

const authorizedImages = new Map<number, Set<string>>()

function rememberFiles(webContentsId: number, files: ProcessRequest['files']): void {
  const allowed = authorizedImages.get(webContentsId) ?? new Set<string>()
  for (const file of files) allowed.add(resolve(file.path))
  authorizedImages.set(webContentsId, allowed)
}

async function chooseImages(owner: BrowserWindow): Promise<ProcessRequest['files']> {
  const result = await dialog.showOpenDialog(owner, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Gambar', extensions: ['jpg', 'jpeg', 'png', 'webp'] }] })
  if (result.canceled) return []
  const files = await Promise.all(result.filePaths.slice(0, MAX_BATCH_FILES).map(async (path) => {
    const details = await stat(path)
    return { name: basename(path), path, size: details.size }
  }))
  rememberFiles(owner.webContents.id, files)
  return files
}

async function chooseDestination(webContentsId: number): Promise<string | null> {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
  if (result.canceled || !result.filePaths[0]) return null
  const path = resolve(result.filePaths[0])
  authorizedDestinations.set(webContentsId, path)
  return path
}

const authorizedDestinations = new Map<number, string>()

async function collectImages(directory: string, depth = 0): Promise<ProcessRequest['files']> {
  if (depth > 3) return []
  const entries = await readdir(directory, { withFileTypes: true })
  const files: ProcessRequest['files'] = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isFile() && isAllowedImagePath(path)) {
      const details = await stat(path)
      files.push({ name: entry.name, path, size: details.size })
    } else if (entry.isDirectory() && depth < 3) {
      files.push(...(await collectImages(path, depth + 1)))
    }
    if (files.length >= MAX_BATCH_FILES) break
  }
  return files.slice(0, MAX_BATCH_FILES)
}

function registerImageHandlers(): void {
  ipcMain.handle('image:choose', async (event) => {
    const owner = BrowserWindow.getAllWindows().find((window) => window.webContents.id === event.sender.id)
    return owner ? chooseImages(owner) : []
  })
  ipcMain.handle('image:choose-folder', async (event) => {
    const owner = BrowserWindow.getAllWindows().find((window) => window.webContents.id === event.sender.id)
    const result = await dialog.showOpenDialog(owner!, { properties: ['openDirectory'] })
    if (result.canceled || !result.filePaths[0]) return []
    const files = await collectImages(result.filePaths[0])
    rememberFiles(event.sender.id, files)
    return files
  })
  ipcMain.handle('image:inspect', async (_event, files: ProcessRequest['files']) => {
    if (!Array.isArray(files) || files.length > MAX_BATCH_FILES) throw new Error('Invalid file list')
    const senderId = _event.sender.id
    const allowed = authorizedImages.get(senderId) ?? new Set<string>()
    for (const file of files) {
      if (!file || typeof file.path !== 'string' || !allowed.has(resolve(file.path))) throw new Error('Unapproved image path')
    }
    return Promise.all(files.map(async (file) => {
      try {
        const metadata = await validateImageFile(file)
        return { name: file.name, valid: true, size: file.size, width: metadata.width, height: metadata.height, format: metadata.format, hasAlpha: metadata.hasAlpha === true }
      } catch (error) {
        console.error(`[image:inspect] ${file.name}`, error)
        const message = error instanceof Error ? error.message : ''
        return { name: file.name, valid: false, size: file.size, error: message.includes('100 MB') ? 'Ukuran file melebihi batas 100 MB.' : 'File tidak dapat diproses. Gunakan gambar JPG, JPEG, PNG, atau WEBP yang valid.' }
      }
    }))
  })
  ipcMain.handle('image:choose-destination', (event) => chooseDestination(event.sender.id))
  ipcMain.handle('image:process', async (event, request: ProcessRequest) => {
    if (!request || !['compress', 'resize', 'convert'].includes(request.operation)) throw new Error('Invalid operation')
    const allowed = authorizedImages.get(event.sender.id) ?? new Set<string>()
    if (!Array.isArray(request.files) || request.files.length > MAX_BATCH_FILES || request.files.some((file) => !file || typeof file.path !== 'string' || !allowed.has(resolve(file.path))) || !request.destination || resolve(request.destination) !== authorizedDestinations.get(event.sender.id)) throw new Error('Unapproved image path or destination')
    const sender = event.sender
    return processImage(request, (progress) => { if (!sender.isDestroyed()) sender.send('image:progress', progress) })
  })
  ipcMain.handle('image:to-pdf', async (event, request: PdfRequest) => {
    if (!request || !isPdfPageSize(request.pageSize)) throw new Error('Invalid PDF page size')
    const allowed = authorizedImages.get(event.sender.id) ?? new Set<string>()
    if (!Array.isArray(request.files) || request.files.length > MAX_BATCH_FILES || request.files.some((file) => !file || typeof file.path !== 'string' || !allowed.has(resolve(file.path))) || !request.destination || resolve(request.destination) !== authorizedDestinations.get(event.sender.id)) throw new Error('Unapproved image path or destination')
    const sender = event.sender
    return processImagesToPdf(request, (progress) => { if (!sender.isDestroyed()) sender.send('image:progress', progress) })
  })
}

/** Main process: local image engine, narrow IPC handlers, and secure window lifecycle. */

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
    backgroundColor: '#f7f5f4',
    webPreferences: {
      // Posture keamanan renderer (DEC-007 / SECURITY PRINCIPLES).
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: join(__dirname, '../preload/index.js'),
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
  registerImageHandlers()
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
