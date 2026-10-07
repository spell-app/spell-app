import { describe, expect, test, vi } from "vite-plus/test"

import * as core from "$/ui/core"
import { Fixture } from "$/ui/test/fixture"
import type { UIHost } from "$/ui/elements"

import { ComponentPacks, registerPack } from "$/ui/components/ui-components"
import type { RootFailure, UIRoot } from "$/ui/components/ui-root"

import "$/ui/components/ui-root"

////////////////
// ## Fixtures
////////////////

/** The test pack:  `<x-card>` (ready when the test says) and `<x-note>`, a classic script (`test/fixtures/`). */
const X_PACK = "/test/fixtures/component-packs/x.pack.js"

/** A pack script that runs but registers nothing. */
const SILENT_PACK = "/test/fixtures/component-packs/silent.pack.js"

/** A pack script that can't load:  nothing listens on port 1. */
const MISSING_PACK = "http://127.0.0.1:1/missing.pack.js"

/** What the test pack keeps on `globalThis`. */
type XPackGlobal = { __xPack?: { runs: number; cards: Set<UIHost> } }

// what the docs bundle puts on `window.SpellUI`, for the packs' classic scripts
Object.assign(globalThis, { SpellUI: { registerPack, packModules: { "$/ui/core": core } } })

/** The test pack's state, once it ran. */
function xPack() {
  return (globalThis as XPackGlobal).__xPack!
}

/** The `<script>`s of the page loading `path`. */
function scriptsFor(path: string) {
  return [...document.querySelectorAll("script")].filter((script) => script.src.endsWith(path))
}

/** Start every `<ui-root>` in `html`;  returns each with its controller and the `ui-error`s it fired (not cancelled). */
async function roots(html: string) {
  const holder = Fixture.render(`<div>${html}</div>`)
  return Promise.all(
    [...holder.querySelectorAll<UIHost>("ui-root")].map(async (host) => {
      const errors: RootFailure[] = []
      host.addEventListener("ui-error", (event) => errors.push((event as CustomEvent<RootFailure>).detail))
      await host.ready
      return { host, controller: host.controller as UIRoot, errors }
    })
  )
}

/** The root's skeleton box, if shown. */
function skeletonBox(host: Element) {
  return host.shadowRoot!.querySelector("[part=skeleton]")
}

////////////////
// ## Tests
////////////////

describe("ComponentPacks.register()", () => {
  test.each([
    ["no name", { name: "", prefix: "z-", catalog: {}, define() {} }],
    ["Spell UI's prefix", { name: "z", prefix: "ui-", catalog: {}, define() {} }],
    ["a prefix without its dash", { name: "z", prefix: "z", catalog: {}, define() {} }],
    ["no define()", { name: "z", prefix: "z-", catalog: {} }],
    ["a tag without the prefix", { name: "z", prefix: "z-", catalog: { "y-card": { folder: "y-card" } }, define() {} }]
  ])("refuses a pack with %s", (_, pack) => {
    expect(() => registerPack(pack as never)).toThrow(TypeError)
    expect(ComponentPacks.owns("z-card")).toBe(false)
  })

  test("rethrows what define() throws, and registers nothing", () => {
    const pack = { name: "boom", prefix: "boom-", catalog: { "boom-card": { folder: "boom-card" } } }
    expect(() =>
      registerPack({
        ...pack,
        define() {
          throw new Error("boom")
        }
      })
    ).toThrow("boom")
    expect(ComponentPacks.owns("boom-card")).toBe(false)
    expect(ComponentPacks.entryOf("boom-card")).toBeUndefined()
  })

  test("names a pack by its file:  `epics.pack.js` => `epics`", () => {
    expect(ComponentPacks.nameFor("https://example.com/packages/epics/pack/epics.pack.js")).toBe("epics")
    expect(ComponentPacks.nameFor("file:///docs/x.js?v=2")).toBe("x")
  })
})

describe("<ui-root> with <ui-components source>", () => {
  test("loads the pack ONCE per page, draws its skeletons while its tags aren't ready, then gets ready", async () => {
    const [first, second] = await roots(
      `<ui-root timeout="10s"><ui-components source="${X_PACK}"></ui-components><x-card></x-card><p>Text</p></ui-root>` +
        `<ui-root timeout="10s"><ui-components source="${X_PACK}"></ui-components><x-note></x-note></ui-root>`
    )
    await expect.poll(() => customElements.get("x-card")).toBeDefined()
    expect(xPack().runs).toBe(1)
    expect(scriptsFor(X_PACK)).toHaveLength(1)
    // the tags upgraded into the pack's classes, built on the page's own `UIHost`
    const card = first!.host.querySelector("x-card")!
    expect(card).toBeInstanceOf(customElements.get("x-card")!)
    expect(card).toBeInstanceOf(core.UIHost)
    expect(second!.host.querySelector("x-note")).toBeInstanceOf(customElements.get("x-note")!)
    // a skeleton from the pack's catalog, in place of the content, until the card is ready
    await expect.poll(() => skeletonBox(first!.host)?.children.length).toBe(1)
    const placeholder = skeletonBox(first!.host)!.firstElementChild as HTMLElement
    expect(placeholder.localName).toBe("ui-placeholder")
    expect(placeholder.style.getPropertyValue("--ui-placeholder-max-width")).toBe("12em")
    expect(first!.host.matches(":state(loading)")).toBe(true)
    expect(await second!.controller.settled).toEqual([])
    for (const each of xPack().cards) each.markReady()
    expect(await first!.controller.settled).toEqual([])
    expect(first!.host.matches(":state(ready)")).toBe(true)
    expect(first!.errors).toEqual([])
  })

  test("a later root reuses the loaded pack, and reports a tag with its prefix that it doesn't define", async () => {
    const [only] = await roots(
      `<ui-root timeout="10s"><ui-components source="${X_PACK}"></ui-components><x-nope></x-nope>` +
        `<x-note></x-note></ui-root>`
    )
    only!.host.addEventListener("ui-error", (event) => event.preventDefault())
    expect(await only!.controller.settled).toEqual([{ tag: "x-nope", reason: "unknown" }])
    expect(scriptsFor(X_PACK)).toHaveLength(1)
    expect(xPack().runs).toBe(1)
  })

  test("a pack already registered loads from any URL naming it at once, with no second script", async () => {
    const elsewhere = "/elsewhere/x.pack.js"
    expect((await ComponentPacks.load(elsewhere)).name).toBe("x")
    expect(scriptsFor(elsewhere)).toEqual([])
  })

  test.each([
    ["can't load", MISSING_PACK, /can't load/],
    ["runs without registering a pack", SILENT_PACK, /registered no pack/]
  ])("a pack that %s:  the root still gets ready, with a console error naming its source", async (_, source, why) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const [only] = await roots(
        `<ui-root timeout="10s"><ui-components source="${source}"></ui-components><p>Text</p></ui-root>`
      )
      const failed = await only!.controller.settled
      expect(failed).toMatchObject([{ tag: "ui-components", reason: "failed", source }])
      expect((failed[0]!.error as Error).message).toMatch(why)
      expect(only!.errors).toEqual(failed)
      expect(only!.host.matches(":state(ready)")).toBe(true)
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(source), failed[0]!.error)
    } finally {
      consoleError.mockRestore()
    }
  })
})
