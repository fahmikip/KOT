import { useCallback, useSyncExternalStore } from 'react'

/**
 * Pantau media query. Dipakai untuk membedakan layout desktop dan mobile.
 *
 * Memakai useSyncExternalStore karena matchMedia adalah sumber state di luar React.
 * Ini juga menghindari setState sinkron di dalam effect.
 * Nilai server fallback `false` menjaga hook ini aman bila dipakai di luar browser.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onStoreChange)
      return () => {
        mediaQueryList.removeEventListener('change', onStoreChange)
      }
    },
    [query]
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false
  )
}

/** >= 1024px: sidebar tampil sebagai kolom permanen. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}