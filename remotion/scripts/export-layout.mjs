// Writes the keyboard layout to out/tact_layout.json so the score can place every key's "thock".
import { buildSync } from 'esbuild'
import fs from 'node:fs'

const { outputFiles } = buildSync({ entryPoints: ['src/tact/layout.ts'], bundle: true, format: 'esm', write: false })
const mod = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'))
fs.mkdirSync('out', { recursive: true })
fs.writeFileSync('out/tact_layout.json', JSON.stringify({ keys: mod.KEYS, esc: mod.ESC, enter: mod.ENTER }))
console.log('keys:', mod.KEYS.length)
