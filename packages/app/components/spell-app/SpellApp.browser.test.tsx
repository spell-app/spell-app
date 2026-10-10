import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SpellCompiled } from "$/app/runner/runner.types"
import type { DOMSpellAppElement } from "$/app/components/spell-app"

/**
 * `<spell-app>` as a root (`UIRoot`), on a page with nothing else of Spell UI.
 * - NO `loadUI.ts` here:
 *   every `<ui-*>` the runner draws is defined by the element itself, the first time it appears.
 * - The runtime and the shadow styles are stubbed, as in `runner.browser.test.tsx`.
 */
vi.mock("$/app/runner/loadRuntime", async (importOriginal) => {
  const original = await importOriginal<typeof import("$/app/runner/loadRuntime")>()
  return { ...original, loadRuntime: testRuntime }
})
vi.mock("$/app/runner/shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("$/app/runner/shadowStyles")>()
  return { ...original, adoptShadowStyles: async () => {} }
})

/** A program with an app:  a button. */
const PROGRAM = `
import { App, h } from "@spell/core"
export class Shown extends App {
  draw() { return h("button", { class: "shown" }, "Shown") }
}
export let shown = new Shown()
shown.start()
`

describe("<spell-app>, a root", () => {
  test("loads the Spell UI widgets its runner draws, on demand:  none before", async () => {
    expect(customElements.get("ui-menu")).toBeUndefined()
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
    app.run({ projectId: "@test:fixtures:Test", compiled: PROGRAM } satisfies SpellCompiled)
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.shown"))
    await customElements.whenDefined("ui-menu")
    await waitFor(() => root.querySelector(".SpellAppToolbar")?.matches(":defined"))
    // its own settings, as a root:  Fomantic's icon names inside it
    expect(app.icons).toBe("fomantic")
  })

  test("loads a spell tag inside it from beside its script:  `<spell-editor>` => `spell-editor.js`", async () => {
    const app = await mountApp(`<spell-app><spell-nothing-here></spell-nothing-here></spell-app>`)
    const failed = await new Promise<{ tag: string; reason: string }[]>((resolve) =>
      app.addEventListener("ui-ready", (event) => resolve((event as CustomEvent).detail.failed), { once: true })
    )
    // in dev the script beside it is its source folder's, where no such file is:  tried, and failed
    expect(failed.map(({ tag, reason }) => `${tag} ${reason}`)).toEqual(["spell-nothing-here failed"])
  })
})

////////////////
// ## Helpers
////////////////

/** Cleanups to run after each test. */
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

/** The runtime, as `loadRuntime()` would hand it over:  `spellRuntime.ts` as vite serves it. */
async function testRuntime() {
  const url = new URL("/src/runner/spellRuntime.ts", location.href).href
  const runtime = (await import(/* @vite-ignore */ url)) as typeof import("$/app/runner/spellRuntime")
  return { runtime, coreUrl: url, release: () => {} }
}

/** Add `<spell-app>` markup `html` to the page;  removed after the test. */
async function mountApp(html: string): Promise<DOMSpellAppElement> {
  await import("$/app/components/spell-app")
  const holder = document.createElement("div")
  holder.innerHTML = html
  const app = holder.firstElementChild as DOMSpellAppElement
  document.body.append(app)
  cleanups.push(() => app.remove())
  await ElementFixture.settle(app)
  return app
}

/** `check()`'s answer once it's truthy, flushing Solid and letting tasks run between tries;  fails after 5s. */
async function waitFor<T>(check: () => T, timeout = 5000): Promise<NonNullable<T>> {
  const start = performance.now()
  for (;;) {
    flush()
    const value = check()
    if (value) return value
    if (performance.now() - start > timeout) throw new Error(`waitFor() timed out:  ${check}`)
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}
