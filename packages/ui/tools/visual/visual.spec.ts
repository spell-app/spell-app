/// <reference types="node" />

import { expect, test, type Page, type TestInfo } from "@playwright/test"
import { mkdirSync, writeFileSync } from "node:fs"

import type {
  ParityKind,
  ParityResult,
  ParitySize,
  VisualBrowser,
  VisualExample,
  VisualScheme
} from "./visual.types.ts"
import { ParityReport } from "./ParityReport.ts"
import { StaticFamilies } from "./StaticFamilies.ts"
import { VisualExamples } from "./VisualExamples.ts"
import { VisualSettings } from "./VisualSettings.ts"

/**
 * `yarn test:visual`'s tests, generated from the examples on disk (`VisualExamples`).  Per element example:
 * - `closed` -- the example as written, light then dark, captured as `#example` (its content box)
 * - one test per open state of its `.visual.ts` hooks, light then dark
 * - `parity` (with `--parity`, `UI_VISUAL_PARITY=1`) -- the class-grammar original vs the element markup, compared
 *   in the browser and REPORTED (`tools/results/visual/parity.md`), never failed
 * - `static` (with `--static`, `UI_VISUAL_STATIC=1`, families in `StaticFamilies` only) -- the example rendered
 *   statically (`/static/<family>/<name>.html`, no scripts) vs the element markup, light then dark, REPORTED
 *   (`tools/results/visual/static-parity.md`), never failed.  `--static` runs ONLY these:  no baselines.
 * - Each capture loads `fixture.html` fresh (`VisualFixture.open()`), in its scheme:  `prefers-color-scheme`
 *   emulation set BEFORE the load, which the tokens follow (`color-scheme: light dark` on `:root`).
 *   - NEVER switch the scheme on a loaded page:  Chromium then repaints only some raster tiles of a top-layer
 *     overlay (a flyout's border drawn on one 512px tile, not the next), a render no person sees and not stable
 *     between runs.
 * - Screenshot assertions are SOFT:  a light diff doesn't hide the dark one.
 */

const EXAMPLES = await VisualExamples.load()
const PARITY = process.env[VisualSettings.ENV.parity] === "1"
const STATIC = process.env[VisualSettings.ENV.static] === "1"

for (const example of EXAMPLES) {
  test.describe(example.id, () => {
    if (!STATIC) {
      test("closed", async ({ page }, testInfo) => {
        for (const scheme of VisualSettings.SCHEMES) {
          await VisualFixture.open(page, testInfo, example.id, scheme)
          await VisualFixture.capture(page, example, scheme)
        }
      })

      for (const [state, hook] of Object.entries(example.hooks.states ?? {})) {
        test(state, async ({ page }, testInfo) => {
          for (const scheme of VisualSettings.SCHEMES) {
            await VisualFixture.open(page, testInfo, example.id, scheme)
            await page.evaluate(`window.visual.open(${JSON.stringify(state)})`)
            await VisualFixture.settle(page)
            await VisualFixture.capture(page, example, scheme, state, hook.capture)
          }
        })
      }
    }

    if (PARITY && example.hasClasses) {
      test("parity", async ({ page }, testInfo) => {
        await VisualFixture.parity(page, testInfo, example)
      })
    }

    if (STATIC && StaticFamilies.covers(example.family)) {
      test("static", async ({ page }, testInfo) => {
        for (const scheme of VisualSettings.SCHEMES) await VisualFixture.static(page, testInfo, example, scheme)
      })
    }
  })
}

/**
 * What every test does to a page:  open the fixture on one example, settle it, capture it.
 */
class VisualFixture {
  /** pages whose errors are already recorded (parity opens one page twice) */
  static readonly watched = new WeakSet<Page>()

  ////////////////
  // ## Page
  ////////////////

  /**
   * Load `fixture.html` on example `id` in `scheme` and wait until it's settled.
   * - Scheme, reduced motion and time set BEFORE the page loads (`Date`;  `Temporal.Now` follows in the fixture).
   * - Page errors and console errors are recorded as annotations (the HTML report shows them), not failures:  the
   *   picture is what this suite judges.
   */
  static async open(
    page: Page,
    testInfo: TestInfo,
    id: string,
    scheme: VisualScheme,
    kind: "elements" | "classes" = "elements"
  ) {
    if (!VisualFixture.watched.has(page)) {
      VisualFixture.watched.add(page)
      page.on("pageerror", (error) => testInfo.annotations.push({ type: "pageerror", description: error.message }))
      page.on("console", (message) => {
        if (message.type() === "error") testInfo.annotations.push({ type: "console", description: message.text() })
      })
    }
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" })
    await page.clock.setFixedTime(new Date(VisualSettings.TIME))
    await page.goto(`${VisualSettings.FIXTURE}?example=${encodeURIComponent(id)}&kind=${kind}`)
    await page.waitForFunction("window.visual !== undefined")
    await page.evaluate("window.visual.ready")
    await VisualFixture.settle(page)
  }

