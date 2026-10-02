import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { APP_DISCLAIMER, APP_NAME, APP_SHORT_VERSION } from '@/lib/appInfo'

function Boom(): never {
  throw new Error('detail teknis yang tidak boleh tampil ke user')
}

describe('error handling foundation (Phase 1 §17)', () => {
  it('menampilkan pesan ramah tanpa detail teknis', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    consoleError.mockRestore()

    expect(screen.getByRole('heading', { level: 1, name: /terjadi kesalahan/i })).toBeVisible()
    expect(
      screen.getByText('Aplikasi mengalami masalah saat membuka halaman ini.')
    ).toBeVisible()
    expect(screen.getByText('Silakan coba kembali.')).toBeVisible()

    const text = document.body.textContent ?? ''
    expect(text).not.toContain('detail teknis yang tidak boleh tampil ke user')
    expect(text).not.toContain('Error:')
  })

  it('menulis detail teknis ke developer log', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )

    const logged = consoleError.mock.calls.flat().join(' ')
    consoleError.mockRestore()

    expect(logged).toContain('detail teknis yang tidak boleh tampil ke user')
  })

  it('merender children tanpa error ketika tidak ada kegagalan', () => {
    render(
      <ErrorBoundary>
        <p>Normal</p>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal')).toBeInTheDocument()
  })
})

describe('app info', () => {
  it('nama aplikasi sesuai SOURCE_OF_TRUTH.md', () => {
    expect(APP_NAME).toBe('KPU Office Tools')
  })

  it('disclaimer menyatakan bukan aplikasi resmi KPU (DEC-003)', () => {
    expect(APP_DISCLAIMER).toMatch(/bukan aplikasi resmi KPU/i)
    expect(APP_DISCLAIMER).toMatch(/bukan aplikasi kepemiluan/i)
  })

  it('versi pendek hanya major.minor', () => {
    expect(APP_SHORT_VERSION).toMatch(/^\d+\.\d+$/)
  })
})