import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../lib/gsap'
import { isTouch, prefersReducedMotion } from '../lib/device'

interface Props {
  children: ReactNode
  strength?: number
  className?: string
}

/** Pulls its child towards the pointer while hovered, then springs back. */
export function Magnetic({ children, strength = 0.35, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isTouch() || prefersReducedMotion()) return
    const inner = el.firstElementChild as HTMLElement | null
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      xTo(x * strength)
      yTo(y * strength)
      if (inner) gsap.to(inner, { x: x * strength * 0.35, y: y * strength * 0.35, duration: 0.6, ease: 'power3.out' })
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  )
}
