import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { ModalCloseDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-flyout"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-flyout/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A flyout DOM element with its properties. */
type Flyout = DOMElement & { visible: boolean; closedBy: string; position: string }

/** Render a flyout (after a trigger button);  returns the DOM element, its dialog and the trigger. */
async function flyout(html: string) {
  const wrapper = await ElementFixture.render(`<div><button id="trigger">Open</button>${html}</div>`)
  const host = wrapper.querySelector<Flyout>("ui-flyout")!
  const dialog = host.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!
  const trigger = wrapper.querySelector<HTMLButtonElement>("#trigger")!
  return { wrapper, host, dialog, trigger }
}

/** Open `host` from `trigger` (so focus has somewhere to return), and wait for `ui-show`. */
async function open(host: Flyout, trigger?: HTMLElement) {
  trigger?.focus()
  const shown = next(host, "ui-show")
  host.visible = true
  await settle()
  await shown
}

/** Hide `host`, and wait for `ui-hide`. */
async function close(host: Flyout) {
  const hidden = next(host, "ui-hide")
  host.visible = false
  await hidden
  await settle()
}

/** Collect `detail`s of `name` events. */
function record<T = ModalCloseDetail>(target: EventTarget, name: string) {
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
  // speeds the slide up (the dialog's alias reads the page's `::part` value)
  Fixture.render(`<style>ui-flyout::part(flyout) { --ui-flyout-duration: 1ms }</style>`)
})

afterEach(() => {
  for (const host of document.querySelectorAll<Flyout>("ui-flyout")) host.visible = false
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-flyout> tokens from outside", () => {
  /** The dialog's width. */
  function width(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("dialog")!).width
  }

  /** The inner box of the first `<ui-header>` in `root`. */
  function header(root: Element): Element {
    return root.querySelector("ui-header")!.shadowRoot!.firstElementChild!
  }

  it("takes a token set on the DOM element", async () => {
    const { host } = await flyout(`<ui-flyout style="--ui-flyout-width: 321px">x</ui-flyout>`)
    expect(width(host)).toBe("321px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const { host } = await flyout(`<section style="--ui-flyout-width: 321px"><ui-flyout>x</ui-flyout></section>`)
    expect(width(host)).toBe("321px")
  })

  it("takes a token set through `::part(flyout)`", async () => {
    const { host } = await flyout(
      `<style>.themed::part(flyout) { --ui-flyout-width: 321px }</style><ui-flyout class="themed">x</ui-flyout>`
    )
    expect(width(host)).toBe("321px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-flyout-width", "321px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-flyout-width")
    })
    const { host } = await flyout(`<ui-flyout>x</ui-flyout>`)
    expect(width(host)).toBe("321px")
  })

  it("a `width` swaps it", async () => {
    const { host } = await flyout(`<ui-flyout width="thin" style="--ui-flyout-width: 321px">x</ui-flyout>`)
    expect(width(host)).toBe("200px")
  })

  it("owner tokens:  a part look token set on the flyout or above it reaches a slotted header;  `inverted` swaps it", async () => {
    const red = "rgb(255, 0, 0)"
    const { wrapper: onFlyout } = await flyout(
      `<ui-flyout style="--ui-flyout-header-color: ${red}"><ui-header>H</ui-header></ui-flyout>`
    )
    expect(getComputedStyle(header(onFlyout)).color).toBe(red)
    const { wrapper: above } = await flyout(
      `<section style="--ui-flyout-header-color: ${red}"><ui-flyout><ui-header>H</ui-header></ui-flyout></section>`
    )
    expect(getComputedStyle(header(above)).color).toBe(red)
    const { wrapper: inverted } = await flyout(
      `<ui-flyout inverted style="--ui-flyout-header-color: ${red}"><ui-header>H</ui-header></ui-flyout>`
    )
    expect(getComputedStyle(header(inverted)).color).not.toBe(red)
  })
})

////////////////
// ## Classes
////////////////

