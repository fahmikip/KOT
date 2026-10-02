import { cn } from '@/lib/cn'
import './Loading.css'

export interface LoadingProps {
  /** Pesan yang diumumkan screen reader. Default: "Memuat". */
  label?: string
  className?: string
}

/**
 * State memuat. Hanya tampil saat ada pekerjaan yang benar-benar berjalan
 * (mis. Suspense boundary). JANGAN dipakai untuk berpura-pura memproses file —
 * lihat FEATURES.md dan Phase 1 §18.
 */
export function Loading({ label = 'Memuat', className }: LoadingProps) {
  return (
    <div className={cn('loading', className)} role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="loading__label">{label}...</span>
    </div>
  )
}