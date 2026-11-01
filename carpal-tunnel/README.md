# Carpal tunnel syndrome · 40 s explainer (9:16)

A Persian motion-graphics explainer about carpal tunnel syndrome, built as one HTML page and rendered frame by frame to MP4.

- **Delivery:** [`carpal-tunnel.mp4`](carpal-tunnel.mp4): 1080×1920, 30 fps, H.264 High, exactly 40 s (1200 frames), no audio.
- **Scene:** [`index.html`](index.html): HTML/CSS/JS in one file. GSAP (timeline only, no ScrollTrigger), three.js with `UnrealBloomPass`, GPU particles for the nerve signals, Vazirmatn type.
- Fonts, libraries and clips are all local (`assets/`). Nothing loads from a CDN.

[فارسی ↓](#راهنمای-فارسی)

## Structure

| Time | Section | What happens |
| --- | --- | --- |
| 0–4 s | Hook | «انگشتات شب‌ها بی‌حس میشن؟» animated word by word over the night-typing clip. «بی‌حس» flickers numb. |
| 4–12 s | Anatomy | The scan clip turns the wrist into a hologram, then a 3D slice of the wrist builds itself with stroke-drawn neon lines: carpal bones, transverse carpal ligament, 9 flexor tendons, median nerve. Labels with leader lines; signals flow along the nerve. |
| 12–22 s | Why | The canal narrows, tendons swell, the nerve flattens, turns red and pulses; signals jam. Then the swelling clip with five cause call-outs and stroke-drawn icons (repetitive motion, bent wrist, vibrating tools, pregnancy, diabetes/thyroid). |
| 22–30 s | Symptoms | Nerve clip, then a short glitch into a neon hand: red particles run from the wrist to the thumb, index and middle finger. |
| 30–40 s | Relief | Relief clip (the nerve turns from red to calm blue) with three tips, then the end card «اگه ادامه داشت به پزشک مراجعه کن». |

Palette: teal `#2ef0dc` for healthy, red `#ff3d57` for pain, on a near-black background. Easing is `power3` / `expo` throughout.

## Deterministic time

Nothing in the picture depends on a clock.

- `window.renderFrame(t)` seeks the master timeline (`tl.seek(t)`), drives tweens outside it with `gsap.updateRoot(t)`, seeks the clips to their exact frames, updates the three.js scene and renders it. Frame *n* is always `t = n / 30`.
- In render mode (`?render=1`) `requestAnimationFrame` is stubbed before GSAP loads, and the GSAP ticker is unhooked, so nothing can advance by itself. Random values come from a seeded PRNG; film grain and glitches are seeded by the frame number.
- Clip seeks resolve only after `seeked` **and** after `requestVideoFrameCallback` reports that the exact target frame has been presented, so a texture upload can never pick up the previous frame.
- `node render/render.cjs --check` renders the same times in two browsers, in opposite orders, and compares the pixels.

Without `?render=1` the page plays itself in real time (that preview loop is the only place a clock is used) and shows a **replay** button at the end. The button exists only in the HTML version: render mode removes it from the page.

## Preview the page

Serve the folder over HTTP. WebGL video textures and ES modules don't work from `file://`.

```bash
cd carpal-tunnel
python3 -m http.server 8080
# open http://localhost:8080
```

## Render the MP4

Needs Node 18+, ffmpeg and Playwright's Chromium.

```bash
cd carpal-tunnel
npm install && npx playwright install chromium
npm run stills    # test frames at key times -> out/stills
npm run check     # determinism check
npm run render    # all 1200 frames -> out/frames, then encode -> out/carpal-tunnel.mp4
```

The same steps by hand: `node render/render.cjs --stills 2,9.5`, `node render/render.cjs --workers 3 [--resume]`, `render/encode.sh`.

Each frame is a lossless PNG captured over CDP. Without a GPU, WebGL runs on SwiftShader at about 2 s per frame per browser.

## Files

```
carpal-tunnel/
├── index.html            the whole scene (CSS, markup, timeline, three.js, renderFrame)
├── carpal-tunnel.mp4     the delivered film
├── assets/
│   ├── clips/            the five source clips, re-encoded (H.264, 12-frame GOP, no audio)
│   ├── fonts/            Vazirmatn variable (Arabic + Latin subsets, OFL)
│   └── lib/              gsap 3.12.5, three 0.169.0 + the postprocessing modules it needs
├── render/
│   ├── render.cjs        local server + headless Chromium frame renderer
│   └── encode.sh         PNG frames -> H.264 MP4
└── package.json          npm scripts for the steps above
```

---

## راهنمای فارسی

یک موشن‌گرافیک آموزشی ۴۰ ثانیه‌ای ۹:۱۶ درباره‌ی سندروم تونل کارپال.

- **خروجی نهایی:** `carpal-tunnel.mp4` با ابعاد ۱۰۸۰×۱۹۲۰، ۳۰ فریم بر ثانیه، H.264، دقیقاً ۴۰ ثانیه.
- **صحنه:** `index.html` (یک فایل). GSAP فقط با timeline، three.js با UnrealBloomPass و ذرات GPU برای سیگنال‌های عصبی. فونت، کتابخانه‌ها و کلیپ‌ها همه لوکال هستند.
- **زمان قطعی:** تابع `renderFrame(t)` تایم‌لاین را با `seek` روی t می‌برد، تویین‌های بیرون از تایم‌لاین را با `gsap.updateRoot(t)` جلو می‌برد، کلیپ‌ها را روی فریم دقیق می‌برد و صحنه را رندر می‌کند. در حالت رندر از `requestAnimationFrame` و ساعت واقعی استفاده نمی‌شود.
- **پیش‌نمایش:** داخل پوشه `python3 -m http.server 8080` را اجرا کن و `http://localhost:8080` را باز کن. دکمه‌ی «پخش مجدد» فقط در نسخه‌ی HTML است.
- **رندر:** `npm install` و بعد `npm run render` (یا `node render/render.cjs --workers 3` و بعد `render/encode.sh`).
