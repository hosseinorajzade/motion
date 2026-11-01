import React, { useMemo } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ARCHIVO, VAZIR, loadFonts } from '../lib/fonts'
import { backOut, clamp, expoIn, expoInOut, expoOut, lerp, map, rand, ramp, springy } from '../lib/motion'
import cues from './cues.json'

loadFonts()

const E = cues.events
const N = cues.seeds
const GOLDEN = Math.PI * (3 - Math.sqrt(5)) // 137.5°
const R = 160 // fruit radius
const CX = 960
const CY = 540

export const ANAR = {
  cream: '#f3ebdd',
  red: '#c8102e',
  seed: '#e2334a',
  deep: '#7d0a1f',
  plum: '#2b0a13',
}

// An aril: egg-shaped, pointed end outwards.
const SEED_PATH = 'M0,-15 C8,-15 12,-5 12,3 C12,10 6.5,14 0,14 C-6.5,14 -12,10 -12,3 C-12,-5 -8,-15 0,-15 Z'

const Seed: React.FC<{ x: number; y: number; rot: number; s: number; o?: number }> = ({ x, y, rot, s, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <path d={SEED_PATH} fill="url(#seedFill)" />
    <ellipse cx={-4} cy={-6} rx={3} ry={4.5} fill="#fff" opacity={0.55} transform="rotate(-20)" />
  </g>
)

// Crown (calyx) of the fruit, sitting on the top of the circle.
const crownPath = (r: number) => {
  const y = -r + 6
  return `M${-46},${y} L${-56},${y - 62} L${-22},${y - 30} L0,${y - 74} L${22},${y - 30} L${56},${y - 62} L${46},${y} Z`
}

type Lockup = { fruit: string; glint: string; text: string; sub: string }

/** Mark + bilingual wordmark, shared by the normal and inverted states. */
const LockupLayer: React.FC<{ frame: number; c: Lockup; seeds: React.ReactNode; inverted?: boolean }> = ({ frame, c, seeds, inverted }) => {
  // Mark build
  const skin = ramp(frame, E.skin, 24, expoInOut)
  const crown = springy(frame, E.crown, 0.09, 0.11)
  const fill = ramp(frame, E.fill, 14, expoOut)
  const settle = 1 + 0.06 * Math.exp(-Math.max(0, frame - E.fill) / 8) * Math.sin(Math.max(0, frame - E.fill) / 2.4) * (frame >= E.fill ? 1 : 0)
  const glint = ramp(frame, E.glint, 16, backOut)
  // Lockup move
  const slide = ramp(frame, E.slide, 28, expoInOut)
  const markX = lerp(CX, 655, slide)
  const markS = lerp(1, 0.86, slide)
  const C = 2 * Math.PI * (R + 6)

  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="seedFill" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ff6b7d" />
            <stop offset="45%" stopColor={ANAR.seed} />
            <stop offset="100%" stopColor={ANAR.deep} />
          </radialGradient>
        </defs>
        <g transform={`translate(${markX} ${CY}) scale(${markS * settle})`}>
          {!inverted && seeds}
          {/* skin outline draws on */}
          <circle r={R + 6} fill="none" stroke={c.fruit} strokeWidth={10} strokeDasharray={C} strokeDashoffset={C * (1 - skin)} transform="rotate(-90)" strokeLinecap="round" opacity={frame < E.skin ? 0 : 1} />
          {/* crown springs up */}
          <path d={crownPath(R + 6)} fill={c.fruit} transform={`translate(0 ${-R}) scale(${Math.max(0, crown)}) translate(0 ${R})`} style={{ transformOrigin: '0 0' }} opacity={frame < E.crown ? 0 : 1} />
          {/* skin closes over the seeds */}
          <circle r={(R + 6) * fill} fill={c.fruit} />
          {/* glint: one seed-shaped highlight */}
          <g transform={`translate(-62 -58) rotate(-35) scale(${2.1 * glint})`}>
            <path d={SEED_PATH} fill={c.glint} />
          </g>
        </g>
      </svg>

      {/* Wordmark: Latin left-to-right, Persian right-to-left */}
      <div style={{ position: 'absolute', left: 860, top: 330, width: 640, color: c.text }}>
        <div style={{ display: 'flex', fontFamily: ARCHIVO, fontSize: 236, fontWeight: 800, fontStretch: '112%', letterSpacing: '-0.045em', lineHeight: 1 }}>
          {'anar'.split('').map((ch, i) => {
            const p = ramp(frame, E.letters[i], 16, expoOut)
            return (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: 12 }}>
                <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 12}deg)` }}>{ch}</span>
              </span>
            )
          })}
        </div>
        <div
          style={{
            marginTop: -6,
            width: 520,
            textAlign: 'right',
            fontFamily: VAZIR,
            fontSize: 132,
            fontWeight: 800,
            direction: 'rtl',
            lineHeight: 1.1,
            clipPath: `inset(-30% 0 -30% ${(1 - ramp(frame, E.fa, 26, expoInOut)) * 100}%)`,
          }}
        >
          انار
        </div>
      </div>

      {/* Tagline */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', gap: 28, alignItems: 'center', color: c.sub, opacity: ramp(frame, E.tagline, 18), transform: `translateY(${(1 - ramp(frame, E.tagline, 24)) * 20}px)` }}>
        <span style={{ fontFamily: ARCHIVO, fontSize: 28, fontWeight: 600, letterSpacing: '0.24em', fontStretch: '115%' }}>COLD-PRESSED POMEGRANATE</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: c.fruit }} />
        <span style={{ fontFamily: VAZIR, fontSize: 32, fontWeight: 600, direction: 'rtl' }}>آب انار سردفشرده</span>
      </div>
    </>
  )
}

export const Anar: React.FC = () => {
  const frame = useCurrentFrame()

  // Per-seed randomness, fixed for the whole film
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const a = rand(i + 1) * Math.PI * 2
        const d = 240 + rand(i + 101) * 520
        // phyllotaxis home inside the fruit
        const r = (R - 14) * Math.sqrt((i + 0.5) / N)
        const th = i * GOLDEN
        return {
          bx: Math.cos(a) * d * 1.5,
          by: Math.sin(a) * d * 0.9,
          brot: rand(i + 201) * 720 - 360,
          bs: 0.7 + rand(i + 301) * 0.8,
          hr: r,
          hth: th,
          delay: (i / N) * E.swirlSpread,
        }
      }),
    [],
  )

  // --- the single falling seed (before the burst)
  const fallP = interpolate(frame, [E.fallStart, E.land], [0, 1], { ...clamp, easing: (t) => t * t })
  const fy = lerp(-560, 0, fallP)
  const squash = frame < E.land ? 1 + fallP * 0.35 : 1 - 0.3 * Math.exp(-(frame - E.land) / 5) * Math.cos((frame - E.land) / 2.2)
  const hop = frame >= E.land ? -Math.abs(Math.sin(((frame - E.land) / (E.burst - E.land)) * Math.PI)) * 40 * (frame < E.burst ? 1 : 0) : 0
  const preBurst = map(frame, E.burst - 6, E.burst, 1, 1.5)

  const seedNodes =
    frame < E.burst ? (
      <g transform={`translate(0 ${fy + hop}) scale(${(1 / squash) * 2.2 * preBurst} ${squash * 2.2 * preBurst})`}>
        <Seed x={0} y={0} rot={0} s={1} />
      </g>
    ) : (
      seeds.map((s, i) => {
        // burst out
        const b = ramp(frame, E.burst, 30, expoOut)
        const drift = Math.max(0, frame - E.burst - 30) * 0.6
        const bx = s.bx * b + Math.sign(s.bx) * drift
        const by = s.by * b + Math.sign(s.by) * drift * 0.6
        // swirl home: polar interpolation with an extra turn
        const w = ramp(frame, E.swirl + s.delay, E.swirlDur, expoInOut)
        const br = Math.hypot(bx, by)
        const bth = Math.atan2(by, bx)
        const rr = lerp(br, s.hr, w)
        let target = s.hth % (Math.PI * 2)
        while (target < bth) target += Math.PI * 2
        const th = lerp(bth, target + Math.PI * 2, w)
        const x = Math.cos(th) * rr
        const y = Math.sin(th) * rr
        const rot = lerp(s.brot + frame * 2, (s.hth * 180) / Math.PI + 90, w)
        const sc = lerp(s.bs, 1, w) * ramp(frame, E.burst, 8, backOut)
        return <Seed key={i} x={x} y={y} rot={rot} s={sc} />
      })
    )

  // --- ending: a drop falls from the fruit and floods the frame, revealing the inverted lockup
  const dripP = ramp(frame, E.drip, E.dripLand - E.drip, expoIn)
  const dripY = lerp(CY + 0.86 * (R + 6) - 4, 1110, dripP)
  const dripVisible = frame >= E.drip && frame < E.dripLand + 2
  const flood = ramp(frame, E.invert, 26, expoInOut)
  const floodR = flood * 2300

  const normal: Lockup = { fruit: ANAR.red, glint: ANAR.cream, text: ANAR.plum, sub: '#6b4a50' }
  const inverted: Lockup = { fruit: ANAR.cream, glint: ANAR.red, text: ANAR.cream, sub: 'rgba(243,235,221,0.8)' }

  return (
    <AbsoluteFill style={{ background: ANAR.cream }}>
      {/* soft floor shadow under the fruit */}
      <div
        style={{
          position: 'absolute',
          left: lerp(CX, 655, ramp(frame, E.slide, 28, expoInOut)) - 150,
          top: CY + R + 40,
          width: 300,
          height: 30,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(43,10,19,0.18), transparent)',
          opacity: ramp(frame, E.skin, 30),
        }}
      />
      <LockupLayer frame={frame} c={normal} seeds={seedNodes} />

      {dripVisible && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(655 ${dripY}) scale(${1.4 - dripP * 0.3} ${1.4 + dripP * 0.6})`}>
            <path d="M0,-16 C6,-6 11,1 11,7 C11,13 6,17 0,17 C-6,17 -11,13 -11,7 C-11,1 -6,-6 0,-16 Z" fill={ANAR.red} />
          </g>
        </svg>
      )}

      {frame >= E.invert && (
        <AbsoluteFill style={{ background: ANAR.red, clipPath: `circle(${floodR}px at 655px 1080px)` }}>
          <LockupLayer frame={frame} c={inverted} seeds={null} inverted />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
