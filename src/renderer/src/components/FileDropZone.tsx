import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '@/lib/cn'
import './FileDropZone.css'

export interface FileDropZoneProps {
  /** Dipanggil saat user memilih atau drop file. Hanya menerima objek File — tidak membaca isi file. */
  onFilesSelected?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  onDroppedFiles?: (files: File[]) => void
  disabled?: boolean
  className?: string
}

/**
 * Drop zone file — KHUSUS Phase 1: komponen UI saja.
 *
 * Batasan yang disengaja (Phase 1 §12):
 * - Drag state dan hover state berfungsi.
 * - Selected state ditampilkan sebagai daftar nama file.
 * - TIDAK ada reading isi file, validasi kompleks, processing, maupun upload.
 *   File tidak pernah dikirim ke mana pun (DEC-001).
 *
 *_onFilesSelected belum dipakai halaman mana pun pada Phase 1 karena seluruh tool
 * masih COMING SOON. Komponen ini diminta eksplisit sebagai fondasi UI.
 */
export function FileDropZone({
  onFilesSelected,
  accept,
  multiple = false,
  onDroppedFiles,
  disabled = false,
  className
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const hintId = useId()

  const openFilePicker = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? [])
      if (files.length > 0) {
        setSelectedNames(files.map((file) => file.name))
        onFilesSelected?.(files)
      }
    },
    [onFilesSelected]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setIsDragging(false)
      if (disabled) {
        return
      }

      const files = Array.from(event.dataTransfer.files)
      if (files.length > 0) {
        setSelectedNames(files.map((file) => file.name))
        if (onDroppedFiles) onDroppedFiles(files)
        else onFilesSelected?.(files)
      }
    },
    [disabled, onFilesSelected, onDroppedFiles]
  )

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className={cn('dropzone', className)}>
      {/*
        Elemennya <button>, bukan <div>, supaya bisa difokus dan diaktifkan dengan
        keyboard (ACCESSIBILITY: "button bukan div").
      */}
      <button
        type="button"
        className={cn('dropzone__area', isDragging && 'dropzone__area--dragging')}
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={disabled}
        aria-describedby={hintId}
      >
        <span className="dropzone__title">Drop file di sini</span>
        <span className="dropzone__hint" id={hintId}>
          atau pilih dari komputer
        </span>
        <span className="dropzone__action">Pilih File</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="dropzone__input"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {selectedNames.length > 0 ? (
        <ul className="dropzone__selected" aria-live="polite">
          {selectedNames.map((name) => (
            <li key={name} className="dropzone__selected-item">
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
