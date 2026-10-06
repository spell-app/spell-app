/**
 * The dropdown filtering benchmark:  a `search selection` dropdown, 1000 options set through the `options`
 * property, the query `"united sta"` typed one character per keystroke.
 * - Browser-only, NO imports:  runs in a vitest browser test (`ui-dropdown.perf.test.tsx`) AND on the smoke perf page
 *   (`tools/frameworks/perf.html`, served as plain JS by `StaticServer`).
 * - Runtime-neutral:  `PerfAdapter.settle()` says "the DOM reflects the last change" (Solid:  `flush()`).
 * - Each step (open, then each keystroke), timed from just before the triggering event:
 *   - `update` -- until `settle()` resolves:  script + DOM writes
 *   - `layout` -- + a forced reflow (`offsetHeight`) of the menu:  style + layout of the new rows
 *   - `frame` -- + the next animation frame (headless chromium runs at 60 Hz, so frames snap to vsync)
 * - Open is a click on the search input (the user's path), not a property write.
 * - A warm-up pass runs first (same steps, results dropped), then the input is cleared and the menu closed.
 * - Rows narrow 1000 => 100 ... => 1 as the query grows;  the first keystroke (`u`) is the worst:  every row
 *   still matches and gets highlighting.
 */
export class PerfRun {
  /** Query typed, one character per keystroke. */
  static readonly query = "united sta"

  /** Options per run. */
  static readonly count = 1000

  /** `count` options whose words the query narrows progressively. */
  static options(count = PerfRun.count): PerfOption[] {
    const first = ["United", "Unity", "Union", "Uni", "Upper", "Under", "Utah", "Ural", "Umbria", "Ulster"]
    const second = ["States", "Stations", "Stars", "Kingdom", "Nations", "Arab", "Rivers", "Lakes", "Hills", "Towns"]
    return Array.from({ length: count }, (_, index) => ({
      value: `option-${index}`,
      text: `${first[index % first.length]} ${second[Math.floor(index / first.length) % second.length]} ${index}`
    }))
  }

