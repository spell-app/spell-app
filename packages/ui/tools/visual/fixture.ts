/**
 * `yarn test:visual`'s page script:  renders ONE example into `#example` and publishes `window.visual`, which the
 * Playwright spec (`visual.spec.ts`) drives.
 * - URL:  `fixture.html?example=<family>/<name>&kind=elements|classes`
 *   - `elements` (default):  `src/components/ui-<family>/examples/elements/<name>.html`, the baselined render
 *   - `classes`:  the class-grammar original `examples/<name>.html`, for the `--parity` comparison only
 * - Same setup as the `yarn dev` demo (`tools/demo/index.ts`):  every family defined, every family sheet on the
 *   PAGE (`FamilySheets`), the stub owners, the runtime loaded.
 * - `window.visual.ready` resolves once the example is SETTLED (see `VisualPage.settle()`).
 * - Time:  the spec freezes `Date` (`page.clock.setFixedTime()`);  `Temporal.Now` is native in most browsers and
 *   doesn't read `Date`, so `freezeTemporal()` points it at `Date.now()` too (the calendar's "today").
 * - A page script, served by Vite:  `$/ui` aliases;  of `tools/`, only the browser-safe `visual.types.ts` and
 *   `FamilySheets`.
 */

import { UI } from "$/ui/runtime"
import { StubOwner } from "$/ui/test/StubOwner"
import type { VisualHooks } from "$/ui/test/test.types"

import { FamilySheets } from "../demo/FamilySheets.ts"
import { VisualMarkups, type VisualMarkup } from "./visual.types.ts"

import "$/ui/index"

/****************
 * ### `VisualPage`
 * The fixture page:  one example, rendered and settled, plus its open-state hooks.
 ****************/
class VisualPage {
  /** `#example`, the captured box. */
  readonly root = document.getElementById("example")!
  /** `<family>/<name>` */
  readonly example: string
  /** which markup of the example */
  readonly kind: VisualMarkup
  /** resolves once the example is rendered and settled */
  readonly ready: Promise<void>

  constructor(params: URLSearchParams) {
    this.example = params.get("example") ?? ""
    const kind = params.get("kind")
    this.kind = VisualMarkups.find((markup) => markup === kind) ?? "elements"
    this.ready = this.render()
  }

  ////////////////
  // ## Render
  ////////////////

  /** Define everything, register the sheets, inject the example, settle. */
  private async render(): Promise<void> {
    VisualPage.freezeTemporal()
    StubOwner.defineFomanticOwners()
    await UI.load()
    FamilySheets.register()
    const [family, name] = this.example.split("/")
    const load =
      this.kind === "elements"
        ? ELEMENTS[`/src/components/${family}/examples/elements/${name}.html`]
        : CLASSES[`/src/components/${family}/examples/${name}.html`]
    if (!load) {
      throw new Error(`VisualPage.render():  no ${this.kind} example "${this.example}";  check \`?example=\``)
    }
    this.root.innerHTML = await load()
    await this.settle()
  }

  /** Put the example in open state `state` (its `.visual.ts` hook), then settle. */
  async open(state: string): Promise<void> {
    const [family, name] = this.example.split("/")
    const hooks = await HOOKS[`/src/components/${family}/examples/elements/${name}.visual.ts`]?.()
    const hook = hooks?.states?.[state]
    if (!hook) throw new Error(`VisualPage.open():  no open state "${state}" for ${this.example};  see its .visual.ts`)
    await hook.open(this.root)
    await this.settle()
  }

  ////////////////
  // ## Settle
  ////////////////

  /**
   * Wait until nothing on the page is still changing:  fonts loaded, every `ui-*` defined and `ready` (across
   * shadow roots), images decoded, icon glyphs in.
   * - Repeats until the page's SIGNATURE (element / `<svg>` / shadow-root counts) holds for two rounds:  a glyph
   *   arrives a module import after its icon is `ready`, and a render can reveal new elements.
   * - The spec adds `networkidle` around it for lazy chunks that change nothing countable yet.
   */
  async settle(): Promise<void> {
    await document.fonts.ready
    let last = ""
    for (let round = 0; round < MAX_SETTLE_ROUNDS; round++) {
      await Promise.all(
        [...document.querySelectorAll(":not(:defined)")]
          .filter((element) => element.localName.startsWith("ui-"))
          .map((element) => VisualPage.within(customElements.whenDefined(element.localName), DEFINE_TIMEOUT))
      )
      const elements = VisualPage.deep(document)
      await Promise.all(
        elements.filter(VisualPage.isDOMElement).map((element) => VisualPage.within(element.ready, READY_TIMEOUT))
      )
      await Promise.all(
        elements
          .filter((element): element is HTMLImageElement => element instanceof HTMLImageElement)
          .map((image) => image.decode().catch(() => undefined))
      )
      await VisualPage.frames(2)
      const signature = VisualPage.signature(elements)
      if (signature === last) break
      last = signature
    }
    await document.fonts.ready
  }

