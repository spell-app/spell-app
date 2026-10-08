import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { SidebarCloseDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-sidebar"
import "$/ui/components/ui-menu"
import "$/ui/components/ui-item"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-sidebar/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A sidebar DOM element with its properties. */
type Sidebar = DOMElement & { visible: boolean; closedBy: string }

/** Links for a sidebar. */
const LINKS = `<a href="#one">One</a> <a href="#two">Two</a>`

/**
 * Render a pushable holding `sidebars` and a pusher with a toggle button;  returns the first sidebar, its panel,
 * the pusher (DOM element and box) and the toggle.
 */
async function pushable(sidebars: string) {
  const wrapper = await ElementFixture.render(
    `<div><ui-pushable style="height: 300px">${sidebars}<ui-pusher><button id="toggle">Menu</button>` +
      `<p>Content</p></ui-pusher></ui-pushable></div>`
  )
  const host = wrapper.querySelector<Sidebar>("ui-sidebar")!
  const panel = host.shadowRoot!.querySelector<HTMLElement>("[part~=sidebar]")!
  const pusher = wrapper.querySelector<DOMElement>("ui-pusher")!
  const pusherBox = pusher.shadowRoot!.querySelector<HTMLElement>("[part~=pusher]")!
  const toggle = wrapper.querySelector<HTMLButtonElement>("#toggle")!
  return { wrapper, host, panel, pusher, pusherBox, toggle }
}

/** Show `host` from `from` (focus returns there), and wait for `ui-show`. */
async function show(host: Sidebar, from?: HTMLElement) {
  from?.focus()
  const shown = next(host, "ui-show")
  host.visible = true
  await settle()
  await shown
}

/** Collect `detail`s of `name` events. */
function record<T = SidebarCloseDetail>(target: EventTarget, name: string) {
  const details: T[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<T>).detail))
  return details
}

/** Resolves on the next `name` event. */
function next(target: EventTarget, name: string) {
  return new Promise<Event>((resolve) => target.addEventListener(name, resolve, { once: true }))
}

/** Let the elements catch up. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/** The x / y translation of an element's computed transform. */
function translation(element: Element): [number, number] {
  const matrix = new DOMMatrix(getComputedStyle(element).transform)
  return [Math.round(matrix.m41), Math.round(matrix.m42)]
}

beforeEach(async () => {
  await UI.load()
  UI.overlays.useCloseWatcher = false
  Fixture.render(`<style>ui-pushable::part(pushable) { --ui-sidebar-duration: 1ms }</style>`)
})

afterEach(() => {
  for (const host of document.querySelectorAll<Sidebar>("ui-sidebar")) host.visible = false
})

////////////////
// ## Rendering
////////////////

describe("<ui-sidebar> classes and markup", () => {
  it.each([
    ["", "ui left uncover sidebar"],
    ['position="right"', "ui right uncover sidebar"],
    ['position="top"', "ui top overlay sidebar"],
    ['width="very thin" transition="scale down"', "ui left scale down sidebar very thin"],
    ['width="very-wide"', "ui left uncover sidebar very wide"],
    ['width="4"', "ui left uncover four wide sidebar"],
    ['width="1/4"', "ui left uncover four wide sidebar"],
    ['width="50%"', "ui left uncover eight wide sidebar"],
    ['transition="slide along" inverted blurring', "ui left slide along blurring inverted sidebar"]
  ])("<ui-sidebar %s>", async (attributes, classes) => {
    const { panel } = await pushable(`<ui-sidebar ${attributes}>${LINKS}</ui-sidebar>`)
    expect(panel.className).toBe(classes)
  })

  it("a modal sidebar is a <dialog>, a persistent one an <aside>;  named 'Sidebar' without an aria-label", async () => {
    const { panel, wrapper } = await pushable(
      `<ui-sidebar>${LINKS}</ui-sidebar><ui-sidebar persistent aria-label="Sections">${LINKS}</ui-sidebar>`
    )
    expect(panel.localName).toBe("dialog")
    expect(panel.getAttribute("aria-label")).toBe("Sidebar")
    const aside = wrapper.querySelectorAll("ui-sidebar")[1]!.shadowRoot!.querySelector("[part~=sidebar]")!
    expect(aside.localName).toBe("aside")
    expect(aside.getAttribute("aria-label")).toBe("Sections")
  })

  it("hidden:  laid out, but invisible and out of the tab order", async () => {
    const { host, panel, wrapper } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    expect(getComputedStyle(panel).visibility).toBe("hidden")
    expect(panel.offsetWidth).toBe(260)
    expect(UI.focus.focusables(host)).toHaveLength(0)
    expect(wrapper.querySelector("ui-pushable")!.matches(":state(pushable)")).toBe(true)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-sidebar> tokens from outside", () => {
  /** The panel's width. */
  function width(panel: Element): string {
    return getComputedStyle(panel).width
  }

  it("takes a token set on the DOM element", async () => {
    const { panel } = await pushable(`<ui-sidebar style="--ui-sidebar-width: 222px">${LINKS}</ui-sidebar>`)
    expect(width(panel)).toBe("222px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="--ui-sidebar-width: 222px"><ui-pushable><ui-sidebar>${LINKS}</ui-sidebar><ui-pusher></ui-pusher></ui-pushable></div>`
    )
    expect(width(wrapper.querySelector("ui-sidebar")!.shadowRoot!.querySelector("[part~=sidebar]")!)).toBe("222px")
  })

  it("takes a token set through `::part(sidebar)`", async () => {
    Fixture.render(`<style>.themed::part(sidebar) { --ui-sidebar-width: 222px }</style>`)
    const { panel } = await pushable(`<ui-sidebar class="themed">${LINKS}</ui-sidebar>`)
    expect(width(panel)).toBe("222px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-sidebar-width", "222px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-sidebar-width")
    })
    const { panel } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    expect(width(panel)).toBe("222px")
  })

  it("a column width is that share of the viewport, and moves the pusher by it", async () => {
    const { host, panel, pusherBox, toggle } = await pushable(
      `<ui-sidebar width="1/4" transition="push">${LINKS}</ui-sidebar>`
    )
    await show(host, toggle)
    await expect.poll(() => Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(innerWidth / 4))
    await expect.poll(() => translation(pusherBox)[0]).toBe(Math.round(panel.offsetWidth))
  })

  it("a width word swaps it;  `inverted` swaps the background", async () => {
    const { panel } = await pushable(`<ui-sidebar width="thin" style="--ui-sidebar-width: 222px">${LINKS}</ui-sidebar>`)
    expect(width(panel)).toBe("150px")
    const red = "rgb(255, 0, 0)"
    const { panel: plain } = await pushable(`<ui-sidebar style="--ui-sidebar-background: ${red}">${LINKS}</ui-sidebar>`)
    expect(getComputedStyle(plain).backgroundColor).toBe(red)
    const { panel: inverted } = await pushable(
      `<ui-sidebar inverted style="--ui-sidebar-background: ${red}">${LINKS}</ui-sidebar>`
    )
    expect(getComputedStyle(inverted).backgroundColor).not.toBe(red)
  })
})

