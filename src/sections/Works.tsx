import { useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { categories, isVertical, projects } from '../data/projects'
import { RevealText } from '../components/RevealText'
import { ProjectCard } from '../components/ProjectCard'
import { prefersReducedMotion } from '../lib/device'

const ALL = '__all'

export function Works() {
  const { t, lang, num } = useLanguage()
  const [filter, setFilter] = useState(ALL)
  const grid = useRef<HTMLDivElement>(null)
  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter)
  const labels = t.works.categories as Record<string, string>

  const choose = (cat: string) => {
    if (cat === filter) return
    if (prefersReducedMotion() || !grid.current) return setFilter(cat)
    gsap.to(grid.current.children, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setFilter(cat),
    })
  }

  return (
    <section id="work" className="py-28 md:py-40">
      <div className="container-x mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
        <RevealText key={lang} as="h2" text={t.works.title} className="display max-w-3xl text-[clamp(2.5rem,6.5vw,6rem)]" />

        <div role="group" aria-label={t.works.filterLabel} className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
          {[ALL, ...categories].map((cat) => {
            const active = cat === filter
            const count = cat === ALL ? projects.length : projects.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => choose(cat)}
                aria-pressed={active}
                className={`border-b py-1 transition-colors duration-300 ${
                  active ? 'border-accent text-paper' : 'border-transparent text-muted hover:text-paper'
                }`}
              >
                {cat === ALL ? t.works.all : (labels[cat] ?? cat)}
                <span className="timecode ms-1.5 text-muted">{num(count)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Clips side by side, like a timeline: two across on phones, four on wide screens */}
      <div
        ref={grid}
        key={filter}
        className="container-x grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
      >
        {visible.map((project) => (
          <div key={project.id} className={`min-w-0 ${isVertical(project) ? '' : 'col-span-2'}`}>
            <ProjectCard project={project} />
          </div>
        ))}
        {visible.length === 0 && <p className="text-muted">{t.works.empty}</p>}
      </div>
    </section>
  )
}