  /** No requests in flight, then the fixture's own settle (a lazy chunk can add elements). */
  static async settle(page: Page) {
    await page.waitForLoadState("networkidle")
    await page.evaluate("window.visual.settle()")
  }

  ////////////////
  // ## Capture
  ////////////////

  /**
   * Capture the page as it is against its baseline.
   * - `capture: "viewport"` shoots the viewport (top-layer overlays), else `#example`.
   */
  static async capture(page: Page, example: VisualExample, scheme: VisualScheme, state?: string, capture = "example") {
    const mask = (example.hooks.mask ?? []).map((selector) => page.locator(selector))
    const target = capture === "viewport" ? page : page.locator("#example")
    await expect.soft(target).toHaveScreenshot(VisualExamples.baselineName(example, scheme, state), { mask })
  }

  ////////////////
  // ## Parity
  ////////////////

  /** Capture the class-grammar original and the element markup (light), and compare them (`compare()`). */
  static async parity(page: Page, testInfo: TestInfo, example: VisualExample) {
    const shots: Buffer[] = []
    for (const kind of ["classes", "elements"] as const) {
      await VisualFixture.open(page, testInfo, example.id, "light", kind)
      shots.push(await VisualFixture.shoot(page))
    }
    await VisualFixture.compare(page, testInfo, example, "parity", "light", shots[0], shots[1]!)
  }

  /**
   * Capture the element markup and its static render (`/static/<family>/<name>.html`) in `scheme`, and compare them
   * (`compare()`).
   * - The static page has no script, so no `window.visual`:  settled once the network is idle and its fonts and
   *   images are in (`STATIC_SETTLE`).  Scheme, reduced motion and time carry over from `open()`.
   * - Reported with its error, never thrown:  a page that failed to render (HTTP 500, the error as text), or one the
   *   browser can't capture (Firefox stops at 32767px).
   */
  static async static(page: Page, testInfo: TestInfo, example: VisualExample, scheme: VisualScheme) {
    await VisualFixture.open(page, testInfo, example.id, scheme)
    const elements = await VisualFixture.shoot(page)
    const response = await page.goto(`${VisualSettings.STATIC_PAGES}${example.id}.html`)
    let error = response?.ok() ? undefined : ((await response?.text())?.split("\n")[0] ?? "no response")
    let shot: Buffer | undefined
    let leftover: string[] = []
    if (!error) {
      await page.waitForLoadState("networkidle")
      await page.evaluate(STATIC_SETTLE)
      leftover = (await page.evaluate(LEFTOVER)) as string[]
      try {
        shot = await VisualFixture.shoot(page)
      } catch (caught) {
        const height = await page.evaluate(`Math.round(document.getElementById("example").offsetHeight)`)
        error = `capture failed (${height}px tall):  ${(caught as Error).message.split("\n")[0]}`
      }
    }
    if (error) testInfo.annotations.push({ type: "static", description: error })
    await VisualFixture.compare(page, testInfo, example, "static", scheme, shot, elements, { leftover, error })
  }

  /** `#example` as it is:  animations finished, caret hidden, CSS pixel scale. */
  static shoot(page: Page): Promise<Buffer> {
    return page.locator("#example").screenshot({ animations: "disabled", caret: "hide", scale: "css" })
  }

