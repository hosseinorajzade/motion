import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../lib/brand'
import { ARCHIVO } from '../lib/fonts'
import { map, ramp, timecode } from '../lib/motion'
import cues from './cues.json'

const footage = cues.sections.filter((s) => s.label)

/** Persistent overlay: name, running timecode, chapter label and the film's own timeline. */
export const Hud: React.FC<{ from: number; to: number; offset?: number; total?: number }> = ({ from, to, offset = 0, total = cues.durationInFrames }) => {
  const local = useCurrentFrame()
  const { fps } = useVideoConfig()
  const frame = local + offset
  if (frame < from || frame >= to) return null
  const fade = ramp(frame, from, 10) * (1 - ramp(frame, to - 6, 6))
  const sec = footage.find((s) => frame >= s.from && frame < s.to)
  const progress = frame / total
  const L = 72
  const R = 1920 - 72
  return (
    <AbsoluteFill style={{ fontFamily: ARCHIVO, color: '#fff', opacity: fade, pointerEvents: 'none' }}>
      <AbsoluteFill style={{ mixBlendMode: 'difference' }}>
        <div style={{ position: 'absolute', left: L, top: 54, display: 'flex', gap: 16, alignItems: 'center', fontSize: 19, fontWeight: 700, fontStretch: '120%', letterSpacing: '0.02em' }}>
          HOSSEIN ORAJZADE
          <span style={{ fontWeight: 500, opacity: 0.6, fontStretch: '100%' }}>Showreel 2026</span>
        </div>
        <div style={{ position: 'absolute', right: L, top: 54, fontSize: 19, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
          {timecode(frame, fps)}
        </div>
        {sec && (
          <div key={sec.from} style={{ position: 'absolute', left: L, bottom: 64, fontSize: 19, fontWeight: 600, fontStretch: '112%', letterSpacing: '0.05em', overflow: 'hidden' }}>
            <div style={{ transform: `translateY(${(1 - ramp(frame, sec.from, 14)) * 100}%)` }}>{sec.label?.toUpperCase()}</div>
          </div>
        )}
        <div style={{ position: 'absolute', left: L, right: L, bottom: 48, height: 1, background: 'rgba(255,255,255,0.35)' }} />
        {cues.sections.map((s) => (
          <div key={s.from} style={{ position: 'absolute', left: L + (s.from / total) * (R - L) - 4, bottom: 44, width: 8, height: 8, transform: 'rotate(45deg)', background: frame >= s.from ? '#fff' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: L + progress * (R - L) - 1, bottom: 38, width: 2, height: 22, background: C.accent, boxShadow: '0 0 12px rgba(77,124,255,0.9)' }} />
      <div style={{ position: 'absolute', left: L, bottom: 48, width: map(progress, 0, 1, 0, R - L), height: 1, background: C.accent }} />
    </AbsoluteFill>
  )
}
