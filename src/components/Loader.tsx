import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { onProgress } from '../lib/loading'
import { useLanguage } from '../i18n/LanguageContext'
import { prefersReducedMotion } from '../lib/device'

const MAX_WAIT = 7000

/** Full-screen loading screen with a real progress counter. Calls onDone once it has left. */
export function Loader({ onDone }: { onDone: () => void }) {
  const { t, num } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const state = { value: 0 }
    let target = 0
    let finished = false
    const reduced = prefersReducedMotion()

    const exit = () => {
      if (finished) return
      finished = true
      if (reduced) {
        setGone(true)
        onDone()
        return
      }
      // Signal now: the page underneath times its intro to the curtain lifting
      onDone()
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to('[data-loader-fade]', { autoAlpha: 0, y: -24, duration: 0.4, ease: 'expo.in', stagger: 0.03 })
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
    }

    const animateTo = (p: number) => {
      target = Math.max(target, p)
      gsap.to(state, {
        value: target * 100,
        duration: reduced ? 0 : 0.6,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: () => {
          setShown(Math.round(state.value))
          if (bar.current) bar.current.style.transform = `scaleX(${state.value / 100})`
        },
        onComplete: () => {
          if (target >= 1) gsap.delayedCall(reduced ? 0 : 0.1, exit)
        },
      })
    }

    const unsubscribe = onProgress(animateTo)
    const timeout = window.setTimeout(() => animateTo(1), MAX_WAIT)
    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
      gsap.killTweensOf(state)
    }
  }, [onDone])

  if (gone) return null

  return (
    <div
      ref={root}
      role="progressbar"
      aria-label={t.loader.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      className="fixed inset-0 z-[95] flex flex-col justify-between bg-ink p-[var(--gutter)]"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div data-loader-fade className="flex items-center justify-between text-sm text-muted">
        <span className="font-display text-paper">{t.name}</span>
        <span>{t.role}</span>
      </div>

      <div data-loader-fade className="flex items-end justify-between gap-6">
        <span className="eyebrow">{t.loader.label}</span>
        <span className="display text-[clamp(5rem,20vw,16rem)] leading-none tabular-nums">
          {num(shown)}
          <span className="text-accent">%</span>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-line">
        <div ref={bar} className="h-full origin-left bg-accent rtl:origin-right" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}
