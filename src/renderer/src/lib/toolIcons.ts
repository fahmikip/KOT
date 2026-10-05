import type { IconName } from '@/components/Icon'
import type { ToolGroupId } from '@/lib/routes'

/**
 * Pemetaan ikon per kategori tool.
 *
 * Satu sumber untuk Sidebar, Dashboard, dan halaman tool supaya tidak ada
 * kategori yang memakai ikon berbeda di tempat berbeda. Ikon selalu dekoratif;
 * nama kategori selalu ditulis sebagai teks.
 */
export const TOOL_GROUP_ICON: Record<ToolGroupId, IconName> = {
  'image-tools': 'image',
  'pdf-tools': 'document',
  conversion: 'convert',
  'file-tools': 'folder',
  utilities: 'sparkle'
}
