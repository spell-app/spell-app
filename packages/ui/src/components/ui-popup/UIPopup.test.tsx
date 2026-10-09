import { beforeEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { page, userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { PopupOpenDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-popup"
import "$/ui/components/ui-button"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-grid"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-popup/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A popup DOM element with its properties. */
type Popup = DOMElement & { open: boolean; target: Element | undefined; htmlFor: string | undefined }

/** Render `html` in a padded wrapper (room for the popups);  returns the first popup, its box and its target. */
async function popup(html: string) {
  const wrapper = await ElementFixture.render(`<div style="padding: 120px 200px">${html}</div>`)
  const host = wrapper.querySelector<Popup>("ui-popup")!
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=popup]")!
  return { wrapper, host, root }
}

/** Collect `detail`s of `name` events. */
function record(target: EventTarget, name: string) {
  const details: PopupOpenDetail[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<PopupOpenDetail>).detail))
  return details
}

/** Let the element catch up with events. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/**
 * Fake `setTimeout` for this test, so `advance()` runs the element's show / hide delays.
 * - Only the timers:  the pointer, focus and the popover's own events still come from the browser.
 */
function fakeTimers() {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  onTestFinished(() => {
    vi.useRealTimers()
  })
}

/** Move the faked clock `ms` on (`fakeTimers()`), then let the element catch up. */
async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await settle()
}

/** Resolves on `host`'s next `toggle` event (the browser queues it after a popover shows or hides). */
function nextToggle(host: Element) {
  return new Promise((resolve) => host.addEventListener("toggle", resolve, { once: true }))
}

/** Is `host` shown in the top layer? */
function shown(host: Element) {
  return host.matches(":popover-open")
}

beforeEach(async () => {
  await UI.load()
  // Escape through a keyboard binding rather than `CloseWatcher`, so every test can press it
  UI.overlays.useCloseWatcher = false
})

////////////////
// ## Classes
////////////////

describe("<ui-popup> classes", () => {
  it.each([
    ["", "ui top left popup"],
    ['size="small"', "ui small top left popup"],
    ['size="medium"', "ui top left popup"],
    ['color="red"', "ui red top left popup"],
    ["basic", "ui basic top left popup"],
    ["wide", "ui wide top left popup"],
    ['wide="very"', "ui very wide top left popup"],
    ["inverted flowing fixed", "ui fixed flowing inverted top left popup"],
    ["fluid loading", "ui fluid loading top left popup"],
    ['position="right center"', "ui right center popup"],
    ['position="left top"', "ui left top popup"],
    ['position="bottom centre"', "ui top left popup"],
    ['open-on="manual" open', "ui visible top left popup"]
  ])("<ui-popup %s>", async (attributes, classes) => {
    const { root } = await popup(`<button>t</button><ui-popup ${attributes}>Text</ui-popup>`)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
  })

  it("sets :state(open) and :state(fluid)", async () => {
    const { host } = await popup(`<button>t</button><ui-popup open-on="manual" open fluid>x</ui-popup>`)
    expect(host.matches(":state(open)")).toBe(true)
    expect(host.matches(":state(fluid)")).toBe(true)
  })
})

////////////////
// ## Content
////////////////

