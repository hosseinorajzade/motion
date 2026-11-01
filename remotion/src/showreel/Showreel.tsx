import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { loadFonts } from '../lib/fonts'
import { Card, WIPE_LEAD } from './Card'
import cues from './cues.json'
import { Hud } from './Hud'
import { Intro } from './Intro'
import { Drop, Montage, Outro, Product, Social, TypeSection, UISection } from './Sections'

loadFonts()

const SCENES: Record<string, React.FC> = {
  intro: Intro,
  drop: Drop,
  product: Product,
  type: TypeSection,
  ui: UISection,
  social: Social,
  montage: Montage,
  outro: Outro,
}

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {cues.sections.map((s, i) => {
      if (s.id === 'card') return null
      const Scene = SCENES[s.id]
      // Footage keeps playing underneath the next card's wipe.
      const next = cues.sections[i + 1]
      const tail = next?.id === 'card' ? 2 : 0
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from + tail}>
          <Scene />
        </Sequence>
      )
    })}
    {/* The HUD sits above footage but under the cards, so each card's wipe covers it too. */}
    <Hud from={120} to={1080} />
    {cues.sections.map((s, i) =>
      s.id === 'card' ? (
        // Cards start early so their playhead wipe lands on the downbeat.
        <Sequence key={i} from={s.from - WIPE_LEAD} durationInFrames={s.to - s.from + WIPE_LEAD}>
          <Card index={s.index!} words={s.words!} fa={s.fa!} theme={s.theme as 'blue' | 'paper' | 'ink'} total={s.to - s.from} />
        </Sequence>
      ) : null,
    )}
  </AbsoluteFill>
)

/**
 * Muted loop for the site's showreel section: footage only, no cards or titles,
 * because the page sets its own "Showreel" headline over it.
 */
export const ShowreelLoop: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Sequence durationInFrames={120}>
      <Drop />
    </Sequence>
    <Sequence from={120} durationInFrames={120}>
      <Product />
    </Sequence>
    <Sequence from={240} durationInFrames={120}>
      <UISection />
    </Sequence>
    <Sequence from={360} durationInFrames={120}>
      <Montage />
    </Sequence>
  </AbsoluteFill>
)
