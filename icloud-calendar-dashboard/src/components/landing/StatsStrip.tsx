const STATS = [
  { value: '2.4M+', label: 'Calendar events synced' },
  { value: '99.95%', label: 'API uptime' },
  { value: '180ms', label: 'Median response time' },
  { value: '600+', label: 'Developers building with iSyncal' },
]

export function StatsStrip() {
  return (
    <section className="bg-ink-deep">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-20 text-center sm:grid-cols-4">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <p className="font-mono text-4xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-paper/50">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
