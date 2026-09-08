// Single source of truth for the production origin, shared by PageMeta,
// the sitemap, and robots.txt.
export const SITE_URL = 'https://icloud-calendar-dashboard-production.up.railway.app'
export const SITE_NAME = 'Syncal'

// Shared OG/Twitter preview image, used as PageMeta's default `image` across
// all public pages. Social platforms require an absolute URL — they fetch
// this server-side, not through the visitor's browser.
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`
