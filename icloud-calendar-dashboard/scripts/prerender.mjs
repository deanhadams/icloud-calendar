// Runs after `vite build` (see package.json's "build" script). Builds a
// small Node-compatible SSR bundle of src/entry-server.tsx, renders each of
// the public routes with it, and writes real HTML files into dist/ so
// crawlers see actual page content instead of an empty <div id="root"></div>.
//
// Deliberately NOT using a third-party SSG framework here: vite-react-ssg
// (the obvious off-the-shelf choice) still imports the pre-v7 subpath
// 'react-router-dom/server.js' internally, which no longer exists in
// react-router-dom v7's package exports (confirmed by actually running its
// build against this project — it throws ERR_PACKAGE_PATH_NOT_EXPORTED).
// vite-react-ssg's own README says as much: it recommends React Router v7
// users use v7's own SSG support instead. Full framework-mode migration
// (@react-router/dev, entry.client/server.tsx, app/routes.ts conventions)
// would be a much bigger rewrite than this project's declarative <Routes>
// setup needs, so this script uses the same first-party primitives
// (StaticRouter + renderToString) directly, at a fraction of the surface
// area — no data loaders, so the simpler non-data-router API is enough.
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const ssrOutDir = path.join(root, '.prerender-ssr')

// The only routes that get static HTML generated at build time — everything
// else (/dashboard/*, the catch-all redirect) stays purely client-rendered,
// since there's no authenticated content worth prerendering or indexing.
const ROUTES = ['/', '/docs', '/docs/apple-app-password', '/docs/quickstart-walkthrough']

async function buildSsrBundle() {
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: path.relative(root, ssrOutDir),
      emptyOutDir: true,
      rollupOptions: {
        output: { entryFileNames: 'entry-server.mjs' },
      },
    },
  })
}

// React 19 natively hoists <title>/<meta>/<link> rendered anywhere in the
// tree to the front of the renderToString() output (this is why
// entry-server.tsx doesn't need react-helmet-async's context-extraction
// path — see the comment there). <script> tags (our JSON-LD) are NOT
// hoisted this way and are left inline in the body, which is still fully
// valid placement for structured data.
const LEADING_HEAD_TAG_RE = /^(<title>.*?<\/title>|<meta\b[^>]*\/>|<link\b[^>]*\/>)/s

function splitHeadFromBody(html) {
  const headTags = []
  let body = html
  let match = body.match(LEADING_HEAD_TAG_RE)
  while (match) {
    headTags.push(match[1])
    body = body.slice(match[1].length)
    match = body.match(LEADING_HEAD_TAG_RE)
  }
  return { head: headTags.join('\n    '), body }
}

async function main() {
  if (!existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('dist/index.html not found — run `vite build` before this script.')
  }

  console.log('[prerender] building SSR bundle...')
  await buildSsrBundle()

  const template = await readFile(path.join(distDir, 'index.html'), 'utf-8')
  const entryUrl = pathToFileURL(path.join(ssrOutDir, 'entry-server.mjs')).href
  const { render } = await import(`${entryUrl}?t=${Date.now()}`)

  for (const routePath of ROUTES) {
    const { html: rawHtml } = render(routePath)
    const { head, body } = splitHeadFromBody(rawHtml)

    let pageHtml = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    // The template ships a placeholder <title> for routes that never get
    // prerendered (e.g. /dashboard/*) — replace it rather than appending, so
    // prerendered pages don't end up with two <title> tags.
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/s, head)

    const outPath =
      routePath === '/' ? path.join(distDir, 'index.html') : path.join(distDir, routePath, 'index.html')

    await mkdir(path.dirname(outPath), { recursive: true })
    await writeFile(outPath, pageHtml, 'utf-8')
    console.log(`[prerender] wrote ${path.relative(root, outPath)}`)
  }

  await rm(ssrOutDir, { recursive: true, force: true })
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exitCode = 1
})
