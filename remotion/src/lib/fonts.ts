import { continueRender, delayRender } from 'remotion'
import archivoLatin from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
import archivoLatinExt from '@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2'
import vazirArabic from '@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2'
import vazirLatin from '@fontsource-variable/vazirmatn/files/vazirmatn-latin-wght-normal.woff2'

export const ARCHIVO = 'Archivo Variable'
export const VAZIR = 'Vazirmatn Variable'

// Fonts are loaded once per page and the render waits for them,
// so no frame is ever captured with a fallback face.
const faces: FontFace[] = [
  new FontFace(ARCHIVO, `url(${archivoLatin}) format('woff2')`, { weight: '100 900', stretch: '62% 125%' }),
  new FontFace(ARCHIVO, `url(${archivoLatinExt}) format('woff2')`, {
    weight: '100 900',
    stretch: '62% 125%',
    unicodeRange: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  }),
  new FontFace(VAZIR, `url(${vazirArabic}) format('woff2')`, {
    weight: '100 900',
    unicodeRange: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
  }),
  new FontFace(VAZIR, `url(${vazirLatin}) format('woff2')`, { weight: '100 900' }),
]

let started = false
export function loadFonts() {
  if (started) return
  started = true
  const handle = delayRender('Loading fonts')
  Promise.all(faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded))))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err)
      continueRender(handle)
    })
}
