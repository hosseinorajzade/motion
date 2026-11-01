type NavigatorExtras = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

const media = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const prefersReducedMotion = () => media('(prefers-reduced-motion: reduce)')
export const isTouch = () => media('(hover: none), (pointer: coarse)')

export const saveData = () => {
  const c = (navigator as NavigatorExtras).connection
  return Boolean(c?.saveData) || /2g/.test(c?.effectiveType ?? '')
}

export type PerformanceTier = 'high' | 'low'

/** Rough device classification used to simplify the 3D scene on phones and weak hardware. */
export function getPerformanceTier(): PerformanceTier {
  const nav = navigator as NavigatorExtras
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const smallTouch = isTouch() && window.innerWidth < 1024
  if (saveData() || smallTouch || cores < 4 || memory < 4) return 'low'
  return 'high'
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}
