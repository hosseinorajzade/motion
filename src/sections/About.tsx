import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import { publicUrl } from '../data/projects'
import site from '../data/site.json'

export function About() {
  const { t, lang } = useLanguage()

  return (
    <section id="about" className="container-x border-t border-line py-28 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-line md:col-span-4">
          <img
            src={publicUrl(site.portrait)}
            alt={t.about.photoAlt}
            loading="lazy"
            decoding="async"
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-10 md:col-span-7 md:col-start-6">
          <RevealText key={lang} as="h2" text={t.about.title} className="display text-[clamp(2.25rem,4.6vw,4.25rem)]" />

          <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed text-paper/80">
            {t.about.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-sm text-muted">{t.about.toolsTitle}</h3>
            <p className="max-w-[62ch] text-lg leading-relaxed">
              {site.tools.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
