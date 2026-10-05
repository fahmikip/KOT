import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import './PageHeader.css'

export interface PageHeaderProps {
  /** Label kecil di atas judul, mis. nama kategori tool. */
  eyebrow: string
  title: string
  description?: ReactNode
  /** Elemen samping kanan, mis. catatan singkat atau lencana status. */
  aside?: ReactNode
  className?: string
}

/**
 * Kepala halaman yang konsisten di semua halaman.
 *
 * Dipakai Dashboard, Coming Soon, dan halaman tool image supaya hierarki
 * judul–subjudul terasa sama di seluruh aplikasi (DEC-034).
 */
export function PageHeader({ eyebrow, title, description, aside, className }: PageHeaderProps) {
  return (
    <div className={cn('page-header', className)}>
      <div className="page-header__text">
        <p className="page-header__eyebrow">{eyebrow}</p>
        <h1 className="page-header__title">{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {aside ? <div className="page-header__aside">{aside}</div> : null}
    </div>
  )
}
