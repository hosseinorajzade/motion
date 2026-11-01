import { createElement, Fragment, useLayoutEffect, useRef, type ElementType } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/device'

interface Props {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** "scroll" animates when entering the viewport, "mount" immediately, "manual" when `play` becomes true */
  trigger?: 'scroll' | 'mount' | 'manual'
  play?: boolean
}

/**
 * Word-by-word mask reveal. Splits on words (never letters) so Persian
 * glyphs keep their joined forms.
 */
export function RevealText({ text, as = 'p', className = '', delay = 0, stagger = 0.06, trigger = 'scroll', play = true }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const words = el.querySelectorAll<HTMLElement>('[data-word]')
    if (prefersReducedMotion()) {
      gsap.set(words, { yPercent: 0, opacity: 1 })
      return
    }
    // Manual mode leaves the words painted until `play` (the loader covers them),
    // so the browser can count them for Largest Contentful Paint right away.
    if (trigger === 'manual' && !play) return
    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 115, rotate: 4, opacity: 1 })
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 1.3,
        stagger,
        delay,
        ease: 'expo.out',
        scrollTrigger: trigger === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
      })
    }, el)
    return () => ctx.revert()
  }, [text, trigger, play, delay, stagger])

  const words = text.split(/\s+/).filter(Boolean)

  return createElement(
    as,
    { ref, className },
    <span className="sr-only">{text}</span>,
    words.map((word, i) => (
      <Fragment key={`${word}-${i}`}>
        <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] pt-[0.06em] -mt-[0.06em] align-top">
          <span data-word className="inline-block origin-bottom-left will-change-transform rtl:origin-bottom-right">
            {word}
          </span>
        </span>
        {i < words.length - 1 && ' '}
      </Fragment>
    )),
  )
}
