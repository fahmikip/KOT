/** Tipe bersama untuk definisi tool. Data ada di src/renderer/src/lib/routes.ts */

export const TOOL_STATUS = {
  COMING_SOON: 'coming-soon'
} as const

export type ToolStatus = (typeof TOOL_STATUS)[keyof typeof TOOL_STATUS]

export type ToolGroupId =
  | 'image-tools'
  | 'pdf-tools'
  | 'conversion'
  | 'file-tools'
  | 'utilities'

export interface ToolDefinition {
  /** id stabil, dipakai sebagai React key dan untuk lookup. */
  readonly id: string
  /** Label yang tampil di navigasi dan halaman. */
  readonly label: string
  /** Path absolut, diawali '/'. */
  readonly path: string
  readonly group: ToolGroupId
  readonly description: string
  /**
   * Kemampuan yang DIRENCANAKAN tool ini, disalin dari FEATURES.md.
   * Ini informasi cakupan, bukan klaim bahwa fitur sudah tersedia.
   */
  readonly plannedCapabilities: readonly string[]
  readonly status: ToolStatus
}

export interface ToolGroup {
  readonly id: ToolGroupId
  readonly label: string
  /** Label panjang untuk kartu Dashboard. */
  readonly description: string
}