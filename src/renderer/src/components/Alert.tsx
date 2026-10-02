import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import './Alert.css'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone
  title: string
  children?: ReactNode
}

/**
 * Pesan kontekstual yang selalu ditampilkan ke user dalam bahasa manusia.
 * Lihat ARCHITECTURE.md §6 — jangan pernah menampilkan detail teknis di sini.
 */
export function Alert({ tone = 'info', title, children, className, ...rest }: AlertProps) {
  return (
    <div
      className={cn('alert', `alert--${tone}`, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
      {...rest}
    >
      <p className="alert__title">{title}</p>
      {children ? <div className="alert__body">{children}</div> : null}
    </div>
  )
}