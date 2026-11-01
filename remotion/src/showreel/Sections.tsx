import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion'
import { C } from '../lib/brand'
import { ARCHIVO, VAZIR } from '../lib/fonts'
import { expoInOut, map, ramp } from '../lib/motion'
import { Cuts, Shot } from './Cuts'
import { CenterStage, Triptych } from './Layouts'

/* ---------- shared bits ---------- */

const Line: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const frame = useCurrentFrame()
  const p = ramp(frame, at, 16)
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)`, ...style }}>{children}</div>
    </div>
  )
}

const FullBleed: React.FC<{ shots: Shot[]; duration: number; push?: number }> = ({ shots, duration, push = 0.06 }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Cuts shots={shots} duration={duration} push={push} />
  </AbsoluteFill>
)

/* ---------- 01 · drop: three films at once ---------- */

export const Drop: React.FC = () => (
  <Triptych
    duration={120}
    bg={C.accent}
    panels={[
      {
        label: 'Daewoo',
        enter: 0,
        dir: 1,
        shots: [
          { k: 'D', at: 0, in: 14.6 },
          { k: 'D', at: 45, in: 26.0 },
          { k: 'D', at: 90, in: 0.8 },
        ],
      },
      {
        label: 'Art Radar',
        enter: 3,
        dir: -1,
        shots: [
          { k: 'A', at: 0, in: 8.5 },
          { k: 'A', at: 15, in: 5.6 },
          { k: 'A', at: 60, in: 15.4, pos: '50% 30%' },
          { k: 'A', at: 105, in: 2.6 },
        ],
      },
      {
        label: 'Art Radar × Vin.meet',
        enter: 6,
        dir: 1,
        shots: [
          { k: 'L', at: 0, in: 13.3 },
          { k: 'L', at: 30, in: 7.2 },
          { k: 'L', at: 75, in: 0.6 },
        ],
      },
    ]}
  />
)

/* ---------- 02 · 3D product: Daewoo case study ---------- */

const credit = (k: string, v: string) => (
  <div style={{ display: 'flex', gap: 22, alignItems: 'baseline' }}>
    <span style={{ width: 92, color: C.muted, fontSize: 20, letterSpacing: '0.04em' }}>{k}</span>
    <span style={{ fontSize: 26, fontWeight: 500 }}>{v}</span>
  </div>
)

export const Product: React.FC = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={60}>
        <CenterStage
          duration={60}
          shots={[
            { k: 'D', at: 0, in: 0.5 },
            { k: 'D', at: 15, in: 7.2 },
            { k: 'D', at: 30, in: 10.6 },
            { k: 'D', at: 45, in: 18.7 },
          ]}
          left={
            <div style={{ position: 'absolute', right: 56, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', fontFamily: ARCHIVO, color: C.paper, textAlign: 'right' }}>
              <Line at={2} style={{ fontSize: 84, fontWeight: 800, fontStretch: '125%', lineHeight: 0.95, letterSpacing: '-0.03em' }}>DAEWOO</Line>
              <Line at={6} style={{ fontSize: 84, fontWeight: 800, fontStretch: '125%', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#ff3b3b' }}>CHARISMA</Line>
              <Line at={14} style={{ marginTop: 26, fontSize: 26, color: C.muted }}>Launch teaser</Line>
              <Line at={18} style={{ marginTop: 4, fontFamily: VAZIR, fontSize: 28, color: C.muted, direction: 'rtl' }}>تیزر معرفی محصول</Line>
            </div>
          }
          right={
            <div style={{ position: 'absolute', left: 56, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, fontFamily: ARCHIVO, color: C.paper }}>
              <Line at={15}>{credit('CLIENT', 'Daewoo')}</Line>
              <Line at={20}>{credit('YEAR', '2026')}</Line>
              <Line at={25}>{credit('TOOLS', 'Cinema 4D · Redshift')}</Line>
              <Line at={30}>{credit('FORMAT', '9:16 · 00:43')}</Line>
              <div style={{ marginTop: 18, width: 380, height: 2, background: C.line, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#ff3b3b', transform: `scaleX(${map(frame, 0, 60, 0, 1)})`, transformOrigin: 'left' }} />
              </div>
            </div>
          }
        />
      </Sequence>
      <Sequence from={60} durationInFrames={60}>
        <FullBleed
          duration={60}
          push={0.08}
          shots={[
            { k: 'D', at: 0, in: 14.8 },
            { k: 'D', at: 15, in: 26.2 },
            { k: 'D', at: 30, in: 11.6, pos: '50% 40%' },
            { k: 'D', at: 45, in: 35.0 },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  )
}

/* ---------- 03 · kinetic type: Art & Walk reads across the frame ---------- */

export const TypeSection: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={60}>
      <Triptych
        duration={60}
        bg={C.paper}
        panels={[
          { enter: 0, dir: 1, shots: [{ k: 'A', at: 0, in: 10.6, rate: 0.6 }] },
          { enter: 15, dir: -1, shots: [{ k: 'A', at: 0, in: 11.95, rate: 0.6 }] },
          { enter: 30, dir: 1, shots: [{ k: 'A', at: 0, in: 13.7, rate: 0.55 }] },
        ]}
      />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <FullBleed
        duration={60}
        shots={[
          { k: 'A', at: 0, in: 15.2, pos: '50% 22%' },
          { k: 'A', at: 30, in: 32.4, pos: '50% 52%' },
        ]}
      />
    </Sequence>
  </AbsoluteFill>
)

/* ---------- 04 · UI animation: Tessel, native 16:9 ---------- */

export const UISection: React.FC = () => (
  <FullBleed
    duration={120}
    push={0.05}
    shots={[
      { k: 'T', at: 0, in: 3.6 },
      { k: 'T', at: 30, in: 11.6 },
      { k: 'T', at: 60, in: 14.2 },
      { k: 'T', at: 75, in: 20.2 },
      { k: 'T', at: 90, in: 22.2 },
      { k: 'T', at: 105, in: 28.2 },
    ]}
  />
)

/* ---------- 05 · social & events ---------- */

export const Social: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={60}>
      <FullBleed duration={60} push={0.1} shots={[{ k: 'S', at: 0, in: 1.0, pos: '50% 42%' }]} />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <Triptych
        duration={60}
        bg={C.accent}
        panels={[
          { label: 'Social Café', enter: 0, dir: 1, shots: [{ k: 'S', at: 0, in: 3.0 }] },
          { label: 'Art Radar × Vin.meet', enter: 15, dir: -1, shots: [{ k: 'L', at: 0, in: 12.0 }, { k: 'L', at: 45, in: 13.4 }] },
          { label: 'Alserkal Avenue', enter: 30, dir: 1, shots: [{ k: 'L', at: 0, in: 6.2 }] },
        ]}
      />
    </Sequence>
  </AbsoluteFill>
)

/* ---------- 06 · montage: every half-beat, then a filmstrip ---------- */

const STRIP: Shot[] = [
  { k: 'D', at: 0, in: 0.6 },
  { k: 'A', at: 0, in: 2.6 },
  { k: 'L', at: 0, in: 6.6 },
  { k: 'S', at: 0, in: 0.2 },
  { k: 'T', at: 0, in: 18.4, pos: '9% 50%' },
  { k: 'D', at: 0, in: 30.0 },
  { k: 'A', at: 0, in: 27.2 },
  { k: 'L', at: 0, in: 17.5 },
]

const Filmstrip: React.FC = () => {
  const frame = useCurrentFrame()
  const W = 360
  const GAP = 24
  const total = STRIP.length * (W + GAP) - GAP
  const x = map(frame, 0, 60, 160, 1920 - total - 160) - Math.pow(map(frame, 40, 60, 0, 1), 3) * 900
  return (
    <AbsoluteFill style={{ background: '#050507' }}>
      <div style={{ position: 'absolute', top: (1080 - 640) / 2, left: x, display: 'flex', gap: GAP }}>
        {STRIP.map((s, i) => {
          const e = ramp(frame, i * 2, 14)
          return (
            <div key={i} style={{ width: W, height: 640, overflow: 'hidden', borderRadius: 14, position: 'relative', transform: `scale(${0.85 + e * 0.15})`, opacity: e }}>
              <Cuts shots={[s]} duration={60} push={0.02} />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

export const Montage: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={60}>
      <FullBleed
        duration={60}
        push={0.12}
        shots={[
          { k: 'D', at: 0, in: 14.9 },
          { k: 'A', at: 8, in: 8.6 },
          { k: 'T', at: 15, in: 4.6 },
          { k: 'L', at: 23, in: 13.6 },
          { k: 'D', at: 30, in: 26.4 },
          { k: 'S', at: 38, in: 3.2, pos: '50% 42%' },
          { k: 'A', at: 45, in: 15.6, pos: '50% 22%' },
          { k: 'T', at: 53, in: 26.0 },
        ]}
      />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <Filmstrip />
    </Sequence>
  </AbsoluteFill>
)

/* ---------- 07 · outro ---------- */

export const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const words = ["LET'S MAKE", 'SOMETHING', 'THAT MOVES.']
  const wipe = ramp(frame, 62, 14, expoInOut)
  const endX = 1920 * wipe
  const rulerP = ramp(frame, 76, 60)
  return (
    <AbsoluteFill style={{ background: '#050507', fontFamily: ARCHIVO, color: C.paper }}>
      <div style={{ position: 'absolute', left: 110, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {words.map((w, i) => {
          const p = ramp(frame, i * 15, 20)
          return (
            <div key={w} style={{ overflow: 'hidden', paddingBottom: 6 }}>
              <div
                style={{
                  fontSize: 190,
                  lineHeight: 0.92,
                  fontWeight: map(p, 0, 1, 900, 800),
                  fontStretch: `${map(p, 0, 1, 62, 125)}%`,
                  letterSpacing: '-0.035em',
                  whiteSpace: 'nowrap',
                  transform: `translateY(${(1 - ramp(frame, i * 15, 12)) * 110}%)`,
                  color: i === 2 ? C.accent : C.paper,
                }}
              >
                {w}
              </div>
            </div>
          )
        })}
      </div>

      {/* End card, wiped in by the playhead */}
      <AbsoluteFill style={{ clipPath: `inset(0 ${1920 - endX}px 0 0)`, background: C.ink }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 132, height: 132, borderRadius: 66, background: '#0d0d10', border: '1px solid #26262c', display: 'grid', placeItems: 'center', transform: `scale(${0.7 + ramp(frame, 72, 24) * 0.3})` }}>
            <div style={{ width: 58, height: 58, borderRadius: 29, background: C.accent, boxShadow: '0 0 60px rgba(77,124,255,0.6)', transform: `scale(${ramp(frame, 78, 18)})` }} />
          </div>
          <div style={{ marginTop: 56, fontSize: 104, fontWeight: 800, fontStretch: `${map(ramp(frame, 74, 26), 0, 1, 80, 125)}%`, letterSpacing: '-0.03em', opacity: ramp(frame, 74, 10) }}>
            HOSSEIN ORAJZADE
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 22, alignItems: 'center', fontSize: 34, opacity: ramp(frame, 84, 14) }}>
            <span style={{ fontWeight: 500, fontStretch: '110%' }}>Motion Designer</span>
            <span style={{ width: 9, height: 9, background: C.accent, transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: VAZIR, fontWeight: 500, direction: 'rtl' }}>حسین اورج‌زاده · طراح موشن</span>
          </div>
          <div style={{ marginTop: 44, fontSize: 34, fontWeight: 600, color: C.accent, letterSpacing: '0.01em', opacity: ramp(frame, 94, 14) }}>
            orajzade@gmail.com
          </div>
        </div>
        {/* closing ruler: the playhead parks on the last frame */}
        <div style={{ position: 'absolute', left: 240, right: 240, bottom: 150, height: 1, background: '#3a3a42' }} />
        <div style={{ position: 'absolute', left: 240 + rulerP * 1440 - 1, bottom: 132, width: 2, height: 36, background: C.accent, boxShadow: '0 0 18px rgba(77,124,255,0.8)' }} />
        <div style={{ position: 'absolute', left: 240 + 1440 - 9, bottom: 141, width: 18, height: 18, transform: `rotate(45deg) scale(${ramp(frame, 136, 10)})`, background: C.accent }} />
        <div style={{ position: 'absolute', left: 240, bottom: 104, fontSize: 18, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>00:00:00:00</div>
        <div style={{ position: 'absolute', right: 240, bottom: 104, fontSize: 18, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>00:00:42:00</div>
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: endX - 2, width: 4, background: C.accent, boxShadow: '0 0 40px 6px rgba(77,124,255,0.75)' }} />}
    </AbsoluteFill>
  )
}
