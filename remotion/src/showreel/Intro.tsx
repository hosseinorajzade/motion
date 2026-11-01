import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { C } from '../lib/brand'
import { ARCHIVO, VAZIR } from '../lib/fonts'
import { backOut, expoIn, map, ramp } from '../lib/motion'
import cues from './cues.json'

// Timeline geometry (an After Effects-style comp panel)
const RULER_Y = 690
const X0 = 420
const X1 = 1800
const TRACK_Y = 742
const TRACK_H = 30
const TRACK_GAP = 14
const PH_START = 10 // playhead leaves X0
const PH_END = 100 // playhead reaches X1

export const playheadX = (frame: number) => map(frame, PH_START, PH_END, X0, X1)
const frameAtX = (x: number) => PH_START + ((x - X0) / (X1 - X0)) * (PH_END - PH_START)

const LAYERS = [
  { name: 'daewoo_charisma.mp4', from: 0.0, to: 0.62, accent: false },
  { name: 'art_and_walk.mp4', from: 0.12, to: 0.78, accent: false },
  { name: 'HO_showreel_2026', from: 0.0, to: 1.0, accent: true },
  { name: 'tessel_launch.mp4', from: 0.34, to: 0.96, accent: false },
  { name: 'social_cafe.mp4', from: 0.55, to: 1.0, accent: false },
]

// Keyframe diamonds sit exactly where the playhead is on each tick frame (cues.sfx.tick),
// so every pop lines up with its click in the score.
const KEYS = cues.sfx.tick.map((f, i) => ({ f, track: [2, 0, 3, 1, 2, 4, 0, 3, 2][i % 9] }))

const Diamond: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 7,
      top: y - 7,
      width: 14,
      height: 14,
      background: color,
      transform: `rotate(45deg) scale(${s})`,
    }}
  />
)

export const Intro: React.FC = () => {
  const frame = useCurrentFrame()
  const ph = playheadX(frame)
  const uiIn = ramp(frame, 0, 18)
  const flash = ramp(frame, 106, 14, expoIn) // playhead line opens up into the drop

  return (
    <AbsoluteFill style={{ background: C.ink, color: C.paper, fontFamily: ARCHIVO }}>
      {/* Name, revealed by the playhead as it scrubs */}
      <div
        style={{
          position: 'absolute',
          left: X0 - 8,
          top: 150,
          width: 1920 - (X0 - 8),
          clipPath: `inset(-20% ${Math.max(0, 1920 - ph)}px -20% 0)`,
          transform: `scale(${1 + flash * 0.08})`,
          transformOrigin: `${X1 - X0}px 50%`,
        }}
      >
        {['HOSSEIN', 'ORAJZADE'].map((w, i) => (
          <div
            key={w}
            style={{
              fontSize: 196,
              lineHeight: 0.9,
              fontWeight: 800,
              fontStretch: '125%',
              letterSpacing: '-0.035em',
              whiteSpace: 'nowrap',
              transform: `translateY(${(1 - ramp(frame, 12 + i * 26, 30)) * 40}px)`,
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Role line */}
      <div
        style={{
          position: 'absolute',
          left: X0,
          top: 548,
          display: 'flex',
          gap: 28,
          alignItems: 'baseline',
          opacity: ramp(frame, 78, 16),
          transform: `translateY(${(1 - ramp(frame, 78, 22)) * 24}px)`,
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 500, fontStretch: '110%', letterSpacing: '0.01em' }}>Motion Designer</span>
        <span style={{ width: 10, height: 10, background: C.accent, transform: 'rotate(45deg)', display: 'inline-block' }} />
        <span style={{ fontFamily: VAZIR, fontSize: 36, fontWeight: 500, direction: 'rtl' }}>طراح موشن</span>
      </div>

      {/* Ruler */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: uiIn }}>
        <div style={{ position: 'absolute', left: X0, top: RULER_Y, width: (X1 - X0) * ramp(frame, 0, 22), height: 1, background: '#3a3a42' }} />
        {Array.from({ length: 24 }, (_, i) => {
          const x = X0 + (i / 23) * (X1 - X0)
          const major = i % 4 === 0
          const vis = ramp(frame, 2 + i * 0.6, 10)
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: x, top: RULER_Y - (major ? 14 : 8), width: 1, height: major ? 14 : 8, background: '#55555e', opacity: vis }} />
              {major && (
                <div style={{ position: 'absolute', left: x + 6, top: RULER_Y - 32, fontSize: 15, color: C.muted, fontVariantNumeric: 'tabular-nums', opacity: vis }}>
                  {`00:${String(Math.round((i / 23) * 42)).padStart(2, '0')}`}
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* Layer names + bars */}
        {LAYERS.map((l, i) => {
          const y = TRACK_Y + i * (TRACK_H + TRACK_GAP)
          const grow = ramp(frame, 4 + i * 3, 24)
          const x = X0 + l.from * (X1 - X0)
          const w = (l.to - l.from) * (X1 - X0) * grow
          return (
            <React.Fragment key={l.name}>
              <div
                style={{
                  position: 'absolute',
                  left: 120,
                  top: y + 4,
                  width: 270,
                  fontSize: 17,
                  color: l.accent ? C.paper : C.muted,
                  opacity: ramp(frame, 4 + i * 3, 14),
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#55555e' }}>{i + 1}</span>
                <span style={{ fontStretch: '100%' }}>{l.name}</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: w,
                  height: TRACK_H,
                  borderRadius: 5,
                  background: l.accent ? C.accent : '#26262c',
                  boxShadow: l.accent ? '0 0 30px rgba(77,124,255,0.35)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              />
            </React.Fragment>
          )
        })}

        {/* Keyframes pop as the playhead crosses them */}
        {KEYS.map((k, i) => {
          const x = playheadX(k.f)
          const y = TRACK_Y + k.track * (TRACK_H + TRACK_GAP) + TRACK_H / 2
          const s = frame < k.f ? 0 : backOut(Math.min(1, (frame - k.f) / 8))
          const lit = map(frame, k.f, k.f + 12, 1, 0)
          return <Diamond key={i} x={x} y={y} s={s * (1 + lit * 0.4)} color={LAYERS[k.track].accent ? C.ink : C.paper} />
        })}
      </div>

      {/* Playhead */}
      <div
        style={{
          position: 'absolute',
          left: ph - 1,
          top: 120,
          width: 2,
          height: 960 - 120 + 20,
          background: C.accent,
          opacity: ramp(frame, 6, 8),
          boxShadow: '0 0 24px rgba(77,124,255,0.8)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: ph - 46,
          top: RULER_Y - 24,
          width: 92,
          height: 24,
          borderRadius: 4,
          background: C.accent,
          color: C.ink,
          fontSize: 14,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: '24px',
          fontVariantNumeric: 'tabular-nums',
          opacity: ramp(frame, 6, 8),
        }}
      >
        {`00:${String(Math.floor(((ph - X0) / (X1 - X0)) * 42)).padStart(2, '0')}:${String(Math.floor((((ph - X0) / (X1 - X0)) * 42 * 30) % 30)).padStart(2, '0')}`}
      </div>

      {/* The playhead line opens into a full-frame flash that cuts to the drop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: ph - flash * ph,
          width: flash * 1920 + 4,
          background: C.accent,
        }}
      />
    </AbsoluteFill>
  )
}

export const introGeometry = { X0, X1, frameAtX }
