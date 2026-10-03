import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'

afterEach(() => {
  cleanup()
})

const imageToolsMock = {
  chooseImages: vi.fn().mockResolvedValue([]),
  chooseFolder: vi.fn().mockResolvedValue([]),
  chooseDestination: vi.fn().mockResolvedValue(null),
  inspect: vi.fn().mockResolvedValue([]),
  process: vi.fn().mockResolvedValue([]),
  onProgress: vi.fn().mockReturnValue(() => {})
}

Object.defineProperty(window, 'imageTools', {
  configurable: true,
  value: imageToolsMock
})
Object.defineProperty(globalThis, 'imageTools', { configurable: true, value: imageToolsMock })

/**
 * jsdom tidak mengimplementasikan window.matchMedia.
 * Stub minimal ini dipakai oleh useMediaQuery (AppLayout).
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()

    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.add(listener as (event: MediaQueryListEvent) => void)
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.delete(listener as (event: MediaQueryListEvent) => void)
      },
      dispatchEvent: () => true
    } as unknown as MediaQueryList
  }
}

/** Helper: set hasil matchMedia untuk testing layout mobile/desktop. */
export function setViewport(isDesktop: boolean): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query.includes('min-width') ? isDesktop : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true
    }) as unknown as MediaQueryList
}
