import { useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useSeo } from '../hooks/useSeo'
import { getNextProject, getProject, isVertical, projectAsset } from '../data/projects'
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
      gsap.from('[data-meta]', { autoAlpha: 0, y: 24, stagger: 0.07, duration: 1.2, delay: 0.5 })
      gsap.from('[data-player]', { autoAlpha: 0, y: 80, duration: 1.6, delay: 0.7 })
      gsap.utils.toArray<HTMLElement>('[data-still]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(15% 15% 15% 15% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true } },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [lang])

  return (
    <article ref={root} className="pt-32 md:pt-44">
      <header className="container-x">
        <TransitionLink to="/" className="link-underline mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-paper">
          <ArrowIcon className="h-4 w-4 rotate-180" />
          {t.project.back}
        </TransitionLink>
        <RevealText key={lang} as="h1" text={title} trigger="mount" delay={0.35} className="display text-[clamp(3.5rem,13vw,13rem)]" />

        <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-8 md:grid-cols-4">
          {[
            [t.project.client, project.client],
            [t.project.year, num(project.year)],
            [t.project.category, category],
            [t.project.tools, project.tools.join(', ')],
          ].map(([label, value]) => (
            <div data-meta key={label}>
              <dt className="eyebrow mb-2">{label}</dt>
              <dd className="text-lg">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {project.fullVideo && (
        <div data-player className="container-x mt-16 md:mt-24">
          <VideoPlayer url={project.fullVideo} resolve={resolve} poster={resolve(project.thumbnail)} title={title} vertical={vertical} />
        </div>
      )}

      <div className="container-x mt-20 grid gap-8 md:mt-32 md:grid-cols-12">
        <p className="text-xl leading-relaxed text-paper/85 md:col-span-8 md:col-start-5 md:text-3xl md:leading-snug">{project.description[lang]}</p>
      </div>

      {project.gallery.length > 0 && (
        <section className="container-x mt-24 md:mt-40" aria-label={t.project.gallery}>
          <h2 className="eyebrow mb-8">{t.project.gallery}</h2>
          <div className={`grid gap-4 md:gap-6 ${vertical ? 'grid-cols-2 md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {project.gallery.map((file, i) => (
              <div key={file} data-still className={`overflow-hidden rounded-2xl bg-line ${!vertical && i % 3 === 0 ? 'md:col-span-2' : ''}`}>
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
        <TransitionLink
          to={`/work/${next.id}`}
          data-cursor="view"
          className="group relative mt-32 block overflow-hidden border-t border-line py-20 md:mt-48 md:py-32"
        >
          <img
            src={projectAsset(next, next.thumbnail)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1.2s] ease-expo group-hover:scale-100 group-hover:opacity-40"
          />
          <div className="container-x relative">
            <span className="eyebrow mb-6">{t.project.next}</span>
            <span className="display flex items-center gap-6 text-[clamp(3rem,10vw,10rem)]">
              {next.title[lang]}
              <ArrowIcon className="h-[0.5em] w-[0.5em] shrink-0 transition-transform duration-700 ease-expo group-hover:translate-x-4 rtl:group-hover:-translate-x-4" />
            </span>
          </div>
        </TransitionLink>
      )}
    </article>
  )
}
