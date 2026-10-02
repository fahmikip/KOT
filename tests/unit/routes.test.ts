import { describe, expect, it } from 'vitest'
import { ALL_PATHS, DASHBOARD_ROUTE, TOOLS, TOOL_GROUPS, toRoutePath, toolsByGroup } from '@/lib/routes'

describe('route registry', () => {
  it('mendaftarkan 13 tool sesuai scope V1', () => {
    expect(TOOLS).toHaveLength(13)
  })

  it('memiliki 5 grup sesuai navigasi Phase 1 §7', () => {
    expect(TOOL_GROUPS.map((group) => group.label)).toEqual([
      'Image Tools',
      'PDF Tools',
      'Convert',
      'File Tools',
      'Utilities'
    ])
  })

  it('menggunakan path persis seperti yang diminta Phase 1 §13', () => {
    expect(ALL_PATHS).toEqual([
      '/',
      '/image/compress',
      '/image/resize',
      '/image/convert',
      '/pdf/compress',
      '/pdf/merge',
      '/pdf/split',
      '/pdf/rotate',
      '/convert/image-to-pdf',
      '/convert/pdf-to-image',
      '/file/batch-rename',
      '/file/zip',
      '/utility/qr',
      '/utility/date'
    ])
  })

  it('tidak memiliki path duplikat', () => {
    expect(new Set(ALL_PATHS).size).toBe(ALL_PATHS.length)
  })

  it('tidak memiliki id duplikat', () => {
    const ids = TOOLS.map((tool) => tool.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('menyimpan seluruh tool pada status coming-soon', () => {
    expect(TOOLS.every((tool) => tool.status === 'coming-soon')).toBe(true)
  })

  it('menghapus garis miring depan untuk path relatif di dalam layout', () => {
    expect(toRoutePath('/pdf/merge')).toBe('pdf/merge')
    expect(toRoutePath(DASHBOARD_ROUTE)).toBe('')
  })

  it('mengelompokkan setiap tool ke grup yang ada', () => {
    const groupIds = new Set(TOOL_GROUPS.map((group) => group.id))

    for (const tool of TOOLS) {
      expect(groupIds.has(tool.group)).toBe(true)
      expect(toolsByGroup(tool.group)).toContain(tool)
    }
  })

  it('menjumlahkan tool per grup sesuai spesifikasi', () => {
    expect(toolsByGroup('image-tools')).toHaveLength(3)
    expect(toolsByGroup('pdf-tools')).toHaveLength(4)
    expect(toolsByGroup('conversion')).toHaveLength(2)
    expect(toolsByGroup('file-tools')).toHaveLength(2)
    expect(toolsByGroup('utilities')).toHaveLength(2)
  })
})