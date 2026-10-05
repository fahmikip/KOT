import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import './Card.css'

export type CardVariant = 'default' | 'flush' | 'quiet'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article'
  variant?: CardVariant
}

/**
 * Wadah berkonten. Dipakai pada Dashboard dan halaman Coming Soon.
 * Card bukan interaktif — kalau interaktif, pakai <a> atau <button>.
 */
export function Card({ as: Tag = 'div', variant = 'default', className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn('card', variant !== 'default' && `card--${variant}`, className)}
      {...rest}
    />
  )
}
