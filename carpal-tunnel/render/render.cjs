#!/usr/bin/env node
/*
 * Frame-by-frame renderer for carpal-tunnel/index.html.
 *
 * It serves the folder over a local HTTP server (with Range support, so the
 * clips can be seeked), opens the page in headless Chromium with ?render=1,
 * calls window.renderFrame(t) for every frame and screenshots the page.
 * Time never comes from a clock: frame n is always rendered at t = n / FPS.
 *
 *   node render/render.cjs                         # all 1200 frames -> out/frames
 *   node render/render.cjs --stills 2,9.5,14,26    # single stills -> out/stills
 *   node render/render.cjs --from 0 --to 299       # a frame range
 *   node render/render.cjs --workers 3             # split frames across browsers
 *   node render/render.cjs --resume                # skip frames that already exist
 *   node render/render.cjs --check                 # same t twice, in a different order -> same pixels?
 *
 * Then run render/encode.sh to build the MP4.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const FPS = 30;
const DURATION = 40;
const TOTAL = FPS * DURATION; // 1200
const W = 1080;
const H = 1920;

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes('--' + name);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, url === '/' ? 'index.html' : url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const size = fs.statSync(file).size;
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : size - 1;
      if (!m[1] && m[2]) { start = size - parseInt(m[2], 10); end = size - 1; }
      end = Math.min(end, size - 1);
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
      fs.createReadStream(file).pipe(res);
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const crypto = require('crypto');

async function openPage(port, id) {
  const browser = await chromium.launch({
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      '--autoplay-policy=no-user-gesture-required',
      '--force-color-profile=srgb',
      '--hide-scrollbars',
      '--font-render-hinting=none',
      // bit-exact DOM raster whatever was drawn before (glyph positions and tiles do not depend on history)
      '--disable-font-subpixel-positioning',
      '--disable-lcd-text',
      '--disable-gpu-rasterization',
      '--disable-partial-raster',
      '--num-raster-threads=1',
    ],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || flag('verbose')) console.log(`[w${id}] ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => console.error(`[w${id}] pageerror: ${e.message}`));
  // boot, with a reload if the page ever stalls while loading fonts or clips
  for (let attempt = 1; ; attempt++) {
    await page.goto(`http://127.0.0.1:${port}/index.html?render=1`);
    try {
      // interval polling: the default rAF polling never fires because render mode stubs requestAnimationFrame
      await page.waitForFunction(() => window.__ready === true || window.__bootError, null, { timeout: 90000, polling: 200 });
      break;
    } catch (e) {
      const stage = await page.evaluate(() => window.__bootStage).catch(() => '?');
      console.log(`[w${id}] boot stalled at "${stage}" (attempt ${attempt})`);
      if (attempt >= 3) throw e;
    }
  }
  const bootError = await page.evaluate(() => window.__bootError);
  if (bootError) throw new Error(bootError);
  // CDP capture: lossless PNG with fast zlib settings (about 1 s faster per frame than page.screenshot)
  const cdp = await page.context().newCDPSession(page);
  return { browser, page, cdp };
}

async function shoot({ page, cdp }, t, file) {
  await page.evaluate((tt) => window.renderFrame(tt), t);
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png', optimizeForSpeed: true, captureBeyondViewport: false,
    clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
  });
  const buf = Buffer.from(data, 'base64');
  if (file) fs.writeFileSync(file, buf);
  return buf;
}

async function main() {
  const server = await serve();
  const port = server.address().port;
  const t0 = Date.now();

  if (flag('check')) {
    // determinism: the same t must give the same pixels, whatever was rendered before it
    const times = (opt('check-times') || '2.5,9.4,15.6,20.4,27.9,34.2').split(',').map(Number);
    const a = await openPage(port, 0);
    const first = [];
    const bufs = [];
    for (const t of times) { const buf = await shoot(a, t); bufs.push(buf); first.push(crypto.createHash('sha1').update(buf).digest('hex')); }
    const dir = path.join(ROOT, 'out', 'check');
    const b = await openPage(port, 1);
    let ok = true;
    for (const [i, t] of [...times.entries()].reverse()) {
      const buf = await shoot(b, t);
      const h = crypto.createHash('sha1').update(buf).digest('hex');
      const same = h === first[i];
      if (!same) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `t${t}_a.png`), bufs[i]);
        fs.writeFileSync(path.join(dir, `t${t}_b.png`), buf);
      }
      ok = ok && same;
      console.log(`t=${t}s  ${first[i].slice(0, 12)}  ${h.slice(0, 12)}  ${same ? 'identical' : 'DIFFERENT'}`);
    }
    await a.browser.close();
    await b.browser.close();
    server.close();
    console.log(ok ? 'deterministic: OK' : 'deterministic: FAILED');
    process.exit(ok ? 0 : 2);
  }

  if (opt('stills')) {
    const out = path.resolve(opt('out', path.join(ROOT, 'out', 'stills')));
    fs.mkdirSync(out, { recursive: true });
    const times = opt('stills').split(',').map(Number);
    const ctx = await openPage(port, 0);
    const { browser } = ctx;
    for (const t of times) {
      const name = path.join(out, `t_${t.toFixed(2).padStart(5, '0')}.png`);
      const s = Date.now();
      await shoot(ctx, t, name);
      console.log(`still t=${t}s -> ${path.relative(ROOT, name)} (${Date.now() - s} ms)`);
    }
    await browser.close();
    server.close();
    return;
  }

  const out = path.resolve(opt('out', path.join(ROOT, 'out', 'frames')));
  fs.mkdirSync(out, { recursive: true });
  const from = parseInt(opt('from', '0'), 10);
  const to = parseInt(opt('to', String(TOTAL - 1)), 10);
  const workers = parseInt(opt('workers', '2'), 10);
  const skipExisting = flag('resume');

  const frames = [];
  for (let f = from; f <= to; f++) {
    const file = path.join(out, `f_${String(f).padStart(5, '0')}.png`);
    if (skipExisting && fs.existsSync(file) && fs.statSync(file).size > 0) continue;
    frames.push(f);
  }
  // contiguous chunks: each worker walks forward through its own block
  const chunk = Math.ceil(frames.length / workers);
  const blocks = Array.from({ length: workers }, (_, i) => frames.slice(i * chunk, (i + 1) * chunk)).filter((b) => b.length);
  let done = 0;
  await Promise.all(blocks.map(async (block, id) => {
    const ctx = await openPage(port, id);
    const { browser } = ctx;
    for (const f of block) {
      const file = path.join(out, `f_${String(f).padStart(5, '0')}.png`);
      await shoot(ctx, f / FPS, file + '.tmp.png');
      fs.renameSync(file + '.tmp.png', file);
      done++;
      if (done % 25 === 0 || done === frames.length) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${frames.length} frames  ${el.toFixed(0)}s elapsed  ~${((el / done) * (frames.length - done)).toFixed(0)}s left`);
      }
    }
    await browser.close();
  }));
  server.close();
  console.log(`rendered ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${path.relative(ROOT, out)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
