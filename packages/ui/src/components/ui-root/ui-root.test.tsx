import { describe, expect, it } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/a11y"
import { Fixture } from "$/ui/test/fixture"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/viewport"
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
    expect(RootLoader.folderFor("ui-buttons")).toBe("ui-button")
    expect(RootLoader.folderFor("toString")).toBeUndefined()
  })
})

describe("<ui-root> display", () => {
  const WAITING = `<ui-test-never-ready></ui-test-never-ready><p>Text</p>`

  it("when-ready (and skeleton with nothing described):  hidden, space kept", async () => {
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

describe("<ui-root> skeletons", () => {
  /** The root's skeleton box, if shown. */
  function skeletonBox(host: Element) {
    return host.shadowRoot!.querySelector("[part=skeleton]")
  }

  it("draws a <ui-placeholder> per described element, in page order, instead of the content", async () => {
    const html =
      `<ui-test-never-ready></ui-test-never-ready><ui-card></ui-card><p>Text</p>` +
      `<ui-button>A</ui-button><ui-button size="small" fluid>B</ui-button>`
    const { host, slot } = await root(`<ui-root timeout="10s">${html}</ui-root>`)
    const placeholders = [...skeletonBox(host)!.children]
    expect(placeholders.map((placeholder) => placeholder.localName)).toEqual(Array(3).fill("ui-placeholder"))
    const [card, button, small] = placeholders as HTMLElement[]
    expect([...card!.children].map((shape) => shape.localName)).toEqual([
      "ui-placeholder-image",
      "ui-placeholder-header",
      "ui-placeholder-paragraph"
    ])
    expect(card!.children[0]!.hasAttribute("square")).toBe(true)
    expect(card!.children[2]!.children).toHaveLength(3)
    expect(card!.style.getPropertyValue("--ui-placeholder-max-width")).toBe("18em")
    expect(button!.style.display).toBe("inline-block")
    expect(button!.firstElementChild!.getAttribute("style")).toContain("--ui-placeholder-image-height: 2.5em")
    expect(small!.style.getPropertyValue("--ui-scale")).toBe("var(--ui-size-small)")
    expect(small!.hasAttribute("fluid")).toBe(true)
    expect(slot.style.display).toBe("none")
    // the page's own DOM is never touched:  no placeholder in it, the same children
    expect(host.querySelector("ui-placeholder")).toBeNull()
    expect([...host.children].map((child) => child.localName)).toEqual([
      "ui-test-never-ready",
      "ui-card",
      "p",
      "ui-button",
      "ui-button"
    ])
  })

  it("an element inside a described one is covered by it", async () => {
    const { host } = await root(
      `<ui-root timeout="10s"><ui-test-never-ready></ui-test-never-ready>` +
        `<ui-segment><ui-button>A</ui-button></ui-segment></ui-root>`
    )
    expect(skeletonBox(host)!.children).toHaveLength(1)
  })

  it("goes once ready;  when-ready and immediately draw none", async () => {
    const { host, controller } = await root(
      `<ui-root timeout="30ms"><ui-test-never-ready></ui-test-never-ready><ui-button>A</ui-button></ui-root>`
    )
    expect(skeletonBox(host)).not.toBeNull()
    await controller.settled
    await ElementFixture.tick()
    expect(skeletonBox(host)).toBeNull()
    for (const display of ["when-ready", "immediately"]) {
      const other = await root(`<ui-root display="${display}" timeout="10s"><ui-button>A</ui-button></ui-root>`)
      expect(skeletonBox(other.host)).toBeNull()
    }
  })

  it("UIRoot.Skeleton swaps the look", async () => {
    const original = UIRoot.prototype.Skeleton
    UIRoot.prototype.Skeleton = {
      render: (part, skeletons) =>
        Object.assign(document.createElement("p"), { part, textContent: `${skeletons().length}` })
    }
    try {
      const { host } = await root(
        `<ui-root timeout="10s"><ui-test-never-ready></ui-test-never-ready><ui-button>A</ui-button></ui-root>`
      )
      expect(host.shadowRoot!.querySelector("p[part=skeleton]")!.textContent).toBe("1")
    } finally {
      UIRoot.prototype.Skeleton = original
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

  it("stack-with sets `--ui-stack-with` for everything inside:  `page` grids lay out by the SCREEN", async () => {
    const { host, controller } = await root(
      `<ui-root stack-with="page"><div style="width: 500px"><ui-grid stackable columns="3"><ui-column>A</ui-column>` +
        `<ui-column>B</ui-column></ui-grid><ui-grid stackable columns="3" stack-with="container"><ui-column>C` +
        `</ui-column><ui-column>D</ui-column></ui-grid></div></ui-root>`
    )
    await controller.settled
    await ElementFixture.settle(host)
    expect(getComputedStyle(host.querySelector("div")!).getPropertyValue("--ui-stack-with").trim()).toBe("page")
    const columns = [...host.querySelectorAll("ui-column")].map((column) => column.shadowRoot!.firstElementChild!)
    /** Whether the first two columns of grid `index` share a line. */
    const oneLine = (index: number) =>
      columns[index * 2]!.getBoundingClientRect().top === columns[index * 2 + 1]!.getBoundingClientRect().top
    await Viewport.resize(1200)
    await expect.poll(() => [oneLine(0), oneLine(1)]).toEqual([true, false])
    await Viewport.resize(500)
    await expect.poll(() => [oneLine(0), oneLine(1)]).toEqual([false, false])
    host.setAttribute("stack-with", "junk")
    await ElementFixture.tick()
    expect(getComputedStyle(host.querySelector("div")!).getPropertyValue("--ui-stack-with")).toBe("")
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
    expect(getComputedStyle(host).position).toBe("fixed")
    const scroller = host.shadowRoot!.querySelector<HTMLElement>("[part~=scroller]")!
    expect(getComputedStyle(scroller).overscrollBehaviorY).toBe("contain")
  })

  it("a box scrolls in a named region that takes focus;  without a box, no region", async () => {
    const { host, controller } = await root(`<ui-root height="5em" aria-label="Report"><p>Text</p></ui-root>`)
    await controller.settled
    await ElementFixture.settle(host)
    const scroller = host.shadowRoot!.querySelector<HTMLElement>("[part~=scroller]")!
    expect(scroller.tabIndex).toBe(0)
    expect(scroller.getAttribute("role")).toBe("region")
    expect(scroller.getAttribute("aria-label")).toBe("Report")
    expect(getComputedStyle(scroller).overflowY).toBe("auto")
    const plain = await root(`<ui-root><p>Text</p></ui-root>`)
    expect(plain.host.shadowRoot!.querySelector("[part~=scroller]")).toBeNull()
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
