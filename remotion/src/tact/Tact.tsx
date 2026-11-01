import { ThreeCanvas } from '@remotion/three'
import { useThree } from '@react-three/fiber'
import React, { useMemo } from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ARCHIVO, VAZIR, loadFonts } from '../lib/fonts'
import { backOut, clamp, expoIn, expoInOut, expoOut, lerp, map, ramp } from '../lib/motion'
import cues from './cues.json'
import { BoardState, Keyboard, Keycap, Switch, TACT, useMaterials } from './Keyboard'
import { ENTER, ESC, KEYS, Key } from './layout'

loadFonts()

const E = cues.events
const S = cues.shots
const W = 1080
const H = 1920
const DEG = Math.PI / 180

// ---------------------------------------------------------------- camera + board per frame

type Rig = {
  cam: THREE.Vector3
  target: THREE.Vector3
  up: THREE.Vector3
  fov: number
  board: { rotY: number; y: number; x: number; z: number }
}

const orbit = (target: THREE.Vector3, radius: number, azDeg: number, elDeg: number) =>
  new THREE.Vector3(
    target.x + radius * Math.cos(elDeg * DEG) * Math.sin(azDeg * DEG),
    target.y + radius * Math.sin(elDeg * DEG),
    target.z + radius * Math.cos(elDeg * DEG) * Math.cos(azDeg * DEG),
  )

export function rigAt(frame: number): Rig {
  const up = new THREE.Vector3(0, 1, 0)
  if (frame < S.macro[1]) {
    const p = frame / S.macro[1]
    const target = new THREE.Vector3(0, map(frame, 70, 110, 1.15, 0.75), 0)
    return { cam: orbit(target, lerp(4.6, 3.9, p), lerp(38, 18, p), lerp(20, 14, p)), target, up, fov: 30, board: { rotY: 0, y: 0, x: 0, z: 0 } }
  }
  if (frame < S.explode[1]) {
    const p = (frame - S.explode[0]) / (S.explode[1] - S.explode[0])
    const target = new THREE.Vector3(2.9, -0.3, 0)
    return { cam: orbit(target, lerp(60, 55, p), lerp(-18, -12, p), lerp(17, 21, p)), target, up, fov: 21, board: { rotY: Math.PI / 2, y: 0, x: 0, z: 0 } }
  }
  if (frame < S.ripple[1]) {
    const p = (frame - S.ripple[0]) / (S.ripple[1] - S.ripple[0])
    const target = new THREE.Vector3(0, 0, lerp(2.6, 2.3, p))
    const cam = orbit(target, lerp(52, 49, p), 180, 74)
    return { cam, target, up: new THREE.Vector3(0, 0, -1), fov: 28, board: { rotY: -Math.PI / 2, y: 0, x: 0, z: 0 } }
  }
  if (frame < S.hero[1]) {
    const p = (frame - S.hero[0]) / (S.hero[1] - S.hero[0])
    const land = ramp(frame, S.hero[0], 16, expoOut)
    const target = new THREE.Vector3(0, 8.2, 0)
    return {
      cam: orbit(target, 92, lerp(-4, 4, p), lerp(30, 26, p)),
      target,
      up,
      fov: 20,
      board: { rotY: lerp(-0.62, -0.42, p), y: (1 - land) * 4, x: 0, z: 0 },
    }
  }
  const p = (frame - S.end[0]) / (S.end[1] - S.end[0])
  const target = new THREE.Vector3(0, -4.8, 0)
  return { cam: orbit(target, lerp(88, 84, p), 0, 18), target, up, fov: 22, board: { rotY: 0, y: 0, x: 0, z: 0 } }
}

const CameraRig: React.FC<{ rig: Rig }> = ({ rig }) => {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  cam.position.copy(rig.cam)
  cam.up.copy(rig.up)
  cam.fov = rig.fov
  cam.near = 0.1
  cam.far = 400
  cam.lookAt(rig.target)
  cam.updateProjectionMatrix()
  return null
}

/** Project a board-local point to screen pixels with the same camera the canvas uses. */
function project(rig: Rig, local: THREE.Vector3) {
  const cam = new THREE.PerspectiveCamera(rig.fov, W / H, 0.1, 400)
  cam.position.copy(rig.cam)
  cam.up.copy(rig.up)
  cam.lookAt(rig.target)
  cam.updateMatrixWorld()
  cam.updateProjectionMatrix()
  const m = new THREE.Matrix4().makeRotationY(rig.board.rotY).setPosition(rig.board.x, rig.board.y, rig.board.z)
  const v = local.clone().applyMatrix4(m).project(cam)
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H }
}

