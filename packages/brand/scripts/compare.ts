/**
 * `yarn compare [<page>...] [--width 1280] [--height 900] [--dark] [--full]` (in `packages/brand`):  screenshot each
 * Claude Design original and its Spell UI copy at the same size, and measure how far apart they are.
 * - Pages:  the names given (`"Spell App"`), else every page whose copy exists (`built: true` in
 *   `_assets/brand-pages.js`, the one list the index and Compare use too).
 * - Served by THIS checkout's page server (started if it isn't running):  four originals fetch local files.
 * - `--dark`:  the browser prefers dark;  the copies follow (`color-scheme`), the originals keep their own toggle.
 * - `--full`:  the whole page, not only the first screen.
 * - Writes, per page, to `.compare/<page>/` (git-ignored):  `dc.png`, `spell.png`, `side.png` (the two side by side)
 *   and `diff.png` (changed pixels in magenta over a faded original);  then `.compare/report.md`, a table of every
 *   page's DIFF:  the share of pixels whose colour differs by more than `THRESHOLD` (0-255 per channel, summed).
 * - The diff is a rough guide, not a verdict:  one line of text wrapping differently moves everything below it.  LOOK
 *   at `side.png`, or the Compare view (`compare.html`).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { runInNewContext } from "node:vm"
import { chromium, type Page } from "playwright"

import { SRV } from "$/server"

/** `packages/brand/`, and the repo root. */
const BRAND = path.resolve(import.meta.dirname, "..")
const REPO = path.resolve(BRAND, "../..")

/** Where results go (git-ignored). */
const OUT = path.join(BRAND, ".compare")

/** A pixel differs when its R + G + B differences add up to more than this:  low enough that the brand's faint tints count (lavender wash on white:  14). */
const THRESHOLD = 12

/** One page of the list in `_assets/brand-pages.js`. */
type BrandPage = { name: string; kind: string; built: boolean; about: string }

/** One page's measurement. */
type Result = { name: string; diff: number; width: number; height: number }

const options = parseArgs(process.argv.slice(2))
const pages = choosePages(options.names)
if (!pages.length) {
  console.log("brand compare:  no page has a copy yet (`built: true` in _assets/brand-pages.js);  name one to force it")
  process.exit(0)
}
const base = await serverBase()
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: options.width, height: options.height },
  colorScheme: options.dark ? "dark" : "light"
})
const page = await context.newPage()
const results: Result[] = []
for (const each of pages) {
  const folder = path.join(OUT, each.name)
  mkdirSync(folder, { recursive: true })
  const dc = await shoot(page, `${base}/packages/brand/${href(each.name, "dc")}`, path.join(folder, "dc.png"))
  const spell = await shoot(page, `${base}/packages/brand/${href(each.name, "spell")}`, path.join(folder, "spell.png"))
  const result = await measure(page, dc, spell, folder)
  results.push({ name: each.name, ...result })
  console.log(`  ${each.name.padEnd(20)} ${(result.diff * 100).toFixed(1).padStart(5)}% differ  (${folder})`)
}
await browser.close()
writeReport(results)

////////////////
// ## Pages
////////////////

/** `--width` / `--height` / `--dark` / `--full`, and the page names. */
function parseArgs(args: string[]) {
  const take = (flag: string, fallback: number) => {
    const at = args.indexOf(flag)
    if (at < 0) return fallback
    const value = Number(args.splice(at, 2)[1])
    if (!Number.isFinite(value)) throw new Error(`${flag} wants a number`)
    return value
  }
  const width = take("--width", 1280)
  const height = take("--height", 900)
  const dark = args.includes("--dark")
  const full = args.includes("--full")
  const names = args.filter((arg) => !arg.startsWith("--"))
  return { width, height, dark, full, names }
}

/**
 * The pages to compare:  `names` (any page, built or not), else every built one.
 * - reads `_assets/brand-pages.js` the way a page does, with stand-ins for `window` / `document`
 */
function choosePages(names: string[]): BrandPage[] {
  const window: { BrandPages?: { PAGES: BrandPage[] } } = {}
  const document = { querySelector: () => null }
  runInNewContext(readFileSync(path.join(BRAND, "_assets/brand-pages.js"), "utf8"), { window, document, location: {} })
  const all = window.BrandPages!.PAGES
  if (!names.length) return all.filter((page) => page.built)
  return names.map((name) => {
    const found = all.find((page) => page.name.toLowerCase() === name.toLowerCase())
    if (!found) throw new Error(`no brand page "${name}" -- known:  ${all.map((page) => page.name).join(", ")}`)
    return found
  })
}

/** URL of a page's original (`dc`) or copy (`spell`), relative to `packages/brand/`. */
function href(name: string, version: "dc" | "spell"): string {
  return `spell-design-system/${encodeURIComponent(name)}.${version}.html`
}

/** This checkout's page server, started if it isn't running. */
async function serverBase(): Promise<string> {
  const pid = new SRV.PidFile(REPO)
  let running = await pid.status()
  if (!running) {
    execFileSync("yarn", ["server", "ensure"], { cwd: REPO, stdio: "ignore" })
    running = await pid.status()
  }
  if (!running) throw new Error("brand compare:  couldn't start the page server (`yarn server ensure`)")
  return running.base
}

