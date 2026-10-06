import { randomUUID } from 'node:crypto'
import { basename, extname, join } from 'node:path'
import { copyFile, open, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import sharp, { type Metadata } from 'sharp'
import { composePdf, isPdfPageSize, type PdfImageInput, type PdfPageSize } from './pdfEngine'

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
export const IMAGE_TARGET_FORMATS = ['png', 'jpg', 'webp'] as const
export const MAX_IMAGE_BYTES = 100 * 1024 * 1024
export const MAX_BATCH_FILES = 100

/**
 * Batas total byte gambar yang boleh jadi satu PDF.
 *
 * pdf-lib menyusun dokumen di memori, jadi 100 file × 100 MB bisa menghabiskan
 * RAM. 250 MB membuat PDF hasil yang masih realistis untuk diarsipkan, dan
 * proses tidak bisa membuat aplikasi kehabisan memori tanpa jejak.
 */
export const MAX_PDF_INPUT_BYTES = 250 * 1024 * 1024

/** Kualitas re-encode hanya untuk format yang tidak bisa di-embed apa adanya. */
export const PDF_FALLBACK_QUALITY = 92

export type ImageTargetFormat = (typeof IMAGE_TARGET_FORMATS)[number]
export type ImageOperation = 'compress' | 'resize' | 'convert'
export type ResizeOptions =
  | { mode: 'width'; value: number; maintainAspectRatio: true }
  | { mode: 'height'; value: number; maintainAspectRatio: true }
  | { mode: 'percentage'; value: number; maintainAspectRatio: true }

export const SKIP_SAME_FORMAT = 'Format file sudah sama dengan format tujuan.'
export const SKIP_TRANSPARENCY = 'Gambar memiliki transparansi. Warna latar untuk konversi ke JPG belum ditentukan.'
export const PDF_ALPHA_FLATTENED = 'Gambar transparan diletakkan di atas latar putih.'
export const PDF_REENCODED = 'Format gambar tidak bisa di-embed ke PDF tanpa diubah.'

const TARGET_EXTENSION: Record<ImageTargetFormat, string> = { png: '.png', jpg: '.jpg', webp: '.webp' }
const TARGET_METADATA_FORMAT: Record<ImageTargetFormat, string> = { png: 'png', jpg: 'jpeg', webp: 'webp' }

export interface ConvertOptions {
  target: ImageTargetFormat
}

export interface ProcessRequest {
  operation: ImageOperation
  files: Array<{ name: string; path: string; size: number }>
  quality: number
  destination: string
  resize?: ResizeOptions
  convert?: ConvertOptions
}

export interface ImageProcessResult {
  name: string
  status: 'success' | 'failed' | 'skipped'
  outputPath?: string
  originalSize: number
  outputSize?: number
  width?: number
  height?: number
  error?: string
  reason?: string
}

export interface ImageProgress { completed: number; total: number; currentFile: string; result?: ImageProcessResult }

export interface PdfRequest {
  files: Array<{ name: string; path: string; size: number }>
  destination: string
  pageSize: PdfPageSize
}

export interface PdfSkipped {
  name: string
  reason: string
}

export interface PdfProcessResult {
  name: string
  status: 'success' | 'failed'
  outputPath?: string
  pageCount: number
  originalSize: number
  outputSize?: number
  notes: PdfSkipped[]
  error?: string
}

export function isAllowedImagePath(path: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(path).toLowerCase())
}

