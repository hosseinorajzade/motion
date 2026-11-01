import { Config } from '@remotion/cli/config'

// Media (project clips, portrait…) is read straight from the site's public/ folder.
Config.setPublicDir('../public')
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(95)
// Software WebGL so three.js scenes render on machines without a GPU.
Config.setChromiumOpenGlRenderer('swangle')
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER)
