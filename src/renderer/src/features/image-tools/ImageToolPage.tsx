import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { FileDropZone } from '@/components/FileDropZone'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import './ImageToolPage.css'

type Operation = 'compress' | 'resize' | 'convert'
type ResizeMode = 'width' | 'height' | 'percentage'

interface SelectedFile extends ImageFileRef {
  valid?: boolean
  width?: number
  height?: number
  format?: string
  hasAlpha?: boolean
  error?: string
}

interface ImageToolPageProps {
  operation: Operation
}

const TITLES: Record<Operation, string> = {
  compress: 'Kompres Gambar',
  resize: 'Ubah Ukuran Gambar',
  convert: 'Konversi Gambar'
}

const PROCESS_LABELS: Record<Operation, string> = {
  compress: 'Kompres',
  resize: 'Ubah ukuran',
  convert: 'Konversi'
}

const TARGET_OPTIONS: Array<{ value: ImageTargetFormat; label: string; hint: string }> = [
  { value: 'png', label: 'PNG', hint: 'Lossless, mendukung transparansi' },
  { value: 'jpg', label: 'JPG', hint: 'Ringan, tidak mendukung transparansi' },
  { value: 'webp', label: 'WEBP', hint: 'Ringan, mendukung transparansi' }
]

const TARGET_EXTENSION: Record<ImageTargetFormat, string> = { png: 'png', jpg: 'jpg', webp: 'webp' }

const INPUT_FORMAT_TO_TARGET: Record<string, ImageTargetFormat> = {
  jpeg: 'jpg',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp'
}

const FORMAT_HINT = 'JPG, JPEG, PNG, WEBP · Maksimum 100 MB per file dan 100 file'
const MAX_PERCENTAGE = 100

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDimensions(width: number | undefined, height: number | undefined): string {
  if (width === undefined || height === undefined) return '—'
  return `${width} × ${height} px`
}

