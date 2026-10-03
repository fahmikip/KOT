import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderAppAt } from '../helpers/renderApp'

type ImageToolsMock = {
  chooseImages: ReturnType<typeof vi.fn>
  inspect: ReturnType<typeof vi.fn>
  chooseDestination: ReturnType<typeof vi.fn>
  process: ReturnType<typeof vi.fn>
}

const tools = window.imageTools as unknown as ImageToolsMock

const jpegFile = { name: 'foto.jpg', path: 'C:\\src\\foto.jpg', size: 2048 }
const transparentPng = { name: 'logo.png', path: 'C:\\src\\logo.png', size: 1024 }

function inspection(name: string, format: string, hasAlpha: boolean) {
  return { name, valid: true, size: 1024, width: 120, height: 80, format, hasAlpha }
}

async function selectFiles(files: typeof jpegFile[], inspected: ReturnType<typeof inspection>[]) {
  tools.chooseImages.mockResolvedValue(files)
  tools.inspect.mockResolvedValue(inspected)
  await userEvent.click(screen.getByRole('button', { name: 'Pilih file' }))
  await screen.findByText('2. Atur opsi')
}

describe('Image Converter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tools.chooseImages.mockResolvedValue([])
    tools.inspect.mockResolvedValue([])
    tools.chooseDestination.mockResolvedValue('C:\\hasil')
    tools.process.mockResolvedValue([])
  })

  it('menampilkan lima langkah dan pilihan format tujuan', async () => {
    renderAppAt('/image/convert')
    expect(screen.getByRole('heading', { level: 1, name: 'Konversi Gambar' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '1. Pilih gambar' })).toBeInTheDocument()

    await selectFiles([jpegFile], [inspection('foto.jpg', 'jpeg', false)])

    expect(screen.getByRole('radio', { name: /PNG/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /JPG/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /WEBP/ })).toBeInTheDocument()
  })

  it('menonaktifkan format tujuan yang sama dengan format gambar', async () => {
    renderAppAt('/image/convert')
    await selectFiles([transparentPng], [inspection('logo.png', 'png', false)])
    expect(screen.getByRole('radio', { name: /^PNG/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /WEBP/ })).toBeEnabled()
  })

  it('memperingatkan gambar transparan saat target JPG dipilih', async () => {
    renderAppAt('/image/convert')
    await selectFiles([transparentPng], [inspection('logo.png', 'png', true)])
    await userEvent.click(screen.getByRole('radio', { name: /JPG/ }))
    expect(screen.getByText(/Warna latar untuk konversi ke JPG belum ditentukan/)).toBeInTheDocument()
  })

  it('mengirim operasi convert dengan format tujuan yang dipilih', async () => {
    renderAppAt('/image/convert')
    await selectFiles([jpegFile], [inspection('foto.jpg', 'jpeg', false)])
    await userEvent.click(screen.getByRole('radio', { name: /WEBP/ }))
    tools.process.mockResolvedValue([
      { name: 'foto.jpg', status: 'success', outputPath: 'C:\\hasil\\foto-converted.webp', originalSize: 2048, outputSize: 1024, width: 120, height: 80 }
    ])
    await userEvent.click(screen.getByRole('button', { name: 'Konversi 1 gambar' }))
    await waitFor(() => expect(tools.process).toHaveBeenCalledTimes(1))
    expect(tools.process).toHaveBeenCalledWith(expect.objectContaining({ operation: 'convert', convert: { target: 'webp' } }))
    expect(screen.getByText(/1 berhasil/)).toBeInTheDocument()
  })

  it('melaporkan file yang dilewati beserta alasannya', async () => {
    renderAppAt('/image/convert')
    await selectFiles([jpegFile], [inspection('foto.jpg', 'jpeg', false)])
    await userEvent.click(screen.getByRole('radio', { name: /JPG/ }))
    tools.process.mockResolvedValue([
      { name: 'foto.jpg', status: 'skipped', originalSize: 2048, reason: 'Format file sudah sama dengan format tujuan.' }
    ])
    await userEvent.click(screen.getByRole('button', { name: 'Konversi 1 gambar' }))
    await waitFor(() => expect(tools.process).toHaveBeenCalled())
    expect(screen.getByText('Format file sudah sama dengan format tujuan.')).toBeInTheDocument()
    expect(screen.getByText(/0 berhasil, 1 dilewati/)).toBeInTheDocument()
  })
})