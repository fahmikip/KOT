import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { ComingSoon } from '@/pages/ComingSoon'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'
import { TOOLS, toRoutePath } from '@/lib/routes'

/**
 * Peta route aplikasi.
 *
 * Semua route tool digenerate dari registry `@/lib/routes` supaya navigasi sidebar,
 * Dashboard, dan routing tidak pernah bisa berbeda.
 *
 * Menu router diekspor terpisah dari <RouterProvider> supaya bisa diuji dengan
 * MemoryRouter tanpa membuka window aplikasi.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        {TOOLS.map((tool) => (
          <Route key={tool.id} path={toRoutePath(tool.path)} element={<ComingSoon />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}