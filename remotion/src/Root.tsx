import React from 'react'
import { Composition } from 'remotion'
import cues from './showreel/cues.json'
import { Showreel, ShowreelLoop } from './showreel/Showreel'
import { Anar } from './anar/Anar'
import anarCues from './anar/cues.json'
import { Tact } from './tact/Tact'
import tactCues from './tact/cues.json'

export const Root: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} width={1920} height={1080} fps={cues.fps} durationInFrames={cues.durationInFrames} />
    <Composition id="ShowreelLoop" component={ShowreelLoop} width={1920} height={1080} fps={cues.fps} durationInFrames={480} />
 <Composition id="Tact75" component={Tact} width={1080} height={1920} fps={tactCues.fps} durationInFrames={tactCues.durationInFrames} />
    <Composition id="Anar" component={Anar} width={1920} height={1080} fps={anarCues.fps} durationInFrames={anarCues.durationInFrames} />
  </>
)
