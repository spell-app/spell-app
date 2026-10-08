import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { DimmerCloseDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-dimmer"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-button"
import "$/ui/components/ui-parts"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-dimmer/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A dimmer host with its properties. */
type Dimmer = UIHost & { active: boolean; closedBy: string }

/** Render `html` in a wrapper;  returns the first dimmer, its box and the wrapper. */
async function dimmer(html: string) {
  const wrapper = await ElementFixture.render(`<div>${html}</div>`)
  const host = wrapper.querySelector<Dimmer>("ui-dimmer")!
  const box = host.shadowRoot!.querySelector<HTMLElement>("[part~=dimmer]")!
  return { wrapper, host, box }
}

/** Collect `detail`s of `name` events. */
function record<T = DimmerCloseDetail>(target: EventTarget, name: string) {
  const details: T[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<T>).detail))
  return details
}

/** Resolves on the next `name` event. */
function next(target: EventTarget, name: string) {
  return new Promise<Event>((resolve) => target.addEventListener(name, resolve, { once: true }))
}

/** Let the element catch up. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

beforeEach(async () => {
  await UI.load()
  UI.overlays.useCloseWatcher = false
  Fixture.render(`<style>:root { --ui-dimmer-duration: 1ms }</style>`)
})

afterEach(() => {
  for (const host of document.querySelectorAll<Dimmer>("ui-dimmer")) host.active = false
})

////////////////
// ## Classes
////////////////

describe("<ui-dimmer> classes", () => {
  it.each([
    ["", "ui dimmer"],
    ["active", "ui active dimmer"],
    ['shade="very light" inverted', "ui very light inverted dimmer"],
    ['blurring simple vertical-align="top"', "ui blurring simple top aligned dimmer"],
    ["page", "ui page dimmer"],
    ["active disabled", "ui disabled dimmer"]
  ])("<ui-dimmer %s>", async (attributes, classes) => {
    const { box } = await dimmer(`<ui-dimmer ${attributes}></ui-dimmer>`)
    expect(box.className).toBe(classes)
  })

  it("renders its content box around the slot;  a div, or a dialog with `page`", async () => {
    const { box, wrapper } = await dimmer(`<ui-dimmer>x</ui-dimmer><ui-dimmer page>y</ui-dimmer>`)
    expect(box.localName).toBe("div")
    expect(box.querySelector(":scope > [part~=content].content > slot")).not.toBeNull()
    const page = wrapper.querySelectorAll("ui-dimmer")[1]!.shadowRoot!.querySelector("[part~=dimmer]")!
    expect(page.localName).toBe("dialog")
  })
})

////////////////
// ## Element dimmer
////////////////

describe("<ui-dimmer> element dimmer", () => {
  it("covers its parent segment (inside its border) while active;  hidden otherwise", async () => {
    const { host, box, wrapper } = await dimmer(
      `<ui-segment><p>Text</p><p>More</p><ui-dimmer><ui-header level="4">Hi</ui-header></ui-dimmer></ui-segment>`
    )
    expect(getComputedStyle(box).display).toBe("none")
    const shown = next(host, "ui-show")
    host.active = true
    await settle()
    await shown
    expect(getComputedStyle(box).display).toBe("flex")
    expect(getComputedStyle(box).opacity).toBe("1")
    expect(host.matches(":state(active)")).toBe(true)
    const segment = wrapper.querySelector("ui-segment")!.shadowRoot!.querySelector("[part~=segment]")!
    // its padding box:  inside the border, as Fomantic's absolute dimmer
    const rect = box.getBoundingClientRect()
    // `clientWidth` / `clientHeight` are rounded to integers;  Firefox lays the segment out at 118.4
    expect(rect.width).toBeCloseTo(segment.clientWidth, 0)
    expect(rect.height).toBeCloseTo(segment.clientHeight, 0)
    expect(rect.left - segment.getBoundingClientRect().left).toBe(segment.clientLeft)
    const hidden = next(host, "ui-hide")
    host.active = false
    await settle()
    await hidden
    expect(getComputedStyle(box).display).toBe("none")
  })

  it("positions a plain parent for itself (the page sheet)", async () => {
    const { wrapper } = await dimmer(`<div id="parent"><ui-dimmer active></ui-dimmer></div>`)
    expect(getComputedStyle(wrapper.querySelector("#parent")!).position).toBe("relative")
  })

  it("is the dark scheme for its content;  inverted, the light one", async () => {
    const { box, wrapper } = await dimmer(`<ui-dimmer active></ui-dimmer><ui-dimmer inverted active></ui-dimmer>`)
    expect(getComputedStyle(box).colorScheme).toBe("dark")
    const inverted = wrapper.querySelectorAll("ui-dimmer")[1]!.shadowRoot!.querySelector("[part~=dimmer]")!
    expect(getComputedStyle(inverted).colorScheme).toBe("light")
  })

  it("a click on the dimmer hides it (reason `click`);  one on its content doesn't", async () => {
    const { host, box } = await dimmer(
      `<ui-segment style="min-height: 10em"><ui-dimmer active><button>Content</button></ui-dimmer></ui-segment>`
    )
    const closes = record(host, "ui-close")
    await userEvent.click(host.querySelector("button")!)
    await settle()
    expect(host.active).toBe(true)
    await userEvent.click(box, { position: { x: 3, y: 3 } })
    await settle()
    expect(host.active).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["click"])
  })

  it("closedby=none ignores clicks;  a vetoed ui-close keeps it", async () => {
    const { host, box } = await dimmer(`<ui-segment><ui-dimmer active closedby="none"></ui-dimmer>x</ui-segment>`)
    await userEvent.click(box)
    await settle()
    expect(host.active).toBe(true)
    host.closedBy = "any"
    host.addEventListener("ui-close", (event) => event.preventDefault())
    await settle()
    await userEvent.click(box)
    await settle()
    expect(host.active).toBe(true)
  })

  it("disabled never shows", async () => {
    const { host, box } = await dimmer(`<ui-segment><ui-dimmer active disabled></ui-dimmer>x</ui-segment>`)
    expect(getComputedStyle(box).display).toBe("none")
    expect(host.matches(":state(active)")).toBe(false)
  })

  it("invoker commands:  --show (a cancelable ui-open), --toggle, --close", async () => {
    const { host, wrapper } = await dimmer(
      `<button id="show" commandfor="d" command="--show">Show</button>` +
        `<button id="toggle" commandfor="d" command="--toggle">Toggle</button>` +
        `<ui-segment><ui-dimmer id="d"></ui-dimmer>x</ui-segment>`
    )
    const opens = record(host, "ui-open")
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await settle()
    expect(host.active).toBe(true)
    expect(opens).toHaveLength(1)
    wrapper.querySelector<HTMLButtonElement>("#toggle")!.click()
    await settle()
    expect(host.active).toBe(false)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-dimmer> tokens from outside", () => {
  const SHADE = "rgba(10, 20, 30, 0.5)"

  /** The dimmer box's background colour. */
  function background(box: Element): string {
    return getComputedStyle(box).backgroundColor
  }

  it("takes a token set on the HOST", async () => {
    const { box } = await dimmer(`<ui-dimmer active style="--ui-dimmer-background: ${SHADE}"></ui-dimmer>`)
    expect(background(box)).toBe(SHADE)
  })

  it("takes a token set on an ANCESTOR", async () => {
    const { box } = await dimmer(
      `<section style="--ui-dimmer-background: ${SHADE}"><ui-dimmer active></ui-dimmer></section>`
    )
    expect(background(box)).toBe(SHADE)
  })

  it("takes a token set through `::part(dimmer)`", async () => {
    const { box } = await dimmer(
      `<style>.themed::part(dimmer) { --ui-dimmer-background: ${SHADE} }</style><ui-dimmer active class="themed"></ui-dimmer>`
    )
    expect(background(box)).toBe(SHADE)
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-dimmer-background", SHADE)
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-dimmer-background")
    })
    const { box } = await dimmer(`<ui-dimmer active></ui-dimmer>`)
    expect(background(box)).toBe(SHADE)
  })

  it("a shade swaps the background;  the duration reaches the fade", async () => {
    const { box } = await dimmer(
      `<ui-dimmer active shade="light" style="--ui-dimmer-background: ${SHADE}"></ui-dimmer>`
    )
    expect(background(box)).not.toBe(SHADE)
    const { box: slow } = await dimmer(`<ui-dimmer style="--ui-dimmer-duration: 2s"></ui-dimmer>`)
    expect(getComputedStyle(slow).transitionDuration.split(",")[0]).toBe("2s")
  })
})

