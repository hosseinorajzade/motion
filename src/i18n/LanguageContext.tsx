import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import content from './content.json'

export type Lang = 'en' | 'fa'
export type Content = (typeof content)['en']

interface LanguageValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: Content
  setLang: (lang: Lang) => void
  /** Formats numbers with Persian digits when the language is Persian */
  num: (n: number | string) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)
const STORAGE_KEY = 'lang'

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fa' || stored === 'en') return stored
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

const faDigits = '۰۱۲۳۴۵۶۷۸۹'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)
  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  useLayoutEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'fa' ? 'fa_IR' : 'en_US')
  }, [lang, dir])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable */
    }
  }, [])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      dir,
      t: (content as Record<Lang, Content>)[lang],
      setLang,
      num: (n) => (lang === 'fa' ? String(n).replace(/\d/g, (d) => faDigits[Number(d)]) : String(n)),
    }),
    [lang, dir, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
