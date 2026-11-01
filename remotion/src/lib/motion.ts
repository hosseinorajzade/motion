import { Easing, interpolate } from 'remotion'

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** Expo-out, the house ease: fast attack, long settle. */
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1)
export const expoIn = Easing.bezier(0.7, 0, 0.84, 0)
export const expoInOut = Easing.bezier(0.87, 0, 0.13, 1)
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1)

/** 0→1 over [start, start+dur] with an ease. */
export const ramp = (frame: number, start: number, dur: number, ease: (t: number) => number = expoOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: ease })

/** Linear map with clamping. */
export const map = (v: number, a: number, b: number, c: number, d: number) =>
  interpolate(v, [a, b], [c, d], clamp)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Damped spring response for an impulse at t=0 (frames). Returns overshooting 0→1. */
export const springy = (frame: number, start: number, stiffness = 0.18, damping = 0.12) => {
  const t = frame - start
  if (t <= 0) return 0
  const w = Math.sqrt(stiffness)
  return 1 - Math.exp(-damping * t) * Math.cos(w * t)
}

/** SMPTE timecode HH:MM:SS:FF */
export const timecode = (frame: number, fps: number) => {
  const f = Math.floor(frame % fps)
  const s = Math.floor(frame / fps)
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, f].map((n) => String(n).padStart(2, '0')).join(':')
}
