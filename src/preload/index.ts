import { contextBridge, ipcRenderer } from 'electron'

export interface ImageFileRef {
  name: string
  path: string
  size: number
}

export interface ImageResizeOptions {
  mode: 'width' | 'height' | 'percentage'
  value: number
  maintainAspectRatio: true
}

export interface ImageProcessResult {
  name: string
  status: 'success' | 'failed'
  outputPath?: string
  originalSize: number
  outputSize?: number
  width?: number
  height?: number
  error?: string
}

export interface ImageInspection {
  name: string
  valid: boolean
  size: number
  width?: number
  height?: number
  format?: string
  error?: string
}

export interface ImageProgress {
  completed: number
  total: number
  currentFile: string
  result?: ImageProcessResult
}

export interface ImageToolBridge {
  chooseImages(): Promise<ImageFileRef[]>
  chooseFolder(): Promise<ImageFileRef[]>
  chooseDestination(): Promise<string | null>
  inspect(files: ImageFileRef[]): Promise<ImageInspection[]>
  process(request: {
    operation: 'compress' | 'resize'
    files: ImageFileRef[]
    quality: number
    destination: string
    resize?: ImageResizeOptions
  }): Promise<ImageProcessResult[]>
  onProgress(callback: (progress: ImageProgress) => void): () => void
}

const imageTools: ImageToolBridge = {
  chooseImages: () => ipcRenderer.invoke('image:choose') as Promise<ImageFileRef[]>,
  chooseFolder: () => ipcRenderer.invoke('image:choose-folder') as Promise<ImageFileRef[]>,
  chooseDestination: () => ipcRenderer.invoke('image:choose-destination') as Promise<string | null>,
  inspect: (files) => ipcRenderer.invoke('image:inspect', files) as Promise<ImageInspection[]>,
  process: (request) => ipcRenderer.invoke('image:process', request) as Promise<ImageProcessResult[]>,
  onProgress: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: ImageProgress): void => callback(progress)
    ipcRenderer.on('image:progress', listener)
    return () => ipcRenderer.removeListener('image:progress', listener)
  }
}

contextBridge.exposeInMainWorld('imageTools', imageTools)
