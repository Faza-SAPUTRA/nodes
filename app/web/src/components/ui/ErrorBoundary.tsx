import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm text-ink-4 max-w-md mb-6">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba muat ulang halaman atau kembali ke beranda.
          </p>
          {this.state.error && (
            <details className="text-xs text-ink-5 bg-ink-9 rounded-xl p-4 mb-6 max-w-md w-full text-left">
              <summary className="cursor-pointer font-medium text-ink-4">Detail Error</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words font-mono">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border border-ink-7 text-sm font-medium text-ink-3 rounded-xl hover:bg-ink-9 transition-colors"
            >
              Ke Beranda
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
