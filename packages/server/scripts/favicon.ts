/**
 * Regenerate Spell's favicon:  `yarn favicon` (in `packages/server`), after the hat mark (`LOGO_MARK`) changes.
 * - The icon:  the brand's app icon, `.sp-appicon--aubergine` (`brand/spell-design-system`):  the white hat
 *   on an aubergine square, corners 22.5% of the width, the hat `HAT` of it, centred.
 * - Writes:
 *   - `src/site/favicon.ts` -- the SVG and PNGs as strings, what `WebServer` serves at `/_server/favicon.*` and the
 *     site header puts on `file://` pages.  Strings, not files:  the VS Code extension bundles `WebServer` (esbuild),
 *     where a file beside the source isn't there at run time.
 *   - `packages/app/static/favicon/` -- the app's copies, which vite serves (and bundles into `dist/`)
 * - PNGs:  headless Chromium (Playwright, the repo root's) screenshots of the SVG.
 *   - `favicon-32.png`:  the SVG as is, for browsers without SVG favicons
 *   - `apple-touch-icon.png` (180):  SQUARE corners, since iOS masks the icon with its own;  transparent corners
 *     would show black there
 * - Usage:  `yarn favicon [--hat 0.74]`
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

import { LOGO_MARK } from "$/server/site/logoMark"

/** This package's folder. */
const PACKAGE = fileURLToPath(new URL("..", import.meta.url))

/** The app's copies:  `packages/app/static/favicon/`. */
const APP_DIR = join(PACKAGE, "..", "app", "static", "favicon")

/** The brand's aubergine (`--spell-aubergine`, `--violet-900`). */
const AUBERGINE = "#2A1D60"

/** Corner radius, as a fraction of the width (`--radius-app-icon`). */
const RADIUS = 0.225

/** The hat's width, as a fraction of the icon's:  `--hat <fraction>`, else the default. */
const HAT = Number(argument("--hat") ?? 0.74)

const svg = faviconSvg(HAT, true)
const square = faviconSvg(HAT, false)
if (svg.includes("'")) throw new Error("favicon:  the SVG has a `'`;  `module()` single-quotes it")
const browser = await chromium.launch()
try {
  const png32 = await render(svg, 32)
  const touch = await render(square, 180)
  writeFileSync(join(PACKAGE, "src", "site", "favicon.ts"), module(svg, png32, touch))
  mkdirSync(APP_DIR, { recursive: true })
  writeFileSync(join(APP_DIR, "favicon.svg"), svg + "\n")
  writeFileSync(join(APP_DIR, "favicon-32.png"), png32)
  writeFileSync(join(APP_DIR, "apple-touch-icon.png"), touch)
  console.log(`favicon:  svg ${svg.length} bytes, 32px ${png32.length}, 180px ${touch.length};  hat ${HAT}`)
} finally {
  await browser.close()
}

////////////////
// ## The icon
////////////////

/**
 * The icon's SVG:  the mark, white, centred on an aubergine square `hat` times its width.
 * - `rounded`:  the brand's 22.5% corners;  `false`:  square (the apple touch icon)
 * - the mark's own box is its `viewBox`, `12 39 218 192`
 */
function faviconSvg(hat: number, rounded: boolean): string {
  const [x, y, width, height] = /viewBox="([^"]+)"/.exec(LOGO_MARK)![1]!.split(" ").map(Number) as number[]
  const side = round(width! / hat)
  const dx = (side - width!) / 2 - x!
  const dy = (side - height!) / 2 - y!
  const d = tidyPath(/ d="([^"]+)"/.exec(LOGO_MARK)![1]!, dx, dy)
  const corner = rounded ? ` rx="${num(side * RADIUS)}"` : ""
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(side)} ${num(side)}">` +
    `<rect width="${num(side)}" height="${num(side)}"${corner} fill="${AUBERGINE}"/>` +
    `<path fill="#fff" fill-rule="evenodd" d="${d}"/></svg>`
  )
}

