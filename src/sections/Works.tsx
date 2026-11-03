import { useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { categories, isVertical, projects } from '../data/projects'
import { RevealText } from '../components/RevealText'
import { ProjectCard } from '../components/ProjectCard'
import { prefersReducedMotion } from '../lib/device'

const ALL = '__all'

// Desktop columns for the vertical row, so a fifth clip doesn't sit alone on a second line
const TALL_COLS: Record<number, string> = { 3: 'lg:grid-cols-3', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3', 7: 'lg:grid-cols-4', 9: 'lg:grid-cols-3' }

export function Works() {
  const { t, lang, num } = useLanguage()
  const [filter, setFilter] = useState(ALL)
  const grid = useRef<HTMLDivElement>(null)
  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter)
  const labels = t.works.categories as Record<string, string>
  const wide = visible.filter((p) => !isVertical(p))
  const tall = visible.filter(isVertical)

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

      {/* Wide films get a row each; vertical clips sit side by side like a timeline */}
      <div ref={grid} key={filter} className="container-x flex flex-col gap-16 md:gap-24">
        {wide.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {tall.length > 0 && (
          <div className={`grid grid-cols-2 gap-x-4 gap-y-10 md:gap-6 ${TALL_COLS[tall.length] ?? 'lg:grid-cols-4'}`}>
            {tall.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
        {visible.length === 0 && <p className="text-muted">{t.works.empty}</p>}
      </div>
    </section>
  )
}