describe("<ui-popup> content", () => {
  it("renders the header and content shorthands, then the slot", async () => {
    const { root } = await popup(`<button>t</button><ui-popup header="Title" content="Body">Extra</ui-popup>`)
    expect([...root.children].map((child) => `${child.className}.${child.getAttribute("part")}`)).toEqual([
      "header.header",
      "content.content",
      ".null"
    ])
    expect(root.querySelector(".header")!.textContent).toBe("Title")
    expect(root.querySelector(".content")!.textContent).toBe("Body")
  })

  it("renders neither shorthand unless asked", async () => {
    const { root } = await popup(`<button>t</button><ui-popup>Only slotted</ui-popup>`)
    expect([...root.children].map((child) => child.localName)).toEqual(["slot"])
  })

  it("owns a slotted <ui-header> and <ui-content>:  :state(in-popup)", async () => {
    const { host } = await popup(
      `<button>t</button><ui-popup><ui-header>Head</ui-header><ui-content>Body</ui-content></ui-popup>`
    )
    expect(host.querySelector("ui-header")!.matches(":state(in-popup)")).toBe(true)
    expect(host.querySelector("ui-content")!.matches(":state(in-popup)")).toBe(true)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-popup> tokens from outside", () => {
  /** The box's top-left radius. */
  function radius(root: Element): string {
    return getComputedStyle(root).borderTopLeftRadius
  }

  it("takes a token set on the DOM element", async () => {
    const { root } = await popup(`<button>t</button><ui-popup style="--ui-popup-radius: 20px">x</ui-popup>`)
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const { root } = await popup(
      `<section style="--ui-popup-radius: 20px"><button>t</button><ui-popup>x</ui-popup></section>`
    )
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set through `::part(popup)`", async () => {
    const { root } = await popup(
      `<style>.themed::part(popup) { --ui-popup-radius: 20px }</style><button>t</button><ui-popup class="themed">x</ui-popup>`
    )
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-popup-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-popup-radius")
    })
    const { root } = await popup(`<button>t</button><ui-popup>x</ui-popup>`)
    expect(radius(root)).toBe("20px")
  })

  it("variations:  `wide` swaps the max width (off phones);  the gap derives from the arrow size", async () => {
    // Render first, THEN resize:
    // WebKit keeps a shared adopted sheet's media results stale when no element using it is alive at the resize,
    // so an OPEN popup must already be in the page
    const { root } = await popup(
      `<button>t</button><ui-popup wide open-on="manual" open style="--ui-popup-max-width: 100px">x</ui-popup>`
    )
    const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
    await page.viewport(1000, 800)
    onTestFinished(() => page.viewport(previousWidth, previousHeight))
    await expect.poll(() => getComputedStyle(root).maxWidth).toBe("350px")
    const { root: plain } = await popup(`<button>t</button><ui-popup>x</ui-popup>`)
    const { root: bigger } = await popup(`<button>t</button><ui-popup style="--ui-popup-arrow-size: 3em">x</ui-popup>`)
    expect(parseFloat(getComputedStyle(bigger).marginBottom)).toBeGreaterThan(
      parseFloat(getComputedStyle(plain).marginBottom)
    )
  })

  it("`flowing`:  a slotted grid sizes the popup by its content, not to a sliver (no size containment)", async () => {
    const columns = ["Basic Plan", "Business Plan", "Premium Plan"].map((text) => `<ui-column>${text}</ui-column>`)
    const html = `<button>t</button><ui-popup flowing open-on="manual" open><ui-grid columns="3">${columns.join("")}</ui-grid></ui-popup>`
    const { host, root } = await popup(html)
    await settle()
    expect(getComputedStyle(host.querySelector("ui-grid")!).containerType).toBe("normal")
    expect(root.getBoundingClientRect().width).toBeGreaterThan(200)
  })

  it("owner tokens:  a header size set on the popup or above it reaches a slotted header", async () => {
    const html = `<button>t</button><ui-popup style="--ui-popup-header-font-size: 30px"><ui-header>H</ui-header></ui-popup>`
    const { host } = await popup(html)
    expect(getComputedStyle(host.querySelector("ui-header")!.shadowRoot!.firstElementChild!).fontSize).toBe("30px")
  })
})

////////////////
// ## Target
////////////////

