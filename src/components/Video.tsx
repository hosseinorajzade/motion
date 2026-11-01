import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type VideoHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../lib/gsap'
import { parseVideo, type VideoSource } from '../data/projects'
import { useLanguage } from '../i18n/LanguageContext'
import { useSmoothScroll } from './SmoothScroll'
import { CloseIcon, PlayIcon } from './Icons'
import { saveData } from '../lib/device'

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  src?: string
  /** Start playing automatically while visible (muted). */
  autoPlayInView?: boolean
}

/**
 * Muted, looping video that only downloads once it gets close to the viewport,
 * and pauses itself when off-screen.
 */
export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(function LazyVideo(
  { src, autoPlayInView = false, ...rest },
  forwarded,
) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  useImperativeHandle(forwarded, () => ref.current as HTMLVideoElement)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!saveData()) setLoad(true)
          if (autoPlayInView) el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src, autoPlayInView])

  return <video ref={ref} src={load ? src : undefined} muted loop playsInline preload="none" {...rest} />
})

/** Player with a lightweight facade: nothing heavy loads until the visitor presses play. */
export function VideoPlayer({ url, poster, title, autoStart = false, resolve }: { url: string; poster?: string; title: string; autoStart?: boolean; resolve?: (f: string) => string }) {
  const { t } = useLanguage()
  const [active, setActive] = useState(autoStart)
  const source: VideoSource = parseVideo(url, resolve)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-line/50">
      {active ? (
        source.kind === 'file' ? (
          <video src={source.src} poster={poster} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />
        ) : (
          <iframe
            src={source.embed}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="h-full w-full"
          />
        )
      ) : (
        <button data-cursor="play" onClick={() => setActive(true)} className="group absolute inset-0 h-full w-full" aria-label={`${t.project.play}: ${title}`}>
          {poster && <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-105" />}
          <span className="absolute inset-0 bg-ink/20 transition-colors duration-700 group-hover:bg-ink/0" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="flex items-center gap-3 rounded-full bg-paper px-6 py-4 font-display text-sm font-medium text-ink transition-transform duration-700 ease-expo group-hover:scale-110">
              <PlayIcon className="h-4 w-4" />
              {t.project.play}
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

/** Fullscreen lightbox for the showreel. */
export function VideoModal({ url, poster, title, onClose }: { url: string; poster?: string; title: string; onClose: () => void }) {
  const { lock } = useSmoothScroll()
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    lock(true)
    const prev = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    gsap.fromTo(root.current, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lock(false)
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [lock, onClose])

  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/95 p-4 backdrop-blur md:p-12">
      <button
        ref={closeBtn}
        data-cursor="close"
        onClick={onClose}
        aria-label={t.cursor.close}
        className="absolute end-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-paper/30 transition-colors hover:bg-paper hover:text-ink md:end-8 md:top-8"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
      <div className="w-full max-w-6xl">
        <VideoPlayer url={url} poster={poster} title={title} autoStart />
      </div>
    </div>,
    document.body,
  )
}
