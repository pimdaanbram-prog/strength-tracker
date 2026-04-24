export default function AmbientBackground({ intensity = 1 }: { intensity?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
    }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%',
        background: 'radial-gradient(circle, var(--theme-accent-glow, rgba(255,122,31,0.45)), transparent 70%)',
        filter: 'blur(60px)',
        animation: 'orbA 14s ease-in-out infinite',
        opacity: 0.7 * intensity,
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%', width: '70%', height: '70%',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--theme-accent-glow, rgba(255,122,31,0.45)) 50%, transparent), transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orbB 18s ease-in-out infinite',
        opacity: 0.6 * intensity,
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '-20%', width: '50%', height: '50%',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--theme-accent-glow, rgba(255,122,31,0.3)) 40%, transparent), transparent 70%)',
        filter: 'blur(70px)',
        animation: 'orbC 22s ease-in-out infinite',
        opacity: 0.5 * intensity,
      }} />
    </div>
  )
}
