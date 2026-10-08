/// <reference types="node" />

import { expect, test, type Page, type TestInfo } from "@playwright/test"
import { mkdirSync, writeFileSync } from "node:fs"

import type { VisualState } from "../../test/test.types.ts"
import { environment } from "../environment.ts"
import type {
  ParityKind,
  ParityResult,
  ParitySize,
  VisualBrowser,
  VisualExample,
  VisualMarkup,
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
 * - `parity` (with `--parity`, `SPELL_UI_VISUAL_PARITY=1`) -- the class-grammar original vs the element markup,
 *   compared in the browser and REPORTED (`tools/results/visual/parity.md`), never failed
 * - `static` (with `--static`, `SPELL_UI_VISUAL_STATIC=1`, families in `StaticFamilies` only) -- the example rendered
 *   statically (`/static/<family>/<name>.html`, no scripts) vs the element markup, light then dark, REPORTED
 *   (`tools/results/visual/static-parity.md`), never failed.  `--static` runs ONLY these:  no baselines.
 * - The run's choices come from `environment.visual` (`tools/environment.ts`), set by `VisualRunner`.
 * - Each capture loads `fixture.html` fresh (`VisualFixture.open()`), in its scheme:  `prefers-color-scheme`
 *   emulation set BEFORE the load, which the tokens follow (`color-scheme: light dark` on `:root`).
 *   - NEVER switch the scheme on a loaded page:  Chromium then repaints only some raster tiles of a top-layer
 *     overlay (a flyout's border drawn on one 512px tile, not the next), a render no person sees and not stable
 *     between runs.
 * - Screenshot assertions are SOFT:  a light diff doesn't hide the dark one.
 */

const EXAMPLES = await VisualExamples.load()
const { isParity, isStatic } = environment.visual

for (const example of EXAMPLES) {
  test.describe(example.id, () => {
    if (!isStatic) {
      test("closed", async ({ page }, testInfo) => {
        const fixture = new VisualFixture({ page, testInfo })
        for (const scheme of VisualSettings.SCHEMES) {
          await fixture.open({ id: example.id, scheme })
          await fixture.capture({ example, scheme })
        }
      })

      for (const [state, hook] of Object.entries(example.hooks.states ?? {})) {
        test(state, async ({ page }, testInfo) => {
          const fixture = new VisualFixture({ page, testInfo })
          for (const scheme of VisualSettings.SCHEMES) {
            await fixture.open({ id: example.id, scheme })
            await page.evaluate(`window.visual.open(${JSON.stringify(state)})`)
            await fixture.settle()
            await fixture.capture({ example, scheme, state, target: hook.capture })
          }
        })
      }
    }

    if (isParity && example.hasClasses) {
      test("parity", async ({ page }, testInfo) => {
        await new VisualFixture({ page, testInfo }).parity(example)
      })
    }

    if (isStatic && StaticFamilies.covers(example.family)) {
      test("static", async ({ page }, testInfo) => {
        const fixture = new VisualFixture({ page, testInfo })
        for (const scheme of VisualSettings.SCHEMES) await fixture.static(example, scheme)
      })
    }
  })
}

/****************
 * ### `VisualFixture`
 * What every test does to its page:  open the fixture on one example, settle it, capture it.
 * - One per test:  its `page` and `testInfo` are STATIC for its life.
 ****************/
class VisualFixture {
  /** the test's page */
  private readonly page: Page
  /** the test's info:  annotations, project (browser) */
  private readonly testInfo: TestInfo
  /** the page's errors are being recorded (parity opens one page twice) */
  private isWatching = false

  constructor({ page, testInfo }: { page: Page; testInfo: TestInfo }) {
    this.page = page
    this.testInfo = testInfo
  }

  ////////////////
  // ## Page
  ////////////////

  /**
   * Load `fixture.html` on example `id` in `scheme` and wait until it's settled.
   * - Scheme, reduced motion and time set BEFORE the page loads (`Date`;  `Temporal.Now` follows in the fixture).
   * - Page errors and console errors are recorded as annotations (the HTML report shows them), not failures:  the
   *   picture is what this suite judges.
   */
  async open({ id, scheme, kind = "elements" }: { id: string; scheme: VisualScheme; kind?: VisualMarkup }) {
    this.watch()
    await this.page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" })
    await this.page.clock.setFixedTime(new Date(VisualSettings.TIME))
    await this.page.goto(`${VisualSettings.FIXTURE}?example=${encodeURIComponent(id)}&kind=${kind}`)
    await this.page.waitForFunction("window.visual !== undefined")
    await this.page.evaluate("window.visual.ready")
    await this.settle()
  }

  /** No requests in flight, then the fixture's own settle (a lazy chunk can add elements). */
  async settle() {
    await this.page.waitForLoadState("networkidle")
    await this.page.evaluate("window.visual.settle()")
  }

  /** Record the page's errors and console errors as annotations, once. */
  private watch() {
    if (this.isWatching) return
    this.isWatching = true
    this.page.on("pageerror", (error) =>
      this.testInfo.annotations.push({ type: "pageerror", description: error.message })
    )
    this.page.on("console", (message) => {
      if (message.type() === "error") this.testInfo.annotations.push({ type: "console", description: message.text() })
    })
  }

  ////////////////
  // ## Capture
  ////////////////

  /**
   * Capture the page as it is against its baseline.
   * - `target: "viewport"` shoots the viewport (top-layer overlays), else `#example`.
   */
  async capture({ example, scheme, state, target = "example" }: CaptureParams) {
    const mask = (example.hooks.mask ?? []).map((selector) => this.page.locator(selector))
    const subject = target === "viewport" ? this.page : this.page.locator("#example")
    await expect.soft(subject).toHaveScreenshot(VisualExamples.baselineName(example, scheme, state), { mask })
  }

  ////////////////
  // ## Parity
  ////////////////

  /** Capture the class-grammar original and the element markup (light), and compare them (`compare()`). */
  async parity(example: VisualExample) {
    await this.open({ id: example.id, scheme: "light", kind: "classes" })
    const classes = await this.shoot()
    await this.open({ id: example.id, scheme: "light", kind: "elements" })
    const elements = await this.shoot()
    await this.compare({ example, kind: "parity", scheme: "light", other: classes, elements })
  }

  /**
   * Capture the element markup and its static render (`/static/<family>/<name>.html`) in `scheme`, and compare them
   * (`compare()`).
   * - The static page has no script, so no `window.visual`:  settled once the network is idle and its fonts and
   *   images are in (`STATIC_SETTLE`).  Scheme, reduced motion and time carry over from `open()`.
   * - Reported with its error, never thrown:  a page that failed to render (HTTP 500, the error as text), or one the
   *   browser can't capture (Firefox stops at 32767px).
   */
  async static(example: VisualExample, scheme: VisualScheme) {
    await this.open({ id: example.id, scheme })
    const elements = await this.shoot()
    const response = await this.page.goto(`${VisualSettings.STATIC_PAGES}${example.id}.html`)
    let error = response?.ok() ? undefined : ((await response?.text())?.split("\n")[0] ?? "no response")
    let other: Buffer | undefined
    let leftover: string[] = []
    if (!error) {
      await this.page.waitForLoadState("networkidle")
      await this.page.evaluate(STATIC_SETTLE)
      leftover = (await this.page.evaluate(LEFTOVER)) as string[]
      try {
        other = await this.shoot()
      } catch (caught) {
        const height = await this.page.evaluate(`Math.round(document.getElementById("example").offsetHeight)`)
        error = `capture failed (${height}px tall):  ${(caught as Error).message.split("\n")[0]}`
      }
    }
    if (error) this.testInfo.annotations.push({ type: "static", description: error })
    await this.compare({ example, kind: "static", scheme, other, elements, leftover, error })
  }

  /** `#example` as it is:  animations finished, caret hidden, CSS pixel scale. */
  private shoot(): Promise<Buffer> {
    return this.page.locator("#example").screenshot({ animations: "disabled", caret: "hide", scale: "css" })
  }

  /**
   * Compare `other` (class grammar or static) with `elements` in the browser, and write a `ParityResult` (plus a
   * diff image when they differ) for `ParityReport`.
   * - `other` missing (`error`):  written as a failure, `ratio` 1.
   * - SIDE EFFECT:  navigates to `about:blank` to compare.
   */
  private async compare({ example, kind, scheme, other, elements, leftover, error }: CompareParams) {
    const browser = this.testInfo.project.name as VisualBrowser
    const relative = `${ParityReport.relativeFolder(environment.visual.os, kind)}/${browser}`
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
      await this.page.goto("about:blank")
      const images = { a: other.toString("base64"), b: elements.toString("base64") }
      const compared = (await this.page.evaluate(
        `(${COMPARE})(${JSON.stringify({ ...images, threshold: VisualSettings.PARITY.threshold })})`
      )) as Compared
      Object.assign(result, { other: compared.a, elements: compared.b, diffPixels: compared.diffPixels })
      result.ratio = compared.diffPixels / (compared.width * compared.height)
      if (result.ratio > VisualSettings.PARITY.ratio) {
        writeFileSync(`${folder}/${file}.png`, Buffer.from(compared.diff.split(",")[1]!, "base64"))
        result.diff = `${relative}/${file}.png`
      }
    }
    if (leftover?.length) result.leftover = leftover
    if (error) result.error = error
    writeFileSync(`${folder}/${file}.json`, `${JSON.stringify(result, null, 2)}\n`)
  }
}

/** What `VisualFixture.capture()` takes. */
type CaptureParams = {
  /** the example on the page */
  example: VisualExample
  /** the scheme it was opened in */
  scheme: VisualScheme
  /** the open state it's in;  none:  closed */
  state?: string
  /** what to shoot:  `#example` (default), or the viewport */
  target?: VisualState["capture"]
}

/** What `VisualFixture.compare()` takes. */
type CompareParams = {
  /** the example compared */
  example: VisualExample
  /** what's set against the elements */
  kind: ParityKind
  /** the scheme both were captured in */
  scheme: VisualScheme
  /** the class-grammar or static capture;  missing when it failed (`error`) */
  other: Buffer | undefined
  /** the element capture */
  elements: Buffer
} & Pick<ParityResult, "leftover" | "error">

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
  const [imageA, imageB] = await Promise.all([load(a), load(b)])
  const width = Math.max(imageA.width, imageB.width)
  const height = Math.max(imageA.height, imageB.height)
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

  /** A PNG (base64) as an image. */
  async function load(base64) {
    return createImageBitmap(await (await fetch("data:image/png;base64," + base64)).blob())
  }

  /** \`image\`'s RGBA pixels on a canvas of the larger size. */
  function pixels(image) {
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, width, height).data
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
