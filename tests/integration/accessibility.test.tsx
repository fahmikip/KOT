import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderAppAt } from '../helpers/renderApp'
import { setViewport } from '../setup'

describe('accessibility (Phase 1 §16)', () => {
  it('memakai heading level 1 yang tepat di setiap halaman', () => {
    setViewport(true)

    for (const path of ['/', '/pdf/merge', '/utility/date', '/tidak-ada']) {
      const { unmount } = renderAppAt(path)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      unmount()
    }
  })

  it('hierarki heading pada dashboard tidak melompat', () => {
    setViewport(true)
    renderAppAt('/')

    const levels = screen
      .getAllByRole('heading')
      .map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toContain(1)

    // Level tidak boleh melompat naik lebih dari 1 (mis. h1 lalu h3).
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }
  })

  it('tidak ada heading level 1 ganda di halaman Coming Soon', () => {
    setViewport(true)
    renderAppAt('/pdf/merge')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('navigasi memakai elemen link, bukan button', () => {
    setViewport(true)
    renderAppAt('/')
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })

    expect(nav.querySelectorAll('a').length).toBeGreaterThan(0)
    expect(nav.querySelectorAll('button')).toHaveLength(0)
  })

  it('elemen interaktif pada konten adalah button atau link, bukan div', () => {
    setViewport(true)
    renderAppAt('/pdf/split')

    const main = screen.getByRole('main')
    expect(main.querySelectorAll('div[onclick], span[onclick]')).toHaveLength(0)
  })

  it('tombol navigasi mobile punya accessible name', () => {
    setViewport(false)
    renderAppAt('/')

    expect(screen.getByRole('button', { name: /buka menu navigasi/i })).toBeInTheDocument()
  })

  it('menu navigasi bisa difokus dan diaktifkan dengan keyboard', async () => {
    const user = userEvent.setup()
    setViewport(true)
    renderAppAt('/')

    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })
    const mergeLink = within(nav).getByRole('link', { name: /^Merge/i })

    mergeLink.focus()
    expect(mergeLink).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { level: 1, name: /^Merge/i })).toBeInTheDocument()
  })

  it('elemen interaktif tidak disembunyikan dari tab order', () => {
    setViewport(false)
    renderAppAt('/')

    const menuButton = screen.getByRole('button', { name: /buka menu navigasi/i })
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })

    expect(menuButton).not.toHaveAttribute('tabindex', '-1')
    for (const link of within(nav).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('tabindex', '-1')
    }
  })
})

describe('semantik dokumen', () => {
  it('memakai landmark header, navigation, main, dan footer', () => {
    setViewport(true)
    renderAppAt('/')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /navigasi utama/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('halaman Coming Soon memakai elemen article', () => {
    setViewport(true)
    renderAppAt('/utility/qr')

    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})