// ---------------------------------------------------------------- scene bits

const Environment: React.FC = () => {
  const { gl, scene } = useThree()
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.55
    pmrem.dispose()
  }, [gl, scene])
  return null
}

const shadowTexture = (() => {
  let tex: THREE.CanvasTexture | null = null
  return () => {
    if (tex) return tex
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128)
    grd.addColorStop(0, 'rgba(0,0,0,0.75)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 256, 256)
    tex = new THREE.CanvasTexture(c)
    return tex
  }
})()

const Lights: React.FC<{ frame: number }> = ({ frame }) => {
  // the rim light sweeps across the macro shot
  const sweep = map(frame, 0, 120, -6, 6)
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[-6, 9, 7]} intensity={1.5} color="#fff4e8" />
      <directionalLight position={[frame < S.macro[1] ? sweep : 8, 5, -9]} intensity={3.2} color="#a9bcff" />
      <pointLight position={[0, -1.2, 3.5]} intensity={frame < S.macro[1] ? 2.5 : 0} distance={8} color={TACT.accent} />
      <directionalLight position={[6, 2, 4]} intensity={0.5} color={TACT.accent} />
    </>
  )
}

const rippleAmount = (frame: number, k: Key) => {
  let press = 0
  let glow = 0
  for (const r of E.ripples) {
    const o = r.from === 'esc' ? ESC : ENTER
    const d = Math.hypot(k.x - o.x, (k.z - o.z) * 1.1)
    const t = frame - r.at - d * E.rippleSpeed
    if (t >= 0) {
      press = Math.max(press, t < 4 ? t / 4 : Math.max(0, 1 - (t - 4) / 7))
      glow = Math.max(glow, Math.exp(-t / 7) * (t < 2 ? t / 2 : 1))
    }
  }
  return { press, glow }
}

const Scene: React.FC<{ frame: number; rig: Rig }> = ({ frame, rig }) => {
  const mats = useMaterials()
  const shadow = useMemo(() => shadowTexture(), [])

  if (frame < S.macro[1]) {
    // A single Escape key and its switch
    const seat = ramp(frame, 88, 14, expoIn)
    const capY = lerp(1.25, 0.62 + 0.21, seat)
    const t = frame - E.macroPress
    const press = t >= 0 ? (t < 3 ? t / 3 : Math.max(0, 1 - (t - 3) / 8)) : 0
    const switchRise = ramp(frame, 60, 30, expoOut)
    const spin = lerp(-0.7, 0.25, ramp(frame, 0, 100, expoInOut))
    const glow = t >= 0 ? Math.exp(-t / 10) : 0
    return (
      <>
        <CameraRig rig={rig} />
        <Lights frame={frame} />
        <group rotation={[0, spin, 0]}>
          <group position={[0, capY - press * 0.16, 0]} rotation={[map(frame, 0, 90, 0.35, 0), 0, map(frame, 0, 90, -0.12, 0)]}>
            <Keycap k={{ w: 1, kind: 'accent' }} mats={mats} />
          </group>
          <group position={[0, lerp(-1.6, -0.02, switchRise), 0]} visible={frame >= 60}>
            <Switch mats={mats} press={press} />
          </group>
          {glow > 0.01 && (
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + (1 - glow) * 3, 1 + (1 - glow) * 3, 1]}>
              <ringGeometry args={[0.55, 0.62, 64]} />
              <meshBasicMaterial color={TACT.accent} toneMapped={false} transparent opacity={glow} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          )}
        </group>
      </>
    )
  }

  const state: BoardState = {}
  if (frame < S.explode[1]) {
    const open = ramp(frame, E.explodeOpen, 22, expoOut)
    const close = ramp(frame, E.collapse, 12, expoIn)
    state.explode = open * (1 - close)
  } else if (frame < S.ripple[1] || frame >= S.end[0]) {
    state.press = (k) => rippleAmount(frame, k).press
    state.glow = (k) => rippleAmount(frame, k).glow
    if (frame >= S.end[0]) {
      // a calm closing wave across the board
      state.press = (k) => {
        const t = frame - (S.end[0] + 18) - (k.x + 8) * 1.2
        return t >= 0 ? (t < 4 ? t / 4 : Math.max(0, 1 - (t - 4) / 7)) * 0.6 : 0
      }
      state.glow = (k) => {
        const t = frame - (S.end[0] + 18) - (k.x + 8) * 1.2
        return t >= 0 ? Math.exp(-t / 8) * 0.5 : 0
      }
    }
  }

  return (
    <>
      <CameraRig rig={rig} />
      <Lights frame={frame} />
      <group rotation={[0, rig.board.rotY, 0]} position={[rig.board.x, rig.board.y, rig.board.z]}>
        <Keyboard mats={mats} state={state} />
        <mesh position={[0, -1.2 - (state.explode ?? 0) * 2.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[24, 12, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.9} />
        </mesh>
      </group>
    </>
  )
}

// ---------------------------------------------------------------- 2-D overlays

const Rise: React.FC<{ at: number; frame: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, frame, children, style }) => {
  const p = ramp(frame, at, 16)
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  )
}

