import type { HTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from '@/components/Icon'
import { cn } from '@/lib/cn'
import './Alert.css'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const TONE_ICON: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning'
}

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
      <span className="alert__icon" aria-hidden="true">
        <Icon name={TONE_ICON[tone]} size="sm" />
      </span>
      <div className="alert__content">
        <p className="alert__title">{title}</p>
        {children ? <div className="alert__body">{children}</div> : null}
      </div>
    </div>
  )
}
