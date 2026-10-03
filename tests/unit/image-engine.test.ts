import { mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SKIP_SAME_FORMAT, SKIP_TRANSPARENCY, calculateDimensions, processImage, type ImageTargetFormat, type ProcessRequest } from '../../src/main/imageEngine'

let directory: string
let original: Buffer
let jpgPath: string

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'kot-image-'))
  original = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#2872ad' } }).jpeg({ quality: 95 }).toBuffer()
  jpgPath = join(directory, 'foto.jpg')
  await writeFile(jpgPath, original)
})

/**
 * Catatan: libvips memegang file input sampai instance di-GC sehingga Windows
 * masih mengunci .webp saat temp dir dihapus. Kegagalan lock diabaikan agar test
 * engine tidak bergantung pada timing GC.
 */
afterEach(async () => {
  await rm(directory, { recursive: true, force: true }).catch(() => undefined)
})

/** Baca metadata lalu lepas handle file; Windows mengunci file yang masih dibuka libvips. */
async function metadataOf(path: string) {
  const image = sharp(path)
  try {
    return await image.metadata()
  } finally {
    await image.destroy()
  }
}

function fileRef(path: string, name = path.split(/[\\/]/).pop() ?? 'image') {
  return stat(path).then((details) => ({ name, path, size: details.size }))
}

async function run(path: string, operation: 'compress' | 'resize', resize?: ProcessRequest['resize']) {
  return processImage({ operation, files: [await fileRef(path)], quality: 80, destination: directory, resize }, () => undefined)
}

describe('image processing engine', () => {
  it.each(['jpg', 'jpeg', 'png'] as const)('compresses valid %s and preserves the original', async (format) => {
    const pipeline = sharp({ create: { width: 80, height: 60, channels: 3, background: '#2a73aa' } })
    const input = await (format === 'jpg' || format === 'jpeg' ? pipeline.jpeg() : format === 'png' ? pipeline.png() : pipeline.webp()).toBuffer()
    const source = join(directory, `input-${format}-${Date.now()}.${format}`)
    await writeFile(source, input)
    const result = await run(source, 'compress')
      expect(result[0].status).toBe('success')
      expect(await readFile(source)).toEqual(input)
      const output = sharp(result[0].outputPath!)
      expect(await output.metadata()).toMatchObject({ format: format === 'jpg' || format === 'jpeg' ? 'jpeg' : format })
      await output.toBuffer()
      expect(result[0].outputSize).toBe((await stat(result[0].outputPath!)).size)
    expect(result[0].outputPath).toContain('-compressed.')
  })

  it('decodes and re-encodes WEBP locally', async () => {
    const input = await sharp({ create: { width: 80, height: 60, channels: 3, background: '#2a73aa' } }).webp().toBuffer()
    const output = await sharp(input).webp({ quality: 80 }).toBuffer()
    const metadata = await sharp(output).metadata()
    expect(metadata).toMatchObject({ format: 'webp', width: 80, height: 60 })
    expect(output.length).toBeGreaterThan(0)
  })

  it('chooses a collision-safe output name', async () => {
    await writeFile(join(directory, 'foto-compressed.jpg'), 'existing')
    const result = await run(jpgPath, 'compress')
    expect(result[0].outputPath).toContain('foto-compressed (2).jpg')
    expect(await readFile(jpgPath)).toEqual(original)
  })

  it.each([
    [{ mode: 'width', value: 60, maintainAspectRatio: true }, { width: 60, height: 40 }],
    [{ mode: 'height', value: 40, maintainAspectRatio: true }, { width: 60, height: 40 }],
    [{ mode: 'percentage', value: 50, maintainAspectRatio: true }, { width: 60, height: 40 }]
  ] as const)('resizes with actual dimensions and preserved ratio', async (resize, dimensions) => {
    const result = await run(jpgPath, 'resize', resize)
    expect(result[0]).toMatchObject({ status: 'success', ...dimensions })
    expect(await metadataOf(result[0].outputPath!)).toMatchObject(dimensions)
    expect(await readFile(jpgPath)).toEqual(original)
  })

  it('reports invalid and empty images per file and continues a batch', async () => {
    const emptyPath = join(directory, 'empty.png')
    const fakePath = join(directory, 'fake.jpg')
    await writeFile(emptyPath, Buffer.alloc(0))
    await writeFile(fakePath, 'not an image')
    const progress = vi.fn()
    const results = await processImage({ operation: 'compress', files: [await fileRef(fakePath), await fileRef(jpgPath), await fileRef(emptyPath)], quality: 80, destination: directory }, progress)
    expect(results.map((result) => result.status)).toEqual(['failed', 'success', 'failed'])
    expect(results[0].error).not.toMatch(/Error:|Sharp|DOMException/)
    expect(progress.mock.calls.at(-1)?.[0]).toMatchObject({ completed: 3, total: 3 })
  })

  it('rejects upscaling, zero sizes, and percentages above 100', async () => {
    const metadata = await sharp(jpgPath).metadata()
    expect(() => calculateDimensions(metadata, { mode: 'width', value: 121, maintainAspectRatio: true })).toThrow()
    expect(() => calculateDimensions(metadata, { mode: 'height', value: 0, maintainAspectRatio: true })).toThrow()
    expect(() => calculateDimensions(metadata, { mode: 'percentage', value: 101, maintainAspectRatio: true })).toThrow()
  })
})

