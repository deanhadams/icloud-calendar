import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CodePanel, RequestCodePanel } from './codeWalkthroughSteps'
import { WALKTHROUGH_STEPS } from './codeWalkthroughSteps'
import { PathTemplate } from './PathTemplate'
import { SlideArrowButton, SlideDots } from './SlideshowControls'
import { useSlideshow } from './useSlideshow'

function RequestBlock({ code }: { code: RequestCodePanel }) {
  const bodyEntries = code.body ? Object.entries(code.body) : []

  return (
    <pre className="w-full overflow-x-auto rounded-md bg-cobalt-tint p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      <div className="break-all">
        <span className="font-semibold text-cobalt">{code.method}</span> <PathTemplate path={code.path} />
      </div>
      {code.headers.map(([name, value]) => (
        <div key={name} className="break-all">
          <span className="text-ink-muted">{name}:</span> <span className="text-ink">{value}</span>
        </div>
      ))}
      {bodyEntries.length > 0 && (
        <>
          <div>&nbsp;</div>
          <div className="text-ink-muted">{'{'}</div>
          {bodyEntries.map(([key, value], i) => (
            <div key={key} className="pl-4">
              <span className="text-ink">"{key}"</span>
              <span className="text-ink-muted">: </span>
              <span className="text-ink-muted">"{value}"</span>
              {i < bodyEntries.length - 1 && <span className="text-ink-muted">,</span>}
            </div>
          ))}
          <div className="text-ink-muted">{'}'}</div>
        </>
      )}
    </pre>
  )
}

function CredentialBlock() {
  return (
    <div className="w-full rounded-md bg-cobalt-tint p-4">
      <p className="mb-2 text-[10px] font-medium tracking-wide text-ink-muted uppercase">Your credential</p>
      <code className="font-mono text-xs">
        <span className="text-ink-muted">Authorization:</span> <span className="text-ink">Bearer</span>{' '}
        <span className="text-ink-muted italic">&lt;your_api_key&gt;</span>
      </code>
    </div>
  )
}

function ChecklistBlock({ items }: { items: string[] }) {
  return (
    <div className="w-full rounded-md bg-cobalt-tint p-4">
      <p className="mb-2 text-xs font-semibold text-ink">What you just did</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-ink-muted">
            <Check className="h-3.5 w-3.5 shrink-0 text-cobalt" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CodePanelView({ code }: { code: CodePanel }) {
  if (code.kind === 'request') return <RequestBlock code={code} />
  if (code.kind === 'checklist') return <ChecklistBlock items={code.items} />
  return <CredentialBlock />
}

const AUTO_ADVANCE_MS = 5000
// Fade the two-panel content out, swap it, then fade back in — simpler than
// crossfading absolutely-positioned slides, and it naturally supports the
// panels reflowing from side-by-side to stacked on narrow viewports.
const FADE_MS = 150

export function CodeWalkthrough() {
  const { index, goTo, next, prev, containerProps } = useSlideshow(WALKTHROUGH_STEPS.length, AUTO_ADVANCE_MS)
  const [displayIndex, setDisplayIndex] = useState(index)
  const visible = index === displayIndex

  useEffect(() => {
    if (index === displayIndex) return

    const timeout = window.setTimeout(() => {
      setDisplayIndex(index)
    }, FADE_MS)

    return () => window.clearTimeout(timeout)
  }, [index, displayIndex])

  const step = WALKTHROUGH_STEPS[displayIndex]

  return (
    <div
      className="rounded-md border border-line bg-white p-5 outline-none"
      {...containerProps}
      role="group"
      aria-roledescription="carousel"
      aria-label="Code walkthrough for integrating the API"
    >
      <div className="relative">
        <div
          className={`grid grid-cols-1 items-center gap-6 px-8 transition-opacity md:grid-cols-2 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <div>
            <p className="text-xs font-medium text-cobalt">
              Step {displayIndex + 1} of {WALKTHROUGH_STEPS.length}
            </p>
            <h3 className="mt-1 text-base font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{step.explanation}</p>
            {step.links && (
              <div className="mt-3 flex flex-col gap-1.5">
                {step.links.map((link) => (
                  <Link key={link.to} to={link.to} className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
                    {link.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <CodePanelView code={step.code} />
          </div>
        </div>

        <SlideArrowButton direction="left" onClick={prev} />
        <SlideArrowButton direction="right" onClick={next} />
      </div>

      <SlideDots count={WALKTHROUGH_STEPS.length} activeIndex={index} onSelect={goTo} />
    </div>
  )
}
