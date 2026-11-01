// Contact-sheet helper: renders chosen frames of a composition to PNGs.
// usage: node scripts/stills.mjs <CompositionId> <outDir> <frame> [frame...]
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import fs from 'node:fs'

const [id, outDir, ...frames] = process.argv.slice(2)
const browserExecutable = process.env.REMOTION_BROWSER ?? null
fs.mkdirSync(outDir, { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('../public') })
const chromiumOptions = { gl: 'swangle' }
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions })
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `${id}-${String(f).padStart(4, '0')}.png`)
  await renderStill({ serveUrl, composition, frame: f, output, browserExecutable, chromiumOptions, scale: 0.5 })
  console.log('wrote', output)
}