////////////////
// ## Screenshots
////////////////

/**
 * Screenshot `url` into `file`;  returns the PNG.
 * - waits for the network to settle, then a moment more:  originals compile their templates with React after load,
 *   and copies wait for `UI.load()` and the theme sheet
 * - hides the originals' fixed "Design System" back link:  page furniture the copies don't have
 */
async function shoot(page: Page, url: string, file: string): Promise<Buffer> {
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  await page.addStyleTag({ content: "[data-backlink] { display: none !important }" })
  return page.screenshot({ path: file, fullPage: options.full })
}

/**
 * Compares two screenshots in the browser (canvas):  the share of pixels that differ, `side.png` and `diff.png`.
 * - sizes differ with `--full`:  both are drawn on the larger canvas, the missing part counts as different
 */
async function measure(page: Page, dc: Buffer, spell: Buffer, folder: string) {
  await page.goto("about:blank")
  // HACK:  `tsx` (esbuild `keepNames`) wraps named functions in `__name(...)`, which the page doesn't have
  await page.evaluate("globalThis.__name = (fn) => fn")
  const result = await page.evaluate(
    async ({ dcUrl, spellUrl, threshold }) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = src
        })
      const [a, b] = await Promise.all([load(dcUrl), load(spellUrl)])
      const width = Math.max(a.width, b.width)
      const height = Math.max(a.height, b.height)
      const pixels = (image: HTMLImageElement) => {
        const canvas = new OffscreenCanvas(width, height)
        const context = canvas.getContext("2d")!
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, width, height).data
      }
      const pa = pixels(a)
      const pb = pixels(b)
      const diff = new OffscreenCanvas(width, height)
      const diffContext = diff.getContext("2d")!
      const out = diffContext.createImageData(width, height)
      let changed = 0
      for (let i = 0; i < pa.length; i += 4) {
        const delta = Math.abs(pa[i]! - pb[i]!) + Math.abs(pa[i + 1]! - pb[i + 1]!) + Math.abs(pa[i + 2]! - pb[i + 2]!)
        const differs = delta > threshold || pa[i + 3] !== pb[i + 3]
        if (differs) changed++
        // changed:  magenta;  same:  the original, faded to a third
        out.data[i] = differs ? 255 : 170 + pa[i]! / 3
        out.data[i + 1] = differs ? 0 : 170 + pa[i + 1]! / 3
        out.data[i + 2] = differs ? 200 : 170 + pa[i + 2]! / 3
        out.data[i + 3] = 255
      }
      diffContext.putImageData(out, 0, 0)
      const side = new OffscreenCanvas(width * 2 + 16, height)
      const sideContext = side.getContext("2d")!
      sideContext.fillStyle = "#888"
      sideContext.fillRect(0, 0, side.width, side.height)
      sideContext.drawImage(a, 0, 0)
      sideContext.drawImage(b, width + 16, 0)
      const toDataUrl = async (canvas: OffscreenCanvas) => {
        const blob = await canvas.convertToBlob({ type: "image/png" })
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }
      return {
        diff: changed / (width * height),
        width,
        height,
        diffPng: await toDataUrl(diff),
        sidePng: await toDataUrl(side)
      }
    },
    { dcUrl: dataUrl(dc), spellUrl: dataUrl(spell), threshold: THRESHOLD }
  )
  writeFileSync(path.join(folder, "diff.png"), fromDataUrl(result.diffPng))
  writeFileSync(path.join(folder, "side.png"), fromDataUrl(result.sidePng))
  return { diff: result.diff, width: result.width, height: result.height }
}

/** A PNG as a `data:` URL. */
function dataUrl(png: Buffer): string {
  return `data:image/png;base64,${png.toString("base64")}`
}

/** A `data:` URL's bytes. */
function fromDataUrl(url: string): Buffer {
  return Buffer.from(url.slice(url.indexOf(",") + 1), "base64")
}

////////////////
// ## Report
////////////////

/** `.compare/report.md`:  every page's diff, worst first, with the settings it was taken at. */
function writeReport(results: Result[]): void {
  const sorted = [...results].sort((a, b) => b.diff - a.diff)
  const lines = [
    `# Brand compare`,
    ``,
    `${new Date().toISOString()}  ·  ${options.width} × ${options.height}${options.full ? ", full page" : ""}, ${options.dark ? "dark" : "light"}`,
    ``,
    `| Page | Differ | Size |`,
    `|---|---:|---|`,
    ...sorted.map(
      (result) => `| ${result.name} | ${(result.diff * 100).toFixed(1)}% | ${result.width} × ${result.height} |`
    )
  ]
  writeFileSync(path.join(OUT, "report.md"), `${lines.join("\n")}\n`)
  console.log(
    `brand compare:  ${results.length} page(s), report in ${path.relative(process.cwd(), path.join(OUT, "report.md"))}`
  )
}
