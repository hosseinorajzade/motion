import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { LazyVideo, VideoModal } from '../components/Video'
import { publicUrl } from '../data/projects'
import { prefersReducedMotion } from '../lib/device'
import site from '../data/site.json'

export function Showreel() {
  const { t } = useLanguage()
  const section = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  // The frame grows from an inset card to full-bleed while the section is pinned
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (c) => {
        const desktop = c.conditions?.desktop
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section.current,
              start: 'top top',
              end: desktop ? '+=120%' : '+=60%',
              scrub: true,
              pin: true,
            },
          })
          .fromTo(
            frame.current,
            { clipPath: desktop ? 'inset(18% 22% 18% 22% round 28px)' : 'inset(22% 6% 22% 6% round 18px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' },
          )
          .fromTo('[data-reel-video]', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
          .fromTo('[data-reel-caption]', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.35 }, 0.65)
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden" aria-label={t.showreel.title}>
      <div ref={frame} className="absolute inset-0 overflow-hidden bg-line">
        <button data-cursor="play" onClick={() => setOpen(true)} aria-label={t.showreel.title} className="absolute inset-0 block h-full w-full">
          <LazyVideo
            data-reel-video
            autoPlayInView
            src={publicUrl(site.showreel.preview)}
            poster={publicUrl(site.showreel.poster)}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        </button>
        <div data-reel-caption className="container-x pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pb-8 md:pb-12">
          <div>
            <p className="display text-[clamp(2.5rem,8vw,7rem)]">{t.showreel.title}</p>
          </div>
          <span className="hidden text-sm text-paper/70 md:block">{t.showreel.hint}</span>
        </div>
      </div>


      {open && <VideoModal url={site.showreel.full} poster={publicUrl(site.showreel.poster)} title={t.showreel.title} onClose={close} />}
    </section>
  )
}