describe('image conversion engine', () => {
  const opaque = async (format: 'png' | 'webp'): Promise<string> => {
    const path = join(directory, `opaque.${format}`)
    const create = sharp({ create: { width: 120, height: 80, channels: 3, background: '#2872ad' } })
    await writeFile(path, format === 'png' ? await create.png().toBuffer() : await create.webp().toBuffer())
    return path
  }

  const transparent = async (): Promise<string> => {
    const path = join(directory, 'transparan.png')
    await writeFile(path, await sharp({ create: { width: 120, height: 80, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer())
    return path
  }

  const convert = async (path: string, target: ImageTargetFormat) => processImage({ operation: 'convert', files: [await fileRef(path)], quality: 80, destination: directory, convert: { target } }, () => undefined)

  it.each([
    ['jpg', 'png', 'png', '-converted.png'],
    ['jpg', 'webp', 'webp', '-converted.webp'],
    ['png', 'jpg', 'jpeg', '-converted.jpg'],
    ['webp', 'jpg', 'jpeg', '-converted.jpg'],
    ['webp', 'png', 'png', '-converted.png']
  ] as const)('converts %s to %s without changing dimensions', async (from, to, expectedFormat, nameSuffix) => {
    const path = from === 'jpg' ? jpgPath : await opaque(from)
    const before = await readFile(path)
    const result = await convert(path, to)
    expect(result[0].status).toBe('success')
    expect(result[0].outputPath).toContain(nameSuffix)
    expect(await metadataOf(result[0].outputPath!)).toMatchObject({ format: expectedFormat, width: 120, height: 80 })
    expect(await readFile(path)).toEqual(before)
  })

  it('skips a transparent image instead of flattening it into JPG', async () => {
    const path = await transparent()
    const result = await convert(path, 'jpg')
    expect(result[0]).toMatchObject({ status: 'skipped', reason: SKIP_TRANSPARENCY })
    expect(result[0].outputPath).toBeUndefined()
    expect(await readdir(directory)).not.toContain('transparan-converted.jpg')
  })

  it('skips a file that already uses the target format', async () => {
    const result = await convert(jpgPath, 'jpg')
    expect(result[0]).toMatchObject({ status: 'skipped', reason: SKIP_SAME_FORMAT })
    expect(await readdir(directory)).not.toContain('foto-converted.jpg')
  })

  it('converts a transparent image to WEBP', async () => {
    const path = await transparent()
    const result = await convert(path, 'webp')
    expect(result[0].status).toBe('success')
    expect((await metadataOf(result[0].outputPath!)).format).toBe('webp')
  })

  it('reports a corrupt file and still converts the rest of the batch', async () => {
    const fakePath = join(directory, 'rusak.webp')
    await writeFile(fakePath, 'not an image')
    const progress = vi.fn()
    const results = await processImage({ operation: 'convert', files: [await fileRef(fakePath), await fileRef(jpgPath), await fileRef(await transparent())], quality: 80, destination: directory, convert: { target: 'jpg' } }, progress)
    expect(results.map((result) => result.status)).toEqual(['failed', 'skipped', 'skipped'])
    expect(results[0].error).not.toMatch(/Error:|Sharp|DOMException/)
    expect(progress.mock.calls.at(-1)?.[0]).toMatchObject({ completed: 3, total: 3 })
  })

  it('uses a collision-safe output name and never writes outside the destination', async () => {
    await writeFile(join(directory, 'foto-converted.png'), 'existing')
    const result = await convert(jpgPath, 'png')
    expect(result[0].outputPath).toContain('foto-converted (2).png')
    expect(basename(dirname(result[0].outputPath!))).toBe(basename(directory))
  })

  it('rejects an unsupported target format', async () => {
    await expect(processImage({ operation: 'convert', files: [await fileRef(jpgPath)], quality: 80, destination: directory, convert: { target: 'gif' as ImageTargetFormat } }, () => undefined)).rejects.toThrow()
    await expect(processImage({ operation: 'convert', files: [await fileRef(jpgPath)], quality: 80, destination: directory }, () => undefined)).rejects.toThrow()
  })
})
