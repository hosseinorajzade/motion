import type { ComponentType, SVGProps } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { RevealText } from '../components/RevealText'
import { Magnetic } from '../components/Magnetic'
import { useSmoothScroll } from '../components/SmoothScroll'
import { ArrowUpIcon, ArrowUpRightIcon, BehanceIcon, InstagramIcon, MailIcon, TelegramIcon, WhatsAppIcon } from '../components/Icons'
import site from '../data/site.json'

const socials: { key: keyof typeof site.socials; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: 'instagram', Icon: InstagramIcon },
  { key: 'behance', Icon: BehanceIcon },
  { key: 'telegram', Icon: TelegramIcon },
  { key: 'whatsapp', Icon: WhatsAppIcon },
]

export function Contact() {
  const { t, lang, num } = useLanguage()
  const { scrollTo } = useSmoothScroll()

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line">
      <div className="container-x pb-10 pt-28 md:pt-44">
        <RevealText key={lang} as="h2" text={t.contact.title} className="display max-w-6xl text-[clamp(2.5rem,7vw,7rem)]" />
        <p className="mt-8 max-w-lg text-lg text-paper/70">{t.contact.subtitle}</p>

        <div className="mt-16 flex flex-col gap-12 md:mt-24 md:flex-row md:items-center md:justify-between">
          <Magnetic strength={0.25}>
            <a
              href={`mailto:${site.email}`}
              className="group flex items-center gap-5 rounded-full bg-accent py-4 pe-4 ps-8 text-ink transition-colors duration-500 hover:bg-paper md:py-5 md:ps-10"
            >
              <span className="flex flex-col">
                <span className="text-xs font-medium">{t.contact.emailLabel}</span>
                <span className="font-display text-xl font-medium md:text-3xl" dir="ltr">
                  {site.email}
                </span>
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper transition-transform duration-700 ease-expo group-hover:rotate-45 md:h-16 md:w-16">
                <MailIcon className="h-5 w-5" />
              </span>
            </a>
          </Magnetic>

          <div>
            <h3 className="mb-4 text-sm text-muted">{t.contact.socialTitle}</h3>
            <ul className="flex flex-wrap gap-3">
              {socials.map(({ key, Icon }) => (
                <li key={key}>
                  <Magnetic>
                    <a
                      href={site.socials[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-full border border-paper/20 px-5 py-3 text-sm transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-ink"
                    >
                      <Icon className="h-5 w-5" />
                      {t.contact[key]}
                      <ArrowUpRightIcon className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="container-x mt-20 flex flex-col gap-6 border-t border-line py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>
          © {num(new Date().getFullYear())} {t.name}. {t.footer.rights}
        </span>
        <button onClick={() => scrollTo(0)} className="link-underline flex items-center gap-2 self-start text-paper md:self-auto">
          {t.footer.top}
          <ArrowUpIcon className="h-4 w-4" />
        </button>
      </footer>

    </section>
  )
}
