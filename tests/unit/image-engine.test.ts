import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateDimensions, processImage, type ProcessRequest } from '../../src/main/imageEngine'

let directory: string
let original: Buffer
let jpgPath: string

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'kot-image-'))
  original = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#2872ad' } }).jpeg({ quality: 95 }).toBuffer()
  jpgPath = join(directory, 'foto.jpg')
  await writeFile(jpgPath, original)
})

afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  await rm(directory, { recursive: true, force: true })
})

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
    expect(await sharp(result[0].outputPath).metadata()).toMatchObject(dimensions)
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
