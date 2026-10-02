import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppAt } from '../helpers/renderApp'
import { setViewport } from '../setup'

describe('application shell (Phase 1 §6, §8)', () => {
  it('header menampilkan nama aplikasi', () => {
    setViewport(true)
    renderAppAt('/')

    expect(screen.getByText('KPU Office Tools')).toBeInTheDocument()
  })

  it('header menampilkan versi aplikasi', () => {
    setViewport(true)
    renderAppAt('/')

    // Versi berasal dari __APP_VERSION__; pada test nilainya fallback test runner.
    const versionElement = document.querySelector('.header__version')
    expect(versionElement).not.toBeNull()
    expect(versionElement?.textContent).toMatch(/^v\d+\.\d+$/)
  })

  it('footer menampilkan disclaimer bukan aplikasi resmi (DEC-003)', () => {
    setViewport(true)
    renderAppAt('/')

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText(/bukan aplikasi resmi KPU/i)).toBeInTheDocument()
  })

  it('dashboard menampilkan lima kategori tanpa statistik palsu', () => {
    setViewport(true)
    renderAppAt('/')

    expect(screen.getByText('Pilih alat yang ingin digunakan.')).toBeInTheDocument()

    for (const label of ['Image Tools', 'PDF Tools', 'Convert', 'File Tools', 'Utilities']) {
      expect(screen.getByRole('heading', { level: 2, name: label })).toBeInTheDocument()
    }
  })

  it('dashboard tidak menampilkan angka atau statistik palsu', () => {
    setViewport(true)
    renderAppAt('/')

    const text = document.body.textContent ?? ''

    expect(text).not.toMatch(/\d+\s*files?\s*processed/i)
    expect(text).not.toMatch(/\d+%\s*compression/i)
    expect(text).not.toMatch(/\d+\s*recent/i)
    expect(text).not.toMatch(/\d+\s*saved\s*projects?/i)
  })

  it('layout memiliki area konten utama', () => {
    setViewport(true)
    renderAppAt('/')

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(within(main).getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('coming soon page (Phase 1 §14)', () => {
  it('menampilkan judul tool dan status Coming Soon', () => {
    setViewport(true)
    renderAppAt('/pdf/rotate')

    expect(screen.getByRole('heading', { level: 1, name: /^Rotate$/i })).toBeInTheDocument()
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0)
  })

  it('menyatakan bahwa tidak ada file yang diproses', () => {
    setViewport(true)
    renderAppAt('/image/compress')

    expect(screen.getByText(/tidak ada file yang diproses pada halaman ini/i)).toBeInTheDocument()
  })

  it('tidak punya tombol aksi yang menyesatkan', () => {
    setViewport(true)
    renderAppAt('/pdf/compress')

    // Halaman Coming Soon hanya boleh punya tombol navigasi, tidak tombol proses.
    const buttons = screen.queryAllByRole('button').filter((button) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      return !label.includes('menu navigasi')
    })

    expect(buttons).toHaveLength(0)
  })

  it('tidak punya input file', () => {
    setViewport(true)
    renderAppAt('/file/zip')

    expect(document.querySelector('input[type="file"]')).toBeNull()
  })
})