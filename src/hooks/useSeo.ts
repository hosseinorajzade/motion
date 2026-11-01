import { useEffect } from 'react'

const setMeta = (selector: string, value: string) => document.querySelector(selector)?.setAttribute('content', value)

/** Updates the document title and social meta tags for the current page + language. */
export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[name="twitter:title"]', title)
  }, [title, description])
}
