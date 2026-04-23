import { useEffect, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

interface StaggerItemProps {
  children: ReactNode
  delay?: number
  style?: CSSProperties
  className?: string
}

export function StaggerItem({ children, delay = 0, style, className }: StaggerItemProps) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
        transition: 'opacity 0.55s cubic-bezier(.2,.8,.2,1), transform 0.55s cubic-bezier(.2,.8,.2,1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface TiltCardProps {
  children: ReactNode
  max?: number
  style?: CSSProperties
  className?: string
}

export function TiltCard({ children, max = 6, style, className }: TiltCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
        setTilt({ x: -ny * max, y: nx * max })
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s cubic-bezier(.2,.8,.2,1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
