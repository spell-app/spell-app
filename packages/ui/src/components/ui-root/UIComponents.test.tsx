import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { DOMElement } from "$/ui/elements"

import { RootLoader, type RootFailure, type UIRoot } from "$/ui/components/ui-root"

import "$/ui/components/ui-root"

/** Fixture packs the test server serves. */
const DIR = "/test/fixtures/component-pack"

/** A `ui-*` element that never gets ready:  holds a root (and its skeletons) while a test looks. */
class NeverReady extends DOMElement {}
customElements.define("ui-test-pack-never-ready", NeverReady)

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * Render `html`;  returns its `<ui-components>` and `<ui-root>` (when there), and the components' first `ui-load` or
 * `ui-error`, which it cancels (no console warning) unless `isWarned`.
 */
function render(html: string, { isWarned = false } = {}) {
  const container = Fixture.render<HTMLElement>(`<div>${html}</div>`)
  const components = container.querySelector<DOMElement>("ui-components")!
  const read = new Promise<CustomEvent>((resolve) => {
    for (const type of ["ui-load", "ui-error"]) {
      components.addEventListener(type, (event) => {
        if (!isWarned && type === "ui-error") event.preventDefault()
        resolve(event as CustomEvent)
      })
    }
  })
  const rootHost = container.querySelector<DOMElement>("ui-root")
  return { components, read, root: rootHost && (rootHost.component as UIRoot) }
}

////////////////
// ## Loading
////////////////

describe("<ui-components> loading", () => {
  test("reads the pack;  a root on the page then loads its tags, whatever their name", async () => {
    const { components, read, root } = render(
      `<ui-components source="${DIR}/pack.json"></ui-components>` +
        `<ui-root><x-pack-chart></x-pack-chart><x-pack-legend></x-pack-legend></ui-root>`
    )
    const event = await read
    expect(event.type).toBe("ui-load")
    expect(event.detail).toEqual({
      source: `${DIR}/pack.json`,
      tags: ["x-pack-chart", "x-pack-legend", "x-pack-eager", "x-pack-broken"]
    })
    expect(await root!.settled).toEqual([])
    expect(customElements.get("x-pack-chart")).toBeDefined()
    await ElementFixture.settle()
    expect(components.matches(":state(loaded)")).toBe(true)
  })

  test("a root that meets a tag while its pack is on its way waits for it;  a tag no pack names is still unknown", async () => {
    // the root comes FIRST, and the pack inside it:  the root looks only after the pack was asked for
    const { root } = render(
      `<ui-root><x-pack-late></x-pack-late><ui-cardd></ui-cardd>` +
        `<ui-components source="${DIR}/late.json"></ui-components></ui-root>`
    )
    expect(await root!.settled).toEqual<RootFailure[]>([{ tag: "ui-cardd", reason: "unknown" }])
    expect(customElements.get("x-pack-late")).toBeDefined()
  })

  test("a pack tag whose module doesn't load is `failed`", async () => {
    const { read, root } = render(
      `<ui-components source="${DIR}/pack.json"></ui-components><ui-root><x-pack-broken></x-pack-broken></ui-root>`
    )
    await read
    expect(await root!.settled).toMatchObject([{ tag: "x-pack-broken", reason: "failed" }])
  })

  test("a root drawing skeletons draws the pack's, once the pack is in", async () => {
    const { read } = render(
      `<ui-components source="${DIR}/skeleton.json"></ui-components>` +
        `<ui-root timeout="1h"><ui-test-pack-never-ready></ui-test-pack-never-ready><x-pack-card></x-pack-card></ui-root>`
    )
    await read
    // not `settle()`:  the root never gets ready, on purpose;  the root finds its skeletons again once the pack is in
    await RootLoader.whenAdded()
    await ElementFixture.tick()
    await ElementFixture.tick()
    const host = document.querySelector("ui-root")!
    const placeholders = [...host.shadowRoot!.querySelector("[part=skeleton]")!.children] as HTMLElement[]
    expect(placeholders.map((it) => it.style.getPropertyValue("--ui-placeholder-max-width"))).toEqual(["18em"])
    expect([...placeholders[0]!.children].map((it) => it.localName)).toEqual([
      "ui-placeholder-header",
      "ui-placeholder-paragraph"
    ])
  })
})

////////////////
// ## Errors
////////////////

describe("<ui-components> errors", () => {
  test("a pack that isn't there:  `ui-error` (`load`), `:state(error)`, a console warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const { components, read } = render(`<ui-components source="${DIR}/nope.json"></ui-components>`, {
      isWarned: true
    })
    const event = await read
    expect(event.detail).toMatchObject({ kind: "load", source: `${DIR}/nope.json` })
    await ElementFixture.settle()
    expect(components.matches(":state(error)")).toBe(true)
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/<ui-components>:  the pack .*nope\.json didn't load \(load\):/),
      expect.anything()
    )
  })

  test("a file that isn't a pack:  `render`;  cancelling the event skips the warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const { read } = render(`<ui-components source="${DIR}/not-a-pack.json"></ui-components>`)
    expect((await read).detail).toMatchObject({ kind: "render" })
    expect(warn).not.toHaveBeenCalled()
  })
})