function imageOutputName(name: string, operation: ImageOperation, suffix = '', target?: ImageTargetFormat): string {
  const extension = extname(name)
  const stem = basename(name, extension).replace(/[<>:"/\\|?*]/g, '_').replace(/[. ]+$/g, '') || 'image'
  const operationSuffix = operation === 'compress' ? '-compressed' : operation === 'resize' ? '-resized' : '-converted'
  const outputExtension = operation === 'convert' && target ? TARGET_EXTENSION[target] : extension.toLowerCase()
  return `${stem}${operationSuffix}${suffix}${outputExtension}`
}

async function reserveOutputPath(sourcePath: string, destination: string, operation: ImageOperation, target?: ImageTargetFormat): Promise<string> {
  const folder = destination
  const originalName = basename(sourcePath)
  for (let index = 0; index < 10000; index += 1) {
    const suffix = index === 0 ? '' : ` (${index + 1})`
    const candidate = join(folder, imageOutputName(originalName, operation, suffix, target))
    try {
      const reservation = await open(candidate, 'wx')
      await reservation.close()
      return candidate
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') continue
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return candidate
      throw error
    }
  }
  throw new Error('No available output name')
}

export async function validateImageFile(file: ProcessRequest['files'][number]): Promise<Metadata> {
  if (!file.name || !isAllowedImagePath(file.path) || !IMAGE_EXTENSIONS.has(extname(file.name).toLowerCase())) throw new Error('Unsupported image format')
  const details = await stat(file.path)
  if (!details.isFile() || details.size === 0 || details.size !== file.size) throw new Error('Invalid file')
  if (details.size > MAX_IMAGE_BYTES) throw new Error('Image exceeds the 100 MB limit')
  const image = sharp(file.path, { limitInputPixels: 100_000_000 })
  const metadata = await image.metadata()
  await image.destroy()
  if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height) throw new Error('Unsupported or invalid image')
  return metadata
}

export function calculateDimensions(metadata: Metadata, resize: ResizeOptions): { width: number; height: number } {
  if (!metadata.width || !metadata.height) throw new Error('Invalid dimensions')
  let width: number
  let height: number
  if (resize.mode === 'percentage') {
    if (resize.value <= 0 || resize.value > 100) throw new Error('Percentage must be between 1 and 100')
    width = Math.max(1, Math.round((metadata.width * resize.value) / 100))
    height = Math.max(1, Math.round((metadata.height * resize.value) / 100))
  } else if (resize.mode === 'width') {
    if (resize.value <= 0 || resize.value > metadata.width) throw new Error('Width must be between 1 and the original width')
    width = Math.round(resize.value)
    height = Math.max(1, Math.round((metadata.height * width) / metadata.width))
  } else {
    if (resize.value <= 0 || resize.value > metadata.height) throw new Error('Height must be between 1 and the original height')
    height = Math.round(resize.value)
    width = Math.max(1, Math.round((metadata.width * height) / metadata.height))
  }
  if (width > metadata.width || height > metadata.height) throw new Error('Upscaling is disabled')
  return { width, height }
}

export function conversionSkipReason(metadata: Metadata, target: ImageTargetFormat): string | undefined {
  if (metadata.format === TARGET_METADATA_FORMAT[target]) return SKIP_SAME_FORMAT
  if (target === 'jpg' && metadata.hasAlpha) return SKIP_TRANSPARENCY
  return undefined
}

function mapError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('100 MB')) return 'Ukuran file melebihi batas 100 MB.'
  if (message.includes('target format')) return 'Format tujuan tidak valid. Pilih PNG, JPG, atau WEBP.'
  if (message.includes('Width') || message.includes('Height') || message.includes('Percentage') || message.includes('Upscaling')) return 'Dimensi tidak valid. Periksa nilai dan pastikan ukuran tidak melebihi gambar asli.'
  if (message.includes('format') || message.includes('Unsupported')) return 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
  return 'File tidak dapat diproses. Format file mungkin tidak didukung atau gambar rusak.'
}

