/**
 * `yarn test:visual`'s page script:  renders ONE example into `#example` and publishes `window.visual`, which the
 * Playwright spec (`visual.spec.ts`) drives.
 * - URL:  `fixture.html?example=<family>/<name>&kind=elements|classes`
 *   - `elements` (default):  `src/components/ui-<family>/examples/elements/<name>.html`, the baselined render
 *   - `classes`:  the class-grammar original `examples/<name>.html`, for the `--parity` comparison only
 * - Same setup as the `yarn dev` demo (`tools/demo/index.ts`):  every family defined, every family sheet on the
 *   PAGE (class-grammar markup and the light-DOM `<button class="ui button">` triggers of element examples need
 *   them), the stub owners, the runtime loaded.  Sheets are globbed, so a new family needs no edit here.
 * - `window.visual.ready` resolves once the example is SETTLED (see `VisualPage.settle()`).
 * - Time:  the spec freezes `Date` (`page.clock.setFixedTime()`);  `Temporal.Now` is native in most browsers and
 *   doesn't read `Date`, so `freezeTemporal()` points it at `Date.now()` too (the calendar's "today").
 */

import { UI } from "$/ui/runtime"
import { StubOwner } from "$/ui/test/StubOwner"
import type { VisualHooks } from "$/ui/test/test.types"

import "$/ui/index"

import popupAnchoredCSS from "$/ui/components/ui-popup/ui-popup.anchored.css?raw"

/** Element examples, by path;  lazy, the page renders one. */
const ELEMENTS = import.meta.glob<string>("/src/components/*/examples/elements/*.html", {
  query: "?raw",
  import: "default"
})

/** Class-grammar originals, by path;  lazy. */
const CLASSES = import.meta.glob<string>("/src/components/*/examples/*.html", { query: "?raw", import: "default" })

/** Open-state hooks (`<example>.visual.ts`), by path;  lazy. */
const HOOKS = import.meta.glob<VisualHooks>("/src/components/*/examples/elements/*.visual.ts", { import: "default" })

/**
 * Every component sheet, by path.
 * - NOTE: `ui-popup.anchored.css` is excluded:  Lightning CSS can't parse its `@container anchored(...)`
 *   (`agents/CODE-DEBT.md`), so it's imported `?raw` above, as the demo does.
 */
const SHEETS = import.meta.glob<string>(["/src/components/*/*.css", "!**/ui-popup.anchored.css"], {
  query: "?inline",
  import: "default",
  eager: true
})

/**
 * The fixture page:  one example, rendered and settled, plus its open-state hooks.
 */
class VisualPage {
  /** `#example`, the captured box. */
  readonly root = document.getElementById("example")!
  /** `<family>/<name>` */
  readonly example: string
  /** which markup of the example */
  readonly kind: "elements" | "classes"
  /** resolves once the example is rendered and settled */
  readonly ready: Promise<void>

  constructor(params: URLSearchParams) {
    this.example = params.get("example") ?? ""
    this.kind = params.get("kind") === "classes" ? "classes" : "elements"
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
    for (const [path, css] of Object.entries(SHEETS)) {
      // only `ui-<family>/ui-<family>.css`:  the other sheets (`ui-dimmer.page.css`, `ui-toast.container.css`) are the
      // components' own, registered when used
      const [, family, file] = /\/components\/([\w-]+)\/([\w.-]+)\.css$/.exec(path) ?? []
      // registered by bare name (`button`), the name the elements adopt it by
      if (family && family === file) UI.styles.register(family.replace(/^ui-/, ""), css, { page: true })
    }
    UI.styles.register("popup-anchored", popupAnchoredCSS, { page: true })
    const [family, name] = this.example.split("/")
    const folder = this.kind === "elements" ? "examples/elements" : "examples"
    const load = (this.kind === "elements" ? ELEMENTS : CLASSES)[`/src/components/${family}/${folder}/${name}.html`]
    if (!load) throw new Error(`no ${this.kind} example "${this.example}"`)
    this.root.innerHTML = await load()
    await this.settle()
  }

  /** Put the example in open state `state` (its `.visual.ts` hook), then settle. */
  async open(state: string): Promise<void> {
    const [family, name] = this.example.split("/")
    const hooks = await HOOKS[`/src/components/${family}/examples/elements/${name}.visual.ts`]?.()
    const hook = hooks?.states?.[state]
    if (!hook) throw new Error(`no open state "${state}" for ${this.example}`)
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
    for (let round = 0; round < 50; round++) {
      await Promise.all(
        [...document.querySelectorAll(":not(:defined)")]
          .filter((element) => element.localName.startsWith("ui-"))
          .map((element) => VisualPage.within(customElements.whenDefined(element.localName), 2000))
      )
      const elements = VisualPage.deep(document)
      await Promise.all(elements.filter(VisualPage.isHost).map((host) => VisualPage.within(host.ready, 5000)))
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

  /** A `UIHost` (has a `ready` promise). */
  static isHost(element: Element): element is Element & { ready: Promise<void> } {
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
