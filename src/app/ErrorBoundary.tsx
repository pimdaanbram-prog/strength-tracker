import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ background: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}
        >
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold">Er is iets misgegaan</h1>
          <p className="text-sm opacity-60 max-w-sm">
            {this.state.error?.message ?? 'Onbekende fout'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg-primary)' }}
          >
            Opnieuw proberen
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