////////////////
// ## Showing and hiding
////////////////

describe("<ui-sidebar> modal (default)", () => {
  it("shows:  focus moves in, the pusher moves aside, dims and goes inert;  aria-modal", async () => {
    const { host, panel, pusher, pusherBox, toggle } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    await show(host, toggle)
    expect(getComputedStyle(panel).visibility).toBe("visible")
    expect((panel as HTMLDialogElement).open).toBe(true)
    expect(panel.getAttribute("aria-modal")).toBe("true")
    expect(document.activeElement).toBe(host.querySelector("a"))
    expect(pusher.hasAttribute("inert")).toBe(true)
    await expect.poll(() => translation(pusherBox)).toEqual([260, 0])
    await expect.poll(() => getComputedStyle(pusherBox, "::after").opacity).toBe("1")
    expect(host.matches(":state(visible)")).toBe(true)
  })

  it("Escape hides it (reason `escape`):  the pusher comes back and focus returns to the toggle", async () => {
    const { host, pusher, pusherBox, toggle } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    const closes = record(host, "ui-close")
    await show(host, toggle)
    const hidden = next(host, "ui-hide")
    await userEvent.keyboard("{Escape}")
    await settle()
    await hidden
    expect(host.visible).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["escape"])
    expect(pusher.hasAttribute("inert")).toBe(false)
    await expect.poll(() => translation(pusherBox)).toEqual([0, 0])
    expect(document.activeElement).toBe(toggle)
  })

  it("with CloseWatcher (the browser's close requests), Escape hides it too", async () => {
    UI.overlays.useCloseWatcher = true
    const { host, toggle } = await pushable(`<ui-sidebar id="side">${LINKS}</ui-sidebar>`)
    toggle.setAttribute("commandfor", "side")
    toggle.setAttribute("command", "--toggle")
    const closes = record(host, "ui-close")
    const shown = next(host, "ui-show")
    // Safari doesn't focus a button on a real click, so the open would have no focus to return to:
    // focus it, then click without moving focus
    toggle.focus()
    toggle.click()
    await shown
    const hidden = next(host, "ui-hide")
    await userEvent.keyboard("{Escape}")
    await settle()
    await hidden
    expect(host.visible).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["escape"])
    expect(document.activeElement).toBe(toggle)
  })

  it("a click on the dimmed pusher hides it (reason `outside`);  closedby=closerequest ignores it", async () => {
    const { host, toggle, wrapper } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    const closes = record(host, "ui-close")
    await show(host, toggle)
    // the pusher is `inert`:  a click on it lands on the pushable
    const beside = { position: { x: 380, y: 20 } }
    const context = wrapper.querySelector("ui-pushable")!
    await userEvent.click(context, beside)
    await settle()
    expect(host.visible).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["outside"])
    host.closedBy = "closerequest"
    await show(host, toggle)
    await userEvent.click(context, beside)
    await settle()
    expect(host.visible).toBe(true)
  })

  it("Tab stays inside while it's open", async () => {
    const { host, toggle } = await pushable(`<ui-sidebar>${LINKS}</ui-sidebar>`)
    await show(host, toggle)
    const [one, two] = host.querySelectorAll("a")
    expect(document.activeElement).toBe(one)
    await Keys.tab()
    expect(document.activeElement).toBe(two)
    await Keys.tab()
    expect(document.activeElement).toBe(one)
    await Keys.tab(true)
    expect(document.activeElement).toBe(two)
  })

  it("invoker commands:  --toggle (a cancelable ui-open), --close", async () => {
    const { host, wrapper } = await pushable(`<ui-sidebar id="s">${LINKS}</ui-sidebar>`)
    wrapper.insertAdjacentHTML("afterbegin", `<button id="t" commandfor="s" command="--toggle">T</button>`)
    const opens = record(host, "ui-open")
    let veto = true
    host.addEventListener("ui-open", (event) => veto && event.preventDefault())
    await userEvent.click(wrapper.querySelector("#t")!)
    await settle()
    expect(opens).toHaveLength(1)
    expect(host.visible).toBe(false)
    veto = false
    await userEvent.click(wrapper.querySelector("#t")!)
    await settle()
    expect(host.visible).toBe(true)
  })

  it("keyboard walkthrough:  Enter on the toggle opens, arrows aren't needed, Escape returns", async () => {
    const { host, toggle, wrapper } = await pushable(`<ui-sidebar id="s">${LINKS}</ui-sidebar>`)
    toggle.setAttribute("commandfor", "s")
    toggle.setAttribute("command", "--toggle")
    toggle.focus()
    const shown = next(host, "ui-show")
    await userEvent.keyboard("{Enter}")
    await shown
    expect(document.activeElement).toBe(host.querySelector("a"))
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(host.visible).toBe(false)
    expect(document.activeElement).toBe(wrapper.querySelector("#toggle"))
  })
})

