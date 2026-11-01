import { useLanguage } from '../i18n/LanguageContext'
import { useSeo } from '../hooks/useSeo'
import { TransitionLink } from '../components/Transition'
import { Magnetic } from '../components/Magnetic'

export default function NotFound({ message }: { message?: 'project' }) {
  const { t, num } = useLanguage()
  useSeo(`${t.notFound.title} — ${t.name}`, t.meta.description)

  return (
    <section className="container-x flex min-h-[100svh] flex-col items-start justify-center gap-8">
      <span className="display text-[clamp(6rem,25vw,22rem)] text-accent">{num(404)}</span>
      <h1 className="display text-4xl md:text-6xl">{message === 'project' ? t.project.notFound : t.notFound.title}</h1>
      <Magnetic>
        <TransitionLink to="/" className="inline-block rounded-full bg-paper px-8 py-4 font-display text-ink transition-colors hover:bg-accent">
          {t.notFound.cta}
        </TransitionLink>
      </Magnetic>
    </section>
  )
}