describe("<ui-popup> target", () => {
  it("is the previous element sibling by default (Fomantic's inline popup)", async () => {
    const { host, wrapper } = await popup(`<button id="a">A</button><ui-popup>Tip</ui-popup>`)
    const button = wrapper.querySelector("button")!
    expect(button.getAttribute("aria-describedby")).toBe(host.id)
    expect(button.style.getPropertyValue("anchor-name")).toMatch(/^--ui-popup-\d+$/)
  })

  it("is the element `for` names, and follows a change of `for`", async () => {
    const { host, wrapper } = await popup(
      `<button id="a">A</button><button id="b">B</button><span></span><ui-popup for="a">Tip</ui-popup>`
    )
    const [a, b] = wrapper.querySelectorAll("button")
    expect(a!.getAttribute("aria-describedby")).toBe(host.id)
    host.htmlFor = "b"
    await settle()
    expect(host.getAttribute("for")).toBe("b")
    expect(a!.hasAttribute("aria-describedby")).toBe(false)
    expect(a!.style.getPropertyValue("anchor-name")).toBe("")
    expect(b!.getAttribute("aria-describedby")).toBe(host.id)
  })

  it("is the `target` property when set, over `for`", async () => {
    const { host, wrapper } = await popup(`<button id="a">A</button><button>B</button><ui-popup for="a">Tip</ui-popup>`)
    const b = wrapper.querySelectorAll("button")[1]!
    host.target = b
    await settle()
    expect(b.getAttribute("aria-describedby")).toBe(host.id)
  })

  it("keeps the page's own anchor names and ARIA, and several popups on one target", async () => {
    const { wrapper } = await popup(
      `<button id="a" aria-describedby="note" style="anchor-name: --mine">A</button><span id="note">Note</span>` +
        `<ui-popup for="a">One</ui-popup><ui-popup for="a">Two</ui-popup>`
    )
    const button = wrapper.querySelector("button")!
    const [one, two] = wrapper.querySelectorAll("ui-popup")
    expect(button.getAttribute("aria-describedby")).toBe(`note ${one!.id} ${two!.id}`)
    expect(button.style.getPropertyValue("anchor-name").split(", ")).toHaveLength(3)
    one!.remove()
    await settle()
    expect(button.getAttribute("aria-describedby")).toBe(`note ${two!.id}`)
    expect(button.style.getPropertyValue("anchor-name").split(", ")[0]).toBe("--mine")
    two!.remove()
    await settle()
    expect(button.getAttribute("aria-describedby")).toBe("note")
    expect(button.style.getPropertyValue("anchor-name")).toBe("--mine")
  })
})

////////////////
// ## Hover
////////////////

describe("<ui-popup> hover", () => {
  it("shows after show-delay, as a `hint` popover, with ui-open;  hides after hide-delay", async () => {
    fakeTimers()
    const { host, wrapper } = await popup(
      `<button>Target</button><ui-popup show-delay="30" hide-delay="30">Tip</ui-popup>`
    )
    const opens = record(host, "ui-open")
    const closes = record(host, "ui-close")
    await userEvent.hover(wrapper.querySelector("button")!)
    await settle()
    expect(shown(host)).toBe(false)
    await advance(60)
    expect(shown(host)).toBe(true)
    expect(host).toMatchObject({ popover: UI.browser.supports.popoverHint ? "hint" : "manual", open: true })
    expect(host.hasAttribute("open")).toBe(true)
    expect(opens).toHaveLength(1)
    expect(opens[0]!.open).toBe(true)
    await userEvent.unhover(wrapper.querySelector("button")!)
    await advance(60)
    expect(shown(host)).toBe(false)
    expect(host.open).toBe(false)
    expect(closes).toHaveLength(1)
  })

  it("stays open while the pointer is over the popup itself", async () => {
    fakeTimers()
    const { host, wrapper } = await popup(
      `<button>Target</button><ui-popup show-delay="0" hide-delay="80">Tip</ui-popup>`
    )
    await userEvent.hover(wrapper.querySelector("button")!)
    await advance(20)
    expect(shown(host)).toBe(true)
    await userEvent.hover(host)
    await advance(120)
    expect(shown(host)).toBe(true)
    await userEvent.hover(wrapper, { position: { x: 1, y: 1 } })
    await advance(120)
    expect(shown(host)).toBe(false)
  })

  it('`hoverable="false"` (Fomantic\'s default) closes as the pointer leaves the target, even onto the popup', async () => {
    fakeTimers()
    const { host, wrapper } = await popup(
      `<button>Target</button><ui-popup hoverable="false" show-delay="0" hide-delay="40">Tip</ui-popup>`
    )
    await userEvent.hover(wrapper.querySelector("button")!)
    await advance(20)
    expect(shown(host)).toBe(true)
    await userEvent.hover(host)
    await advance(120)
    expect(shown(host)).toBe(false)
    expect(host.shadowRoot!.querySelector("[part~=popup]")!.className).not.toContain("hoverable")
  })

  it("opens on keyboard focus at once, and closes when focus leaves", async () => {
    const { host, wrapper } = await popup(`<button>Target</button><ui-popup>Tip</ui-popup><button>Next</button>`)
    wrapper.querySelector("button")!.focus()
    await settle()
    expect(shown(host)).toBe(true)
    await Keys.tab()
    await settle()
    expect(shown(host)).toBe(false)
  })

  it("Escape closes it, and focus stays on the target", async () => {
    const { host, wrapper } = await popup(`<button>Target</button><ui-popup>Tip</ui-popup>`)
    const button = wrapper.querySelector("button")!
    button.focus()
    await settle()
    expect(shown(host)).toBe(true)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(shown(host)).toBe(false)
    expect(document.activeElement).toBe(button)
  })

  it("a vetoed ui-open keeps it hidden", async () => {
    const { host, wrapper } = await popup(`<button>Target</button><ui-popup>Tip</ui-popup>`)
    host.addEventListener("ui-open", (event) => event.preventDefault())
    wrapper.querySelector("button")!.focus()
    await settle()
    expect(shown(host)).toBe(false)
    expect(host.open).toBe(false)
  })
})

