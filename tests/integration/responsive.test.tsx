import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderAppAt } from '../helpers/renderApp'
import { setViewport } from '../setup'

function getSidebar(): HTMLElement {
  return screen.getByRole('navigation', { name: /navigasi utama/i })
}

describe('layout responsif — mobile (Phase 1 §15)', () => {
  it('menampilkan tombol menu di header pada mobile', () => {
    setViewport(false)
    renderAppAt('/')

    const menuButton = screen.getByRole('button', { name: /buka menu navigasi/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('tombol menu membuka drawer navigasi', async () => {
    const user = userEvent.setup()
    setViewport(false)
    renderAppAt('/')

    const sidebarWrapper = document.querySelector('.app-layout__sidebar')
    expect(sidebarWrapper).toHaveAttribute('data-open', 'false')

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }))

    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'true')
    expect(screen.getByRole('button', { name: 'Tutup menu navigasi' })).toBeInTheDocument()
  })

  it('menutup drawer kembali saat tombol menu diklik lagi', async () => {
    const user = userEvent.setup()
    setViewport(false)
    renderAppAt('/')

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }))
    await user.click(screen.getByRole('button', { name: 'Tutup menu navigasi' }))

    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'false')
  })

  it('menutup drawer dengan tombol Escape', async () => {
    const user = userEvent.setup()
    setViewport(false)
    renderAppAt('/')

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }))
    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'true')

    await user.keyboard('{Escape}')

    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'false')
  })

  it('menutup drawer ketika memilih menu', async () => {
    const user = userEvent.setup()
    setViewport(false)
    renderAppAt('/')

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }))
    await user.click(within(getSidebar()).getByRole('link', { name: /^Merge/i }))

    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'false')
    expect(screen.getByRole('heading', { level: 1, name: /^Merge/i })).toBeInTheDocument()
  })

  it('menutup drawer ketika backdrop diklik', async () => {
    const user = userEvent.setup()
    setViewport(false)
    renderAppAt('/')

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }))
    await user.click(
      screen.getByRole('button', { name: 'Tutup menu navigasi dengan klik di luar' })
    )

    expect(document.querySelector('.app-layout__sidebar')).toHaveAttribute('data-open', 'false')
  })
})

describe('layout responsif — desktop (Phase 1 §15)', () => {
  it('sidebar tampil permanen tanpa tombol menu', () => {
    setViewport(true)
    renderAppAt('/')

    expect(screen.queryByRole('button', { name: /buka menu navigasi/i })).not.toBeInTheDocument()
    expect(document.querySelector('.app-layout')?.className).toContain('app-layout--desktop')
    expect(document.querySelector('.app-layout__scrim')).toBeNull()
  })

  it('navigasi tetap berfungsi di desktop', async () => {
    const user = userEvent.setup()
    setViewport(true)
    renderAppAt('/')

    await user.click(within(getSidebar()).getByRole('link', { name: /rotate/i }))

    expect(screen.getByRole('heading', { level: 1, name: /^Rotate$/i })).toBeInTheDocument()
  })
})