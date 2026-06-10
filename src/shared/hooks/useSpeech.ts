import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Web Speech API voice-over voor hands-free gebruik tijdens een set.
 * Niet ondersteund (oude browsers / sommige WebViews) → `supported: false`,
 * de UI verbergt dan de spreekknop.
 */
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const queueRef = useRef<SpeechSynthesisUtterance[]>([])

  const stop = useCallback(() => {
    if (!supported) return
    queueRef.current = []
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback((texts: string[], lang = 'nl-NL') => {
    if (!supported || texts.length === 0) return
    window.speechSynthesis.cancel()
    queueRef.current = texts.map((text, index) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.95
      if (index === texts.length - 1) {
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)
      }
      return utterance
    })
    setSpeaking(true)
    for (const utterance of queueRef.current) {
      window.speechSynthesis.speak(utterance)
    }
  }, [supported])

  // Stop voorlezen bij unmount (bv. navigatie naar andere oefening)
  useEffect(() => stop, [stop])

  return { supported, speaking, speak, stop }
}