////////////////
// ## Focus
////////////////

describe("<ui-popup> focus", () => {
  it("opens on focus only, not on hover", async () => {
    fakeTimers()
    const { host, wrapper } = await popup(
      `<button>Target</button><ui-popup open-on="focus" show-delay="0">Tip</ui-popup>`
    )
    const button = wrapper.querySelector("button")!
    await userEvent.hover(button)
    await advance(20)
    expect(shown(host)).toBe(false)
    button.focus()
    await settle()
    expect(shown(host)).toBe(true)
    button.blur()
    await settle()
    expect(shown(host)).toBe(false)
  })
})

////////////////
// ## Click
////////////////

describe("<ui-popup> click", () => {
  /** A click popup with a control inside. */
  const CLICK = `<button id="t">Target</button><ui-popup for="t" open-on="click" header="Plan"><button>Choose</button></ui-popup>`

  it("is a non-modal dialog:  role, name, and aria-haspopup / -expanded / -controls on the target", async () => {
    const { host, wrapper } = await popup(CLICK)
    const button = wrapper.querySelector<HTMLButtonElement>("#t")!
    expect(host.internals).toMatchObject({ role: "dialog", ariaLabel: "Plan" })
    expect(host.popover).toBe("manual")
    expect(button).toMatchObject({ ariaHasPopup: "dialog", ariaExpanded: "false" })
    expect(button.getAttribute("aria-controls")).toBe(host.id)
    expect(button.hasAttribute("aria-describedby")).toBe(false)
    button.click()
    await settle()
    expect(shown(host)).toBe(true)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    button.click()
    await settle()
    expect(shown(host)).toBe(false)
    expect(button.getAttribute("aria-expanded")).toBe("false")
  })

  it("closes on an outside click, not on a click inside it or on its target", async () => {
    const { host, wrapper } = await popup(CLICK)
    await userEvent.click(wrapper.querySelector("#t")!)
    await settle()
    expect(shown(host)).toBe(true)
    await userEvent.click(host.querySelector("button")!)
    await settle()
    expect(shown(host)).toBe(true)
    await userEvent.click(document.body, { position: { x: 5, y: 5 } })
    await settle()
    expect(shown(host)).toBe(false)
  })

  it("keyboard:  Enter opens, Tab moves into it, Escape closes and returns focus to the target", async () => {
    const { host, wrapper } = await popup(CLICK)
    const button = wrapper.querySelector<HTMLButtonElement>("#t")!
    button.focus()
    await userEvent.keyboard("{Enter}")
    await settle()
    expect(shown(host)).toBe(true)
    await Keys.tab()
    expect(document.activeElement).toBe(host.querySelector("button"))
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(shown(host)).toBe(false)
    expect(document.activeElement).toBe(button)
  })

  it("a vetoed ui-close keeps it open", async () => {
    const { host, wrapper } = await popup(CLICK)
    const closes = record(host, "ui-close")
    host.addEventListener("ui-close", (event) => event.preventDefault())
    await userEvent.click(wrapper.querySelector("#t")!)
    await settle()
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(closes).toHaveLength(1)
    expect(shown(host)).toBe(true)
  })

  it("the target's ARIA goes on a <ui-button>'s inner button, by element reflection", async () => {
    const { host, wrapper } = await popup(
      `<ui-button id="t">Go</ui-button><ui-popup for="t" open-on="click">x</ui-popup>`
    )
    const inner = wrapper.querySelector("ui-button")!.shadowRoot!.querySelector("button")!
    expect((inner as unknown as { ariaControlsElements: Element[] }).ariaControlsElements).toEqual([host])
    expect(inner.getAttribute("aria-expanded")).toBe("false")
    inner.click()
    await settle()
    expect(shown(host)).toBe(true)
    expect(inner.getAttribute("aria-expanded")).toBe("true")
  })
})