////////////////
// ## `show-on`
////////////////

describe("<ui-dimmer> on", () => {
  it("show-on=hover:  shows while the pointer is over the parent", async () => {
    const { host, wrapper } = await dimmer(
      `<div id="card" style="width: 10em; height: 6em"><ui-dimmer show-on="hover"><button>Add</button></ui-dimmer></div>` +
        `<p id="away">Away</p>`
    )
    await userEvent.hover(wrapper.querySelector("#card")!)
    await settle()
    expect(host.active).toBe(true)
    await userEvent.hover(wrapper.querySelector("#away")!)
    await settle()
    expect(host.active).toBe(false)
  })

  it("show-on=hover:  keyboard focus reaches the content (laid out while inactive), which shows it", async () => {
    const { host, box, wrapper } = await dimmer(
      `<button id="before">Before</button>` +
        `<div style="width: 10em; height: 6em"><ui-dimmer show-on="hover"><button id="add">Add</button></ui-dimmer></div>` +
        `<button id="after">After</button>`
    )
    expect(getComputedStyle(box).opacity).toBe("0")
    expect(getComputedStyle(box).pointerEvents).toBe("none")
    wrapper.querySelector<HTMLButtonElement>("#before")!.focus()
    await Keys.tab()
    expect(document.activeElement?.id).toBe("add")
    await settle()
    expect(host.active).toBe(true)
    await Keys.tab()
    await settle()
    expect(host.active).toBe(false)
  })

  it("show-on=click:  a click on the parent shows it", async () => {
    const { host, wrapper } = await dimmer(
      `<div id="card" style="width: 10em; height: 6em">Card<ui-dimmer show-on="click"></ui-dimmer></div>`
    )
    await userEvent.click(wrapper.querySelector("#card")!)
    await settle()
    expect(host.active).toBe(true)
  })
})

