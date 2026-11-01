import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor'
import * as THREE from 'three'
import { blobFragment, blobVertex, particlesFragment, particlesVertex } from './shaders'
import type { PerformanceTier } from '../lib/device'

interface Input {
  mouse: THREE.Vector2
  scroll: number
}

interface QualityProps {
  tier: PerformanceTier
  reduced: boolean
}

function readAccent() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
  const [r, g, b] = raw.split(/\s+/).map(Number)
  return Number.isFinite(r) ? new THREE.Color(r / 255, g / 255, b / 255) : new THREE.Color('#ff4d2e')
}

function Blob({ input, tier, reduced }: QualityProps & { input: Input }) {
  const mesh = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  const smoothMouse = useRef(new THREE.Vector2())
  const detail = tier === 'high' ? 56 : 20

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uFreq: { value: 0.9 },
      uMouse: { value: new THREE.Vector2() },
      uMouseForce: { value: 0 },
      uAccent: { value: readAccent() },
      uDeep: { value: new THREE.Color('#1b1730') },
    }),
    [],
  )

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const t = reduced ? 4 : state.clock.elapsedTime
    const s = input.scroll

    smoothMouse.current.lerp(input.mouse, reduced ? 1 : Math.min(1, delta * 3))
    uniforms.uTime.value = t
    uniforms.uMouse.value.copy(smoothMouse.current)
    uniforms.uMouseForce.value = THREE.MathUtils.lerp(uniforms.uMouseForce.value, reduced ? 0 : smoothMouse.current.length(), 0.05)
    // Breathing morph between calm and spiky, intensified by scroll
    uniforms.uAmp.value = 0.13 + Math.sin(t * 0.35) * 0.05 + s * 0.25
    uniforms.uFreq.value = 0.7 + Math.sin(t * 0.21 + 1.3) * 0.18 + s * 0.4

    const base = Math.min(1, viewport.width / 4.8)
    m.scale.setScalar(base * (1 + s * 0.45))
    m.position.y = s * 1.6
    m.rotation.y = t * 0.08 + smoothMouse.current.x * 0.4 + s * 1.2
    m.rotation.x = -smoothMouse.current.y * 0.3 + s * 0.6
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.45, detail]} />
      <shaderMaterial vertexShader={blobVertex} fragmentShader={blobFragment} uniforms={uniforms} />
    </mesh>
  )
}

function Particles({ input, count, reduced }: { input: Input; count: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null)
  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi) - 1], i * 3)
      seeds[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return {
      geometry: g,
      uniforms: { uTime: { value: 0 }, uSize: { value: 26 * Math.min(window.devicePixelRatio, 2) }, uAccent: { value: readAccent() } },
    }
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    const p = points.current
    if (!p) return
    const t = reduced ? 0 : state.clock.elapsedTime
    uniforms.uTime.value = t
    p.rotation.y = t * 0.03 + input.mouse.x * 0.15
    p.rotation.x = input.mouse.y * 0.1 + input.scroll * 0.5
    p.position.y = input.scroll * 2.4
  })

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial vertexShader={particlesVertex} fragmentShader={particlesFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(onReady)
  })
  return null
}

export default function HeroScene({ tier, reduced, onReady }: QualityProps & { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const input = useMemo<Input>(() => ({ mouse: new THREE.Vector2(), scroll: 0 }), [])
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState(tier === 'high' ? 1.75 : 1.25)
  const [lite, setLite] = useState(tier === 'low')

  // Track pointer + scroll globally (the canvas sits behind the hero text)
  useEffect(() => {
    const onMove = (e: PointerEvent) => input.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    const onScroll = () => (input.scroll = Math.min(1.2, window.scrollY / window.innerHeight))
    onScroll()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [input])

  // Stop rendering when the hero is off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, dpr]}
        frameloop={reduced ? 'demand' : visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 5.2], fov: 40 }}
        gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance', stencil: false }}
        aria-hidden
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1)
            setLite(true)
          }}
        />
        <Blob input={input} tier={lite ? 'low' : 'high'} reduced={reduced} />
        <Particles input={input} count={lite ? 450 : 1800} reduced={reduced} />
        <FirstFrame onReady={onReady} />
      </Canvas>
    </div>
  )
}