////////////////
// ## Manual
////////////////

describe("<ui-popup> manual", () => {
  it("shows and hides with `open` only, as a `manual` popover, without events", async () => {
    const { host, wrapper } = await popup(`<button>Target</button><ui-popup open-on="manual">Tip</ui-popup>`)
    const opens = record(host, "ui-open")
    expect(host.popover).toBe("manual")
    wrapper.querySelector("button")!.focus()
    await settle()
    expect(shown(host)).toBe(false)
    host.open = true
    await settle()
    expect(shown(host)).toBe(true)
    host.removeAttribute("open")
    await settle()
    expect(shown(host)).toBe(false)
    expect(opens).toHaveLength(0)
  })

  it("follows the browser when it dismisses the popover itself:  a ui-close, `open` off", async () => {
    const { host } = await popup(`<button>Target</button><ui-popup open-on="manual" open>Tip</ui-popup>`)
    const closes = record(host, "ui-close")
    const toggled = nextToggle(host)
    host.hidePopover()
    await toggled
    await settle()
    expect(host.open).toBe(false)
    expect(closes).toHaveLength(1)
  })

  it("hides when removed, and shows again when put back", async () => {
    const { host, wrapper } = await popup(`<button>Target</button><ui-popup open-on="manual" open>Tip</ui-popup>`)
    expect(UI.overlays.isOpen(UI.overlays.entries.find((entry) => entry.element === host)!)).toBe(true)
    host.remove()
    await settle()
    expect(UI.overlays.entries.some((entry) => entry.element === host)).toBe(false)
    wrapper.append(host)
    await settle()
    expect(shown(host)).toBe(true)
  })
})

////////////////
// ## Positioning
////////////////

