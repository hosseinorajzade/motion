import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { categories, projects } from '../data/projects'
import { RevealText } from '../components/RevealText'
import { ProjectCard } from '../components/ProjectCard'
import { prefersReducedMotion } from '../lib/device'

const ALL = '__all'

export function Works() {
  const { t, lang, num } = useLanguage()
  const [filter, setFilter] = useState(ALL)
  const grid = useRef<HTMLDivElement>(null)
  const firstRun = useRef(true)
  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter)
  const labels = t.works.categories as Record<string, string>

  // Card entrance: mask the media from the bottom + subtle parallax
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        const media = card.querySelector('[data-card-media]')
        gsap.fromTo(
          media,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 90%', once: true } },
        )
      })
      // Only needed when the filter changed the grid height
      if (!firstRun.current) ScrollTrigger.refresh()
      firstRun.current = false
    }, grid)
    return () => ctx.revert()
  }, [filter])

  const choose = (cat: string) => {
    if (cat === filter) return
    if (prefersReducedMotion() || !grid.current) return setFilter(cat)
    gsap.to(grid.current.children, {
      opacity: 0,
      y: 30,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => setFilter(cat),
    })
  }

  return (
    <section id="work" className="container-x py-28 md:py-44">
      <div className="mb-14 flex flex-col gap-10 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow mb-6">{t.works.eyebrow}</span>
          <RevealText key={lang} as="h2" text={t.works.title} className="display text-[clamp(3rem,9vw,8.5rem)]" />
        </div>

        <div role="group" aria-label={t.works.eyebrow} className="flex flex-wrap gap-2 md:max-w-md md:justify-end">
          {[ALL, ...categories].map((cat) => {
            const active = cat === filter
            const count = cat === ALL ? projects.length : projects.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => choose(cat)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition-colors duration-500 ${
                  active ? 'border-accent bg-accent text-ink' : 'border-paper/15 text-paper/80 hover:border-paper/50'
                }`}
              >
                {cat === ALL ? t.works.all : (labels[cat] ?? cat)}
                <sup className="ms-1 text-[0.65em] opacity-70">{num(count)}</sup>
              </button>
            )
          })}
        </div>
      </div>

      <div ref={grid} key={filter} className="grid gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24">
        {visible.map((project, i) => (
          <div key={project.id} className={i % 2 === 1 ? 'md:mt-40' : ''}>
            <ProjectCard project={project} index={projects.indexOf(project)} />
          </div>
        ))}
        {visible.length === 0 && <p className="text-muted">{t.works.empty}</p>}
      </div>
    </section>
  )
}
