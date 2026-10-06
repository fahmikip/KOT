import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import {
  PDF_PAGE_SIZES,
  composePdf,
  fitWithinPage,
  isPdfPageSize,
  resolvePageBox,
  type PdfImageInput
} from '../../src/main/pdfEngine'
import { PDF_ALPHA_FLATTENED, PDF_REENCODED, pdfEmbedPlan } from '../../src/main/imageEngine'

/** PNG 1×1 opaque dan JPEG kecil supaya test tidak butuh file di disk. */
const PNG_1X1 = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  ),
  (character) => character.charCodeAt(0)
)

async function jpegBytes(): Promise<Uint8Array> {
  const buffer = await sharp({
    create: { width: 120, height: 80, channels: 3, background: '#7a1f2b' }
  })
    .jpeg({ quality: 95 })
    .toBuffer()
  return new Uint8Array(buffer)
}

function image(overrides: Partial<PdfImageInput> = {}): PdfImageInput {
  return { name: 'foto.jpg', bytes: PNG_1X1, width: 1200, height: 800, format: 'png', ...overrides }
}

describe('resolvePageBox', () => {
  it('menjadikan sisi terpanjang gambar sebagai sisi panjang kertas A4', () => {
    const landscape = resolvePageBox('a4', 1200, 800)
    expect(landscape.orientation).toBe('landscape')
    expect(landscape.width).toBeCloseTo(841.89, 1)
    expect(landscape.height).toBeCloseTo(595.28, 1)

    const portrait = resolvePageBox('a4', 800, 1200)
    expect(portrait.orientation).toBe('portrait')
    expect(portrait.width).toBeCloseTo(595.28, 1)
    expect(portrait.height).toBeCloseTo(841.89, 1)
  })

  it('memakai ukuran Letter dalam point', () => {
    const box = resolvePageBox('letter', 800, 1200)
    expect(box.orientation).toBe('portrait')
    expect(box.width).toBeCloseTo(612, 1)
    expect(box.height).toBeCloseTo(792, 1)
  })

  it('mengubah 1 px = 1 pt untuk mode Ikuti gambar', () => {
    expect(resolvePageBox('fit', 1200, 800)).toEqual({
      width: 1200,
      height: 800,
      orientation: 'landscape'
    })
  })

  it('menolak ukuran halaman dan gambar yang tidak valid', () => {
    expect(() => resolvePageBox('a3' as 'a4', 100, 100)).toThrow(/page size/i)
    expect(() => resolvePageBox('a4', 0, 100)).toThrow(/dimensions/i)
    expect(() => resolvePageBox('fit', 20_000, 10)).toThrow(/too large/i)
  })

  it('mengenali hanya tiga ukuran halaman yang didukung', () => {
    for (const size of PDF_PAGE_SIZES) expect(isPdfPageSize(size)).toBe(true)
    for (const size of ['a3', 'legal', '', null, 3]) expect(isPdfPageSize(size)).toBe(false)
  })
})

describe('fitWithinPage', () => {
  it('menjaga rasio aspek dan memusatkan gambar, bukan meregangkan', () => {
    const box = resolvePageBox('a4', 1000, 1000)
    const placement = fitWithinPage(2000, 1000, box)

    expect(placement.width / placement.height).toBeCloseTo(2, 5)
    expect(placement.width).toBeCloseTo(box.width, 5)
    expect(placement.x).toBeCloseTo(0, 5)
    expect(placement.x + placement.width).toBeCloseTo(box.width, 5)
    expect(placement.y + placement.height / 2).toBeCloseTo(box.height / 2, 5)
  })
})

describe('pdfEmbedPlan', () => {
  it('menyisipkan JPEG dan PNG opak apa adanya', () => {
    expect(pdfEmbedPlan({ format: 'jpeg', hasAlpha: false } as never)).toEqual({
      format: 'jpeg',
      lossless: true,
      notes: []
    })
    expect(pdfEmbedPlan({ format: 'png', hasAlpha: false } as never)).toEqual({
      format: 'png',
      lossless: true,
      notes: []
    })
  })

  it('mengubah WEBP dan gambar transparan ke JPEG di atas putih', () => {
    expect(pdfEmbedPlan({ format: 'webp', hasAlpha: false } as never)).toEqual({
      format: 'jpeg',
      lossless: false,
      notes: [PDF_REENCODED]
    })
    expect(pdfEmbedPlan({ format: 'png', hasAlpha: true } as never).notes).toEqual([
      PDF_REENCODED,
      PDF_ALPHA_FLATTENED
    ])
  })
})

describe('composePdf', () => {
  it('menulis satu halaman per gambar dengan ukuran A4 dan orientasi per gambar', async () => {
    const result = await composePdf(
      [image({ width: 1600, height: 900 }), image({ width: 900, height: 1600 })],
      'a4'
    )
    const text = Buffer.from(result.bytes).toString('latin1')

    expect(result.pageCount).toBe(2)
    expect(result.pages[0].orientation).toBe('landscape')
    expect(result.pages[1].orientation).toBe('portrait')
    expect(text.startsWith('%PDF-')).toBe(true)
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true)

    // Baca ulang hasilnya supaya assertion ikut memverifikasi PDF-nya benar-benar valid.
    const reloaded = await PDFDocument.load(result.bytes)
    expect(reloaded.getPageCount()).toBe(2)
    const landscape = reloaded.getPage(0).getSize()
    const portrait = reloaded.getPage(1).getSize()
    expect(landscape.width).toBeCloseTo(841.89, 1)
    expect(landscape.height).toBeCloseTo(595.28, 1)
    expect(portrait.width).toBeCloseTo(595.28, 1)
    expect(portrait.height).toBeCloseTo(841.89, 1)
  })

  it('menyisipkan JPEG apa adanya tanpa mengubahnya', async () => {
    const bytes = await jpegBytes()
    const result = await composePdf([image({ bytes, format: 'jpeg', width: 120, height: 80 })], 'fit')

    expect(result.pageCount).toBe(1)
    expect(result.pages[0]).toEqual({ width: 120, height: 80, orientation: 'landscape' })
    expect(Buffer.from(result.bytes).includes(Buffer.from(bytes))).toBe(true)
    expect(Buffer.from(result.bytes).toString('latin1')).toContain('/DCTDecode')
  })

  it('menolak batch kosong', async () => {
    await expect(composePdf([], 'a4')).rejects.toThrow(/between 1 and 100/i)
  })
})