/**
 * Satu halaman untuk tiga operasi gambar (kompres, resize, konversi).
 *
 * Alurnya selalu lima langkah bernomor dan berurutan; langkah 2–5 baru muncul
 * setelah ada file. Tidak ada langkah yang dilewati diam-diam, dan setiap
 * batasan (jumlah file, format, upscaling) ditulis apa adanya.
 */
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
  const [message, setMessage] = useState<{ tone: 'danger' | 'success' | 'info'; text: string } | null>(
    null
  )

  const validFiles = useMemo(() => files.filter((file) => file.valid), [files])

  const inputFormats = useMemo(
    () =>
      new Set(
        validFiles
          .map((file) => (file.format ? INPUT_FORMAT_TO_TARGET[file.format] : undefined))
          .filter((format): format is ImageTargetFormat => Boolean(format))
      ),
    [validFiles]
  )

  const sharedInputFormat = inputFormats.size === 1 ? Array.from(inputFormats)[0] : undefined
  const targetUnavailable = operation === 'convert' && sharedInputFormat === target
  const transparentCount = validFiles.filter((file) => file.hasAlpha).length

  const resizeValue = Number(value)
  const resizeInvalid =
    operation === 'resize' &&
    (!Number.isInteger(resizeValue) ||
      resizeValue <= 0 ||
      resizeValue > (mode === 'percentage' ? MAX_PERCENTAGE : Number.MAX_SAFE_INTEGER))

  const invalidWidthOrHeight =
    operation === 'resize' &&
    mode !== 'percentage' &&
    validFiles.some((file) => {
      const original = mode === 'width' ? file.width : file.height
      return original !== undefined && resizeValue > original
    })

  const inspectFiles = useCallback(async (incoming: ImageFileRef[]) => {
    const unique = new Map<string, ImageFileRef>()
    for (const file of incoming) unique.set(file.path.toLowerCase(), file)
    const selected = Array.from(unique.values()).slice(0, 100)

    if (incoming.length > 100) {
      setMessage({
        tone: 'info',
        text: 'Batch dibatasi hingga 100 file. File sisanya tidak ditambahkan.'
      })
    }
    if (!selected.length) return

    setBusy(true)
    setMessage(null)
    setResults([])
    try {
      const inspected = await window.imageTools.inspect(selected)
      setFiles((previous) => {
        const merged = new Map(previous.map((file) => [file.path.toLowerCase(), file]))
        for (const [index, entry] of inspected.entries()) {
          merged.set(selected[index].path.toLowerCase(), {
            ...selected[index],
            valid: entry.valid,
            width: entry.width,
            height: entry.height,
            format: entry.format,
            hasAlpha: entry.hasAlpha,
            error: entry.error
          })
        }
        return Array.from(merged.values()).slice(0, 100)
      })
    } catch {
      setMessage({
        tone: 'danger',
        text: 'File tidak dapat diperiksa. Pilih ulang file gambar yang valid.'
      })
    } finally {
      setBusy(false)
    }
  }, [])

  const handleDrop = useCallback(
    (dropped: File[]) => {
      const refs = dropped.flatMap((file) => {
        const path = (file as File & { path?: string }).path
        return path ? [{ name: file.name, path, size: file.size }] : []
      })

      if (!refs.length) {
        setMessage({
          tone: 'danger',
          text: 'Aplikasi tidak dapat membaca lokasi file. Gunakan tombol Pilih file atau Pilih folder.'
        })
        return
      }
      void inspectFiles(refs)
    },
    [inspectFiles]
  )

  useEffect(() => window.imageTools.onProgress(setProgress), [])

  const addFromPicker = async (folder: boolean): Promise<void> => {
    setBusy(true)
    try {
      const chosen = folder
        ? await window.imageTools.chooseFolder()
        : await window.imageTools.chooseImages()
      await inspectFiles(chosen)
    } catch {
      setMessage({
        tone: 'danger',
        text: 'File tidak dapat dibuka. Periksa izin akses lalu coba lagi.'
      })
      setBusy(false)
    }
  }

  const run = async (): Promise<void> => {
    if (!validFiles.length || resizeInvalid) return

    setBusy(true)
    setResults([])
    setProgress({
      completed: 0,
      total: validFiles.length,
      currentFile: validFiles[0].name
    })
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

      const resize: ImageResizeOptions | undefined =
        operation === 'resize'
          ? { mode, value: resizeValue, maintainAspectRatio: true }
          : undefined
      const convert = operation === 'convert' ? { target } : undefined

      const completed = await window.imageTools.process({
        operation,
        files: validFiles,
        quality,
        destination: outputFolder,
        resize,
        convert
      })

      setResults(completed)
      const success = completed.filter((result) => result.status === 'success').length
      const failed = completed.filter((result) => result.status === 'failed').length
      const skipped = completed.filter((result) => result.status === 'skipped').length
      const summary = [`${success} berhasil`]
      if (failed) summary.push(`${failed} gagal`)
      if (skipped) summary.push(`${skipped} dilewati`)
      setMessage({
        tone: failed ? (success ? 'info' : 'danger') : 'success',
        text: `${summary.join(', ')}. File asli tetap aman.`
      })
    } catch {
      setMessage({
        tone: 'danger',
        text: 'Proses tidak dapat diselesaikan. Periksa ruang penyimpanan dan coba lagi.'
      })
    } finally {
      setBusy(false)
    }
  }

  const exampleOutputName = useMemo(() => {
    const first = validFiles[0]?.name
    if (!first) return '—'
    const stem = first.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*]/g, '_') || 'image'
    return `${stem}-converted.${TARGET_EXTENSION[target]}`
  }, [validFiles, target])

  const outputDimensions = useMemo(() => {
    if (operation !== 'resize' || validFiles.length !== 1 || resizeInvalid) return null
    if (invalidWidthOrHeight || !value) return null
    const source = validFiles[0]
    if (!source.width || !source.height) return null

    if (mode === 'percentage') {
      return formatDimensions(
        Math.max(1, Math.round((source.width * resizeValue) / 100)),
        Math.max(1, Math.round((source.height * resizeValue) / 100))
      )
    }
    if (mode === 'width') {
      return formatDimensions(resizeValue, Math.round((source.height * resizeValue) / source.width))
    }
    return formatDimensions(Math.round((source.width * resizeValue) / source.height), resizeValue)
  }, [invalidWidthOrHeight, mode, operation, resizeInvalid, resizeValue, validFiles, value])

  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : 0

  const canRun = !busy && validFiles.length > 0 && !resizeInvalid && !invalidWidthOrHeight && !targetUnavailable

  return (
    <article className="tool">
      <PageHeader
        eyebrow="Image Tools"
        title={TITLES[operation]}
        description="Semua gambar diproses secara lokal di perangkat ini. File asli tidak diubah."
        aside={
          <span className="tool__local">
            <Icon name="lock" size="sm" />
            <span>Tanpa upload</span>
          </span>
        }
      />

      {message ? <Alert tone={message.tone} title={message.text} className="tool__alert" /> : null}

      <section className="step" aria-labelledby="select-heading">
        <div className="step__head">
          <h2 className="step__title" id="select-heading">
            1. Pilih gambar
          </h2>
          <p className="step__hint">{FORMAT_HINT}</p>
        </div>
        <div className="step__body">
          <FileDropZone
            disabled={busy}
            showAction={false}
            onChooseFiles={() => void addFromPicker(false)}
            onDroppedFiles={handleDrop}
          />
          <div className="tool__picker-actions">
            <Button variant="primary" disabled={busy} onClick={() => void addFromPicker(false)}>
              <Icon name="upload" size="sm" />
              Pilih file
            </Button>
            <Button disabled={busy} onClick={() => void addFromPicker(true)}>
              <Icon name="folder" size="sm" />
              Pilih folder
            </Button>
          </div>
        </div>
      </section>

      {files.length > 0 ? (
        <section className="step" aria-labelledby="options-heading">
          <div className="step__head">
            <h2 className="step__title" id="options-heading">
              2. Atur opsi
            </h2>
          </div>
          <div className="step__body">
            {operation === 'compress' ? (
              <div className="tool__control">
                <label htmlFor="image-quality">Kualitas JPEG / WEBP</label>
                <div className="tool__range-row">
                  <div className="tool__range-slider">
                    <input
                      id="image-quality"
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={quality}
                      disabled={busy}
                      onChange={(event) => setQuality(Number(event.target.value))}
                    />
                    <div className="tool__range-scale" aria-hidden="true">
                      <span>10 · terkecil</span>
                      <span>100 · terbesar</span>
                    </div>
                  </div>
                  <output htmlFor="image-quality">{quality}</output>
                </div>
                <p className="tool__note">
                  PNG memakai kompresi lossless; kualitas JPEG/WEBP tidak mengubah PNG.
                </p>
              </div>
            ) : null}

            {operation === 'convert' ? (
              <div className="tool__control tool__control--wide">
                <span className="tool__label" id="convert-target-label">
                  Format tujuan
                </span>
                <div
                  className="tool__formats"
                  role="radiogroup"
                  aria-labelledby="convert-target-label"
                >
                  {TARGET_OPTIONS.map((option) => (
                    <label key={option.value} className="tool__format">
                      <input
                        type="radio"
                        name="convert-target"
                        value={option.value}
                        checked={target === option.value}
                        disabled={busy || sharedInputFormat === option.value}
                        onChange={() => setTarget(option.value)}
                      />
                      <strong>{option.label}</strong>
                      <small>{option.hint}</small>
                    </label>
                  ))}
                </div>
                {sharedInputFormat ? (
                  <p className="tool__note">
                    Format {sharedInputFormat.toUpperCase()} tidak dapat dipilih karena semua
                    gambar sudah memakai format tersebut.
                  </p>
                ) : null}
                <p className="tool__note">
                  Ukuran dan rasio aspek gambar tidak diubah. PNG memakai kompresi lossless, JPG dan
                  WEBP bersifat lossy.
                </p>
                {target === 'jpg' && transparentCount > 0 ? (
                  <p className="tool__note">
                    {transparentCount} gambar memiliki latar transparan dan akan dilewati. Warna
                    latar untuk konversi ke JPG belum ditentukan.
                  </p>
                ) : null}
              </div>
            ) : null}

            {operation === 'resize' ? (
              <div className="tool__control">
                <div className="tool__resize-options">
                  <div className="tool__field">
                    <label htmlFor="resize-mode">Mode ukuran</label>
                    <select
                      id="resize-mode"
                      value={mode}
                      disabled={busy}
                      onChange={(event) => {
                        setMode(event.target.value as ResizeMode)
                        setValue('')
                      }}
                    >
                      <option value="width">Lebar</option>
                      <option value="height">Tinggi</option>
                      <option value="percentage">Persentase</option>
                    </select>
                  </div>
                  <div className="tool__field">
                    <label htmlFor="resize-value">
                      {mode === 'width' ? 'Lebar (px)' : mode === 'height' ? 'Tinggi (px)' : 'Persentase (%)'}
                    </label>
                    <input
                      id="resize-value"
                      type="number"
                      min="1"
                      max={mode === 'percentage' ? MAX_PERCENTAGE : undefined}
                      step="1"
                      value={value}
                      disabled={busy}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={mode === 'percentage' ? '50' : '2000'}
                    />
                  </div>
                </div>
                <p className="tool__note">Rasio aspek dipertahankan. Gambar tidak diperbesar.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {files.length > 0 ? (
        <section className="step" aria-labelledby="preview-heading">
          <div className="step__head">
            <h2 className="step__title" id="preview-heading">
              3. Pratinjau
            </h2>
            <p className="step__hint">
              {validFiles.length} gambar valid dari {files.length} dipilih.
            </p>
          </div>
          <div className="step__body">
            <ul className="file-list">
              {files.map((file) => (
                <li key={file.path} className="file-row">
                  <span className="file-row__icon" aria-hidden="true">
                    <Icon name="image" size="sm" />
                  </span>
                  <div className="file-row__body">
                    <strong className="file-row__name">{file.name}</strong>
                    <span className="file-row__meta">
                      {file.valid
                        ? `${formatDimensions(file.width, file.height)} · ${formatSize(file.size)} · ${file.format?.toUpperCase()}${
                            operation === 'convert' && file.hasAlpha ? ' · ada transparansi' : ''
                          }`
                        : file.error}
                    </span>
                  </div>
                  <span className={file.valid ? 'status status--ready' : 'status status--danger'}>
                    {file.valid ? 'Siap' : 'Gagal validasi'}
                  </span>
                </li>
              ))}
            </ul>

            {outputDimensions ? (
              <p className="tool__output-hint">
                <Icon name="info" size="sm" />
                <span>Ukuran keluaran: {outputDimensions}</span>
              </p>
            ) : null}

            {invalidWidthOrHeight ? (
              <Alert
                tone="warning"
                title="Ukuran target melebihi dimensi gambar. Pembesaran tidak diizinkan."
              />
            ) : null}

            {operation === 'convert' ? (
              <p className="tool__output-hint">
                <Icon name="info" size="sm" />
                <span>Contoh nama keluaran: {exampleOutputName}</span>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {files.length > 0 ? (
        <section className="step" aria-labelledby="process-heading">
          <div className="step__head">
            <h2 className="step__title" id="process-heading">
              4. Proses
            </h2>
          </div>
          <div className="step__body">
            <div className="tool__process">
              <Button variant="primary" size="lg" disabled={!canRun} onClick={() => void run()}>
                {busy
                  ? 'Sedang memproses…'
                  : `${PROCESS_LABELS[operation]} ${validFiles.length} gambar`}
              </Button>
              <p className="tool__note">Folder hasil dipilih saat proses dimulai.</p>
            </div>

            {targetUnavailable ? (
              <Alert tone="warning" title="Pilih format tujuan yang berbeda dari format gambar." />
            ) : null}

            {progress ? (
              <div className="progress" role="status" aria-live="polite">
                <p className="progress__label">
                  Memproses {progress.completed} / {progress.total}: {progress.currentFile}
                </p>
                <span className="progress__track" aria-hidden="true">
                  <span className="progress__bar" style={{ width: `${progressPercent}%` }} />
                </span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {results.length > 0 ? (
        <section className="step" aria-labelledby="result-heading">
          <div className="step__head">
            <h2 className="step__title" id="result-heading">
              5. Hasil
            </h2>
          </div>
          <div className="step__body">
            <ul className="file-list">
              {results.map((result, index) => {
                const reductionPercent =
                  result.outputSize && result.originalSize
                    ? ((result.originalSize - result.outputSize) / result.originalSize) * 100
                    : null

                return (
                  <li key={`${result.name}-${index}`} className="file-row file-row--result">
                    <span className="file-row__icon" aria-hidden="true">
                      <Icon name="image" size="sm" />
                    </span>
                    <div className="file-row__body">
                      <strong className="file-row__name">{result.name}</strong>
                      {result.status === 'success' ? (
                        <span className="file-row__meta">
                          {formatSize(result.originalSize)} → {formatSize(result.outputSize ?? 0)}
                          {operation === 'resize'
                            ? ` · ${formatDimensions(result.width, result.height)}`
                            : ''}
                        </span>
                      ) : (
                        <span className="file-row__meta">{result.error ?? result.reason}</span>
                      )}
                    </div>
                    {result.status === 'success' && reductionPercent !== null ? (
                      <span
                        className={
                          reductionPercent > 0 ? 'status status--ready' : 'status status--warning'
                        }
                      >
                        {reductionPercent > 0
                          ? `−${reductionPercent.toFixed(1)}%`
                          : `+${Math.abs(reductionPercent).toFixed(1)}%`}
                      </span>
                    ) : (
                      <span
                        className={
                          result.status === 'skipped' ? 'status status--neutral' : 'status status--danger'
                        }
                      >
                        {result.status === 'skipped' ? 'Dilewati' : 'Gagal'}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  )
}
