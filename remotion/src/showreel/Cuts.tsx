import React from 'react'
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { map } from '../lib/motion'

export const SRC = {
  D: 'projects/daewoo-charisma/full.mp4',
  A: 'projects/art-and-walk/full.mp4',
  L: 'projects/alserkal-walk/full.mp4',
  T: 'projects/tessel/full.mp4',
  S: 'projects/social-cafe/full.mp4',
} as const
export type SrcKey = keyof typeof SRC

/** One shot: which film, when it starts (local frame), its in-point (seconds) and framing. */
export type Shot = { k: SrcKey; at: number; in: number; pos?: string; zoom?: number; rate?: number }

const ShotView: React.FC<{ shot: Shot; dur: number; push: number }> = ({ shot, dur, push }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  // A gentle push-in keeps every shot alive, even the held ones.
  const s = (shot.zoom ?? 1) * map(frame, 0, dur, 1, 1 + push)
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <OffthreadVideo
        src={staticFile(SRC[shot.k])}
        trimBefore={Math.round(shot.in * fps)}
        muted
        playbackRate={shot.rate ?? 1}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: shot.pos ?? '50% 50%',
          transform: `scale(${s})`,
          transformOrigin: shot.pos ?? '50% 50%',
        }}
      />
    </AbsoluteFill>
  )
}

/** A cut list played back to back inside the parent box. */
export const Cuts: React.FC<{ shots: Shot[]; duration: number; push?: number }> = ({ shots, duration, push = 0.05 }) => (
  <AbsoluteFill>
    {shots.map((shot, i) => {
      const end = shots[i + 1]?.at ?? duration
      const dur = end - shot.at
      if (dur <= 0) return null
      return (
        <Sequence key={i} from={shot.at} durationInFrames={dur} layout="none">
          <ShotView shot={shot} dur={dur} push={push} />
        </Sequence>
      )
    })}
  </AbsoluteFill>
)
