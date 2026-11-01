import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useSmoothScroll } from './SmoothScroll'
import { TransitionLink, useTransition } from './Transition'
import { Magnetic } from './Magnetic'

export const SECTIONS = ['work', 'about', 'services', 'contact'] as const
export type SectionId = (typeof SECTIONS)[number]

/** Scrolls to a home-page section, navigating home first when needed. */
export function useSectionNav() {
  const location = useLocation()
  const { scrollTo } = useSmoothScroll()
  const { go } = useTransition()
  return (id: SectionId) => {
    if (location.pathname === '/') scrollTo(`#${id}`, { offset: -40 })
    else go('/', { scrollTo: id })
  }
}

export function Header() {
  const { t, lang, dir, setLang } = useLanguage()
  const { run } = useTransition()
  const { lock } = useSmoothScroll()
  const navTo = useSectionNav()
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > 160 && y > last)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const corner = dir === 'rtl' ? '0% 0%' : '100% 0%'

  // Mobile menu animation
  useEffect(() => {
    lock(open)
    const el = menuRef.current
    if (!el) return
    const links = el.querySelectorAll('[data-menu-item]')
    if (open) {
      gsap.timeline()
        .set(el, { visibility: 'visible' })
        .fromTo(el, { clipPath: `circle(0% at ${corner})` }, { clipPath: `circle(150% at ${corner})`, duration: 1, ease: 'expo.inOut' })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 1 }, '-=0.5')
    } else {
      gsap.to(el, { clipPath: `circle(0% at ${corner})`, duration: 0.7, ease: 'expo.inOut', onComplete: () => void gsap.set(el, { visibility: 'hidden' }) })
    }
  }, [open, lock, corner])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleLang = () => {
    setOpen(false)
    run(() => setLang(lang === 'fa' ? 'en' : 'fa'), { keepScroll: true })
  }

  const handleNav = (id: SectionId) => {
    setOpen(false)
    navTo(id)
  }

  return (
    <>
      <a href="#main" className="sr-only z-[110] rounded bg-accent px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.skip}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-700 ease-expo ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="container-x flex items-center justify-between py-5 md:py-7">
          <TransitionLink to="/" className="group flex items-center gap-3 font-display text-base font-medium tracking-tight">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full border border-paper/20 text-xs transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
              {t.nameShort}
            </span>
            <span className="sr-only sm:not-sr-only">{t.name}</span>
          </TransitionLink>

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            {SECTIONS.map((id) => (
              <button key={id} onClick={() => handleNav(id)} className="link-underline text-sm text-paper/80 transition-colors hover:text-paper">
                {t.nav[id]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic>
              <button
                onClick={toggleLang}
                aria-label={t.langAria}
                className="relative grid h-11 min-w-11 place-items-center overflow-hidden rounded-full border border-paper/20 px-3 font-display text-sm font-medium transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-ink"
              >
                <span lang={lang === 'fa' ? 'en' : 'fa'} className={lang === 'en' ? "font-['Vazirmatn_Variable']" : ''}>
                  {t.langLabel}
                </span>
              </button>
            </Magnetic>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid h-11 place-items-center rounded-full border border-paper/20 px-4 text-sm md:hidden"
            >
              {open ? t.nav.close : t.nav.menu}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="invisible fixed inset-0 z-[65] flex flex-col justify-end bg-accent px-[var(--gutter)] pb-16 text-ink md:hidden"
        style={{ clipPath: `circle(0% at ${corner})` }}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          {SECTIONS.map((id, i) => (
            <div key={id} className="overflow-hidden">
              <button data-menu-item tabIndex={open ? 0 : -1} onClick={() => handleNav(id)} className="display flex items-baseline gap-4 py-1 text-[15vw]">
                <span className="font-body text-sm tracking-normal">0{i + 1}</span>
                {t.nav[id]}
              </button>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}