const LABELS = [
  { en: 'PBT keycaps', fa: 'کلاهک‌های PBT', anchor: new THREE.Vector3(-3, 3.1, 3.3) },
  { en: 'Hot-swap switches', fa: 'سوییچ‌های هات‌سواپ', anchor: new THREE.Vector3(-3, 1.1, 3.0) },
  { en: 'Gasket-mounted plate', fa: 'صفحه‌ی گسکتی', anchor: new THREE.Vector3(-3, -0.15, 3.4) },
  { en: 'Aluminium case', fa: 'بدنه‌ی آلومینیومی', anchor: new THREE.Vector3(-3, -3.2, 3.6) },
]
const LABEL_X = 750

const Overlay: React.FC<{ frame: number; rig: Rig }> = ({ frame, rig }) => {
  const display = { fontFamily: ARCHIVO, color: TACT.cream } as const
  if (frame < S.macro[1]) {
    return (
      <>
        <div style={{ position: 'absolute', left: 90, top: 190, ...display }}>
          <Rise at={18} frame={frame} style={{ fontSize: 118, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            BUILT TO
          </Rise>
          <Rise at={24} frame={frame} style={{ fontSize: 118, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95, letterSpacing: '-0.02em', color: TACT.accent }}>
            BE FELT.
          </Rise>
          <Rise at={36} frame={frame} style={{ marginTop: 18, fontFamily: VAZIR, fontSize: 46, fontWeight: 600, direction: 'rtl', textAlign: 'left' }}>
            ساخته‌شده برای لمس.
          </Rise>
        </div>
        <div style={{ position: 'absolute', left: 90, bottom: 170, fontFamily: ARCHIVO, fontSize: 26, color: 'rgba(233,229,219,0.6)', letterSpacing: '0.18em', opacity: ramp(frame, 60, 20) }}>
          TACT 75 · 45 g LINEAR
        </div>
      </>
    )
  }
  if (frame < S.explode[1]) {
    const fade = 1 - ramp(frame, E.collapse - 4, 8)
    return (
      <>
        <div style={{ position: 'absolute', left: 90, top: 150, ...display, opacity: fade }}>
          <Rise at={E.explodeOpen + 6} frame={frame} style={{ fontSize: 96, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95 }}>
            FIVE LAYERS.
          </Rise>
          <Rise at={E.explodeOpen + 12} frame={frame} style={{ fontSize: 96, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95, color: TACT.accent }}>
            ONE SOUND.
          </Rise>
        </div>
        {LABELS.map((l, i) => {
          const p = project(rig, l.anchor)
          const at = E.labels[i]
          const a = ramp(frame, at, 14) * fade
          const len = Math.max(0, LABEL_X - 20 - p.x) * ramp(frame, at, 18, expoOut)
          return (
            <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, opacity: a }}>
              <div style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: 6, background: TACT.accent, boxShadow: '0 0 14px rgba(255,90,31,0.9)' }} />
              <div style={{ position: 'absolute', left: 6, top: -1, width: len, height: 2, background: 'rgba(233,229,219,0.6)' }} />
              <div style={{ position: 'absolute', left: LABEL_X - p.x, top: -24, whiteSpace: 'nowrap', fontFamily: ARCHIVO, color: TACT.cream, transform: `translateX(${(1 - a) * 20}px)` }}>
                <div style={{ fontSize: 31, fontWeight: 700, fontStretch: '80%', lineHeight: 1.1 }}>{l.en}</div>
                <div style={{ fontFamily: VAZIR, fontSize: 25, color: 'rgba(233,229,219,0.62)', direction: 'rtl', textAlign: 'left' }}>{l.fa}</div>
              </div>
            </div>
          )
        })}
      </>
    )
  }
  if (frame < S.ripple[1]) {
    return (
      <div style={{ position: 'absolute', left: 80, bottom: 150, ...display }}>
        <Rise at={S.ripple[0] + 20} frame={frame} style={{ fontSize: 104, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95 }}>
          84 KEYS.
        </Rise>
        <Rise at={S.ripple[0] + 30} frame={frame} style={{ fontSize: 104, fontWeight: 800, fontStretch: '70%', lineHeight: 0.95, color: TACT.accent }}>
          ONE FEEL.
        </Rise>
        <Rise at={S.ripple[0] + 44} frame={frame} style={{ marginTop: 14, fontFamily: VAZIR, fontSize: 44, fontWeight: 600, direction: 'rtl', textAlign: 'left' }}>
          ۸۴ کلید، یک حس.
        </Rise>
      </div>
    )
  }
  if (frame < S.hero[1]) {
    return (
      <div style={{ position: 'absolute', left: 90, bottom: 190, fontFamily: ARCHIVO, color: 'rgba(233,229,219,0.75)', fontSize: 30, letterSpacing: '0.16em', opacity: ramp(frame, S.hero[0] + 30, 16) }}>
        75% · HOT-SWAP · GASKET MOUNT
        <div style={{ fontFamily: VAZIR, letterSpacing: 0, marginTop: 10, fontSize: 32, direction: 'rtl', textAlign: 'left' }}>۷۵٪ · هات‌سواپ · ساختار گسکت</div>
      </div>
    )
  }
  // end card
  const f = frame - S.end[0]
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', flexDirection: 'column', alignItems: 'center', ...display }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontSize: 210, fontWeight: 900, fontStretch: `${map(ramp(f, 0, 22), 0, 1, 125, 62)}%`, letterSpacing: '-0.03em', lineHeight: 1 }}>tact</span>
        <span style={{ fontSize: 210, fontWeight: 900, fontStretch: '62%', lineHeight: 1, color: TACT.accent, transform: `scale(${ramp(f, 8, 16, backOut)})`, display: 'inline-block' }}>75</span>
      </div>
      <div style={{ marginTop: 26, fontSize: 40, fontWeight: 600, fontStretch: '85%', opacity: ramp(f, 22, 14) }}>Every key, tuned.</div>
      <div style={{ marginTop: 8, fontFamily: VAZIR, fontSize: 40, fontWeight: 600, direction: 'rtl', opacity: ramp(f, 30, 14) }}>هر کلید، کوک‌شده.</div>
      <div style={{ marginTop: 70, fontSize: 24, letterSpacing: '0.22em', color: 'rgba(233,229,219,0.55)', opacity: ramp(f, 44, 14) }}>MECHANICAL KEYBOARD · 2026</div>
    </div>
  )
}

