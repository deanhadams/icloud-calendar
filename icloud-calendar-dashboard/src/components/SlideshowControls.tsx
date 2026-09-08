import { ChevronLeft, ChevronRight } from 'lucide-react'

export function SlideArrowButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight
  const sideClass = direction === 'left' ? '-left-3' : '-right-3'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous step' : 'Next step'}
      className={`absolute top-1/2 ${sideClass} flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-cobalt shadow-sm transition-colors hover:bg-cobalt-tint`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function SlideDots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="mt-4 flex justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to step ${i + 1}`}
          aria-current={i === activeIndex}
          className={`h-2 w-2 rounded-full transition-colors ${i === activeIndex ? 'bg-cobalt' : 'border border-line'}`}
        />
      ))}
    </div>
  )
}