  /** Every element under `root`, through open shadow roots. */
  static deep(root: Document | ShadowRoot): Element[] {
    const found: Element[] = []
    visit(root)
    return found

    /** Collect `node`'s elements and recurse into their shadow roots. */
    function visit(node: Document | ShadowRoot) {
      for (const element of node.querySelectorAll("*")) {
        found.push(element)
        if (element.shadowRoot) visit(element.shadowRoot)
      }
    }
  }

  /** A `DOMElement` (has a `ready` promise). */
  static isDOMElement(element: Element): element is Element & { ready: Promise<void> } {
    return "ready" in element && element.ready instanceof Promise
  }

  /** What changes while the page is still settling. */
  static signature(elements: readonly Element[]): string {
    const svgs = elements.filter((element) => element.localName === "svg").length
    const shadows = elements.filter((element) => element.shadowRoot).length
    return `${elements.length}/${svgs}/${shadows}/${document.body.scrollHeight}`
  }

  /** `promise`, or give up after `ms`:  one element that never gets ready must not hang the capture. */
  static within(promise: Promise<unknown>, ms: number): Promise<unknown> {
    return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))])
  }

  /** Wait `count` animation frames. */
  static async frames(count: number): Promise<void> {
    for (let i = 0; i < count; i++) await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  ////////////////
  // ## Time
  ////////////////

  /**
   * Point native `Temporal.Now` at `Date.now()`, which the spec froze.
   * - The polyfill (`temporal-polyfill`, where `Temporal` is missing) reads `Date.now()` already.
   * - SIDE EFFECT: replaces `Temporal.Now`'s methods for the page's lifetime.
   */
  static freezeTemporal() {
    const T = (globalThis as { Temporal?: TemporalLike }).Temporal
    if (!T) return
    const zone = T.Now.timeZoneId()
    const zoned = (timeZone = zone) => T.Instant.fromEpochMilliseconds(Date.now()).toZonedDateTimeISO(timeZone)
    Object.assign(T.Now, {
      instant: () => T.Instant.fromEpochMilliseconds(Date.now()),
      zonedDateTimeISO: zoned,
      plainDateTimeISO: (timeZone?: string) => zoned(timeZone).toPlainDateTime(),
      plainDateISO: (timeZone?: string) => zoned(timeZone).toPlainDate(),
      plainTimeISO: (timeZone?: string) => zoned(timeZone).toPlainTime()
    })
  }
}

/** Element examples, by path;  lazy, the page renders one. */
const ELEMENTS = import.meta.glob<string>("/src/components/*/examples/elements/*.html", {
  query: "?raw",
  import: "default"
})

/** Class-grammar originals, by path;  lazy. */
const CLASSES = import.meta.glob<string>("/src/components/*/examples/*.html", { query: "?raw", import: "default" })

/** Open-state hooks (`<example>.visual.ts`), by path;  lazy. */
const HOOKS = import.meta.glob<VisualHooks>("/src/components/*/examples/elements/*.visual.ts", { import: "default" })

/** `settle()` gives up after this many rounds:  a page that never stops changing is captured as it is. */
const MAX_SETTLE_ROUNDS = 50

/** How long `settle()` waits for a `ui-*` tag to be defined, ms. */
const DEFINE_TIMEOUT = 2000

/** How long `settle()` waits for one element's `ready`, ms. */
const READY_TIMEOUT = 5000

/** The bits of `Temporal` `freezeTemporal()` touches (TypeScript 7's lib has no `Temporal`). */
type TemporalLike = {
  Now: Record<string, unknown> & { timeZoneId(): string }
  Instant: {
    fromEpochMilliseconds(ms: number): {
      toZonedDateTimeISO(timeZone: string): {
        toPlainDateTime(): unknown
        toPlainDate(): unknown
        toPlainTime(): unknown
      }
    }
  }
}

// what the spec reads:  `window.visual`
;(window as unknown as { visual: VisualPage }).visual = new VisualPage(new URLSearchParams(location.search))
