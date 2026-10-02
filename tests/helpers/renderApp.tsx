import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/router'

/**
 * Render seluruh route tree dengan MemoryRouter pada path tertentu.
 * Dipakai untuk menguji navigasi tanpa membuka window Electron.
 */
export function renderAppAt(path: string): RenderResult {
  return render(wrapAt(path))
}

export function wrapAt(path: string): ReactElement {
  return (
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  )
}