import React, { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BOARD_D, BOARD_W, KEYS, Key } from './layout'

export const TACT = {
  cream: '#e9e5db',
  graphite: '#3a3c41',
  accent: '#ff5a1f',
  bg: '#0b0b0d',
}

// ---------------------------------------------------------------- geometry (cached)

const capCache = new Map<number, THREE.BufferGeometry>()
export function keycapGeometry(w: number) {
  if (capCache.has(w)) return capCache.get(w)!
  const W = w - 0.1
  const D = 0.9
  const H = 0.42
  const g = new RoundedBoxGeometry(W, H, D, 4, 0.08)
  const pos = g.attributes.position
  // taper the sides towards the top, like a real keycap profile
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + H / 2) / H
    pos.setX(i, pos.getX(i) * (1 - t * (0.17 / W)))
    pos.setZ(i, pos.getZ(i) * (1 - t * (0.17 / D)))
  }
  pos.needsUpdate = true
  g.computeBoundingSphere()
  capCache.set(w, g)
  return g
}

export const switchHousing = new RoundedBoxGeometry(0.62, 0.3, 0.62, 2, 0.04)
export const switchTop = new RoundedBoxGeometry(0.52, 0.12, 0.52, 2, 0.04)
export const stemA = new THREE.BoxGeometry(0.06, 0.16, 0.22)
export const stemB = new THREE.BoxGeometry(0.22, 0.16, 0.06)

// ---------------------------------------------------------------- materials

export const useMaterials = () =>
  useMemo(
    () => ({
      alpha: new THREE.MeshStandardMaterial({ color: TACT.cream, roughness: 0.58, metalness: 0 }),
      mod: new THREE.MeshStandardMaterial({ color: TACT.graphite, roughness: 0.62, metalness: 0 }),
      accent: new THREE.MeshStandardMaterial({ color: TACT.accent, roughness: 0.45, metalness: 0 }),
      caseMat: new THREE.MeshStandardMaterial({ color: '#2a2c31', roughness: 0.3, metalness: 0.85 }),
      plate: new THREE.MeshStandardMaterial({ color: '#a7a9ae', roughness: 0.32, metalness: 0.92 }),
      pcb: new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.55, metalness: 0.2 }),
      foam: new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.95, metalness: 0 }),
      housing: new THREE.MeshStandardMaterial({ color: '#1c1d21', roughness: 0.25, metalness: 0.1 }),
      housingTop: new THREE.MeshStandardMaterial({ color: '#2b2d33', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }),
      stem: new THREE.MeshStandardMaterial({ color: TACT.accent, roughness: 0.4 }),
      glow: new THREE.MeshBasicMaterial({ color: TACT.accent, toneMapped: false, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }),
    }),
    [],
  )
export type Mats = ReturnType<typeof useMaterials>

// ---------------------------------------------------------------- parts

export const Switch: React.FC<{ mats: Mats; press?: number }> = ({ mats, press = 0 }) => (
  <group>
    <mesh geometry={switchHousing} material={mats.housing} position={[0, 0.15, 0]} />
    <mesh geometry={switchTop} material={mats.housingTop} position={[0, 0.36, 0]} />
    <group position={[0, 0.48 - press * 0.16, 0]}>
      <mesh geometry={stemA} material={mats.stem} />
      <mesh geometry={stemB} material={mats.stem} />
    </group>
  </group>
)

export const Keycap: React.FC<{ k: Pick<Key, 'w' | 'kind'>; mats: Mats }> = ({ k, mats }) => (
  <mesh geometry={keycapGeometry(k.w)} material={mats[k.kind]} />
)

const caseGeo = new RoundedBoxGeometry(BOARD_W + 0.7, 0.95, BOARD_D + 0.7, 5, 0.22)
const plateGeo = new RoundedBoxGeometry(BOARD_W + 0.2, 0.06, BOARD_D + 0.2, 2, 0.03)
const pcbGeo = new RoundedBoxGeometry(BOARD_W + 0.15, 0.06, BOARD_D + 0.15, 2, 0.03)
const foamGeo = new RoundedBoxGeometry(BOARD_W + 0.1, 0.12, BOARD_D + 0.1, 2, 0.05)
const glowGeo = new THREE.PlaneGeometry(1, 1)

const ACCENT = new THREE.Color(TACT.accent)
function glowCap(m: THREE.MeshStandardMaterial, g: number) {
  m.emissive.copy(ACCENT)
  m.emissiveIntensity = g * 1.1
  return m
}

export type BoardState = {
  /** 0 = assembled, 1 = fully exploded */
  explode?: number
  /** per-key press amount 0..1 */
  press?: (k: Key) => number
  /** per-key under-glow 0..1 */
  glow?: (k: Key) => number
  /** per-key extra drop-in offset (key rain) */
  drop?: (k: Key) => number
}

/**
 * The assembled board. y = 0 is the top of the plate.
 * Layers spread vertically with `explode`.
 */
export const Keyboard: React.FC<{ mats: Mats; state: BoardState }> = ({ mats, state }) => {
  // per-key materials so pressed keys can light up from within
  const capMats = useMemo(() => KEYS.map((k) => mats[k.kind].clone()), [mats])
  const e = state.explode ?? 0
  const yCase = -0.6 - e * 2.6
  const yFoam = -0.42 - e * 1.8
  const yPcb = -0.24 - e * 1.0
  const yPlate = 0 - e * 0.15
  const ySwitch = 0 + e * 0.9
  const yCap = 0.62 + e * 2.3
  return (
    <group>
      <mesh geometry={caseGeo} material={mats.caseMat} position={[0, yCase, 0]} />
      <mesh geometry={foamGeo} material={mats.foam} position={[0, yFoam, 0]} />
      <mesh geometry={pcbGeo} material={mats.pcb} position={[0, yPcb, 0]} />
      <mesh geometry={plateGeo} material={mats.plate} position={[0, yPlate, 0]} />
      {KEYS.map((k) => {
        const p = state.press?.(k) ?? 0
        const g = state.glow?.(k) ?? 0
        const d = state.drop?.(k) ?? 0
        return (
          <group key={k.id} position={[k.x, 0, k.z]}>
            <group position={[0, ySwitch - 0.02, 0]}>
              <Switch mats={mats} press={p} />
            </group>
            <group position={[0, yCap + 0.21 - p * 0.16 + d, 0]}>
              <mesh geometry={keycapGeometry(k.w)} material={glowCap(capMats[k.id], g)} />
            </group>
            {g > 0.01 && (
              <mesh geometry={glowGeo} position={[0, ySwitch + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[k.w + 0.9, 1.9, 1]}>
                <meshBasicMaterial color="#ff6a2a" toneMapped={false} transparent opacity={g * 0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