/**
 * Path `d` (absolute `M` / `L` / `C` / `Z` only, as the mark's tracer writes) moved by `dx`, `dy`, as relative
 * commands to 0.1 units:  about half the size, and no visible change (0.05 of ~300 units).
 * - each point is rounded, then measured from the previous ROUNDED point, so rounding never accumulates
 */
function tidyPath(d: string, dx: number, dy: number): string {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? []
  const out: string[] = []
  let at = { x: 0, y: 0 }
  let start = at
  let command = ""
  for (let index = 0; index < tokens.length;) {
    const token = tokens[index]!
    if (/[MLCZ]/.test(token)) {
      command = token
      index++
      if (command === "Z") {
        out.push("z")
        at = start
        continue
      }
      out.push(command.toLowerCase())
    } else if (command === "M") {
      // implicit repeat:  after `M`, more pairs are lines
      command = "L"
      out.push("l")
    } else out.push(" ")
    const count = command === "C" ? 3 : 1
    const points: string[] = []
    let end = at
    for (let pair = 0; pair < count; pair++) {
      const point = { x: round(Number(tokens[index++]) + dx), y: round(Number(tokens[index++]) + dy) }
      points.push(`${num(point.x - at.x)} ${num(point.y - at.y)}`)
      end = point
    }
    at = end
    if (command === "M") start = at
    out[out.length - 1] += points.join(" ")
  }
  return out.join("").replace(/ -/g, "-")
}

////////////////
// ## Output
////////////////

/** Screenshot `svg` at `size` px square, transparent outside it. */
async function render(svg: string, size: number): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  const src = `data:image/svg+xml,${encodeURIComponent(svg)}`
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}img{display:block}</style>` +
      `<img src="${src}" width="${size}" height="${size}">`
  )
  await page.locator("img").evaluate((img: HTMLImageElement) => img.decode())
  const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
  await page.close()
  return png
}

/** `src/site/favicon.ts`'s source, as `oxfmt` writes it:  the SVG has `"`s and no `'`, so it's single-quoted. */
function module(svg: string, png32: Buffer, touch: Buffer): string {
  return `/**
 * Spell's favicon:  the brand's app icon (white hat on aubergine), as strings.
 * - GENERATED by \`yarn favicon\` (\`packages/server/scripts/favicon.ts\`), from \`LOGO_MARK\`:  NEVER edit by hand
 * - served by \`WebServer\` at \`/_server/favicon.svg\` / \`favicon-32.png\` / \`apple-touch-icon.png\` (and
 *   \`/favicon.ico\`);  the site header puts the SVG on \`file://\` pages as a \`data:\` URI
 * - browser-safe (no node imports):  the site header bundles it
 */

/** The icon, as SVG:  ${HAT} of its width is hat, corners ${RADIUS * 100}%. */
export const FAVICON_SVG =
  '${svg}'

/** 32px PNG, base64:  for browsers without SVG favicons. */
export const FAVICON_PNG_32 =
  "${png32.toString("base64")}"

/** 180px PNG, base64, square corners (iOS rounds them):  \`apple-touch-icon\`. */
export const APPLE_TOUCH_ICON_PNG =
  "${touch.toString("base64")}"
`
}

////////////////
// ## Helpers
////////////////

/** `value` to 0.1. */
function round(value: number): number {
  return Math.round(value * 10) / 10
}

/** `value` short:  `0.5` -> `.5`, `-0.5` -> `-.5`, `3.0` -> `3`. */
function num(value: number): string {
  return String(round(value))
    .replace(/^(-?)0\./, "$1.")
    .replace(/^-0$/, "0")
}

/** The value after `flag` on the command line. */
function argument(flag: string): string | undefined {
  const at = process.argv.indexOf(flag)
  return at >= 0 ? process.argv[at + 1] : undefined
}
