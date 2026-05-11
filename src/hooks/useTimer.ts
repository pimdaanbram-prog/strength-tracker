import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerReturn {
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  formatTime: () => string
}

export function useTimer(initialSeconds = 0): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatTime = useCallback(() => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [seconds])

  return { seconds, isRunning, start, pause, reset, formatTime }
}

interface UseCountdownReturn {
  seconds: number
  isRunning: boolean
  isFinished: boolean
  start: () => void
  pause: () => void
  reset: (newDuration?: number) => void
  formatTime: () => string
  progress: number
}

export function useCountdown(durationSeconds: number): UseCountdownReturn {
  const [seconds, setSeconds] = useState(durationSeconds)
  const [total, setTotal] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalRef = useRef(durationSeconds)

  const start = useCallback(() => {
    if (!isRunning && seconds > 0) {
      setIsRunning(true)
      setIsFinished(false)
    }
  }, [isRunning, seconds])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback((newDuration?: number) => {
    const dur = newDuration ?? totalRef.current
    totalRef.current = dur
    setTotal(dur)
    setIsRunning(false)
    setIsFinished(false)
    setSeconds(dur)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [seconds])

  const progress = total > 0 ? (total - seconds) / total : 0

  return { seconds, isRunning, isFinished, start, pause, reset, formatTime, progress }
}
