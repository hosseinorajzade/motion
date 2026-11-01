import { createContext, useCallback, useContext, useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useSmoothScroll } from './SmoothScroll'
import { prefersReducedMotion } from '../lib/device'

interface TransitionValue {
  /** Covers the screen, runs `action`, then reveals the new state */
  run: (action: () => void, opts?: { keepScroll?: boolean }) => void
  go: (to: string, state?: unknown) => void
}

const TransitionContext = createContext<TransitionValue | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { dir, t } = useLanguage()
  const { scrollTo } = useSmoothScroll()
  const busy = useRef(false)
  const panelA = useRef<HTMLDivElement>(null)
  const panelB = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)

  const run = useCallback(
    (action: () => void, { keepScroll = false } = {}) => {
      if (busy.current) return
      if (prefersReducedMotion()) {
        action()
        requestAnimationFrame(() => ScrollTrigger.refresh())
        return
      }
      busy.current = true
      // Panels wipe in from the reading-start side: left in LTR, right in RTL
      const s = dir === 'rtl' ? 1 : -1
      const panels = [panelA.current, panelB.current]
      gsap
        .timeline({
          defaults: { ease: 'expo.inOut', duration: 0.8 },
          onComplete: () => {
            busy.current = false
            gsap.set(panels, { visibility: 'hidden' })
          },
        })
        .set(panels, { xPercent: 100 * s, visibility: 'visible' })
        .to(panelA.current, { xPercent: 0 })
        .to(panelB.current, { xPercent: 0 }, 0.08)
        .fromTo(label.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.45)
        .add(() => {
          action()
          if (!keepScroll) scrollTo(0, { immediate: true })
        })
        .to(label.current, { autoAlpha: 0, y: -20, duration: 0.4, ease: 'expo.in' }, '+=0.15')
        .to(panelB.current, { xPercent: -100 * s })
        .to(panelA.current, { xPercent: -100 * s }, '<0.08')
        .add(() => ScrollTrigger.refresh(), '<0.1')
    },
    [dir, scrollTo],
  )

  const go = useCallback((to: string, state?: unknown) => run(() => navigate(to, { state })), [run, navigate])

  return (
    <TransitionContext.Provider value={{ run, go }}>
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
        <div ref={panelA} className="invisible absolute inset-0 bg-accent" />
        <div ref={panelB} className="invisible absolute inset-0 grid place-items-center bg-ink">
          <div ref={label} className="font-display text-2xl font-medium tracking-tight text-paper opacity-0">
            {t.name}
            <span className="text-accent">.</span>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransition must be used inside <TransitionProvider>')
  return ctx
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode }

/** A router link that plays the page transition. Keeps a real href for accessibility / open-in-new-tab. */
export function TransitionLink({ to, children, onClick, ...rest }: LinkProps) {
  const { go } = useTransition()
  const location = useLocation()
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        if (location.pathname !== to) go(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
