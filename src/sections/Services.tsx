import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'

export function Services() {
  const { t, lang } = useLanguage()

  return (
    <section id="services" className="container-x border-t border-line py-28 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <RevealText key={lang} as="h2" text={t.services.title} className="display text-[clamp(2.25rem,4.6vw,4.25rem)] md:col-span-4" />

        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 md:col-span-7 md:col-start-6">
          {t.services.items.map((item) => (
            <li key={item.title} className="border-t border-line pt-5">
              <h3 className="font-display text-xl font-semibold leading-snug md:text-2xl">{item.title}</h3>
              <p className="mt-3 max-w-[40ch] leading-relaxed text-paper/70">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
