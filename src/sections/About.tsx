import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import { publicUrl } from '../data/projects'
import { prefersReducedMotion } from '../lib/device'
import site from '../data/site.json'

export function About() {
  const { t, lang } = useLanguage()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-portrait]', { yPercent: -12, scale: 1.15 }, {
        yPercent: 12,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: { trigger: '[data-portrait-frame]', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from('[data-fade]', {
        autoAlpha: 0,
        y: 40,
        stagger: 0.08,
        duration: 1.2,
        scrollTrigger: { trigger: '[data-fade-group]', start: 'top 80%', once: true },
      })
      gsap.from('[data-tool]', {
        autoAlpha: 0,
        y: 20,
        stagger: 0.04,
        duration: 1,
        scrollTrigger: { trigger: '[data-tools]', start: 'top 85%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [lang])

  return (
    <section id="about" ref={root} className="container-x border-t border-line py-28 md:py-44">
      <span className="eyebrow mb-6">{t.about.eyebrow}</span>
      <RevealText key={lang} as="h2" text={t.about.title} className="display max-w-5xl text-[clamp(2.75rem,7.5vw,7rem)]" />

      <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-8">
        <div data-portrait-frame className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-line md:col-span-5">
          <img
            data-portrait
            src={publicUrl(site.portrait)}
            alt={t.about.photoAlt}
            loading="lazy"
            decoding="async"
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>

        <div data-fade-group className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
          <div className="space-y-6 text-lg leading-relaxed text-paper/80 md:text-xl">
            {t.about.bio.map((p) => (
              <p data-fade key={p}>
                {p}
              </p>
            ))}
          </div>

          <dl className="grid grid-cols-3 gap-4 border-y border-line py-8">
            {t.about.stats.map((s) => (
              <div data-fade key={s.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-sm text-muted">{s.label}</dt>
                <dd className="display text-[clamp(2.25rem,5vw,4rem)] text-accent">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div data-tools>
            <h3 className="eyebrow mb-5">{t.about.toolsTitle}</h3>
            <ul className="flex flex-wrap gap-2" dir="ltr">
              {site.tools.map((tool) => (
                <li data-tool key={tool} className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/85 transition-colors duration-500 hover:border-accent hover:text-accent">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
