import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

// Used only by scripts/prerender.mjs (via a Vite SSR build of this file) —
// no data loaders here, so react-router-dom's plain StaticRouter is enough;
// no need for the data-router's createStaticHandler/StaticRouterProvider.
//
// react-helmet-async's usual SSR pattern reads collected tags back off a
// `context` object after renderToString. On React 19 that context is never
// populated — <title>/<meta>/<link> rendered inside <Helmet> are handled by
// React's own native document-metadata hoisting instead (they come out at
// the front of this render's HTML string). prerender.mjs pulls them out of
// `html` directly rather than reading `context.helmet`.
export function render(url: string): { html: string } {
  const html = renderToString(
    <HelmetProvider>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </HelmetProvider>,
  )

  return { html }
}
