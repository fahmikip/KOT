/**
 * Route registry — sumber tunggal untuk navigasi sidebar, routing, dan Dashboard.
 *
 * Menambah atau mengubah tool HARUS dilakukan di berkas ini saja, supaya navigasi
 * dan routing tidak pernah berbeda.
 *
 * Status tiap tool mengikuti phase implementasi masing-masing.
 */

import {
  TOOL_STATUS,
  type ToolDefinition,
  type ToolGroup,
  type ToolGroupId,
  type ToolStatus
} from '@/types/tools'

export { TOOL_STATUS }
export type { ToolDefinition, ToolGroup, ToolGroupId, ToolStatus }

export const DASHBOARD_ROUTE = '/'

export const TOOL_GROUPS: readonly ToolGroup[] = [
  {
    id: 'image-tools',
    label: 'Image Tools',
    description: 'Kompres, ubah ukuran, dan konversi gambar'
  },
  {
    id: 'pdf-tools',
    label: 'PDF Tools',
    description: 'Kompres, gabung, pisah, dan putar PDF'
  },
  {
    id: 'conversion',
    label: 'Convert',
    description: 'Konversi antara gambar dan PDF'
  },
  {
    id: 'file-tools',
    label: 'File Tools',
    description: 'Rename banyak file dan buat ZIP'
  },
  {
    id: 'utilities',
    label: 'Utilities',
    description: 'Pembuat QR Code dan kalkulator tanggal'
  }
]

export const TOOLS: readonly ToolDefinition[] = [
  {
    id: 'image-compress',
    label: 'Compress',
    path: '/image/compress',
    group: 'image-tools',
    description: 'Mengurangi ukuran file gambar.',
    plannedCapabilities: ['Kompresi', 'Kontrol kualitas', 'Pemrosesan batch'],
    status: TOOL_STATUS.READY
  },
  {
    id: 'image-resize',
    label: 'Resize',
    path: '/image/resize',
    group: 'image-tools',
    description: 'Mengubah ukuran gambar.',
    plannedCapabilities: [
      'Resize berdasarkan lebar',
      'Resize berdasarkan tinggi',
      'Persentase',
      'Pertahankan aspect ratio',
      'Pemrosesan batch'
    ],
    status: TOOL_STATUS.READY
  },
  {
    id: 'image-convert',
    label: 'Convert',
    path: '/image/convert',
    group: 'image-tools',
    description: 'Mengubah format gambar.',
    plannedCapabilities: ['JPG ke PNG', 'PNG ke JPG', 'WEBP ke JPG'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'pdf-compress',
    label: 'Compress',
    path: '/pdf/compress',
    group: 'pdf-tools',
    description: 'Mengurangi ukuran file PDF.',
    plannedCapabilities: ['Maximum Compression', 'Balanced', 'High Quality'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'pdf-merge',
    label: 'Merge',
    path: '/pdf/merge',
    group: 'pdf-tools',
    description: 'Menggabungkan beberapa PDF menjadi satu.',
    plannedCapabilities: ['Drag & drop', 'Reorder', 'Hapus', 'Merge'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'pdf-split',
    label: 'Split',
    path: '/pdf/split',
    group: 'pdf-tools',
    description: 'Memisahkan PDF per halaman atau berdasarkan rentang halaman.',
    plannedCapabilities: ['Split per halaman', 'Page range'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'pdf-rotate',
    label: 'Rotate',
    path: '/pdf/rotate',
    group: 'pdf-tools',
    description: 'Memutar halaman PDF.',
    plannedCapabilities: ['90 derajat', '180 derajat', '270 derajat'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'image-to-pdf',
    label: 'Image → PDF',
    path: '/convert/image-to-pdf',
    group: 'conversion',
    description: 'Menggabungkan beberapa gambar menjadi satu PDF.',
    plannedCapabilities: ['Banyak gambar', 'Reorder', 'Page size', 'Orientasi', 'Margin'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'pdf-to-image',
    label: 'PDF → Image',
    path: '/convert/pdf-to-image',
    group: 'conversion',
    description: 'Mengekspor halaman PDF menjadi gambar.',
    plannedCapabilities: ['Pilih halaman', 'JPG', 'PNG'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'batch-rename',
    label: 'Batch Rename',
    path: '/file/batch-rename',
    group: 'file-tools',
    description: 'Mengubah nama banyak file sekaligus.',
    plannedCapabilities: ['Pattern penamaan', 'Nomor urut', 'Preview sebelum rename'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'zip-creator',
    label: 'ZIP Creator',
    path: '/file/zip',
    group: 'file-tools',
    description: 'Membuat file ZIP dari banyak file.',
    plannedCapabilities: ['Pilih banyak file', 'Buat ZIP'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'qr-generator',
    label: 'QR Generator',
    path: '/utility/qr',
    group: 'utilities',
    description: 'Membuat QR Code dari teks atau URL.',
    plannedCapabilities: ['Input teks', 'Input URL', 'Output PNG'],
    status: TOOL_STATUS.COMING_SOON
  },
  {
    id: 'date-calculator',
    label: 'Date Calculator',
    path: '/utility/date',
    group: 'utilities',
    description: 'Menghitung selisih tanggal, tambah hari, dan kurang hari.',
    plannedCapabilities: ['Selisih tanggal', 'Tambah hari', 'Kurang hari'],
    status: TOOL_STATUS.COMING_SOON
  }
]

export const ALL_PATHS: readonly string[] = [DASHBOARD_ROUTE, ...TOOLS.map((tool) => tool.path)]

/** Ubah path absolut menjadi path relatif untuk <Route path="..."> di dalam layout. */
export function toRoutePath(path: string): string {
  return path.replace(/^\//, '')
}

export function toolsByGroup(groupId: ToolGroupId): readonly ToolDefinition[] {
  return TOOLS.filter((tool) => tool.group === groupId)
}

export function findToolByPath(path: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.path === path)
}
