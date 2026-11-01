import { useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useSeo } from '../hooks/useSeo'
import { formatTimecode, getNextProject, getProject, isVertical, projectAsset } from '../data/projects'
import { RevealText } from '../components/RevealText'
import { TransitionLink } from '../components/Transition'
import { VideoPlayer } from '../components/Video'
import { ArrowIcon } from '../components/Icons'
import { prefersReducedMotion } from '../lib/device'
import NotFound from './NotFound'

export default function ProjectPage() {
  const { id } = useParams()
  const project = getProject(id)
  if (!project) return <NotFound message="project" />
  return <ProjectDetail key={project.id} id={project.id} />
}

function ProjectDetail({ id }: { id: string }) {
  const { t, lang, num } = useLanguage()
  const project = getProject(id)!
  const next = getNextProject(id)
  const root = useRef<HTMLElement>(null)
  const title = project.title[lang]
  const category = (t.works.categories as Record<string, string>)[project.category] ?? project.category
  const resolve = (file: string) => projectAsset(project, file)
  const vertical = isVertical(project)
  useSeo(t.meta.projectTitle.replace('{project}', title), project.description[lang])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-player]', { autoAlpha: 0, y: 60, duration: 1.4, delay: 0.6 })
    }, root)
    return () => ctx.revert()
  }, [lang])

  const meta: [string, string][] = [
    [t.project.client, project.client],
    [t.project.year, num(project.year)],
    [t.project.category, category],
    ...(project.duration !== undefined ? [[t.project.duration, num(formatTimecode(project.duration))] as [string, string]] : []),
    [t.project.tools, project.tools.join(', ')],
  ]

  return (
    <article ref={root} className="pt-32 md:pt-44">
      <header className="container-x">
        <TransitionLink to="/" className="link-underline mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-paper">
          <ArrowIcon className="h-4 w-4 rotate-180" />
          {t.project.back}
        </TransitionLink>
        <RevealText key={lang} as="h1" text={title} trigger="mount" delay={0.35} className="display text-[clamp(3rem,10vw,10rem)]" />
      </header>

      <div className="container-x mt-12 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-8">
        {project.fullVideo && (
          <div data-player className={vertical ? 'md:col-span-5 md:self-start md:sticky md:top-28' : 'md:col-span-12'}>
            <VideoPlayer url={project.fullVideo} resolve={resolve} poster={resolve(project.thumbnail)} title={title} vertical={vertical} />
          </div>
        )}

        <div className={vertical ? 'md:col-span-6 md:col-start-7' : 'md:col-span-8 md:col-start-5'}>
          <p className="max-w-[56ch] text-xl leading-relaxed text-paper/85 md:text-2xl md:leading-snug">{project.description[lang]}</p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8">
            {meta.map(([label, value]) => (
              <div key={label} className={label === t.project.tools ? 'col-span-2' : ''}>
                <dt className="mb-1 text-sm text-muted">{label}</dt>
                <dd className="text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {project.gallery.length > 0 && (
        <section className="container-x mt-24 md:mt-40" aria-labelledby="stills-title">
          <h2 id="stills-title" className="mb-6 text-sm text-muted">
            {t.project.gallery}
          </h2>
          <div className={`grid gap-4 md:gap-6 ${vertical ? 'grid-cols-2 md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {project.gallery.map((file, i) => (
              <div key={file} className={`overflow-hidden rounded-lg bg-line ${!vertical && i % 3 === 0 ? 'md:col-span-2' : ''}`}>
                <img
                  src={resolve(file)}
                  alt={`${title} — ${num(i + 1)}`}
                  loading="lazy"
                  decoding="async"
                  className={`w-full object-cover ${vertical ? 'aspect-[9/16]' : i % 3 === 0 ? 'aspect-video' : 'aspect-[4/3]'}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {next && next.id !== project.id && (
        <TransitionLink to={`/work/${next.id}`} data-cursor="view" className="group mt-32 block border-t border-line py-16 md:mt-48 md:py-24">
          <div className="container-x">
            <span className="mb-4 block text-sm text-muted">{t.project.next}</span>
            <span className="display flex items-center gap-6 text-[clamp(2.5rem,8vw,8rem)] transition-colors duration-300 group-hover:text-accent">
              {next.title[lang]}
              <ArrowIcon className="h-[0.5em] w-[0.5em] shrink-0 transition-transform duration-500 ease-expo group-hover:translate-x-4 rtl:group-hover:-translate-x-4" />
            </span>
          </div>
        </TransitionLink>
      )}
    </article>
  )
}
