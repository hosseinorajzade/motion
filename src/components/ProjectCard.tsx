import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatTimecode, isVertical, projectAsset, type Project } from '../data/projects'
import { TransitionLink } from './Transition'
import { LazyVideo } from './Video'
import { useIsTouch } from '../hooks/useMediaQuery'
import { getPerformanceTier } from '../lib/device'

/**
 * A project as a clip on the timeline: the uncropped frame in its real
 * aspect ratio, with its running time where an editor would look for it.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { t, lang, num } = useLanguage()
  const video = useRef<HTMLVideoElement>(null)
  const isTouch = useIsTouch()
  // On touch screens previews play while visible (skipped on weak devices / data saver)
  const autoPreview = isTouch && getPerformanceTier() === 'high'
  const title = project.title[lang]
  const category = (t.works.categories as Record<string, string>)[project.category] ?? project.category
  const vertical = isVertical(project)

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
        <div className={`relative overflow-hidden rounded-lg bg-line ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
          <img
            src={projectAsset(project, project.thumbnail)}
            alt=""
            loading="lazy"
            decoding="async"
            width={vertical ? 720 : 1280}
            height={vertical ? 1280 : 720}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {project.previewVideo && (
            <LazyVideo
              ref={video}
              autoPlayInView={autoPreview}
              src={projectAsset(project, project.previewVideo)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${autoPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
            />
          )}
          {project.duration !== undefined && (
            <span className="timecode absolute bottom-3 start-3 rounded bg-ink/70 px-2 py-1 text-xs text-paper backdrop-blur-sm" dir="ltr">
              {num(formatTimecode(project.duration))}
            </span>
          )}
          {/* Playhead: sweeps across the frame while the preview plays */}
          <span
            aria-hidden
            className="absolute inset-y-0 start-0 w-px bg-accent opacity-0 group-hover:animate-[playhead_6s_linear_infinite] group-hover:opacity-100"
          />
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold leading-tight transition-colors duration-300 group-hover:text-accent md:text-2xl">
          {title}
        </h3>
        <p className="mt-1 flex flex-wrap justify-between gap-x-4 text-sm text-muted">
          <span>
            {project.client}
            <span className="sr-only">, </span>
          </span>
          <span className="shrink-0">
            {category}, <span className="timecode">{num(project.year)}</span>
          </span>
        </p>
      </TransitionLink>
    </article>
  )
}