////////////////
// ## Transitions
////////////////

describe("<ui-sidebar> transitions", () => {
  it.each([
    ['transition="overlay"', [0, 0], "none"],
    ['transition="push" position="right"', [-260, 0], "none"],
    ['transition="slide out" width="thin"', [150, 0], "none"],
    ['transition="scale down"', [0, 0], "matrix(0.75, 0, 0, 0.75, 0, 0)"]
  ])("<ui-sidebar %s> moves the pusher", async (attributes, [x, y], scaled) => {
    const { host, pusherBox, toggle } = await pushable(`<ui-sidebar ${attributes}>${LINKS}</ui-sidebar>`)
    await show(host, toggle)
    if (scaled === "none") await expect.poll(() => translation(pusherBox)).toEqual([x, y])
    else await expect.poll(() => getComputedStyle(pusherBox).transform).toBe(scaled)
  })

  it("a top push moves the pusher down by the sidebar's height", async () => {
    const { host, panel, pusherBox, toggle } = await pushable(
      `<ui-sidebar position="top" transition="push">${LINKS}</ui-sidebar>`
    )
    await show(host, toggle)
    await expect.poll(() => translation(pusherBox)).toEqual([0, panel.offsetHeight])
    expect(panel.offsetWidth).toBe(pusherBox.offsetWidth)
  })

  it("two sidebars on opposite sides:  the pusher stays put", async () => {
    const { wrapper, pusherBox } = await pushable(
      `<ui-sidebar persistent transition="push">${LINKS}</ui-sidebar>` +
        `<ui-sidebar persistent position="right" transition="push">${LINKS}</ui-sidebar>`
    )
    const [left, right] = wrapper.querySelectorAll<Sidebar>("ui-sidebar")
    await show(left!)
    await expect.poll(() => translation(pusherBox)).toEqual([260, 0])
    await show(right!)
    await expect.poll(() => translation(pusherBox)).toEqual([0, 0])
  })
})

describe("<ui-sidebar persistent>", () => {
  it("part of the page:  no inert, no dimmer, focus stays, Escape does nothing", async () => {
    const { host, pusher, pusherBox, toggle } = await pushable(
      `<ui-sidebar persistent transition="push">${LINKS}</ui-sidebar>`
    )
    await show(host, toggle)
    expect(document.activeElement).toBe(toggle)
    expect(pusher.hasAttribute("inert")).toBe(false)
    expect(getComputedStyle(pusherBox, "::after").opacity).toBe("0")
    await expect.poll(() => translation(pusherBox)).toEqual([260, 0])
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(host.visible).toBe(true)
  })

  it("visible on first paint moves the pusher at once", async () => {
    const { pusherBox } = await pushable(`<ui-sidebar persistent transition="push" visible>${LINKS}</ui-sidebar>`)
    await expect.poll(() => translation(pusherBox)).toEqual([260, 0])
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-sidebar> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s, with each sidebar shown", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
    for (const host of root.querySelectorAll<Sidebar>("ui-sidebar:not([visible])")) {
      await show(host)
      await expectAccessible(root)
      host.visible = false
      await settle()
    }
  })
})
