# Films (Remotion)

Source for the films on the site, made in code with [Remotion](https://www.remotion.dev): picture in React (2-D) and three.js (3-D), score and sound design synthesised in Python, delivery encoded with ffmpeg.

| Composition | Size | Length | Goes to |
| --- | --- | --- | --- |
| `Showreel` | 1920×1080 | 42 s | `public/showreel/reel-2026.mp4` (lightbox) |
| `ShowreelLoop` | 1920×1080 | 16 s, muted | `public/showreel/reel-preview.mp4` (background loop) + poster |
| `Anar` | 1920×1080 | 12 s | `public/projects/anar/` |
| `Tact75` | 1080×1920 | 20 s | `public/projects/tact-75/` |

The showreel cuts the real project films in `public/projects/*/full.mp4`. Remotion reads them straight from the site's `public/` folder.

## Setup

Node 18+, Python 3 with `numpy` and `scipy`, and ffmpeg.

```bash
cd remotion
npm install
pip install numpy scipy
npm run studio            # preview and scrub every composition
```

## Render and publish

```bash
# 1. picture
npx remotion render src/index.ts Showreel     out/showreel_picture.mp4 --muted --crf=14
npx remotion render src/index.ts ShowreelLoop out/showreel_loop.mp4    --muted --crf=14
npx remotion render src/index.ts Anar         out/anar_picture.mp4     --muted --crf=14
npx remotion render src/index.ts Tact75       out/tact_picture.mp4     --muted --crf=14

# 2. sound (mastered to -14 LUFS / -1 dBTP)
node scripts/export-layout.mjs     # key positions for the keyboard clicks
python3 scripts/score.py all       # writes out/audio/*.wav

# 3. mux + encode into ../public (full film, 6 s hover preview, thumbnail, stills)
scripts/deliver.sh all
```

On a machine without a GPU the 3-D scene renders through software WebGL (`swangle`, set in `remotion.config.ts`). To use a specific Chrome build set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.

## How picture and sound stay in sync

Each film has a cue sheet (`src/*/cues.json`) with its tempo and every hit, wipe and impact in frames. The React scenes animate from those frames and `scripts/score.py` places drums, risers, whooshes and clicks from the same numbers, so a cut and its sound can't drift apart. Change a cue and re-render both.

- Showreel: 120 BPM, one beat = 15 frames, one bar = 60 frames.
- Anar: 100 BPM, one beat = 18 frames.
- Tact 75: 120 BPM; every key in the ripple shot has its own click, panned to where the key sits.