/** Giant title set behind the product in the hero shot. */
const BackTitle: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < S.hero[0] || frame >= S.hero[1]) return null
  const a = ramp(frame, S.hero[0], 10, expoOut)
  const b = ramp(frame, S.hero[0] + 7, 10, expoOut)
  const drift = map(frame, S.hero[0], S.hero[1], 0, -40)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170 + drift, textAlign: 'center', fontFamily: ARCHIVO, fontWeight: 900, lineHeight: 0.82, letterSpacing: '-0.03em' }}>
      <div style={{ fontSize: 470, fontStretch: '62%', color: TACT.cream, transform: `translateY(${(1 - a) * 60}px)`, opacity: a }}>TACT</div>
      <div style={{ fontSize: 470, fontStretch: '62%', color: TACT.accent, transform: `translateY(${(1 - b) * 60}px)`, opacity: b }}>75</div>
    </div>
  )
}

export const Tact: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const rig = rigAt(frame)
  // brief white-hot flash on the collapse impact and the title hit
  const flash = Math.max(map(frame, E.impact, E.impact + 6, 0.5, 0) * (frame >= E.impact ? 1 : 0), map(frame, E.titleHit, E.titleHit + 6, 0.35, 0) * (frame >= E.titleHit ? 1 : 0))
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 45%, #18191d 0%, ${TACT.bg} 60%, #050506 100%)` }}>
      <BackTitle frame={frame} />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 30, position: [0, 2, 6] }}>
        <Environment />
        <Scene frame={frame} rig={rig} />
      </ThreeCanvas>
      <AbsoluteFill>
        <Overlay frame={frame} rig={rig} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: flash, mixBlendMode: 'overlay' }} />
      {/* shot changes cut on the beat; a 2-frame dip hides the jump */}
      <AbsoluteFill style={{ background: '#000', opacity: [S.explode[0], S.ripple[0], S.end[0]].some((c) => frame >= c && frame < c + 2) ? 0.6 : 0 }} />
    </AbsoluteFill>
  )
}

export const _unused = { clamp, KEYS }
