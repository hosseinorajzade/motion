import { useLanguage } from '../i18n/LanguageContext'
import site from '../data/site.json'

/** Client names set large and quiet — the list is short, so it doesn't need to scroll. */
export function Clients() {
  const { t } = useLanguage()

  return (
    <section className="container-x border-t border-line py-28 md:py-40" aria-labelledby="clients-title">
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <h2 id="clients-title" className="text-sm text-muted md:col-span-4">
          {t.clients.title}
        </h2>
        <ul className="flex flex-wrap gap-x-10 gap-y-4 md:col-span-8 md:col-start-6">
          {site.clients.map((name) => (
            <li key={name} dir="ltr" className="display text-[clamp(2rem,5vw,4.5rem)] text-paper/40 transition-colors duration-300 hover:text-paper">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
