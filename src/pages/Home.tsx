import { startTransition, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useSeo } from '../hooks/useSeo'
import { useSmoothScroll } from '../components/SmoothScroll'
import { Hero } from '../sections/Hero'
import { Showreel } from '../sections/Showreel'
import { Works } from '../sections/Works'
import { About } from '../sections/About'
import { Services } from '../sections/Services'
import { Clients } from '../sections/Clients'
import { Contact } from '../sections/Contact'

export default function Home() {
  const { t, lang } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { scrollTo } = useSmoothScroll()
  const target = (location.state as { scrollTo?: string } | null)?.scrollTo
  // Below-the-fold sections render in a low-priority pass so the first paint stays fast
  const [showRest, setShowRest] = useState(Boolean(target))

  useEffect(() => {
    startTransition(() => setShowRest(true))
  }, [])

  useSeo(`${t.meta.title} | ${lang === 'fa' ? 'Motion Designer' : 'طراح موشن'}`, t.meta.description)

  // Arriving from another page with a target section (e.g. header "About" on a project page)
  useEffect(() => {
    if (!target || !showRest) return
    const id = window.setTimeout(() => {
      scrollTo(`#${target}`, { immediate: true, offset: -40 })
      navigate('.', { replace: true, state: null })
    }, 50)
    return () => window.clearTimeout(id)
  }, [target, showRest, navigate, scrollTo])

  return (
    <>
      <Hero />
      <Showreel />
      {showRest && (
        <>
          <Works />
          <About />
          <Services />
          <Clients />
          <Contact />
        </>
      )}
    </>
  )
}
