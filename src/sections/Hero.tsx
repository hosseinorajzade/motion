import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import { getPerformanceTier, hasWebGL, prefersReducedMotion } from '../lib/device'
import { useApp } from '../AppContext'

const HeroScene = lazy(() => import('../three/HeroScene'))

export function Hero() {
  const { t, lang } = useLanguage()
  const { loaded } = useApp()
  const root = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const quality = useMemo(() => ({ tier: getPerformanceTier(), reduced: prefersReducedMotion(), webgl: hasWebGL() }), [])
  const otherRole = lang === 'fa' ? 'Motion Designer' : 'طراح موشن'

  // The 3D scene (three.js, ~220 KB gzipped) starts on the first interaction —
  // a mouse move, scroll, touch or key press — keeping the initial load light.
  // A CSS orb stands in until the first frame is rendered, then cross-fades out.
  const [start3D, setStart3D] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    if (!quality.webgl || start3D) return
    const go = () => setStart3D(true)
    // Real input only — scripts (Lenis, ScrollTrigger) also fire 'scroll', which isn't the visitor
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'pointermove'] as const
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, go))
  }, [quality.webgl, start3D])

  const onSceneReady = useCallback(() => {
    setSceneReady(true)
  }, [])

  // Fade/lift the hero copy as the visitor scrolls away
  useLayoutEffect(() => {
    if (quality.reduced) return
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [quality.reduced])

  useLayoutEffect(() => {
    if (!loaded || quality.reduced) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-fade]', { autoAlpha: 0, y: 30, duration: 1.4, stagger: 0.1, delay: 1.1 })
    }, root)
    return () => ctx.revert()
  }, [loaded, quality.reduced, lang])

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-label={t.name}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgb(var(--color-accent)/0.14),transparent_70%)]" aria-hidden />
      <div
        aria-hidden
        className={`absolute left-1/2 top-[44%] aspect-square w-[min(62vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-1000 ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #2a2340 0%, #0d0c12 55%, transparent 71%)',
          boxShadow: 'inset -24px -18px 70px rgb(var(--color-accent) / 0.55), inset 18px 10px 50px rgb(90 70 255 / 0.22), 0 0 120px rgb(var(--color-accent) / 0.2)',
        }}
      />
      {start3D && (
        <Suspense fallback={null}>
          <HeroScene tier={quality.tier} reduced={quality.reduced} onReady={onSceneReady} />
        </Suspense>
      )}

      <div ref={content} className="container-x pointer-events-none relative z-10 flex flex-1 flex-col justify-between pb-10 pt-32 md:pb-28 md:pt-40">
        <p data-hero-fade className="eyebrow">{t.hero.available}</p>

        <div>
          <RevealText
            key={lang}
            as="h1"
            text={t.name}
            trigger="manual"
            play={loaded}
            delay={0.75}
            className="display text-[clamp(3rem,12vw,12.5rem)]"
          />
          <div className="mt-6 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p data-hero-fade className="font-display text-2xl font-light md:text-4xl">
              {t.role}
              <span className="mx-3 text-accent">/</span>
              <span className="text-muted" lang={lang === 'fa' ? 'en' : 'fa'}>
                {otherRole}
              </span>
            </p>
            <p data-hero-fade className="max-w-sm text-base leading-relaxed text-paper/70">
              {t.hero.intro}
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}
