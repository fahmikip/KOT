import { PDFDocument } from 'pdf-lib'

/**
 * Penulis PDF lokal (bagian UI dari ARCHITECTURE §2 — tidak menyentuh Electron).
 *
 * Satu-satunya keputusan di sini adalah "gambar jadi halaman": setiap gambar
 * menjadi satu halaman, tanpa margin tambahan, tanpa pengubahan dimensi
 * gambar (DEC-015). pdf-lib dipakai karena dapat menyisipkan JPEG apa adanya
 * (tanpa rekompresi) dan tidak butuh build native.
 */

export const PDF_PAGE_SIZES = ['a4', 'letter', 'fit'] as const

export type PdfPageSize = (typeof PDF_PAGE_SIZES)[number]

export const PDF_PAGE_SIZE_LABELS: Record<PdfPageSize, string> = {
  a4: 'A4',
  letter: 'Letter',
  fit: 'Ikuti gambar'
}

/** Ukuran kertas dalam milimeter; orientasi ditentukan per gambar oleh resolvePageBox. */
const PAPER_MM: Record<Exclude<PdfPageSize, 'fit'>, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 }
}

/** 1 mm = 72/25,4 pt. Ruang user PDF selalu dihitung dalam point, bukan piksel. */
const MM_TO_POINTS = 72 / 25.4

/** Batas keras spesifikasi PDF: 200 inci = 14 400 pt per sisi. */
export const MAX_PDF_PAGE_POINTS = 14_400

export interface PdfPageBox {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

export interface PdfImageInput {
  name: string
  bytes: Uint8Array
  width: number
  height: number
  /** Format yang didukung pdf-lib secara native. PNG transparan tidak termasuk. */
  format: 'jpeg' | 'png'
}

export interface PdfResult {
  bytes: Uint8Array
  pageCount: number
  pages: PdfPageBox[]
}

function isLandscape(imageWidth: number, imageHeight: number): boolean {
  return imageWidth > imageHeight
}

/**
 * Kotak halaman untuk satu gambar.
 *
 * - `a4` / `letter`: kertas tetap, orientasi mengikuti gambar (sisi terpanjang jadi sisi panjang).
 * - `fit`: halaman sebesar gambar dalam point, jadi 1 px = 1 pt. Tanpa downsampling dan tanpa
 *   perlu menebak DPI; tradeoff-nya ukuran halaman tidak standar untuk dicetak.
 */
export function resolvePageBox(
  size: PdfPageSize,
  imageWidth: number,
  imageHeight: number
): PdfPageBox {
  if (!PDF_PAGE_SIZES.includes(size)) throw new Error('Unsupported PDF page size')
  if (!Number.isFinite(imageWidth) || !Number.isFinite(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
    throw new Error('Invalid image dimensions')
  }

  if (size === 'fit') {
    const width = Math.round(imageWidth)
    const height = Math.round(imageHeight)
    if (width > MAX_PDF_PAGE_POINTS || height > MAX_PDF_PAGE_POINTS) {
      throw new Error('Image is too large for a PDF page')
    }
    return { width, height, orientation: isLandscape(imageWidth, imageHeight) ? 'landscape' : 'portrait' }
  }

  const paper = PAPER_MM[size]
  const longEdge = Math.max(paper.width, paper.height) * MM_TO_POINTS
  const shortEdge = Math.min(paper.width, paper.height) * MM_TO_POINTS
  return isLandscape(imageWidth, imageHeight)
    ? { width: longEdge, height: shortEdge, orientation: 'landscape' }
    : { width: shortEdge, height: longEdge, orientation: 'portrait' }
}

/**
 * Skalakan gambar agar muat di dalam halaman tanpa meregangkan rasio aspek.
 *
 * Sisa ruang yang tidak tertutup gambar diisi putih oleh viewer PDF — itu
 * konsekuensi margin 0 saat rasio aspek gambar tidak sama dengan kertas, bukan
 * gambar yang diregangkan.
 */
export function fitWithinPage(
  imageWidth: number,
  imageHeight: number,
  box: PdfPageBox
): { width: number; height: number; x: number; y: number } {
  const scale = Math.min(box.width / imageWidth, box.height / imageHeight)
  const width = imageWidth * scale
  const height = imageHeight * scale
  return { width, height, x: (box.width - width) / 2, y: (box.height - height) / 2 }
}

export function isPdfPageSize(value: unknown): value is PdfPageSize {
  return typeof value === 'string' && PDF_PAGE_SIZES.includes(value as PdfPageSize)
}

/** Susun satu PDF; setiap input menjadi satu halaman berurutan. */
export async function composePdf(images: PdfImageInput[], size: PdfPageSize): Promise<PdfResult> {
  if (!Array.isArray(images) || images.length === 0) throw new Error('Select between 1 and 100 image files')

  const document_ = await PDFDocument.create()
  document_.setProducer('KPU Office Tools')
  document_.setCreator('KPU Office Tools')

  const pages: PdfPageBox[] = []
  for (const image of images) {
    const box = resolvePageBox(size, image.width, image.height)
    const page = document_.addPage([box.width, box.height])
    const placement = fitWithinPage(image.width, image.height, box)
    const embedded =
      image.format === 'jpeg'
        ? await document_.embedJpg(image.bytes)
        : await document_.embedPng(image.bytes)
    page.drawImage(embedded, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height
    })
    pages.push(box)
  }

  return { bytes: await document_.save(), pageCount: pages.length, pages }
}