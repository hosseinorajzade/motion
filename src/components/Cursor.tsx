import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useIsTouch, useReducedMotion } from '../hooks/useMediaQuery'

type Mode = 'default' | 'link' | 'play' | 'view' | 'close'

/**
 * Custom cursor. Add data-cursor="play" | "view" | "close" to any element to change it.
 * Links and buttons get a hover state automatically.
 */
export function Cursor() {
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()
  const { t } = useLanguage()
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('default')
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()

  // The element under the pointer is gone after a route change
  useEffect(() => setMode('default'), [pathname])

  useEffect(() => {
    if (isTouch) return
    document.documentElement.classList.add('has-cursor')

    const lag = reduced ? 0.01 : 0.45
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: lag, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: lag, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      setVisible(true)
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)

      const target = e.target as HTMLElement | null
      const tagged = target?.closest<HTMLElement>('[data-cursor]')
      if (tagged) setMode(tagged.dataset.cursor as Mode)
      else if (target?.closest('a, button, [role="button"], input, label, select, textarea')) setMode('link')
      else setMode('default')
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [isTouch, reduced])

  if (isTouch) return null

  const labelled = mode === 'play' || mode === 'view' || mode === 'close'
  const label = labelled ? t.cursor[mode] : ''

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-500 ease-expo ${
            labelled
              ? 'h-24 w-24 border-accent bg-accent text-ink'
              : mode === 'link'
                ? 'h-14 w-14 border-paper/60 bg-paper/5 backdrop-blur-[2px]'
                : 'h-9 w-9 border-paper/30'
          }`}
        >
          <span className={`font-display text-sm font-semibold transition-opacity duration-300 ${labelled ? 'opacity-100' : 'opacity-0'}`}>
            {mode === 'play' && <PlayGlyph />}
            {label}
          </span>
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0">
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper transition-transform duration-300 ${labelled ? 'scale-0' : 'scale-100'}`} />
      </div>
    </div>
  )
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 10 12" className="mb-0.5 me-1.5 inline h-2.5 w-2.5 fill-current rtl:-scale-x-100">
      <path d="M0 0l10 6-10 6z" />
    </svg>
  )
}
