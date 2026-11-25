// Records the ClearDoor demo walkthrough of the LIVE demo with a visible
// cursor + click ripples, paced to the narration segments.
//   node scripts/record-demo.mjs
// Output: video/walkthrough/*.webm + video/scene-times.json
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const CHROME = '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome'
const ROOT = new URL('..', import.meta.url).pathname
const OUTDIR = join(ROOT, 'video', 'walkthrough')
await mkdir(OUTDIR, { recursive: true })

// Headless Chromium cannot tunnel through the egress proxy, so the exact
// live build (downloaded from https://siribraheem.github.io/cleardoor/,
// byte-identical to dist/) is mirrored in video/live-mirror and served
// locally for the recording.
const DIST = join(ROOT, 'video', 'live-mirror')
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
}
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (path === '/') path = '/index.html'
  try {
    const body = await readFile(join(DIST, normalize(path)))
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}/`

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const t0 = Date.now()
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: OUTDIR, size: { width: 1280, height: 800 } },
})
const page = await context.newPage()

// Visible cursor + click ripple overlay, injected before any page script.
await page.addInitScript(() => {
  const install = () => {
    if (document.getElementById('demo-cursor')) return
    const cursor = document.createElement('div')
    cursor.id = 'demo-cursor'
    cursor.style.cssText =
      'position:fixed;left:0;top:0;width:28px;height:28px;z-index:2147483647;' +
      'pointer-events:none;transform:translate(-100px,-100px);' +
      'filter:drop-shadow(0 1px 2px rgba(0,0,0,0.55));'
    cursor.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M6 3 L22 14 L14.5 15.5 L18 23 L14.8 24.5 L11.3 16.8 L6 21 Z" ' +
      'fill="#ffffff" stroke="#14152a" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    document.documentElement.appendChild(cursor)
    let x = -100
    let y = -100
    const place = () => {
      cursor.style.transform = `translate(${x - 5}px, ${y - 3}px)`
    }
    window.addEventListener(
      'mousemove',
      (e) => {
        x = e.clientX
        y = e.clientY
        place()
      },
      true,
    )
    window.addEventListener(
      'mousedown',
      (e) => {
        const ripple = document.createElement('div')
        ripple.style.cssText =
          `position:fixed;left:${e.clientX - 26}px;top:${e.clientY - 26}px;` +
          'width:52px;height:52px;border-radius:50%;z-index:2147483646;' +
          'pointer-events:none;border:5px solid #f59e0b;background:rgba(245,158,11,0.20);opacity:1;' +
          'transform:scale(0.35);transition:transform 650ms ease-out, opacity 650ms ease-out;'
        document.documentElement.appendChild(ripple)
        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(1.8)'
          ripple.style.opacity = '0'
        })
        setTimeout(() => ripple.remove(), 700)
      },
      true,
    )
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install)
  } else {
    install()
  }
})

const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(String(err)))

const elapsed = () => (Date.now() - t0) / 1000
const sceneTimes = {}
let sceneStart = 0
function markScene(name) {
  sceneTimes[name] = Number(elapsed().toFixed(2))
  sceneStart = Date.now()
  console.log('scene', name, 'at', sceneTimes[name], 's')
}
async function holdUntil(seconds) {
  const target = sceneStart + seconds * 1000
  const remain = target - Date.now()
  if (remain > 0) await page.waitForTimeout(remain)
}

async function moveToBox(box, steps = 12) {
  if (!box) return
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps })
}
async function scrollIntoView(locator) {
  for (let i = 0; i < 12; i++) {
    const box = await locator.boundingBox()
    if (!box) throw new Error('no bounding box')
    if (box.y > 60 && box.y + box.height < 760) return box
    const dy = box.y > 400 ? 320 : -320
    await page.mouse.wheel(0, dy)
    await page.waitForTimeout(220)
  }
  return locator.boundingBox()
}
async function clickLoc(locator) {
  const box = await scrollIntoView(locator)
  await moveToBox(box)
  await page.waitForTimeout(280)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(450)
}
async function smoothWheel(dy, steps = 6) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps)
    await page.waitForTimeout(110)
  }
}

const tab = (label) =>
  page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: label })
const btn = (label) => page.locator('main').getByRole('button', { name: label }).first()

await page.goto(base, { waitUntil: 'networkidle' })
// The liquid glass backdrop blur + drifting blobs are very expensive to
// paint in software rendering and slow the recording badly. Turn them
// off for the recording only; layout and colours stay the same.
await page.addStyleTag({
  content:
    '* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; animation: none !important; }',
})
await page.waitForTimeout(600)
sceneTimes.appReady = Number(elapsed().toFixed(2))
console.log('app ready at', sceneTimes.appReady, 's')

// ---------- Scene 1: the barrier (sample lesson, grade chips) ----------
markScene('s1')
await page.mouse.move(640, 400, { steps: 10 })
await page.waitForTimeout(1000)
await moveToBox(await page.locator('#lesson-text').boundingBox())
await page.waitForTimeout(3000)
await smoothWheel(300)
await page.waitForTimeout(600)
await moveToBox(await page.locator('.stat-row').boundingBox())
await page.waitForTimeout(3000)
await moveToBox(await page.locator('.chip').first().boundingBox())
await page.waitForTimeout(2500)
await smoothWheel(-300)
await moveToBox(await page.locator('.brand').boundingBox())
await holdUntil(21)

// ---------- Scene 2: make it clear (grade drop, words made plain) ----------
markScene('s2')
await clickLoc(btn('Make it clear'))
await page.waitForSelector('.result-text')
await page.waitForTimeout(1200)
await moveToBox(await page.locator('.compare').boundingBox())
await page.waitForTimeout(2800)
await moveToBox(await page.locator('.compare-box.good').boundingBox())
await page.waitForTimeout(2200)
await smoothWheel(280)
await page.waitForTimeout(500)
await clickLoc(page.locator('.changes summary'))
await page.waitForTimeout(800)
await moveToBox(await page.locator('.change-list').boundingBox())
await holdUntil(17.5)

// ---------- Scene 3: save and read (reader controls) ----------
markScene('s3')
await smoothWheel(-500)
await clickLoc(btn('Save to library'))
await page.waitForTimeout(900)
await clickLoc(tab('Read'))
await page.waitForSelector('.reading-page h2')
await page.waitForTimeout(800)
await moveToBox(await page.locator('#font-size').boundingBox())
await page.locator('#font-size').fill('27')
await page.waitForTimeout(1200)
await moveToBox(await page.locator('#line-spacing').boundingBox())
await page.locator('#line-spacing').fill('2')
await page.waitForTimeout(1000)
await clickLoc(btn('Night'))
await page.waitForTimeout(1400)
await clickLoc(btn('High contrast'))
await page.waitForTimeout(1400)
await clickLoc(btn('Paper'))
await page.waitForTimeout(600)
await clickLoc(page.locator('.reading-page .para').first())
await page.waitForTimeout(1400)
await clickLoc(page.locator('.reading-page .para').first())
await page.waitForTimeout(500)
await clickLoc(btn('Read aloud'))
await page.waitForTimeout(2500)
const stopBtn = btn('Stop')
if (await stopBtn.isVisible().catch(() => false)) {
  await clickLoc(stopBtn)
}
await holdUntil(21)

// ---------- Scene 4: offline library ----------
markScene('s4')
await clickLoc(tab('My library'))
await page.waitForSelector('.card')
await page.waitForTimeout(1000)
await moveToBox(await page.locator('.card').first().boundingBox())
await page.waitForTimeout(2200)
await moveToBox(await btn('Download all (.txt)').boundingBox())
await page.waitForTimeout(2000)
await moveToBox(await page.locator('.library-head h2').boundingBox())
await holdUntil(12.5)

// ---------- Scene 5: close on header ----------
markScene('s5')
await clickLoc(tab('Make it clear'))
await page.waitForTimeout(800)
await smoothWheel(-600)
await page.waitForTimeout(500)
await moveToBox(await page.locator('.brand').boundingBox())
await page.waitForTimeout(2500)
await moveToBox(await page.locator('.tabs').boundingBox())
await page.waitForTimeout(2500)
await moveToBox(await page.locator('.brand').boundingBox())
await holdUntil(19)

sceneTimes.end = Number(elapsed().toFixed(2))
console.log('end at', sceneTimes.end, 's')

const video = page.video()
await context.close()
const videoPath = await video.path()
await browser.close()
server.close()

await writeFile(join(ROOT, 'video', 'scene-times.json'), JSON.stringify(sceneTimes, null, 2))
console.log('video:', videoPath)
console.log(JSON.stringify(sceneTimes, null, 2))
if (consoleErrors.length > 0) {
  console.error('CONSOLE ERRORS:', consoleErrors)
  process.exit(1)
}
console.log('done, zero console errors')
