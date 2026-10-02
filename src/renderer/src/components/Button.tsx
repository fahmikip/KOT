import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

/**
 * Tombol untuk aksi. Navigasi harus memakai <a>/<Link>, bukan Button
 * (ACCESSIBILITY: "link bukan button jika navigasi").
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full',
        className
      )}
      {...rest}
    />
  )
}