describe("<ui-flyout> classes", () => {
  it.each([
    ["", "ui left flyout"],
    ['position="right"', "ui right flyout"],
    ["inverted fullscreen", "ui left fullscreen inverted flyout"],
    ['width="4"', "ui left four wide flyout"],
    ['width="1/2"', "ui left eight wide flyout"],
    ['width="thin"', "ui left thin flyout"],
    ['width="very-wide"', "ui left very wide flyout"],
    ['position="bottom" blurring', "ui bottom blurring flyout"]
  ])("<ui-flyout %s>", async (attributes, classes) => {
    const { dialog } = await flyout(`<ui-flyout ${attributes}>x</ui-flyout>`)
    expect(dialog.className).toBe(classes)
  })

  it("adds `visible` while visible, and :state(hidden) once hidden", async () => {
    const { host, dialog } = await flyout(`<ui-flyout>x</ui-flyout>`)
    await open(host)
    expect(dialog.className).toBe("ui left visible flyout")
    expect(host.matches(":state(hidden)")).toBe(false)
    await close(host)
    expect(host.matches(":state(hidden)")).toBe(true)
  })

  it("renders the shared dialog contract:  header, content, slot, close icon (last)", async () => {
    const { dialog } = await flyout(`<ui-flyout header="Title" content="Body" closable>x</ui-flyout>`)
    expect([...dialog.children].map((child) => `${child.localName}.${child.getAttribute("part")}`)).toEqual([
      "div.header",
      "div.content",
      "slot.null",
      "button.close"
    ])
    expect(dialog.getAttribute("part")).toBe("flyout")
  })
})

////////////////
// ## Layout
////////////////

describe("<ui-flyout> layout", () => {
  it("slides in from its edge, full height;  widths by word and column", async () => {
    const { host, dialog } = await flyout(`<ui-flyout position="right" header="Hi">x</ui-flyout>`)
    await open(host)
    const rect = dialog.getBoundingClientRect()
    expect(Math.round(rect.right)).toBe(document.documentElement.clientWidth)
    expect(Math.round(rect.height)).toBe(innerHeight)
    expect(rect.width).toBe(400)
    host.setAttribute("width", "thin")
    await settle()
    expect(dialog.getBoundingClientRect().width).toBe(200)
    host.setAttribute("width", "8")
    await settle()
    expect(Math.round(dialog.getBoundingClientRect().width)).toBe(Math.round(innerWidth / 2))
  })

  it("top / bottom:  full width, as tall as the content", async () => {
    const { host, dialog } = await flyout(`<ui-flyout position="bottom" content="Body"></ui-flyout>`)
    await open(host)
    const rect = dialog.getBoundingClientRect()
    expect(Math.round(rect.bottom)).toBe(innerHeight)
    expect(rect.height).toBeLessThan(innerHeight / 2)
    expect(Math.round(rect.width)).toBe(document.documentElement.clientWidth)
  })

  it("starts off-screen and slides (a transform transition)", async () => {
    Fixture.render(`<style>ui-flyout.slow::part(flyout) { --ui-flyout-duration: 300ms }</style>`)
    const { host, dialog } = await flyout(`<ui-flyout class="slow">x</ui-flyout>`)
    host.visible = true
    await settle()
    const transitions = dialog.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty)
    expect(transitions).toContain("transform")
  })

  it("owns slotted parts:  :state(in-flyout);  the content grows so actions sit at the bottom", async () => {
    const { host, dialog } = await flyout(
      `<ui-flyout><ui-header>H</ui-header><ui-content>Body</ui-content><ui-actions>A</ui-actions></ui-flyout>`
    )
    await open(host)
    for (const tag of ["ui-header", "ui-content", "ui-actions"]) {
      expect(host.querySelector(tag)!.matches(":state(in-flyout)"), tag).toBe(true)
    }
    const actions = host.querySelector("ui-actions")!.shadowRoot!.firstElementChild!
    expect(Math.round(actions.getBoundingClientRect().bottom)).toBe(Math.round(dialog.getBoundingClientRect().bottom))
  })
})

////////////////
// ## Behaviour (DialogComponent)
////////////////