  /**
   * Measure `host`, a rendered, closed, empty `<ui-dropdown search selection>`.
   * - SIDE EFFECT:  sets `host.options`, opens it, types into it, and leaves it open with the full query.
   */
  static async run(host: PerfHost, adapter: PerfAdapter, count = PerfRun.count): Promise<PerfResult> {
    host.options = PerfRun.options(count)
    await adapter.settle(host)
    const input = await PerfRun.until(() => host.shadowRoot?.querySelector<HTMLInputElement>("input.search"))
    await PerfRun.pass(host, input, adapter)
    input.value = ""
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "deleteContent" }))
    host.open = false
    input.blur()
    await adapter.settle(host)
    await PerfRun.nextFrame()
    const steps = await PerfRun.pass(host, input, adapter)
    const [open, ...keystrokes] = steps
    return {
      count,
      query: PerfRun.query,
      open: open!,
      keystrokes,
      update: PerfRun.stats(keystrokes.map((step) => step.update)),
      layout: PerfRun.stats(keystrokes.map((step) => step.layout)),
      frame: PerfRun.stats(keystrokes.map((step) => step.frame))
    }
  }

  /**
   * Write `result` as JSON (`PerfRecord`) to `path`, relative to the repo root.
   * - `writeFile` is vitest's `commands.writeFile` (browser tests can't reach `fs`, and console output doesn't
   *   reach the terminal);  passed in so this file stays free of a second vitest import.
   */
  static async save(
    record: Omit<PerfRecord, "date">,
    writeFile: (path: string, content: string) => Promise<unknown>,
    path: string
  ) {
    const full: PerfRecord = { ...record, date: new Date().toISOString().slice(0, 10) }
    await writeFile(path, `${JSON.stringify(full, null, 2)}\n`)
  }

  /** Open, then type the query:  one step each. */
  private static async pass(host: PerfHost, input: HTMLInputElement, adapter: PerfAdapter): Promise<PerfStep[]> {
    const steps: PerfStep[] = []
    input.focus()
    steps.push(await PerfRun.step(host, adapter, "", () => input.click()))
    for (let length = 1; length <= PerfRun.query.length; length++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      const query = PerfRun.query.slice(0, length)
      steps.push(
        await PerfRun.step(host, adapter, query, () => {
          input.value = query
          input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "insertText" }))
        })
      )
    }
    return steps
  }

  /** Time `trigger` through update, layout and the next frame. */
  private static async step(
    host: PerfHost,
    adapter: PerfAdapter,
    query: string,
    trigger: () => void
  ): Promise<PerfStep> {
    const start = performance.now()
    trigger()
    await adapter.settle(host)
    const update = performance.now() - start
    const menu = host.shadowRoot!.querySelector<HTMLElement>("[role=listbox]")
    void menu?.offsetHeight
    const layout = performance.now() - start
    await PerfRun.nextFrame()
    const frame = performance.now() - start
    const rows = menu?.querySelectorAll("[role=option]:not([aria-disabled=true])").length ?? 0
    return { query, rows, update, layout, frame }
  }

  /** min / avg / max of `values`. */
  private static stats(values: number[]): PerfStats {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length
    return { min: Math.min(...values), avg, max: Math.max(...values) }
  }

  /** Next animation frame. */
  private static nextFrame(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
  }

  /** Resolve with `test()`'s first truthy value, polling every 10 ms;  reject after 10 s. */
  private static until<T>(test: () => T | null | undefined): Promise<T> {
    const start = performance.now()
    return new Promise((resolve, reject) => {
      poll()

      /** One try. */
      function poll() {
        const value = test()
        if (value) resolve(value)
        else if (performance.now() - start > 10_000) reject(new Error(`PerfRun:  timed out waiting for ${test}`))
        else setTimeout(poll, 10)
      }
    })
  }
}

////////////////
// ## Types
////////////////

/**
 * "Wait until the DOM reflects the last change".
 * - Solid:  `() => flush()` (Solid 2 batches writes to a microtask;  `flush()` applies them now)
 */
export type PerfAdapter = {
  /** may return a promise (awaited) or nothing (a synchronous flush) */
  settle(element: HTMLElement): unknown
}

/** min / avg / max, ms. */
export type PerfStats = { min: number; avg: number; max: number }

/** One timed step (open, or a keystroke). */
export type PerfStep = {
  /** query after it (`""` for open) */
  query: string
  /** `[role=option]` rows after it */
  rows: number
  /** ms, event => DOM updated (`settle`) */
  update: number
  /** ms, + a forced reflow (`offsetHeight`) */
  layout: number
  /** ms, + the next animation frame (60 Hz vsync in headless chromium) */
  frame: number
}

/** `PerfRun.run()` result. */
export type PerfResult = {
  /** options in the dropdown */
  count: number
  /** what was typed, a keystroke per character */
  query: string
  /** opening the menu */
  open: PerfStep
  /** each keystroke of `query` */
  keystrokes: PerfStep[]
  /** `update` over the keystrokes */
  update: PerfStats
  /** `layout` over the keystrokes */
  layout: PerfStats
  /** `frame` over the keystrokes */
  frame: PerfStats
}

/** `perf-results.json`:  one run, labelled with where it ran. */
export type PerfRecord = {
  /** package measured, e.g. `@spell-app/ui` */
  package: string
  /** e.g. `vitest browser mode` */
  where: string
  /** e.g. `dev` (Vite dev server) or `production` (`dist/` + vendored peers) */
  build: string
  /** when it ran */
  date: string
  /** what it measured */
  result: PerfResult
}

/** One generated option. */
export type PerfOption = { value: string; text: string }

/** What `PerfRun` needs of the dropdown element. */
export type PerfHost = HTMLElement & { options?: readonly PerfOption[]; open?: boolean }
