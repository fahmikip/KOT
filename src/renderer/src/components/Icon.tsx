import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import './Icon.css'

export type IconName =
  | 'grid'
  | 'image'
  | 'document'
  | 'convert'
  | 'folder'
  | 'sparkle'
  | 'menu'
  | 'close'
  | 'upload'
  | 'check'
  | 'info'
  | 'warning'
  | 'lock'
  | 'arrow-left'
  | 'arrow-right'

/**
 * Bentuk ikon garis (stroke) dengan satu viewBox 24×24 supaya semua ikon sejajar.
 * Tanpa gradient dan tanpa isian agar tidak melanggar §14.
 */
const ICON_SHAPES: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 17.5l4.2-4.2a1.8 1.8 0 0 1 2.5 0L15 17.5" />
      <path d="M13.5 16l1.8-1.8a1.8 1.8 0 0 1 2.5 0L20 16.5" />
    </>
  ),
  document: (
    <>
      <path d="M13.5 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V8z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9 12.5h6" />
      <path d="M9 16h4" />
    </>
  ),
  convert: (
    <>
      <path d="M4 8.5h14" />
      <path d="M14.5 5l3.5 3.5-3.5 3.5" />
      <path d="M20 15.5H6" />
      <path d="M9.5 12L6 15.5 9.5 19" />
    </>
  ),
  folder: (
    <>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  upload: (
    <>
      <path d="M12 15.5V4.5" />
      <path d="M8.5 8L12 4.5 15.5 8" />
      <path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5l8.5 15H3.5z" />
      <path d="M12 10v4" />
      <path d="M12 16.8h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  'arrow-left': <path d="M19 12H5.5M11 6l-5.5 6 5.5 6" />,
  'arrow-right': <path d="M5 12h13.5M13 6l5.5 6-5.5 6" />
}

export type IconSize = 'sm' | 'md' | 'lg'

export interface IconProps {
  name: IconName
  size?: IconSize
  className?: string
}

/**
 * Ikon dekoratif.
 *
 * SELALU aria-hidden: ikon tidak pernah menjadi satu-satunya sumber informasi.
 * Setiap ikon wajib berpasangan dengan label teks (ACCESSIBILITY).
 */
export function Icon({ name, size = 'md', className }: IconProps) {
  return (
    <svg
      className={cn('icon', `icon--${size}`, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_SHAPES[name]}
    </svg>
  )
}
