import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.css'

export interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Error boundary React.
 *
 * Dua lapis (ARCHITECTURE.md §6):
 * - User melihat pesan dalam bahasa manusia, tanpa detail teknis.
 * - Detail teknis ditulis ke developer log (console.error), bukan ke layar.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Developer log. Lihat SOURCE_OF_TRUTH.md § SECURITY PRINCIPLES.
    console.error('[KOT] render error', error, errorInfo.componentStack)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="error-boundary__box" role="alert">
            <h1>Terjadi kesalahan</h1>
            <p>Aplikasi mengalami masalah saat membuka halaman ini.</p>
            <p>Silakan coba kembali.</p>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}