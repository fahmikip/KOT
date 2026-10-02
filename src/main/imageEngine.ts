import { randomUUID } from 'node:crypto'
import { basename, extname, join } from 'node:path'
import { copyFile, open, readFile, stat, unlink } from 'node:fs/promises'
import sharp, { type Metadata } from 'sharp'

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
export const MAX_IMAGE_BYTES = 100 * 1024 * 1024
export const MAX_BATCH_FILES = 100

export type ImageOperation = 'compress' | 'resize'
export type ResizeOptions =
  | { mode: 'width'; value: number; maintainAspectRatio: true }
  | { mode: 'height'; value: number; maintainAspectRatio: true }
  | { mode: 'percentage'; value: number; maintainAspectRatio: true }

export interface ProcessRequest {
  operation: ImageOperation
  files: Array<{ name: string; path: string; size: number }>
  quality: number
  destination: string
  resize?: ResizeOptions
}

export interface ImageProcessResult {
  name: string
  status: 'success' | 'failed'
  outputPath?: string
  originalSize: number
  outputSize?: number
  width?: number
  height?: number
  error?: string
}

export interface ImageProgress { completed: number; total: number; currentFile: string; result?: ImageProcessResult }

export function isAllowedImagePath(path: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(path).toLowerCase())
}

function imageOutputName(name: string, operation: ImageOperation, suffix = ''): string {
  const extension = extname(name)
  const stem = basename(name, extension).replace(/[<>:"/\\|?*]/g, '_').replace(/[. ]+$/g, '') || 'image'
  const operationSuffix = operation === 'compress' ? '-compressed' : '-resized'
  return `${stem}${operationSuffix}${suffix}${extension.toLowerCase()}`
}

async function reserveOutputPath(sourcePath: string, destination: string, operation: ImageOperation): Promise<string> {
  const folder = destination
  const originalName = basename(sourcePath)
  for (let index = 0; index < 10000; index += 1) {
    const suffix = index === 0 ? '' : ` (${index + 1})`
    const candidate = join(folder, imageOutputName(originalName, operation, suffix))
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

function mapError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('100 MB')) return 'Ukuran file melebihi batas 100 MB.'
  if (message.includes('Width') || message.includes('Height') || message.includes('Percentage') || message.includes('Upscaling')) return 'Dimensi tidak valid. Periksa nilai dan pastikan ukuran tidak melebihi gambar asli.'
  if (message.includes('format') || message.includes('Unsupported')) return 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
  return 'File tidak dapat diproses. Format file mungkin tidak didukung atau gambar rusak.'
}

export async function processImage(request: ProcessRequest, onProgress: (progress: ImageProgress) => void): Promise<ImageProcessResult[]> {
  if (!Array.isArray(request.files) || request.files.length === 0 || request.files.length > MAX_BATCH_FILES) throw new Error('Select between 1 and 100 image files')
  if (!Number.isInteger(request.quality) || request.quality < 10 || request.quality > 100) throw new Error('Quality must be between 10 and 100')
  const results: ImageProcessResult[] = []
  for (let index = 0; index < request.files.length; index += 1) {
    const file = request.files[index]
    onProgress({ completed: index, total: request.files.length, currentFile: file.name })
    try {
      const metadata = await validateImageFile(file)
      const outputPath = await reserveOutputPath(file.name, request.destination, request.operation)
      const temporaryPath = `${outputPath}.${randomUUID()}.tmp`
      try {
        let pipeline = sharp(file.path, { limitInputPixels: 100_000_000, failOn: 'error' }).rotate()
        if (request.operation === 'resize') {
          if (!request.resize) throw new Error('Resize options are missing')
          pipeline = pipeline.resize(calculateDimensions(metadata, request.resize))
        }
        if (metadata.format === 'jpeg') pipeline = pipeline.jpeg({ quality: request.quality })
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
      results.push({ name: file.name, status: 'success', outputPath, originalSize: file.size, outputSize: outputStat.size, width: outputMetadata.width, height: outputMetadata.height })
    } catch (error) {
      console.error(`[image:${request.operation}] ${file.name}`, error)
      results.push({ name: file.name, status: 'failed', originalSize: file.size, error: mapError(error) })
    }
    onProgress({ completed: index + 1, total: request.files.length, currentFile: file.name, result: results[results.length - 1] })
  }
  return results
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
