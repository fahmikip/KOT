import { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Loading } from '@/components/Loading'
import { AppRoutes } from '@/app/router'

/**
 * Akar aplikasi renderer.
 *
 * HashRouter dipilih karena renderer dimuat dari skema file:// pada build produksi.
 * BrowserRouter akan gagal di skema tersebut. Lihat DEC-021.
 */
export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <AppRoutes />
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  )
}