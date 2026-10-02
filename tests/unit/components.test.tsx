import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '@/components/Alert'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FileDropZone } from '@/components/FileDropZone'
import { Loading } from '@/components/Loading'

describe('Button', () => {
  it('merender sebagai elemen button dengan type default button', () => {
    render(<Button>Aksi</Button>)

    const button = screen.getByRole('button', { name: 'Aksi' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('memanggil onClick saat diklik', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Proses</Button>)

    await user.click(screen.getByRole('button', { name: 'Proses' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('tidak bisa diklik saat disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Proses
      </Button>
    )

    await user.click(screen.getByRole('button', { name: 'Proses' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('menerapkan class variant dan size', () => {
    render(
      <Button variant="primary" size="sm">
        Simpan
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Simpan' })
    expect(button.className).toContain('button--primary')
    expect(button.className).toContain('button--sm')
  })
})

describe('Badge', () => {
  it('merender label status', () => {
    render(<Badge tone="info">Coming Soon</Badge>)

    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })
})

describe('Card', () => {
  it('merender konten di dalam elemen yang diminta', () => {
    const { container } = render(
      <Card as="section">
        <p>Isi</p>
      </Card>
    )

    expect(container.querySelector('section.card')).not.toBeNull()
    expect(screen.getByText('Isi')).toBeInTheDocument()
  })
})

describe('Alert', () => {
  it('merender judul dan body', () => {
    render(
      <Alert tone="warning" title="Perhatian">
        <p>Detail</p>
      </Alert>
    )

    expect(screen.getByText('Perhatian')).toBeInTheDocument()
    expect(screen.getByText('Detail')).toBeInTheDocument()
  })

  it('danger memakai role alert, info memakai role status', () => {
    const { rerender } = render(<Alert tone="danger" title="Gagal" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal')

    rerender(<Alert tone="info" title="Info" />)
    expect(screen.getByRole('status')).toHaveTextContent('Info')
  })
})

describe('Loading', () => {
  it('merender pesan memuat dengan role status', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toHaveTextContent('Memuat...')
  })

  it('menampilkan label kustom', () => {
    render(<Loading label="Membuka berkas" />)

    expect(screen.getByText('Membuka berkas...')).toBeInTheDocument()
  })
})

describe('FileDropZone (Phase 1 §12 — UI saja)', () => {
  it('merender area drop dengan aksi Choose Files', () => {
    render(<FileDropZone />)

    const area = screen.getByRole('button')
    expect(area).toBeInTheDocument()
    expect(screen.getByText('Drop file di sini')).toBeInTheDocument()
    expect(screen.getByText('Choose Files')).toBeInTheDocument()
  })

  it('area drop adalah button sehingga dapat diakses keyboard', () => {
    render(<FileDropZone />)

    expect(screen.getByRole('button').tagName).toBe('BUTTON')
  })

  it('menampilkan drag state saat dragover', async () => {
    render(<FileDropZone />)
    const area = screen.getByRole('button')

    const { fireEvent } = await import('@testing-library/react')
    fireEvent.dragEnter(area)

    expect(area.className).toContain('dropzone__area--dragging')
  })

  it('menghapus drag state saat dragleave', async () => {
    render(<FileDropZone />)
    const area = screen.getByRole('button')

    const { fireEvent } = await import('@testing-library/react')
    fireEvent.dragEnter(area)
    fireEvent.dragLeave(area)

    expect(area.className).not.toContain('dropzone__area--dragging')
  })

  it('menampilkan selected state berisi nama file', () => {
    render(<FileDropZone />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    const file = new File(['isi'], 'Dokumen_Rapat.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(screen.getByText('Dokumen_Rapat.pdf')).toBeInTheDocument()
  })

  it('tidak mengirim file ke mana pun (Phase 1 §12)', () => {
    render(<FileDropZone />)

    // Tidak ada fetch, XMLHttpRequest, WebSocket, atau beacon diPhase 1.
    expect(globalThis.fetch).toBeDefined()
    expect(document.querySelector('form')).toBeNull()
  })
})