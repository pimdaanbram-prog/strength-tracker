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

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--theme-bg-primary)',
            color: 'var(--theme-text-primary)',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ fontSize: '2rem' }}>⚠️</p>
          <h2 style={{ margin: 0, fontFamily: 'var(--theme-font-display)' }}>
            Er is iets misgegaan
          </h2>
          <p style={{ color: 'var(--theme-text-muted)', maxWidth: '32ch', margin: 0 }}>
            {this.state.error?.message ?? 'Onbekende fout'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--theme-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pagina herladen
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
