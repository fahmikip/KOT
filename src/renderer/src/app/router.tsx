import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { ComingSoon } from '@/pages/ComingSoon'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'
import { ImageToolPage } from '@/features/image-tools/ImageToolPage'
import { TOOLS, toRoutePath } from '@/lib/routes'

/** Tool yang punya halaman nyata; sisanya masih Coming Soon. */

type ImageOperation = 'compress' | 'resize' | 'convert' | 'toPdf'
const IMAGE_TOOL_OPERATIONS: Partial<Record<string, ImageOperation>> = {
  'image-compress': 'compress',
  'image-resize': 'resize',
  'image-convert': 'convert',
  'image-to-pdf': 'toPdf'
}

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
          <Route key={tool.id} path={toRoutePath(tool.path)} element={<ImageToolRoute toolId={tool.id} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function ImageToolRoute({ toolId }: { toolId: string }) {
  const operation = IMAGE_TOOL_OPERATIONS[toolId]
  return operation ? <ImageToolPage operation={operation} /> : <ComingSoon />
}
