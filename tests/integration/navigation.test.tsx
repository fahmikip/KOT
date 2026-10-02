import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TOOLS } from '@/lib/routes'
import { renderAppAt } from '../helpers/renderApp'

describe('navigasi: dashboard (Phase 1 §19)', () => {
  it('dashboard dapat dibuka di /', () => {
    renderAppAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /alat bantu sederhana/i })).toBeVisible()
  })
})

describe('navigasi: setiap route tool', () => {
  it.each(TOOLS.filter((tool) => tool.status === 'coming-soon').map((tool) => ({ path: tool.path, label: tool.label })))(
    'route $path terbuka dan menampilkan Coming Soon',
    ({ path }) => {
      renderAppAt(path)

      // "Coming Soon" muncul di sidebar (13 badge) dan di halaman, jadi pakai getAllByText.
      expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0)
      expect(screen.getByText(/tidak ada file yang diproses pada halaman ini/i)).toBeInTheDocument()
    }
  )

  it.each(TOOLS.filter((tool) => tool.status === 'ready').map((tool) => ({ path: tool.path, id: tool.id })))(
    'route $path membuka tool yang diimplementasikan', ({ path, id }) => {
      renderAppAt(path)
      expect(screen.queryByText(/tidak ada file yang diproses pada halaman ini/i)).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(id).toMatch(/^image-/)
    }
  )
})

describe('navigasi: route tidak ditemukan', () => {
  it('menampilkan 404 yang sesuai', () => {
    renderAppAt('/halaman-yang-tidak-ada')

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: /halaman tidak ditemukan/i })
    ).toBeVisible()
  })

  it('404 menampilkan alamat yang diminta', () => {
    renderAppAt('/halaman-yang-tidak-ada')
    expect(screen.getByText('/halaman-yang-tidak-ada')).toBeInTheDocument()
  })
})

describe('navigasi: sidebar', () => {
  it('sidebar muncul pada layout', () => {
    renderAppAt('/')
    expect(screen.getByRole('navigation', { name: /navigasi utama/i })).toBeInTheDocument()
  })

  it('sidebar memuat semua menu tool', () => {
    renderAppAt('/')
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })
    const linkCount = within(nav).getAllByRole('link').length

    // 1 link Dashboard + 13 link tool
    expect(linkCount).toBe(TOOLS.length + 1)
  })

  it('menu dikelompokkan ke 5 grup', () => {
    renderAppAt('/')
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })

    const groupLabels = Array.from(nav.querySelectorAll('.sidebar__group-label')).map(
      (element) => element.textContent
    )

    expect(groupLabels).toEqual(['Image Tools', 'PDF Tools', 'Convert', 'File Tools', 'Utilities'])
  })
})

describe('navigasi: interaksi menu', () => {
  it('klik menu Merge membuka halaman Merge', async () => {
    const user = userEvent.setup()
    renderAppAt('/')
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })

    await user.click(within(nav).getByRole('link', { name: /merge/i }))

    expect(screen.getByRole('heading', { level: 1, name: /^Merge/i })).toBeInTheDocument()
  })

  it('klik menu Split lalu Dashboard kembali ke dashboard', async () => {
    const user = userEvent.setup()
    renderAppAt('/')
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i })

    await user.click(within(nav).getByRole('link', { name: /split/i }))
    expect(screen.getByRole('heading', { level: 1, name: /^Split$/i })).toBeInTheDocument()

    await user.click(within(nav).getByRole('link', { name: /^Dashboard$/i }))
    expect(screen.getByRole('heading', { level: 1, name: /alat bantu sederhana/i })).toBeVisible()
  })

  it('link di Dashboard membuka tool yang dipilih', async () => {
    const user = userEvent.setup()
    renderAppAt('/')

    await user.click(screen.getByRole('link', { name: 'Batch Rename' }))

    expect(screen.getByRole('heading', { level: 1, name: /^Batch Rename$/i })).toBeInTheDocument()
  })

  it('halaman Coming Soon punya link kembali ke Dashboard', async () => {
    const user = userEvent.setup()
    renderAppAt('/pdf/merge')

    await user.click(screen.getByRole('link', { name: /kembali ke dashboard/i }))

    expect(screen.getByRole('heading', { level: 1, name: /alat bantu sederhana/i })).toBeVisible()
  })
})
