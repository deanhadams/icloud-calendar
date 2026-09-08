import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation — without this,
// navigating to a new page keeps whatever scroll offset the previous page
// was at (e.g. a Concepts-section link jumping straight to the middle of
// the destination page).
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
