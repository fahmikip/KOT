import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { FileDropZone } from '@/components/FileDropZone'
import './ImageToolPage.css'

type Operation = 'compress' | 'resize' | 'convert'
type ResizeMode = 'width' | 'height' | 'percentage'
interface SelectedFile extends ImageFileRef { valid?: boolean; width?: number; height?: number; format?: string; hasAlpha?: boolean; error?: string }

interface ImageToolPageProps { operation: Operation }

const ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
const TARGET_OPTIONS: Array<{ value: ImageTargetFormat; label: string; hint: string }> = [
  { value: 'png', label: 'PNG', hint: 'Lossless, mendukung transparansi' },
  { value: 'jpg', label: 'JPG', hint: 'Ringan, tidak mendukung transparansi' },
  { value: 'webp', label: 'WEBP', hint: 'Ringan, mendukung transparansi' }
]
const TARGET_EXTENSION: Record<ImageTargetFormat, string> = { png: 'png', jpg: 'jpg', webp: 'webp' }
const INPUT_FORMAT_TO_TARGET: Record<string, ImageTargetFormat> = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp' }

export function ImageToolPage({ operation }: ImageToolPageProps) {
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [quality, setQuality] = useState(80)
  const [destination, setDestination] = useState<string | null>(null)
  const [mode, setMode] = useState<ResizeMode>('width')
  const [value, setValue] = useState('')
  const [target, setTarget] = useState<ImageTargetFormat>('png')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ImageProgress | null>(null)
  const [results, setResults] = useState<ImageProcessResult[]>([])
  const [message, setMessage] = useState<{ tone: 'danger' | 'success' | 'info'; text: string } | null>(null)
  const title = operation === 'compress' ? 'Kompres Gambar' : operation === 'resize' ? 'Ubah Ukuran Gambar' : 'Konversi Gambar'
  const validFiles = useMemo(() => files.filter((file) => file.valid), [files])
  const inputFormats = useMemo(() => new Set(validFiles.map((file) => file.format ? INPUT_FORMAT_TO_TARGET[file.format] : undefined).filter((format): format is ImageTargetFormat => Boolean(format))), [validFiles])
  const sharedInputFormat = inputFormats.size === 1 ? Array.from(inputFormats)[0] : undefined
  const targetUnavailable = operation === 'convert' && sharedInputFormat === target
  const transparentCount = validFiles.filter((file) => file.hasAlpha).length
  const resizeValue = Number(value)
  const resizeInvalid = operation === 'resize' && (!Number.isInteger(resizeValue) || resizeValue <= 0 || resizeValue > (mode === 'percentage' ? 100 : Number.MAX_SAFE_INTEGER))

  const inspectFiles = useCallback(async (incoming: ImageFileRef[]) => {
    const unique = new Map<string, ImageFileRef>()
    for (const file of incoming) unique.set(file.path.toLowerCase(), file)
    const selected = Array.from(unique.values()).slice(0, 100)
    if (incoming.length > 100) setMessage({ tone: 'info', text: 'Batch dibatasi hingga 100 file. File sisanya tidak ditambahkan.' })
    if (!selected.length) return
    setBusy(true)
    setMessage(null)
    setResults([])
    try {
      const inspected = await window.imageTools.inspect(selected)
      setFiles((previous) => {
        const old = new Map(previous.map((file) => [file.path.toLowerCase(), file]))
        for (const [index, entry] of inspected.entries()) old.set(selected[index].path.toLowerCase(), { ...selected[index], valid: entry.valid, width: entry.width, height: entry.height, format: entry.format, hasAlpha: entry.hasAlpha, error: entry.error })
        return Array.from(old.values()).slice(0, 100)
      })
    } catch {
      setMessage({ tone: 'danger', text: 'File tidak dapat diperiksa. Pilih ulang file gambar yang valid.' })
    } finally {
      setBusy(false)
    }
  }, [])

  const handleDrop = useCallback((dropped: File[]) => {
    const refs = dropped.flatMap((file) => {
      const path = (file as File & { path?: string }).path
      return path ? [{ name: file.name, path, size: file.size }] : []
    })
    if (!refs.length) {
      setMessage({ tone: 'danger', text: 'Aplikasi tidak dapat membaca lokasi file. Gunakan tombol Pilih file atau Pilih folder.' })
      return
    }
    void inspectFiles(refs)
  }, [inspectFiles])

  useEffect(() => window.imageTools.onProgress(setProgress), [])

  const addFromPicker = async (folder: boolean): Promise<void> => {
    setBusy(true)
    try {
      const chosen = folder ? await window.imageTools.chooseFolder() : await window.imageTools.chooseImages()
      await inspectFiles(chosen)
    } catch {
      setMessage({ tone: 'danger', text: 'File tidak dapat dibuka. Periksa izin akses lalu coba lagi.' })
      setBusy(false)
    }
  }

  const run = async (): Promise<void> => {
    if (!validFiles.length || resizeInvalid) return
    setBusy(true)
    setResults([])
    setProgress({ completed: 0, total: validFiles.length, currentFile: validFiles[0].name })
    setMessage(null)
    try {
      let outputFolder = destination
      if (!outputFolder) {
        outputFolder = await window.imageTools.chooseDestination()
        if (!outputFolder) {
          setBusy(false)
          setMessage({ tone: 'info', text: 'Pilih folder hasil untuk melanjutkan proses.' })
          return
        }
        setDestination(outputFolder)
      }
      const resize: ImageResizeOptions | undefined = operation === 'resize'
        ? { mode, value: resizeValue, maintainAspectRatio: true }
        : undefined
      const convert = operation === 'convert' ? { target } : undefined
      const completed = await window.imageTools.process({ operation, files: validFiles, quality, destination: outputFolder, resize, convert })
      setResults(completed)
      const success = completed.filter((result) => result.status === 'success').length
      const failed = completed.filter((result) => result.status === 'failed').length
      const skipped = completed.filter((result) => result.status === 'skipped').length
      const summary = [`${success} berhasil`]
      if (failed) summary.push(`${failed} gagal`)
      if (skipped) summary.push(`${skipped} dilewati`)
      setMessage({ tone: failed ? (success ? 'info' : 'danger') : 'success', text: `${summary.join(', ')}. File asli tetap aman.` })
    } catch {
      setMessage({ tone: 'danger', text: 'Proses tidak dapat diselesaikan. Periksa ruang penyimpanan dan coba lagi.' })
    } finally {
      setBusy(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const reduction = (result: ImageProcessResult): string => {
    if (!result.outputSize || !result.originalSize) return '—'
    return `${(((result.originalSize - result.outputSize) / result.originalSize) * 100).toFixed(1)}%`
  }

  const invalidWidthOrHeight = operation === 'resize' && mode !== 'percentage' && validFiles.some((file) => {
    const original = mode === 'width' ? file.width : file.height
    return original !== undefined && resizeValue > original
  })

  const exampleOutputName = useMemo(() => {
    const first = validFiles[0]?.name
    if (!first) return '—'
    const stem = first.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*]/g, '_') || 'image'
    return `${stem}-converted.${TARGET_EXTENSION[target]}`
  }, [validFiles, target])

  const handleDropZone = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    const dropped = Array.from(event.dataTransfer.files)
    handleDrop(dropped)
  }

  return (
    <article className="image-tool">
      <header className="image-tool__header">
        <p className="image-tool__eyebrow">Image Tools</p>
        <h1>{title}</h1>
        <p>Semua gambar diproses secara lokal di perangkat ini. File asli tidak diubah.</p>
      </header>

      {message ? <Alert tone={message.tone} title={message.text} /> : null}

      <section className="image-tool__section" aria-labelledby="select-heading">
        <h2 id="select-heading">1. Pilih gambar</h2>
        <div onDrop={handleDropZone} onDragOver={(event) => event.preventDefault()}>
          <FileDropZone accept={ACCEPT} multiple disabled={busy} onDroppedFiles={handleDrop} />
        </div>
        <div className="image-tool__picker-actions">
          <Button disabled={busy} onClick={() => void addFromPicker(false)}>Pilih file</Button>
          <Button disabled={busy} onClick={() => void addFromPicker(true)}>Pilih folder</Button>
          <span>JPG, JPEG, PNG, WEBP · Maksimum 100 MB per file dan 100 file</span>
        </div>
      </section>

      {files.length ? (
        <section className="image-tool__section" aria-labelledby="options-heading">
          <h2 id="options-heading">2. Atur opsi</h2>
          {operation === 'compress' ? (
            <div className="image-tool__control">
              <label htmlFor="image-quality">Kualitas JPEG / WEBP</label>
              <div className="image-tool__range-row">
                <input id="image-quality" type="range" min="10" max="100" step="1" value={quality} disabled={busy} onChange={(event) => setQuality(Number(event.target.value))} />
                <output htmlFor="image-quality">{quality}</output>
              </div>
              <small>PNG memakai kompresi lossless; kualitas JPEG/WEBP tidak mengubah PNG.</small>
            </div>
          ) : operation === 'convert' ? (
            <div className="image-tool__convert-options">
              <span className="image-tool__label" id="convert-target-label">Format tujuan</span>
              <div className="image-tool__formats" role="radiogroup" aria-labelledby="convert-target-label">
                {TARGET_OPTIONS.map((option) => (
                  <label key={option.value} className="image-tool__format">
                    <input type="radio" name="convert-target" value={option.value} checked={target === option.value} disabled={busy || sharedInputFormat === option.value} onChange={() => setTarget(option.value)} />
                    <strong>{option.label}</strong>
                    <small>{option.hint}</small>
                  </label>
                ))}
              </div>
              {sharedInputFormat ? <p className="image-tool__ratio">Format {sharedInputFormat.toUpperCase()} tidak dapat dipilih karena semua gambar sudah memakai format tersebut.</p> : null}
              <p className="image-tool__ratio">Ukuran dan rasio aspek gambar tidak diubah. PNG memakai kompresi lossless, JPG dan WEBP bersifat lossy.</p>
              {target === 'jpg' && transparentCount ? <p className="image-tool__ratio">{transparentCount} gambar memiliki latar transparan dan akan dilewati. Warna latar untuk konversi ke JPG belum ditentukan.</p> : null}
            </div>
          ) : (
            <div className="image-tool__resize-options">
              <div className="image-tool__control">
                <label htmlFor="resize-mode">Mode ukuran</label>
                <select id="resize-mode" value={mode} disabled={busy} onChange={(event) => { setMode(event.target.value as ResizeMode); setValue('') }}>
                  <option value="width">Lebar</option>
                  <option value="height">Tinggi</option>
                  <option value="percentage">Persentase</option>
                </select>
              </div>
              <div className="image-tool__control">
                <label htmlFor="resize-value">{mode === 'width' ? 'Lebar (px)' : mode === 'height' ? 'Tinggi (px)' : 'Persentase (%)'}</label>
                <input id="resize-value" type="number" min="1" max={mode === 'percentage' ? 100 : undefined} step="1" value={value} disabled={busy} onChange={(event) => setValue(event.target.value)} placeholder={mode === 'percentage' ? '50' : '2000'} />
              </div>
              <p className="image-tool__ratio">Rasio aspek dipertahankan. Gambar tidak diperbesar.</p>
            </div>
          )}
        </section>
      ) : null}

      {files.length ? (
        <section className="image-tool__section" aria-labelledby="preview-heading">
          <h2 id="preview-heading">3. Pratinjau</h2>
          <p>{validFiles.length} gambar valid dari {files.length} dipilih.</p>
          <ul className="image-tool__files">
            {files.map((file) => (
              <li key={file.path}>
                <div><strong>{file.name}</strong><span>{file.valid ? `${file.width} × ${file.height} px · ${formatSize(file.size)} · ${file.format?.toUpperCase()}${operation === 'convert' && file.hasAlpha ? ' · ada transparansi' : ''}` : file.error}</span></div>
                <span className={file.valid ? 'image-tool__valid' : 'image-tool__invalid'}>{file.valid ? 'Siap' : 'Gagal validasi'}</span>
              </li>
            ))}
          </ul>
          {operation === 'resize' && validFiles.length === 1 && !resizeInvalid && !invalidWidthOrHeight && value ? (
            <p className="image-tool__dimensions">Ukuran keluaran: {mode === 'percentage' ? `${Math.max(1, Math.round((validFiles[0].width! * resizeValue) / 100))} × ${Math.max(1, Math.round((validFiles[0].height! * resizeValue) / 100))} px` : mode === 'width' ? `${resizeValue} × ${Math.round((validFiles[0].height! * resizeValue) / validFiles[0].width!)} px` : `${Math.round((validFiles[0].width! * resizeValue) / validFiles[0].height!)} × ${resizeValue} px`}</p>
          ) : null}
          {invalidWidthOrHeight ? <p className="image-tool__invalid">Ukuran target melebihi dimensi gambar. Pembesaran tidak diizinkan.</p> : null}
          {operation === 'convert' ? <p className="image-tool__dimensions">Contoh nama keluaran: {exampleOutputName}</p> : null}
        </section>
      ) : null}

      {files.length ? (
        <section className="image-tool__section" aria-labelledby="process-heading">
          <h2 id="process-heading">4. Proses</h2>
          <Button variant="primary" disabled={busy || !validFiles.length || resizeInvalid || invalidWidthOrHeight || targetUnavailable} onClick={() => void run()}>
            {busy ? 'Sedang memproses…' : operation === 'compress' ? `Kompres ${validFiles.length} gambar` : operation === 'resize' ? `Ubah ukuran ${validFiles.length} gambar` : `Konversi ${validFiles.length} gambar`}
          </Button>
          {targetUnavailable ? <p className="image-tool__invalid">Pilih format tujuan yang berbeda dari format gambar.</p> : null}
          {progress ? <p role="status" aria-live="polite">Memproses {progress.completed} / {progress.total}: {progress.currentFile}</p> : null}
        </section>
      ) : null}

      {results.length ? (
        <section className="image-tool__section" aria-labelledby="result-heading">
          <h2 id="result-heading">5. Hasil</h2>
          <ul className="image-tool__results">
            {results.map((result, index) => (
              <li key={`${result.name}-${index}`}>
                <strong>{result.name}</strong>
                {result.status === 'success' ? (
                  <span>{formatSize(result.originalSize)} → {formatSize(result.outputSize ?? 0)} · {reduction(result)} pengurangan{operation === 'resize' ? ` · ${result.width} × ${result.height} px` : ''}</span>
                ) : <span className={result.status === 'skipped' ? 'image-tool__skipped' : 'image-tool__invalid'}>{result.error ?? result.reason}</span>}
              </li>
            ))}
          </ul>
          {destination ? <p>Folder hasil dipilih saat mulai diproses.</p> : null}
        </section>
      ) : null}
    </article>
  )
}
