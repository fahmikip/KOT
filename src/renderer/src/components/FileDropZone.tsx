import { useCallback, useId, useState, type DragEvent } from 'react'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import './FileDropZone.css'

export interface FileDropZoneProps {
  onDroppedFiles?: (files: File[]) => void
  /** Membuka pemilih native agar aplikasi desktop mendapat path file yang dapat diproses. */
  onChooseFiles?: () => void
  disabled?: boolean
  /**
   * Label aksi "Pilih File" di dalam area. Nilai default true. Halaman yang sudah
   * punya baris tombol sendiri mengeset false supaya tidak ada dua ajakan sekaligus.
   */
  showAction?: boolean
  className?: string
}

/**
 * Drop zone file.
 *
 * Batasan yang disengaja (ARCHITECTURE.md §5, DEC-001):
 * - Drag state dan hover state berfungsi.
 * - TIDAK ada reading isi file di layer ini, dan tidak ada upload ke mana pun.
 * - Area drop adalah satu-satunya <button> supaya bisa difokus dan diaktifkan
 *   dengan keyboard; label aksi di dalamnya hanya <span> (ACCESSIBILITY).
 */
export function FileDropZone({
  onDroppedFiles,
  onChooseFiles,
  disabled = false,
  showAction = true,
  className
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const hintId = useId()

  const openFilePicker = useCallback(() => {
    if (!disabled) onChooseFiles?.()
  }, [disabled, onChooseFiles])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setIsDragging(false)
      if (disabled) {
        return
      }

      const files = Array.from(event.dataTransfer.files)
      if (files.length > 0) {
        if (onDroppedFiles) onDroppedFiles(files)
      }
    },
    [disabled, onDroppedFiles]
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
        <span className="dropzone__icon" aria-hidden="true">
          <Icon name="upload" size="lg" />
        </span>
        <span className="dropzone__title">Drop file di sini</span>
        <span className="dropzone__hint" id={hintId}>
          atau pilih dari komputer
        </span>
        {showAction ? <span className="dropzone__action">Pilih File</span> : null}
      </button>
    </div>
  )
}
