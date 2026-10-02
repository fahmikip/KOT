import { fileURLToPath } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const appVersion = JSON.stringify(process.env.npm_package_version ?? '0.1.0')

const alias = {
  '@': fileURLToPath(new URL('./src/renderer/src', import.meta.url))
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ include: ['sharp'] })],
    define: { __APP_VERSION__: appVersion }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: { alias },
    plugins: [react()],
    define: { __APP_VERSION__: appVersion }
  }
})
