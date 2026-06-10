import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export interface VolumePoint {
  label: string
  volume: number
}

// Apart chunk: Recharts (~100 kB gzip) wordt pas geladen wanneer het
// dashboard dit component lazy importeert.
export default function VolumeTrendChart({ data }: { data: VolumePoint[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Volume per week, laatste 8 weken">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--theme-border-subtle)" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
          />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value)).toLocaleString('nl-NL')} kg`, 'Volume']}
            contentStyle={{
              background: 'var(--theme-bg-card)',
              border: '1px solid var(--theme-border)',
              borderRadius: 12,
              color: 'var(--theme-text-primary)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="var(--theme-accent)"
            strokeWidth={2.5}
            fill="url(#volumeFill)"
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
