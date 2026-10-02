/** Dideklarasikan oleh electron.vite.config.ts (define) dan vite/client. */
export {}

declare global {
  const __APP_VERSION__: string
  type ImageFileRef = {
    name: string
    path: string
    size: number
  }

  type ImageResizeOptions = {
    mode: 'width' | 'height' | 'percentage'
    value: number
    maintainAspectRatio: true
  }

  type ImageProcessResult = {
    name: string
    status: 'success' | 'failed'
    outputPath?: string
    originalSize: number
    outputSize?: number
    width?: number
    height?: number
    error?: string
  }

  type ImageInspection = {
    name: string
    valid: boolean
    size: number
    width?: number
    height?: number
    format?: string
    error?: string
  }

  type ImageProgress = {
    completed: number
    total: number
    currentFile: string
    result?: ImageProcessResult
  }

  interface Window {
    imageTools: {
      chooseImages(): Promise<ImageFileRef[]>
      chooseFolder(): Promise<ImageFileRef[]>
      chooseDestination(): Promise<string | null>
      inspect(files: ImageFileRef[]): Promise<ImageInspection[]>
      process(request: { operation: 'compress' | 'resize'; files: ImageFileRef[]; quality: number; destination: string; resize?: ImageResizeOptions }): Promise<ImageProcessResult[]>
      onProgress(callback: (progress: ImageProgress) => void): () => void
    }
  }
}
