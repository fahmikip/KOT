import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import './Card.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article'
}

/**
 * Wadah berkonten. Dipakai pada Dashboard dan halaman Coming Soon.
 * Card bukan interaktif — kalau interaktif, pakai <a> atau <button>.
 */
export function Card({ as: Tag = 'div', className, ...rest }: CardProps) {
  return <Tag className={cn('card', className)} {...rest} />
}