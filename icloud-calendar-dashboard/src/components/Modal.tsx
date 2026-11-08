import { X, type LucideIcon } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
  /** Optional brand mark rendered in a cobalt-tinted circle above the title. */
  icon?: LucideIcon
  /** Optional supporting line under the title. */
  description?: ReactNode
}

export function Modal({
  title,
  onClose,
  children,
  maxWidthClassName = 'max-w-[400px]',
  icon: Icon,
  description,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`modal-panel relative w-full ${maxWidthClassName} overflow-hidden rounded-md border border-line`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Brand edge: cobalt → violet, the hero glow's colour pair. */}
        <div
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cobalt to-violet"
          aria-hidden="true"
        />
        {/* Grid texture, clipped to the panel by overflow-hidden. */}
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative px-9 pt-10 pb-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-ink/[0.07] hover:text-ink focus-visible:bg-ink/[0.07] focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {Icon && (
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-cobalt-tint-strong">
              <Icon className="h-5 w-5 text-cobalt" aria-hidden="true" />
            </div>
          )}

          <h2 id={titleId} className="pr-8 text-xl leading-snug font-bold text-balance text-ink">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">
              {description}
            </p>
          )}

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
