import type { SVGProps } from 'react'

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Arrow pointing to the reading direction (auto-mirrored in RTL). */
export const ArrowIcon = ({ className = '', ...p }: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden className={`rtl:-scale-x-100 ${className}`} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRightIcon = ({ className = '', ...p }: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden className={`rtl:-scale-x-100 ${className}`} {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
)

export const ArrowUpIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const PlayIcon = ({ className = '', ...p }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden className={`fill-current rtl:-scale-x-100 ${className}`} {...p}>
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
)

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

export const BehanceIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...p}>
    <path d="M8.2 11.3c.9-.4 1.5-1.2 1.5-2.4C9.7 6.6 8 6 6 6H1v12h5.2c2 0 4-1 4-3.4 0-1.5-.7-2.8-2-3.3zM3.3 8h2.2c.8 0 1.6.2 1.6 1.2 0 .9-.6 1.3-1.4 1.3H3.3V8zm2.5 8H3.3v-3.3h2.6c1 0 1.7.4 1.7 1.6 0 1.3-.8 1.7-1.8 1.7zM15.4 7h5V8.3h-5zM23 13.4c0-2.7-1.6-4.9-4.4-4.9-2.8 0-4.6 2.1-4.6 4.8 0 2.8 1.8 4.7 4.6 4.7 2.1 0 3.5-1 4.2-3h-2.2c-.2.8-1.2 1.1-1.9 1.1-1.4 0-2.1-.8-2.1-2.2H23v-.5zm-6.4-1c.1-1.1.8-1.8 1.9-1.8 1.2 0 1.8.7 1.9 1.8h-3.8z" />
  </svg>
)

export const TelegramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <path d="M21 4L3 11l6 2.5M21 4l-3 16-9-6.5M21 4L9 13.5V19l3-3.5" />
  </svg>
)

export const WhatsAppIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z" />
    <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1-2z" />
  </svg>
)

export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} aria-hidden {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
)