async function processOne(request: ProcessRequest, file: ProcessRequest['files'][number], target?: ImageTargetFormat): Promise<ImageProcessResult> {
  const metadata = await validateImageFile(file)
  if (request.operation === 'convert' && target) {
    const reason = conversionSkipReason(metadata, target)
    if (reason) return { name: file.name, status: 'skipped', originalSize: file.size, reason }
  }
  const outputPath = await reserveOutputPath(file.name, request.destination, request.operation, target)
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`
  try {
    let pipeline = sharp(file.path, { limitInputPixels: 100_000_000, failOn: 'error' }).rotate()
    if (request.operation === 'resize') {
      if (!request.resize) throw new Error('Resize options are missing')
      pipeline = pipeline.resize(calculateDimensions(metadata, request.resize))
    }
    if (request.operation === 'convert' && target) {
      if (target === 'jpg') pipeline = pipeline.jpeg({ quality: request.quality })
      else if (target === 'webp') pipeline = pipeline.webp({ quality: request.quality })
      else pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
    } else if (metadata.format === 'jpeg') pipeline = pipeline.jpeg({ quality: request.quality })
    else if (metadata.format === 'webp') pipeline = pipeline.webp({ quality: request.quality })
    else pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
    await pipeline.toFile(temporaryPath)
    await pipeline.destroy()
    const outputFile = await open(outputPath, 'w')
    try {
      await outputFile.writeFile(await readFile(temporaryPath))
    } catch (error) {
      await outputFile.close()
      await unlink(outputPath).catch(() => undefined)
      throw error
    } finally {
      await outputFile.close().catch(() => undefined)
    }
  } finally {
    await unlink(temporaryPath).catch(() => undefined)
  }
  const outputStat = await stat(outputPath)
  const outputImage = sharp(outputPath)
  const outputMetadata = await outputImage.metadata()
  await outputImage.destroy()
  return { name: file.name, status: 'success', outputPath, originalSize: file.size, outputSize: outputStat.size, width: outputMetadata.width, height: outputMetadata.height }
}

export async function processImage(request: ProcessRequest, onProgress: (progress: ImageProgress) => void): Promise<ImageProcessResult[]> {
  if (!Array.isArray(request.files) || request.files.length === 0 || request.files.length > MAX_BATCH_FILES) throw new Error('Select between 1 and 100 image files')
  if (!Number.isInteger(request.quality) || request.quality < 10 || request.quality > 100) throw new Error('Quality must be between 10 and 100')
  const target = request.operation === 'convert' ? request.convert?.target : undefined
  if (request.operation === 'convert' && (!target || !IMAGE_TARGET_FORMATS.includes(target))) throw new Error('Unsupported target format')
  const results: ImageProcessResult[] = []
  for (let index = 0; index < request.files.length; index += 1) {
    const file = request.files[index]
    onProgress({ completed: index, total: request.files.length, currentFile: file.name })
    let result: ImageProcessResult
    try {
      result = await processOne(request, file, target)
    } catch (error) {
      console.error(`[image:${request.operation}] ${file.name}`, error)
      result = { name: file.name, status: 'failed', originalSize: file.size, error: mapError(error) }
    }
    results.push(result)
    onProgress({ completed: index + 1, total: request.files.length, currentFile: file.name, result })
  }
  return results
}

function pdfOutputName(name: string, suffix = ''): string {
  const extension = extname(name)
  const stem = basename(name, extension).replace(/[<>:"/\\|?*]/g, '_').replace(/[. ]+$/g, '') || 'image'
  return `${stem}${suffix}.pdf`
}

/** Nama PDF mengikuti gambar pertama; benturan mendapat ` (2)`, ` (3)`, dst. */
async function reservePdfPath(firstFileName: string, destination: string): Promise<string> {
  for (let index = 0; index < 10000; index += 1) {
    const candidate = join(destination, pdfOutputName(firstFileName, index === 0 ? '' : ` (${index + 1})`))
    try {
      const reservation = await open(candidate, 'wx')
      await reservation.close()
      return candidate
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') continue
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return candidate
      throw error
    }
  }
  throw new Error('No available output name')
}

export interface PdfEmbedPlan {
  format: 'jpeg' | 'png'
  /** true berarti byte asli bisa dipakai tanpa rekompresi. */
  lossless: boolean
  notes: string[]
}

/**
 * Rencanakan cara satu gambar masuk ke PDF.
 *
 * PDF tidak punya kanal alpha dan pdf-lib hanya menerima JPEG dan PNG, jadi PNG
 * ber-transparansi dan WEBP harus di-flatten ke putih lalu di-encode ulang
 * (DEC-035). JPEG dan PNG opak di-embed apa adanya supaya tidak ada kualitas
 * yang hilang dan ukuran PDF tetap mendekati jumlah file asli.
 */
export function pdfEmbedPlan(metadata: Metadata): PdfEmbedPlan {
  const transparent = metadata.hasAlpha === true
  if (metadata.format === 'jpeg' && !transparent) return { format: 'jpeg', lossless: true, notes: [] }
  if (metadata.format === 'png' && !transparent) return { format: 'png', lossless: true, notes: [] }
  const notes = [PDF_REENCODED]
  if (transparent) notes.push(PDF_ALPHA_FLATTENED)
  return { format: 'jpeg', lossless: false, notes }
}

async function preparePdfImage(
  file: PdfRequest['files'][number],
  metadata: Metadata,
  plan: PdfEmbedPlan
): Promise<PdfImageInput> {
  if (plan.lossless) {
    return {
      name: file.name,
      bytes: await readFile(file.path),
      width: metadata.width as number,
      height: metadata.height as number,
      format: plan.format
    }
  }
  const flattened = await sharp(file.path, { limitInputPixels: 100_000_000, failOn: 'error' })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: PDF_FALLBACK_QUALITY })
    .toBuffer()
  return {
    name: file.name,
    bytes: new Uint8Array(flattened),
    width: metadata.width as number,
    height: metadata.height as number,
    format: 'jpeg'
  }
}

function mapPdfError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('total size')) return 'Total ukuran gambar melebihi batas 250 MB untuk satu PDF.'
  if (message.includes('100 MB')) return 'Ukuran file melebihi batas 100 MB.'
  if (message.includes('page size')) return 'Ukuran halaman tidak valid. Pilih A4, Letter, atau Ikuti gambar.'
  if (message.includes('too large')) return 'Ukuran gambar terlalu besar untuk dijadikan halaman PDF.'
  if (message.includes('format') || message.includes('Unsupported')) return 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
  return 'PDF tidak dapat dibuat. Periksa jumlah gambar dan ruang penyimpanan, lalu coba lagi.'
}

/** Gabung semua gambar yang valid menjadi satu PDF; file asli tidak pernah disentuh. */
export async function processImagesToPdf(
  request: PdfRequest,
  onProgress: (progress: Omit<ImageProgress, 'result'>) => void
): Promise<PdfProcessResult> {
  if (!Array.isArray(request.files) || request.files.length === 0 || request.files.length > MAX_BATCH_FILES) throw new Error('Select between 1 and 100 image files')
  if (!isPdfPageSize(request.pageSize)) throw new Error('Unsupported PDF page size')
  const totalSize = request.files.reduce((sum, file) => sum + (Number.isFinite(file.size) ? file.size : 0), 0)
  if (totalSize > MAX_PDF_INPUT_BYTES) throw new Error('Exceeds the PDF total size limit')

  const notes: PdfSkipped[] = []
  const images: PdfImageInput[] = []
  let embeddedBytes = 0

  for (let index = 0; index < request.files.length; index += 1) {
    const file = request.files[index]
    onProgress({ completed: index, total: request.files.length, currentFile: file.name })
    try {
      const metadata = await validateImageFile(file)
      const plan = pdfEmbedPlan(metadata)
      const image = await preparePdfImage(file, metadata, plan)
      for (const note of plan.notes) notes.push({ name: file.name, reason: note })
      embeddedBytes += image.bytes.length
      images.push(image)
    } catch (error) {
      console.error(`[image:toPdf] ${file.name}`, error)
      notes.push({ name: file.name, reason: mapPdfError(error) })
    }
    onProgress({ completed: index + 1, total: request.files.length, currentFile: file.name })
  }

  if (!images.length) {
    return {
      name: pdfOutputName(request.files[0].name),
      status: 'failed',
      pageCount: 0,
      originalSize: totalSize,
      notes,
      error: 'Tidak ada gambar yang bisa dimasukkan ke PDF. Pilih ulang gambar yang valid.'
    }
  }

  try {
    const composed = await composePdf(images, request.pageSize)
    const outputPath = await reservePdfPath(request.files[0].name, request.destination)
    await writeFile(outputPath, composed.bytes)
    const outputStat = await stat(outputPath)
    return {
      name: basename(outputPath),
      status: 'success',
      outputPath,
      pageCount: composed.pages.length,
      originalSize: embeddedBytes,
      outputSize: outputStat.size,
      notes
    }
  } catch (error) {
    console.error('[image:toPdf] compose', error)
    return {
      name: pdfOutputName(request.files[0].name),
      status: 'failed',
      pageCount: 0,
      originalSize: totalSize,
      notes,
      error: mapPdfError(error)
    }
  }
}

export async function chooseDestination(paths: string[], folder: string): Promise<number> {
  let saved = 0
  for (const sourcePath of paths) {
    const name = basename(sourcePath)
    const extension = extname(name)
    const stem = basename(name, extension)
    let destination = join(folder, name)
    for (let index = 2; ; index += 1) {
      try { await copyFile(sourcePath, destination, 1); saved += 1; break }
      catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') { destination = join(folder, `${stem} (${index})${extension}`); continue }
        throw error
      }
    }
  }
  return saved
}
