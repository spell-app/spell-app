import { describe, expect, it } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { Fixture } from "$/ui/test/fixture"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UIHost } from "$/ui/elements"

import { RootLoader, UIRoot, type RootFailure } from "$/ui/components/ui-root"
import { RootTimeout } from "./ui-root.types"
import { ROOT_CATALOG } from "./ui-root.catalog"

/** Element examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-root/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A `ui-*` element that never gets ready:  what a root waits for until its timeout. */
class NeverReady extends UIHost {}
customElements.define("ui-test-never-ready", NeverReady)

/** Render `html` (a `<ui-root>` first), wait for the root to settle;  returns the root, its controller and events. */
async function root(html: string) {
  const host = Fixture.render<UIHost>(html)
  const events: { ready: RootFailure[][]; errors: RootFailure[] } = { ready: [], errors: [] }
  host.addEventListener("ui-ready", (event) => events.ready.push((event as CustomEvent).detail.failed))
  host.addEventListener("ui-error", (event) => {
    events.errors.push((event as CustomEvent).detail)
    event.preventDefault()
  })
  await host.ready
  const controller = host.controller as UIRoot
  return { host, controller, events, slot: host.shadowRoot!.querySelector("slot")! }
}

describe("<ui-root> loading on demand", () => {
  it("imports only the families its content uses", async () => {
    expect(customElements.get("ui-card")).toBeUndefined()
    const { controller, host } = await root(`<ui-root><ui-card><ui-header>Report</ui-header></ui-card></ui-root>`)
    expect(await controller.settled).toEqual([])
    expect(customElements.get("ui-card")).toBeDefined()
    expect(customElements.get("ui-header")).toBeDefined()
    expect(customElements.get("ui-table")).toBeUndefined()
    expect(host.matches(":state(ready)")).toBe(true)
  })

  it("loads what is added later, without hiding again", async () => {
    const { controller, host, slot } = await root(`<ui-root></ui-root>`)
    await controller.settled
    host.insertAdjacentHTML("beforeend", `<ui-segment>Late</ui-segment>`)
    await customElements.whenDefined("ui-segment")
    expect(slot.style.visibility).toBe("")
    expect(slot.style.display).toBe("")
  })

  it("reports an unknown tag once, and still gets ready", async () => {
    const { controller, events } = await root(`<ui-root><ui-cardd>typo</ui-cardd><ui-cardd>again</ui-cardd></ui-root>`)
    const failed = await controller.settled
    expect(failed).toEqual([{ tag: "ui-cardd", reason: "unknown" }])
    expect(events.errors).toEqual(failed)
    expect(events.ready).toEqual([failed])
  })

  it("shows the content after the timeout, reporting what wasn't ready", async () => {
    const { controller, host } = await root(
      `<ui-root timeout="50ms"><ui-test-never-ready></ui-test-never-ready><p>Text</p></ui-root>`
    )
    expect(host.matches(":state(loading)")).toBe(true)
    expect(await controller.settled).toEqual([{ tag: "ui-test-never-ready", reason: "timeout" }])
    expect(host.matches(":state(ready)")).toBe(true)
  })

  it("an outer root is ready only once an inner one is", async () => {
    const { controller } = await root(
      `<ui-root><ui-root timeout="50ms"><ui-test-never-ready></ui-test-never-ready></ui-root></ui-root>`
    )
    const order: string[] = []
    const inner = (document.querySelector("ui-root ui-root") as UIHost).controller as UIRoot
    void inner.settled.then(() => order.push("inner"))
    await controller.settled.then(() => order.push("outer"))
    expect(order).toEqual(["inner", "outer"])
  })

  it("RootLoader rejects a folder with no family", async () => {
    await expect(RootLoader.load("ui-nope")).rejects.toThrow(/no family/)
    expect(RootLoader.folderOf("ui-buttons")).toBe("ui-button")
    expect(RootLoader.folderOf("toString")).toBeUndefined()
  })
})

