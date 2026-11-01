import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import { ArrowIcon } from '../components/Icons'

export function Services() {
  const { t, lang, num } = useLanguage()

  return (
    <section id="services" className="container-x border-t border-line py-28 md:py-44">
      <div className="mb-14 md:mb-20">
        <span className="eyebrow mb-6">{t.services.eyebrow}</span>
        <RevealText key={lang} as="h2" text={t.services.title} className="display max-w-4xl text-[clamp(2.75rem,7.5vw,7rem)]" />
      </div>

      <ol className="border-b border-line">
        {t.services.items.map((item, i) => (
          <li key={item.title} className="group relative overflow-hidden border-t border-line">
            {/* Accent sweep from the reading-start side */}
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-700 ease-expo group-hover:scale-y-100"
            />
            <div className="relative grid gap-3 py-8 transition-colors duration-500 group-hover:text-ink md:grid-cols-12 md:items-center md:gap-8 md:py-10">
              <span className="text-sm text-muted transition-colors duration-500 group-hover:text-ink/70 md:col-span-1">
                {num(String(i + 1).padStart(2, '0'))}
              </span>
              <h3 className="font-display text-3xl font-medium tracking-tight transition-transform duration-700 ease-expo group-hover:translate-x-4 rtl:group-hover:-translate-x-4 md:col-span-5 md:text-5xl">
                {item.title}
              </h3>
              <p className="max-w-md text-paper/70 transition-colors duration-500 group-hover:text-ink/80 md:col-span-5">{item.description}</p>
              <ArrowIcon className="hidden h-8 w-8 -translate-x-4 opacity-0 transition-all duration-700 ease-expo group-hover:translate-x-0 group-hover:opacity-100 rtl:translate-x-4 md:col-span-1 md:block md:justify-self-end" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