describe("<ui-flyout> behaviour (DialogComponent)", () => {
  it("`open` shows it with showModal():  top layer, scroll lock;  ui-show then ui-hide", async () => {
    const { host, dialog } = await flyout(`<ui-flyout header="Hi">x</ui-flyout>`)
    const shows = record(host, "ui-show")
    await open(host)
    expect(dialog.matches(":modal")).toBe(true)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(true)
    expect(shows).toEqual([{ visible: true }])
    const hidden = next(host, "ui-hide")
    host.visible = false
    await settle()
    await hidden
    expect(dialog.open).toBe(false)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(false)
  })

  it("a click on the dimmer closes it (reason `outside`);  one inside doesn't", async () => {
    const { host, dialog } = await flyout(`<ui-flyout header="Hi" content="Body"></ui-flyout>`)
    const closes = record(host, "ui-close")
    await open(host)
    await userEvent.click(dialog.querySelector(".content")!)
    await settle()
    expect(dialog.open).toBe(true)
    await userEvent.click(document.body, { position: { x: innerWidth - 5, y: 5 } })
    await settle()
    expect(dialog.open).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["outside"])
  })

  it("approve:  a cancelable ui-approve, then closes;  the close icon closes (reason `close`)", async () => {
    const { host, dialog } = await flyout(
      `<ui-flyout header="Sure?" content="Body" closable><ui-actions><ui-button class="approve">Yes</ui-button>` +
        `</ui-actions></ui-flyout>`
    )
    const closes = record(host, "ui-close")
    const approves = record(host, "ui-approve")
    await open(host)
    await userEvent.click(host.querySelector(".approve")!)
    await settle()
    expect(approves).toHaveLength(1)
    expect(dialog.open).toBe(false)
    await open(host)
    await userEvent.click(dialog.querySelector("[part~=close]")!)
    await settle()
    expect(closes.map((detail) => detail.reason)).toEqual(["approve", "close"])
  })

  it("closedby=none ignores Escape and the dimmer", async () => {
    const { host, dialog } = await flyout(`<ui-flyout closedby="none" content="Body"></ui-flyout>`)
    await open(host)
    await userEvent.keyboard("{Escape}")
    await userEvent.click(document.body, { position: { x: innerWidth - 5, y: 5 } })
    await settle()
    expect(dialog.open).toBe(true)
  })

  it("keyboard walkthrough:  --show opens, focus starts inside, the page is out of reach, Escape returns it", async () => {
    const { host, dialog, wrapper } = await flyout(
      `<ui-flyout id="f" header="Walk" closable><ui-actions><ui-button class="deny">No</ui-button>` +
        `<ui-button class="approve">Yes</ui-button></ui-actions></ui-flyout>`
    )
    wrapper.insertAdjacentHTML("afterbegin", `<button id="show" commandfor="f" command="--show">Show</button>`)
    const show = wrapper.querySelector<HTMLButtonElement>("#show")!
    const opens = record(host, "ui-open")
    show.focus()
    const shown = next(host, "ui-show")
    await userEvent.keyboard("{Enter}")
    await settle()
    await shown
    expect(opens).toHaveLength(1)
    expect(UI.focus.containsDeep(host.querySelector(".deny")!, UI.focus.activeElementDeep()), "initial").toBe(true)
    await Keys.tab()
    await Keys.tab()
    expect(UI.focus.activeElementDeep()).toBe(dialog.querySelector("[part~=close]"))
    // past the last, the page behind stays out of reach (`inert`);  only the browser's own UI is next
    await Keys.tab()
    const active = UI.focus.activeElementDeep()
    expect(active === show || active === wrapper.querySelector("#trigger"), "page reached").toBe(false)
    await Keys.tab(true)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(show)
  })

  it("with CloseWatcher (the browser's close requests), Escape closes one opened by a click", async () => {
    UI.overlays.useCloseWatcher = true
    const { host, dialog, wrapper } = await flyout(`<ui-flyout id="f" header="Hi">x</ui-flyout>`)
    wrapper.insertAdjacentHTML("afterbegin", `<button id="show" commandfor="f" command="--show">Show</button>`)
    const closes = record(host, "ui-close")
    const shown = next(host, "ui-show")
    await userEvent.click(wrapper.querySelector("#show")!)
    await shown
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(closes.map((detail) => detail.reason)).toEqual(["escape"])
    expect(dialog.open).toBe(false)
  })

  it("is named by its header shorthand or aria-label", async () => {
    const { dialog } = await flyout(`<ui-flyout header="Title">x</ui-flyout>`)
    const id = dialog.getAttribute("aria-labelledby")!
    expect(dialog.querySelector(`#${id}`)!.textContent).toBe("Title")
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s, with each flyout open", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
    for (const host of root.querySelectorAll<Flyout>("ui-flyout")) {
      await open(host)
      await expectAccessible(host)
      host.visible = false
      await settle()
    }
  })
})
