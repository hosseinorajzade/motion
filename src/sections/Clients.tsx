import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import site from '../data/site.json'

function Row({ names, reverse = false }: { names: string[]; reverse?: boolean }) {
  // The list is rendered twice so the -50% loop is seamless
  const items = [...names, ...names]
  return (
    <div className="flex overflow-hidden" dir="ltr">
      <ul className={`marquee-track flex shrink-0 items-center gap-10 pe-10 md:gap-16 md:pe-16 ${reverse ? 'reverse' : ''}`} style={{ ['--marquee-duration' as string]: '45s' }}>
        {items.map((name, i) => (
          <li key={i} aria-hidden={i >= names.length} className="flex items-center gap-10 whitespace-nowrap md:gap-16">
            <span className={`display text-[clamp(2.5rem,7vw,6rem)] ${reverse ? 'text-outline' : ''} transition-colors duration-500 hover:text-accent`}>{name}</span>
            <span className="text-2xl text-accent">✦</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Clients() {
  const { t, lang } = useLanguage()
  const half = Math.ceil(site.clients.length / 2)

  return (
    <section className="overflow-hidden border-t border-line py-28 md:py-40" aria-label={t.clients.title}>
      <div className="container-x mb-14 md:mb-20">
        <span className="eyebrow mb-6">{t.clients.eyebrow}</span>
        <RevealText key={lang} as="h2" text={t.clients.title} className="display max-w-4xl text-[clamp(2.25rem,6vw,5.5rem)]" />
      </div>
      <div className="space-y-4 md:space-y-8">
        <Row names={site.clients.slice(0, half)} />
        <Row names={site.clients.slice(half)} reverse />
      </div>
    </section>
  )
}