////////////////
// ## Page dimmer
////////////////

describe("<ui-dimmer> page", () => {
  it("a modal dialog over the viewport:  inert page, scroll lock, focus inside;  Escape hides and restores focus", async () => {
    const { host, box, wrapper } = await dimmer(
      `<button id="trigger">Open</button><ui-dimmer page aria-label="Busy"><button>Inside</button></ui-dimmer>`
    )
    const trigger = wrapper.querySelector<HTMLButtonElement>("#trigger")!
    trigger.focus()
    const shown = next(host, "ui-show")
    host.active = true
    await settle()
    await shown
    const dialog = box as HTMLDialogElement
    expect(dialog.matches(":modal")).toBe(true)
    expect(dialog.getAttribute("aria-label")).toBe("Busy")
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(true)
    const rect = dialog.getBoundingClientRect()
    expect([rect.left, rect.top, rect.width, rect.height]).toEqual([0, 0, innerWidth, innerHeight])
    expect(UI.focus.containsDeep(host.querySelector("button")!, UI.focus.activeElementDeep())).toBe(true)
    const closes = record(host, "ui-close")
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(host.active).toBe(false)
    expect(dialog.open).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["escape"])
    expect(document.activeElement).toBe(trigger)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(false)
  })

  it("with CloseWatcher (the browser's close requests), Escape hides one shown by a click", async () => {
    UI.overlays.useCloseWatcher = true
    const { host, wrapper } = await dimmer(
      `<button id="show" commandfor="d" command="--show">Show</button><ui-dimmer id="d" page><p>Busy</p></ui-dimmer>`
    )
    const closes = record(host, "ui-close")
    const shown = next(host, "ui-show")
    await userEvent.click(wrapper.querySelector("#show")!)
    await shown
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(closes.map((detail) => detail.reason)).toEqual(["escape"])
    expect(host.active).toBe(false)
  })

  it("named 'Dimmed page' without an aria-label;  a click anywhere hides it", async () => {
    const { host, box } = await dimmer(`<ui-dimmer page><p>Busy</p></ui-dimmer>`)
    host.active = true
    await settle()
    expect(box.getAttribute("aria-label")).toBe("Dimmed page")
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(host.active).toBe(false)
  })

  it("closedby=closerequest:  Escape hides, a click doesn't;  none:  neither", async () => {
    const { host } = await dimmer(`<ui-dimmer page closedby="closerequest"><p>Busy</p></ui-dimmer>`)
    host.active = true
    await settle()
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(host.active).toBe(true)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(host.active).toBe(false)
    host.closedBy = "none"
    host.active = true
    await settle()
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(host.active).toBe(true)
  })

  it("removing it closes the dialog and releases the scroll lock", async () => {
    const { host, box } = await dimmer(`<ui-dimmer page>x</ui-dimmer>`)
    host.active = true
    await settle()
    host.remove()
    await settle()
    expect((box as HTMLDialogElement).open).toBe(false)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(false)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-dimmer> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s, with each page dimmer shown", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
    for (const host of root.querySelectorAll<Dimmer>("ui-dimmer[page]")) {
      host.active = true
      await settle()
      await expectAccessible(host)
      host.active = false
      await settle()
    }
  })
})