describe("<ui-root> display", () => {
  const WAITING = `<ui-test-never-ready></ui-test-never-ready><p>Text</p>`

  it("when-ready (and skeleton, until skeletons exist):  hidden, space kept", async () => {
    for (const display of ["when-ready", "skeleton", ""]) {
      const { slot } = await root(`<ui-root display="${display}" timeout="10s">${WAITING}</ui-root>`)
      expect(slot.style.visibility).toBe("hidden")
      Fixture.cleanup()
    }
  })

  it("immediately:  never hidden", async () => {
    const { slot } = await root(`<ui-root display="immediately" timeout="10s">${WAITING}</ui-root>`)
    expect(slot.style.visibility).toBe("")
    expect(slot.style.display).toBe("")
  })

  it("loading:  a <ui-loader> with the message instead of the content", async () => {
    const { host, slot } = await root(`<ui-root loading="Loading reports" timeout="10s">${WAITING}</ui-root>`)
    const loader = host.shadowRoot!.querySelector("ui-loader")!
    expect(loader.textContent).toBe("Loading reports")
    expect(loader.getAttribute("part")).toBe("loading")
    expect(slot.style.display).toBe("none")
  })

  it("a bare loading shows the default text, and goes once ready", async () => {
    const { host, controller } = await root(`<ui-root loading timeout="30ms">${WAITING}</ui-root>`)
    expect(host.shadowRoot!.querySelector("ui-loader")!.textContent).toBe("Loading…")
    await controller.settled
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector("ui-loader")).toBeNull()
  })

  it("UIRoot.Loading swaps the look", async () => {
    const original = UIRoot.prototype.Loading
    UIRoot.prototype.Loading = {
      render: (part, message) => Object.assign(document.createElement("p"), { part, textContent: message() })
    }
    try {
      const { host } = await root(`<ui-root loading="Wait" timeout="10s">${WAITING}</ui-root>`)
      expect(host.shadowRoot!.querySelector("p[part=loading]")!.textContent).toBe("Wait")
    } finally {
      UIRoot.prototype.Loading = original
    }
  })
})

describe("<ui-root> theme, size and box", () => {
  it("theme sets the colour scheme of everything inside", async () => {
    const { host, controller } = await root(`<ui-root theme="dark"><p>Text</p></ui-root>`)
    await controller.settled
    await ElementFixture.settle(host)
    expect(host.matches(":state(dark)")).toBe(true)
    expect(getComputedStyle(host.querySelector("p")!).colorScheme).toBe("dark")
  })

  it("size scales everything inside (`--ui-scale`)", async () => {
    const { host, controller } = await root(`<ui-root size="small"><p>Text</p></ui-root>`)
    await controller.settled
    await ElementFixture.tick()
    expect(Number(getComputedStyle(host.querySelector("p")!).getPropertyValue("--ui-scale"))).toBe(0.875)
  })

  it("width / height make a box;  `window` is the viewport;  junk is ignored", async () => {
    const { host, controller } = await root(`<ui-root width="window" height="200px"><p>Text</p></ui-root>`)
    await controller.settled
    await ElementFixture.settle(host)
    expect(host.matches(":state(box)")).toBe(true)
    expect(host.getBoundingClientRect().width).toBe(document.documentElement.clientWidth)
    expect(host.getBoundingClientRect().height).toBe(200)
    host.setAttribute("height", "10px; background: red")
    await ElementFixture.tick()
    expect(getComputedStyle(host).backgroundColor).not.toBe("rgb(255, 0, 0)")
  })

  it("fixed pins it to the viewport", async () => {
    const { host, controller } = await root(`<ui-root fixed><p>Text</p></ui-root>`)
    await controller.settled
    await ElementFixture.settle(host)
    const style = getComputedStyle(host)
    expect(style.position).toBe("fixed")
    expect(style.overscrollBehaviorY).toBe("contain")
  })
})

describe("RootTimeout and the catalog", () => {
  it.each([
    ["5s", 5000],
    ["2.5s", 2500],
    ["500ms", 500],
    ["3000", 3000],
    ["soon", 5000],
    [undefined, 5000]
  ])("%s => %d ms", (value, ms) => {
    expect(RootTimeout.parse(value)).toBe(ms)
  })

  it("knows every tag, and its family", () => {
    expect(ROOT_CATALOG["ui-or"].folder).toBe("ui-button")
    expect(ROOT_CATALOG["ui-content"].folder).toBe("ui-parts")
    expect(ROOT_CATALOG["ui-root"].folder).toBe("ui-root")
  })
})

describe("<ui-root> examples", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s, once every root is ready", async (path) => {
    const holder = Fixture.render(`<div>${EXAMPLES[path]!}</div>`)
    const roots = [...holder.querySelectorAll<UIHost>("ui-root")]
    await Promise.all(roots.map(async (host) => (await host.ready, (host.controller as UIRoot).settled)))
    await ElementFixture.settle(holder)
    await expectAccessible(holder)
  })
})
