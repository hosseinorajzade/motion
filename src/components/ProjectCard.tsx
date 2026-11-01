import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { projectAsset, type Project } from '../data/projects'
import { TransitionLink } from './Transition'
import { LazyVideo } from './Video'
import { ArrowUpRightIcon } from './Icons'
import { useIsTouch } from '../hooks/useMediaQuery'
import { getPerformanceTier } from '../lib/device'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t, lang, num } = useLanguage()
  const video = useRef<HTMLVideoElement>(null)
  const isTouch = useIsTouch()
  // On touch screens previews play while visible (skipped on weak devices / data saver)
  const autoPreview = isTouch && getPerformanceTier() === 'high'
  const title = project.title[lang]
  const category = (t.works.categories as Record<string, string>)[project.category] ?? project.category

  const play = () => {
    const v = video.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }
  const stop = () => video.current?.pause()

  return (
    <article data-card className="group">
      <TransitionLink
        to={`/work/${project.id}`}
        data-cursor="view"
        onPointerEnter={isTouch ? undefined : play}
        onPointerLeave={isTouch ? undefined : stop}
        onFocus={play}
        onBlur={stop}
        className="block"
      >
        <div data-card-media className="relative aspect-[4/3] overflow-hidden rounded-xl bg-line md:rounded-2xl">
          <img
            src={projectAsset(project, project.thumbnail)}
            alt=""
            loading="lazy"
            decoding="async"
            width={960}
            height={720}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
          />
          {project.previewVideo && (
            <LazyVideo
              ref={video}
              autoPlayInView={autoPreview}
              src={projectAsset(project, project.previewVideo)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${autoPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
            />
          )}
          <span className="absolute start-4 top-4 rounded-full bg-ink/60 px-3 py-1 text-xs text-paper backdrop-blur-md">{category}</span>
          <span className="absolute bottom-4 end-4 grid h-11 w-11 scale-0 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 ease-expo group-hover:scale-100">
            <ArrowUpRightIcon className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
            <span className="me-3 font-body text-sm text-muted">{num(String(index + 1).padStart(2, '0'))}</span>
            {title}
          </h3>
          <span className="shrink-0 text-sm text-muted">
            {project.client} · {num(project.year)}
          </span>
        </div>
      </TransitionLink>
    </article>
  )
}
