import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import './Badge.css'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

/** Label status pendek dan tidak interaktif. */
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span className={cn('badge', `badge--${tone}`, className)} {...rest} />
}