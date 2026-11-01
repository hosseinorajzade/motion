import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { C } from '../lib/brand'
import { ARCHIVO, VAZIR } from '../lib/fonts'
import { expoInOut, expoOut, map, ramp } from '../lib/motion'

export const WIPE_LEAD = 10 // the wipe starts this many frames before the downbeat
export const WIPE_DUR = 12

const THEMES = {
  blue: { bg: C.accent, fg: C.ink, sub: 'rgba(0,0,0,0.6)', key: C.ink },
  paper: { bg: C.paper, fg: C.ink, sub: 'rgba(0,0,0,0.5)', key: C.accent },
  ink: { bg: '#050507', fg: C.paper, sub: C.muted, key: C.accent },
} as const

/** A playhead wipe: the scene is revealed left of a moving blue line. */
export const Wipe: React.FC<{ progress: number; children: React.ReactNode; line?: boolean }> = ({ progress, children, line = true }) => {
  const x = progress * 1920
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${1920 - x}px 0 0)` }}>{children}</AbsoluteFill>
      {line && progress > 0 && progress < 1 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: x - 2, width: 4, background: C.accent, boxShadow: '0 0 40px 6px rgba(77,124,255,0.75)' }} />
      )}
    </AbsoluteFill>
  )
}

/**
 * Chapter card. Local frame WIPE_LEAD is the downbeat.
 * Words slam in one per half-beat while the width axis of Archivo opens from 62% to 125%.
 */
export const Card: React.FC<{ index: string; words: string[]; fa: string; theme: keyof typeof THEMES; total: number }> = ({
  index,
  words,
  fa,
  theme,
  total,
}) => {
  const frame = useCurrentFrame()
  const t = THEMES[theme]
  const d = WIPE_LEAD // downbeat
  const wipe = ramp(frame, 0, WIPE_DUR, expoInOut)
  const longest = Math.max(...words.map((w) => w.length))
  const size = Math.min(words.length > 2 ? 210 : 250, Math.round(1480 / (longest * 0.8)))

  return (
    <Wipe progress={wipe}>
      <AbsoluteFill style={{ background: t.bg, color: t.fg, fontFamily: ARCHIVO }}>
        {/* index + chapter count */}
        <div style={{ position: 'absolute', left: 120, top: 120, fontSize: 30, fontWeight: 600, fontStretch: '110%', display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ width: 14, height: 14, background: t.key, transform: 'rotate(45deg)' }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{index}</span>
          <span style={{ color: t.sub }}>/ 04</span>
        </div>

        {/* Persian chapter title, set right-to-left and wiped in from the right */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 112,
            fontFamily: VAZIR,
            fontSize: 44,
            fontWeight: 600,
            direction: 'rtl',
            clipPath: `inset(-20% 0 -20% ${(1 - ramp(frame, d + 18, 22)) * 100}%)`,
          }}
        >
          {fa}
        </div>

        {/* Stacked words */}
        <div style={{ position: 'absolute', left: 110, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {words.map((w, i) => {
            const start = d + i * 7
            const p = ramp(frame, start, 20)
            const stretch = map(p, 0, 1, 62, 125)
            const weight = map(p, 0, 1, 900, 800)
            // tiny overshoot on the vertical slam
            const y = (1 - ramp(frame, start, 12)) * 110
            const accentWord = i === words.length - 1
            return (
              <div key={i} style={{ overflow: 'hidden', paddingBottom: 6 }}>
                <div
                  style={{
                    fontSize: size,
                    lineHeight: 0.92,
                    fontWeight: weight,
                    fontStretch: `${stretch}%`,
                    letterSpacing: '-0.035em',
                    whiteSpace: 'nowrap',
                    transform: `translateY(${y}%)`,
                    color: accentWord && theme === 'ink' ? C.accent : t.fg,
                  }}
                >
                  {w}
                </div>
              </div>
            )
          })}
        </div>

        {/* Beat keyframes along the bottom: one lights per beat */}
        <div style={{ position: 'absolute', left: 120, right: 120, bottom: 120, height: 1, background: t.sub, opacity: 0.5, transform: `scaleX(${ramp(frame, 0, 24, expoOut)})`, transformOrigin: 'left' }} />
        {[0, 1, 2, 3].map((b) => {
          const on = frame >= d + b * 15
          const pop = ramp(frame, d + b * 15, 8)
          return (
            <div
              key={b}
              style={{
                position: 'absolute',
                left: 120 + b * ((1920 - 240) / 3) - 9,
                bottom: 111,
                width: 18,
                height: 18,
                background: on ? t.key : t.bg,
                border: `2px solid ${t.key}`,
                transform: `rotate(45deg) scale(${0.6 + pop * 0.4})`,
              }}
            />
          )
        })}
        {/* the card's own playhead travels the bottom line through its length */}
        <div style={{ position: 'absolute', left: 120 + map(frame, d, total + d, 0, 1920 - 240) - 1, bottom: 96, width: 2, height: 48, background: t.key }} />
      </AbsoluteFill>
    </Wipe>
  )
}
