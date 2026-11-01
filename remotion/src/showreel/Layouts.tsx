import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { C } from '../lib/brand'
import { ARCHIVO } from '../lib/fonts'
import { ramp } from '../lib/motion'
import { Cuts, Shot } from './Cuts'

export type PanelSpec = { shots: Shot[]; label?: string; enter?: number; dir?: 1 | -1 }

const Label: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame()
  const p = ramp(frame, delay, 14)
  return (
    <div
      style={{
        position: 'absolute',
        left: 28,
        bottom: 122,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: ARCHIVO,
        fontSize: 19,
        fontWeight: 600,
        fontStretch: '112%',
        letterSpacing: '0.04em',
        color: C.paper,
        opacity: p,
        transform: `translateX(${(1 - p) * -16}px)`,
        textShadow: '0 1px 12px rgba(0,0,0,0.6)',
      }}
    >
      <span style={{ width: 9, height: 9, background: C.accent, transform: 'rotate(45deg)' }} />
      {text.toUpperCase()}
    </div>
  )
}

/** Three 9:16 films side by side, filling a 16:9 frame (each cropped to 640×1080). */
export const Triptych: React.FC<{ panels: PanelSpec[]; duration: number; bg?: string }> = ({ panels, duration, bg = C.ink }) => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: bg }}>
      {panels.map((p, i) => {
        const enter = p.enter ?? 0
        const e = ramp(frame, enter, 16)
        const visible = frame >= enter
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * 640 + (i > 0 ? 2 : 0),
              top: 0,
              width: 640 - (i > 0 ? 2 : 0),
              height: 1080,
              overflow: 'hidden',
              clipPath: `inset(${p.dir === -1 ? 0 : (1 - e) * 100}% 0 ${p.dir === -1 ? (1 - e) * 100 : 0}% 0)`,
              visibility: visible ? 'visible' : 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - e) * 18 * (p.dir ?? 1)}%) scale(${1 + (1 - e) * 0.15})` }}>
              <Cuts shots={p.shots} duration={duration} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 32%)' }} />
            {p.label && <Label text={p.label} delay={enter + 6} />}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/** One 9:16 film centred, with type on either side. */
export const CenterStage: React.FC<{
  shots: Shot[]
  duration: number
  left: React.ReactNode
  right: React.ReactNode
}> = ({ shots, duration, left, right }) => {
  const frame = useCurrentFrame()
  const e = ramp(frame, 0, 18)
  return (
    <AbsoluteFill style={{ background: '#050507' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 656, height: 1080 }}>{left}</div>
      <div style={{ position: 'absolute', right: 0, top: 0, width: 656, height: 1080 }}>{right}</div>
      <div
        style={{
          position: 'absolute',
          left: 656,
          top: 0,
          width: 608,
          height: 1080,
          overflow: 'hidden',
          clipPath: `inset(${(1 - e) * 50}% 0 ${(1 - e) * 50}% 0)`,
          boxShadow: '0 0 120px rgba(255,40,40,0.08)',
        }}
      >
        <Cuts shots={shots} duration={duration} push={0.04} />
      </div>
    </AbsoluteFill>
  )
}