  /**
   * Compare `other` (class grammar or static) with `elements` in the browser, and write a `ParityResult` (plus a
   * diff image when they differ) for `ParityReport`.
   * - `other` missing (`extra.error`):  written as a failure, `ratio` 1.
   * - SIDE EFFECT:  navigates to `about:blank` to compare.
   */
  static async compare(
    page: Page,
    testInfo: TestInfo,
    example: VisualExample,
    kind: ParityKind,
    scheme: VisualScheme,
    other: Buffer | undefined,
    elements: Buffer,
    extra: Pick<ParityResult, "leftover" | "error"> = {}
  ) {
    const browser = testInfo.project.name as VisualBrowser
    const relative = `${ParityReport.relativeFolder(VisualFixture.os(), kind)}/${browser}`
    const folder = `${VisualSettings.RESULTS}/${relative}`
    mkdirSync(folder, { recursive: true })
    const file = `${example.family}-${example.name}-${scheme}`
    const none: ParitySize = { width: 0, height: 0 }
    const result: ParityResult = {
      id: example.id,
      browser,
      scheme,
      other: none,
      elements: none,
      diffPixels: 0,
      ratio: 1
    }
    if (other) {
      await page.goto("about:blank")
      const arg = { a: other.toString("base64"), b: elements.toString("base64") }
      const compared = (await page.evaluate(
        `(${COMPARE})(${JSON.stringify({ ...arg, threshold: VisualSettings.PARITY.threshold })})`
      )) as Compared
      Object.assign(result, { other: compared.a, elements: compared.b, diffPixels: compared.diffPixels })
      result.ratio = compared.diffPixels / (compared.width * compared.height)
      if (result.ratio > VisualSettings.PARITY.ratio) {
        writeFileSync(`${folder}/${file}.png`, Buffer.from(compared.diff.split(",")[1]!, "base64"))
        result.diff = `${relative}/${file}.png`
      }
    }
    if (extra.leftover?.length) result.leftover = extra.leftover
    if (extra.error) result.error = extra.error
    writeFileSync(`${folder}/${file}.json`, `${JSON.stringify(result, null, 2)}\n`)
  }

  /** The run's OS (`VisualSettings.ENV.os`). */
  static os() {
    return process.env[VisualSettings.ENV.os] === "linux" ? "linux" : "local"
  }
}

/** What `COMPARE` returns. */
type Compared = {
  a: ParitySize
  b: ParitySize
  width: number
  height: number
  diffPixels: number
  /** PNG data URL:  differing pixels red over a faded copy of the element render */
  diff: string
}

/**
 * Pixel comparison of two PNGs (base64), run IN THE BROWSER (canvas), so parity needs no image library.
 * - A string, not a function:  the test runner's transform would otherwise leak helpers into the page;  the
 *   spec calls it in an expression, `(COMPARE)({ a, b, threshold })`.
 * - Pixels past the smaller image count as different.
 */
const COMPARE = `async ({ a, b, threshold }) => {
  const load = async (base64) => createImageBitmap(await (await fetch("data:image/png;base64," + base64)).blob())
  const [imageA, imageB] = await Promise.all([load(a), load(b)])
  const width = Math.max(imageA.width, imageB.width)
  const height = Math.max(imageA.height, imageB.height)
  const pixels = (image) => {
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, width, height).data
  }
  const [dataA, dataB] = [pixels(imageA), pixels(imageB)]
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext("2d")
  const out = context.createImageData(width, height)
  let diffPixels = 0
  for (let i = 0; i < dataA.length; i += 4) {
    const delta = Math.max(
      Math.abs(dataA[i] - dataB[i]),
      Math.abs(dataA[i + 1] - dataB[i + 1]),
      Math.abs(dataA[i + 2] - dataB[i + 2]),
      Math.abs(dataA[i + 3] - dataB[i + 3])
    )
    if (delta > threshold) {
      diffPixels++
      out.data.set([255, 0, 0, 255], i)
    } else {
      const grey = 255 - (255 - (dataB[i] + dataB[i + 1] + dataB[i + 2]) / 3) * 0.25
      out.data.set([grey, grey, grey, 255], i)
    }
  }
  context.putImageData(out, 0, 0)
  const blob = await canvas.convertToBlob({ type: "image/png" })
  const diff = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
  return {
    a: { width: imageA.width, height: imageA.height },
    b: { width: imageB.width, height: imageB.height },
    width,
    height,
    diffPixels,
    diff
  }
}`

/**
 * Settle a static page (no script, so no `window.visual`):  fonts loaded, images decoded, two frames.
 * - A string, like `COMPARE`:  evaluated in the page as is.
 */
const STATIC_SETTLE = `(async () => {
  await document.fonts.ready
  await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)))
  for (let i = 0; i < 2; i++) await new Promise((resolve) => requestAnimationFrame(resolve))
})()`

/** The `ui-*` tags a static page still has, sorted:  families the static render doesn't define (yet). */
const LEFTOVER = `[...new Set([...document.querySelectorAll("#example *")]
  .map((element) => element.localName)
  .filter((name) => name.startsWith("ui-")))].sort()`
