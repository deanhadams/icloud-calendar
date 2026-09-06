interface Testimonial {
  quote: string
  name: string
  role: string
  initial: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We tried wrapping libical ourselves for two weeks before finding iSyncal. Swapping in the REST client took an afternoon, and we haven't touched CalDAV since.",
    name: 'Priya N.',
    role: 'Founder, scheduling startup',
    initial: 'P',
  },
  {
    quote:
      'The recurring-event handling is what sold me — RRULE edge cases used to eat a full sprint every quarter. Now it just works, and the response times hold up under our sync load.',
    name: 'Marcus T.',
    role: 'Backend engineer, booking platform',
    initial: 'M',
  },
  {
    quote:
      "Support walked us through app-specific password rotation for client accounts within a day. It's the kind of detail you only appreciate after the third support ticket you didn't have to write.",
    name: 'Elena R.',
    role: 'CTO, small business tools',
    initial: 'E',
  },
]

export function Testimonials() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold text-ink">
          Built for developers who'd rather not touch CalDAV
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initial }) => (
            <div key={name} className="rounded-md border border-line bg-white p-6">
              <p className="text-sm text-ink">{quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cobalt-tint text-sm font-semibold text-cobalt">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{name}</p>
                  <p className="text-xs text-ink-muted">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
