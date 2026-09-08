import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from '../seo'

interface PageMetaProps {
  title: string
  description: string
  /** Path from the site root, e.g. '/' or '/docs'. */
  path: string
  /** Absolute URL to a social preview image — defaults to the shared brand image. */
  image?: string
}

// Per-page <title>/<meta>/OG/Twitter/canonical tags, rendered via Helmet so
// scripts/prerender.mjs can capture them into each route's static HTML head.
export function PageMeta({ title, description, path, image = SITE_OG_IMAGE }: PageMetaProps) {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