describe("<ui-popup> positioning", () => {
  /** Rectangles of the popup box and its target. */
  async function rects(html: string) {
    const { host, wrapper, root } = await popup(html)
    await settle()
    await Promise.all(root.getAnimations().map((animation) => animation.finished))
    const target = wrapper.querySelector<HTMLElement>("[data-target]")!
    return { host, root, box: root.getBoundingClientRect(), anchor: target.getBoundingClientRect() }
  }

  it("top left:  above the target, left edges lined up, one arrow's size away", async () => {
    const { box, anchor, host } = await rects(
      `<button data-target>Target</button><ui-popup open-on="manual" open>Tip</ui-popup>`
    )
    expect(host.style.getPropertyValue("position-area")).toBe("span-right top")
    expect(Math.round(box.left)).toBe(Math.round(anchor.left))
    const gap = anchor.top - box.bottom
    expect(gap).toBeGreaterThan(8)
    expect(gap).toBeLessThan(14)
  })

  it("bottom center:  below the target, centred on it", async () => {
    const { box, anchor } = await rects(
      `<button data-target style="width: 200px">Target</button>` +
        `<ui-popup open-on="manual" open position="bottom center">Tip</ui-popup>`
    )
    expect(box.top).toBeGreaterThan(anchor.bottom)
    expect(Math.abs(box.left + box.width / 2 - (anchor.left + anchor.width / 2))).toBeLessThan(1)
  })

  it("left top:  beside the target, top edges lined up, the arrow on its right edge near the top", async () => {
    const { box, anchor, host, root } = await rects(
      `<button data-target style="margin-left: 300px; height: 4em">Target</button>` +
        `<ui-popup open-on="manual" open position="left top">Tip</ui-popup>`
    )
    expect(host.style.getPropertyValue("position-area")).toBe("left span-bottom")
    expect(box.right).toBeLessThan(anchor.left)
    expect(Math.abs(box.top - anchor.top)).toBeLessThan(1)
    const before = getComputedStyle(root, "::before")
    expect(parseFloat(before.top)).toBeLessThan(box.height / 2)
    expect(parseFloat(before.left)).toBeGreaterThan(box.width / 2)
  })

  it("right bottom:  beside the target, bottom edges lined up", async () => {
    const { box, anchor, host } = await rects(
      `<button data-target style="height: 4em">Target</button>` +
        `<ui-popup open-on="manual" open position="right bottom">Tip</ui-popup>`
    )
    expect(host.style.getPropertyValue("position-area")).toBe("right span-top")
    expect(box.left).toBeGreaterThan(anchor.right)
    expect(Math.abs(box.bottom - anchor.bottom)).toBeLessThan(1)
  })

  it("right center:  beside the target, centred on it vertically", async () => {
    const { box, anchor } = await rects(
      `<button data-target>Target</button><ui-popup open-on="manual" open position="right center">Tip</ui-popup>`
    )
    expect(box.left).toBeGreaterThan(anchor.right)
    expect(Math.abs(box.top + box.height / 2 - (anchor.top + anchor.height / 2))).toBeLessThan(1)
  })

  it("flips to the other side when there's no room (and the arrow follows)", async () => {
    const { host, wrapper } = await popup(
      `<button style="position: fixed; top: 0; left: 50px">Target</button><ui-popup open-on="manual" open>Tip</ui-popup>`
    )
    await settle()
    const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=popup]")!
    await Promise.all(root.getAnimations().map((animation) => animation.finished))
    const anchor = wrapper.querySelector("button")!.getBoundingClientRect()
    expect(root.getBoundingClientRect().top).toBeGreaterThanOrEqual(anchor.bottom)
    // the arrow follows the flip through an anchored container query, which Safari doesn't have yet
    if (UI.browser.supports.anchoredQueries) {
      expect(Number.parseFloat(getComputedStyle(root, "::before").top)).toBeLessThan(0)
    }
  })

  it("anchors to the inner box of a target without one (display: contents, e.g. <ui-icon>)", async () => {
    const { host, wrapper, root } = await popup(
      `<ui-icon id="i" name="circle-info" label="Info"></ui-icon><ui-popup for="i" open-on="manual" open>Tip</ui-popup>`
    )
    await settle()
    await Promise.all(root.getAnimations().map((animation) => animation.finished))
    expect(host.style.getPropertyValue("position-anchor")).toBe("auto")
    const inner = wrapper.querySelector("ui-icon")!.shadowRoot!.firstElementChild!.getBoundingClientRect()
    expect(Math.round(root.getBoundingClientRect().left)).toBe(Math.round(inner.left))
    expect(root.getBoundingClientRect().bottom).toBeLessThanOrEqual(inner.top)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-popup> accessibility", () => {
  it("a tooltip is role=tooltip;  a <ui-button> target's inner button is described by it", async () => {
    const { host, wrapper } = await popup(`<ui-button>Go</ui-button><ui-popup content="Goes">x</ui-popup>`)
    expect(host.internals.role).toBe("tooltip")
    const inner = wrapper.querySelector("ui-button")!.shadowRoot!.querySelector("button")!
    expect((inner as unknown as { ariaDescribedByElements: Element[] }).ariaDescribedByElements).toEqual([host])
    host.remove()
    await settle()
    expect((inner as unknown as { ariaDescribedByElements: Element[] | null }).ariaDescribedByElements).toBeNull()
  })

  it("keyboard walkthrough:  Tab through two tooltip targets, each announces its own popup", async () => {
    const { wrapper } = await popup(
      `<button>One</button><ui-popup content="First"></ui-popup><button>Two</button><ui-popup content="Second"></ui-popup>`
    )
    const [first, second] = wrapper.querySelectorAll("ui-popup")
    wrapper.querySelector("button")!.focus()
    await settle()
    expect([shown(first!), shown(second!)]).toEqual([true, false])
    await Keys.tab()
    await settle()
    expect([shown(first!), shown(second!)]).toEqual([false, true])
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await settle()
    await expectAccessible(root)
  })
})

////////////////
// ## Invoker commands
////////////////

describe("<ui-popup> invoker commands", () => {
  /** Whether this browser has native invoker commands (`commandfor`). */
  const NATIVE = "commandForElement" in HTMLButtonElement.prototype

  /** A manual popup at its own target, and buttons elsewhere that command it. */
  const MARKUP = `<button id="t">Target</button><ui-popup id="p" for="t" open-on="manual">Tip</ui-popup>
    <button id="show" commandfor="p" command="--show">Show</button>
    <button id="flip" commandfor="p" command="--toggle">Flip</button>
    <button id="hide" commandfor="p" command="--close">Hide</button>`

  /** Dispatch a plain `command` event at `host`, what the button's JS fallback dispatches. */
  function send(host: Element, command: string) {
    host.dispatchEvent(Object.assign(new Event("command", { cancelable: true }), { command }))
  }

  it.skipIf(!NATIVE)(
    "REAL clicks on --toggle flip a manual and a click popup (no outside-close + reopen)",
    async () => {
      for (const on of ["manual", "click"]) {
        // ids per pass:  the first pass's popup is still on the page, and `commandfor` finds the FIRST `id`
        const markup = MARKUP.replace('open-on="manual"', `open-on="${on}"`)
          .replaceAll('"p"', `"p-${on}"`)
          .replaceAll('id="flip"', `id="flip-${on}"`)
        const { host, wrapper } = await popup(markup)
        await userEvent.click(wrapper.querySelector(`#flip-${on}`)!)
        await settle()
        expect(shown(host), `${on}:  first toggle opens`).toBe(true)
        await userEvent.click(wrapper.querySelector(`#flip-${on}`)!)
        await settle()
        expect(shown(host), `${on}:  second toggle closes`).toBe(false)
      }
    }
  )

  it.skipIf(!NATIVE)(
    "native buttons:  --show opens it at ITS target, --toggle flips it, --close hides it",
    async () => {
      const { host, wrapper } = await popup(MARKUP)
      const press = (id: string) => wrapper.querySelector<HTMLButtonElement>(`#${id}`)!.click()
      const opens = record(host, "ui-open")
      const closes = record(host, "ui-close")
      press("show")
      await settle()
      expect(shown(host)).toBe(true)
      expect(opens).toHaveLength(1)
      // above the target (`top left`), not beside the button that sent the command
      const anchor = wrapper.querySelector<HTMLElement>("#t")!.getBoundingClientRect()
      expect(host.getBoundingClientRect().bottom).toBeLessThanOrEqual(anchor.top + 1)
      press("flip")
      await settle()
      expect(shown(host)).toBe(false)
      expect(closes).toHaveLength(1)
      press("flip")
      await settle()
      expect(shown(host)).toBe(true)
      press("hide")
      await settle()
      expect(shown(host)).toBe(false)
      expect(closes).toHaveLength(2)
    }
  )

  it.skipIf(!NATIVE)("a vetoed ui-open keeps it hidden", async () => {
    const { host, wrapper } = await popup(MARKUP)
    host.addEventListener("ui-open", (event) => event.preventDefault())
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await settle()
    expect(shown(host)).toBe(false)
  })

  it("the `Invoker.run()` fallback of a <ui-button> (no native invokers) reaches it too", async () => {
    const supports = UI.browser.supports
    const was = supports.invokers
    supports.invokers = false
    try {
      const { host, wrapper } = await popup(
        `<button id="t">Target</button><ui-popup id="p" for="t" open-on="manual">Tip</ui-popup>
         <ui-button id="flip" commandfor="p" command="--toggle">Flip</ui-button>`
      )
      const flip = wrapper.querySelector<HTMLElement>("#flip")!.shadowRoot!.querySelector<HTMLButtonElement>("button")!
      flip.click()
      await settle()
      expect(shown(host)).toBe(true)
      flip.click()
      await settle()
      expect(shown(host)).toBe(false)
    } finally {
      supports.invokers = was
    }
  })

  it("answers a plain `command` event, and ignores unknown commands", async () => {
    const { host } = await popup(MARKUP)
    send(host, "--bogus")
    await settle()
    expect(shown(host)).toBe(false)
    send(host, "--show")
    await settle()
    expect(shown(host)).toBe(true)
    send(host, "--toggle")
    await settle()
    expect(shown(host)).toBe(false)
  })
})
