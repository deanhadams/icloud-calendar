import { useEffect, useState, type KeyboardEvent } from 'react'

// Shared carousel mechanics: auto-advance that pauses on hover or after the
// first manual interaction, plus keyboard arrow navigation. Used by both
// SetupSlideshow and CodeWalkthrough so their behavior can't drift apart.
export function useSlideshow(slideCount: number, autoAdvanceMs: number) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    if (hovered || interacted) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount)
    }, autoAdvanceMs)

    return () => window.clearInterval(id)
  }, [hovered, interacted, slideCount, autoAdvanceMs])

  const goTo = (target: number) => {
    setInteracted(true)
    setIndex(((target % slideCount) + slideCount) % slideCount)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(index + 1)
    }
  }

  return {
    index,
    goTo,
    next: () => goTo(index + 1),
    prev: () => goTo(index - 1),
    containerProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onKeyDown: handleKeyDown,
      tabIndex: 0 as const,
    },
  }
}
