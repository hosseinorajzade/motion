import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

interface ScrollValue {
  lenis: Lenis | null
  scrollTo: (target: string | number | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void
  lock: (locked: boolean) => void
}

const ScrollContext = createContext<ScrollValue>({ lenis: null, scrollTo: () => {}, lock: () => {} })

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    lenisRef.current = instance
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenisRef.current = null
      setLenis(null)
    }
  }, [reduced])

  const scrollTo = useCallback<ScrollValue['scrollTo']>((target, opts = {}) => {
    const l = lenisRef.current
    if (l) {
      // The page may have just changed — re-measure so the scroll limit isn't stale
      l.resize()
      l.scrollTo(target, { immediate: opts.immediate, offset: opts.offset ?? 0, force: true })
      return
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    const top = typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0) : 0
    window.scrollTo({ top, behavior: opts.immediate || reduced ? 'auto' : 'smooth' })
  }, [reduced])

  const lock = useCallback((locked: boolean) => {
    const l = lenisRef.current
    if (l) locked ? l.stop() : l.start()
    document.documentElement.style.overflow = locked ? 'hidden' : ''
  }, [])

  return <ScrollContext.Provider value={{ lenis, scrollTo, lock }}>{children}</ScrollContext.Provider>
}

export const useSmoothScroll = () => useContext(ScrollContext)
