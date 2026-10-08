import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { page, userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import { PartOwnerTokens, type ModalCloseDetail } from "$/ui/components/components.types"
import { A11y, expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-modal"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-modal/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A modal DOM element with its properties. */
type Modal = DOMElement & { open: boolean; closedBy: string }

/** Render a modal (with a trigger button before it);  returns the DOM element, its dialog and the trigger. */
async function modal(html: string) {
  const wrapper = await ElementFixture.render(`<div><button id="trigger">Open</button>${html}</div>`)
  const host = wrapper.querySelector<Modal>("ui-modal")!
  const dialog = host.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!
  const trigger = wrapper.querySelector<HTMLButtonElement>("#trigger")!
  return { wrapper, host, dialog, trigger }
}

/** Open `host` from its trigger (so focus has somewhere to return), and wait for `ui-show`. */
async function open(host: Modal, trigger?: HTMLElement) {
  trigger?.focus()
  const shown = next(host, "ui-show")
  host.open = true
  await settle()
  await shown
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

/** Let the element catch up with events. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/** This test's `fast()` rule, which a test may remove to see the real transition. */
let speedUp: HTMLElement

/** Speeds the transitions up (the dialog's alias reads the page's `::part` value), for this test. */
function fast() {
  const style = Fixture.render(`<style>ui-modal::part(modal) { --ui-modal-duration: 1ms }</style>`)
  return style
}

beforeEach(async () => {
  await UI.load()
  // Escape through a keyboard binding rather than `CloseWatcher`, so every test can press it
  UI.overlays.useCloseWatcher = false
  speedUp = fast()
})

afterEach(() => {
  for (const dialog of document.querySelectorAll("ui-modal")) (dialog as Modal).open = false
})

////////////////
// ## Classes
////////////////

describe("<ui-modal> classes", () => {
  it.each([
    ["", "ui modal"],
    ['size="tiny"', "ui tiny modal"],
    ['size="medium"', "ui modal"],
    ["basic", "ui basic modal"],
    ["overlay fullscreen", "ui fullscreen overlay modal"],
    ["inverted scrolling", "ui inverted scrolling modal"],
    ['vertical-align="top"', "ui top aligned modal"],
    ['vertical-align="middle"', "ui modal"]
  ])("<ui-modal %s>", async (attributes, classes) => {
    const { dialog } = await modal(`<ui-modal ${attributes}>x</ui-modal>`)
    expect(dialog.className).toBe(classes)
  })

  it("adds `active` and :state(open) while open", async () => {
    const { host, dialog } = await modal(`<ui-modal>x</ui-modal>`)
    await open(host)
    expect(dialog.className).toBe("ui active modal")
    expect(host.matches(":state(open)")).toBe(true)
  })
})

////////////////
// ## Content
////////////////

describe("<ui-modal> content", () => {
  it("renders in contract order:  header, content, slot, close icon (last)", async () => {
    const { dialog } = await modal(`<ui-modal header="Title" content="Body" closable>x</ui-modal>`)
    expect([...dialog.children].map((child) => `${child.localName}.${child.getAttribute("part")}`)).toEqual([
      "div.header",
      "div.content",
      "slot.null",
      "button.close"
    ])
    const close = dialog.querySelector("button")!
    expect(close.className).toBe("close icon")
    expect(close.getAttribute("aria-label")).toBe("Close")
    await expect.poll(() => close.querySelector("svg")).not.toBeNull()
  })

  it("renders no header, content or close icon unless asked", async () => {
    const { dialog } = await modal(`<ui-modal>x</ui-modal>`)
    expect([...dialog.children].map((child) => child.localName)).toEqual(["slot"])
  })

  it("owns slotted parts:  :state(in-modal), and the owner tokens they read", async () => {
    const { host, dialog } = await modal(
      `<ui-modal basic size="large"><ui-header>H</ui-header><ui-content><ui-description>D</ui-description>` +
        `</ui-content><ui-actions>A</ui-actions></ui-modal>`
    )
    for (const tag of ["ui-header", "ui-content", "ui-actions"]) {
      expect(host.querySelector(tag)!.matches(":state(in-modal)"), tag).toBe(true)
    }
    const style = getComputedStyle(dialog)
    expect(style.getPropertyValue(PartOwnerTokens.modalBasic).trim()).toBe("1")
    expect(style.getPropertyValue(PartOwnerTokens.modalHeaderSize).trim()).toBe("1.6em")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-modal> tokens from outside", () => {
  /** The dialog's top-left radius. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("dialog")!).borderTopLeftRadius
  }

  /** The inner box of the first `<ui-header>` in `root`. */
  function header(root: Element): Element {
    return root.querySelector("ui-header")!.shadowRoot!.firstElementChild!
  }

  it("takes a token set on the DOM element", async () => {
    const { host } = await modal(`<ui-modal style="--ui-modal-radius: 20px">x</ui-modal>`)
    expect(radius(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const { host } = await modal(`<section style="--ui-modal-radius: 20px"><ui-modal>x</ui-modal></section>`)
    expect(radius(host)).toBe("20px")
  })

  it("takes a token set through `::part(modal)`", async () => {
    const { host } = await modal(
      `<style>.themed::part(modal) { --ui-modal-radius: 20px }</style><ui-modal class="themed">x</ui-modal>`
    )
    expect(radius(host)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-modal-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-modal-radius")
    })
    const { host } = await modal(`<ui-modal>x</ui-modal>`)
    expect(radius(host)).toBe("20px")
  })

  it("a page width holds on every screen;  `fullscreen` swaps it", async () => {
    const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
    await page.viewport(1300, 800)
    onTestFinished(() => page.viewport(previousWidth, previousHeight))
    const { host } = await modal(`<ui-modal style="--ui-modal-width: 300px">x</ui-modal>`)
    expect(getComputedStyle(host.shadowRoot!.querySelector("dialog")!).width).toBe("300px")
    const { host: full } = await modal(`<ui-modal fullscreen style="--ui-modal-width: 300px">x</ui-modal>`)
    expect(getComputedStyle(full.shadowRoot!.querySelector("dialog")!).width).not.toBe("300px")
  })

  it("owner tokens:  a part look token set on the modal or above it reaches a slotted header;  `basic` swaps it", async () => {
    const red = "rgb(255, 0, 0)"
    const { wrapper: onModal } = await modal(
      `<ui-modal style="--ui-modal-header-color: ${red}"><ui-header>H</ui-header></ui-modal>`
    )
    expect(getComputedStyle(header(onModal)).color).toBe(red)
    const { wrapper: above } = await modal(
      `<section style="--ui-modal-header-color: ${red}"><ui-modal><ui-header>H</ui-header></ui-modal></section>`
    )
    expect(getComputedStyle(header(above)).color).toBe(red)
    const { wrapper: basic } = await modal(
      `<ui-modal basic style="--ui-modal-header-color: ${red}"><ui-header>H</ui-header></ui-modal>`
    )
    expect(getComputedStyle(header(basic)).color).not.toBe(red)
  })
})

////////////////
// ## Open / close
////////////////

describe("<ui-modal> open / close", () => {
  it("`open` shows it with showModal():  top layer, inert page, scroll lock;  ui-show, then ui-hide", async () => {
    const { host, dialog } = await modal(`<ui-modal header="Hi">x</ui-modal>`)
    const opens = record(host, "ui-open")
    const shows = record(host, "ui-show")
    await open(host)
    expect(dialog.open).toBe(true)
    expect(dialog.matches(":modal")).toBe(true)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(true)
    expect(opens).toHaveLength(0)
    expect(shows).toEqual([{ open: true }])
    const hidden = next(host, "ui-hide")
    host.open = false
    await settle()
    expect(dialog.open).toBe(false)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(false)
    expect(((await hidden) as CustomEvent).detail).toEqual({ open: false })
  })

  it("waits for the transition before ui-show / ui-hide", async () => {
    speedUp.remove()
    const { host, dialog } = await modal(`<ui-modal>x</ui-modal>`)
    const shows = record(host, "ui-show")
    host.open = true
    await settle()
    expect(dialog.getAnimations().length).toBeGreaterThan(0)
    expect(shows).toHaveLength(0)
    await expect.poll(() => shows.length, { timeout: 2000 }).toBe(1)
  })

  it("an invoker command (`--show`) opens it as a user action:  a cancelable ui-open", async () => {
    const { host, dialog, wrapper } = await modal(`<ui-modal id="m">x</ui-modal>`)
    wrapper.insertAdjacentHTML("afterbegin", `<button id="show" commandfor="m" command="--show">Show</button>`)
    const opens = record(host, "ui-open")
    let veto = true
    host.addEventListener("ui-open", (event) => veto && event.preventDefault())
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await settle()
    expect(opens).toHaveLength(1)
    expect(dialog.open).toBe(false)
    veto = false
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await settle()
    expect(dialog.open).toBe(true)
    expect(host.open).toBe(true)
  })

  it("Escape closes it (reason `escape`), and focus returns to the trigger", async () => {
    const { host, dialog, trigger } = await modal(`<ui-modal header="Hi"><button>Inside</button></ui-modal>`)
    const closes = record(host, "ui-close")
    await open(host, trigger)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(false)
    expect(closes).toHaveLength(1)
    expect(closes[0]!.reason).toBe("escape")
    expect(document.activeElement).toBe(trigger)
  })

  it("a vetoed ui-close keeps it open", async () => {
    const { host, dialog } = await modal(`<ui-modal><button>Inside</button></ui-modal>`)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    await open(host)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(true)
    expect(host.open).toBe(true)
  })

  it("with CloseWatcher (the browser's close requests), a vetoed Escape still keeps it open", async () => {
    UI.overlays.useCloseWatcher = true
    const { host, dialog, wrapper } = await modal(`<ui-modal id="m"><button>Inside</button></ui-modal>`)
    wrapper.insertAdjacentHTML("afterbegin", `<button id="show" commandfor="m" command="--show">Show</button>`)
    const closes = record(host, "ui-close")
    host.addEventListener("ui-close", (event) => event.preventDefault())
    const shown = next(host, "ui-show")
    await userEvent.click(wrapper.querySelector("#show")!)
    await shown
    await userEvent.keyboard("{Escape}")
    await settle()
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(closes.map((detail) => detail.reason)).toEqual(["escape", "escape"])
    expect(dialog.open).toBe(true)
  })

  it("a click on the dimmer closes it (reason `outside`);  one inside doesn't", async () => {
    const { host, dialog } = await modal(`<ui-modal size="mini" header="Hi" content="Body"></ui-modal>`)
    const closes = record(host, "ui-close")
    await open(host)
    await userEvent.click(dialog.querySelector(".content")!)
    await settle()
    expect(dialog.open).toBe(true)
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(dialog.open).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["outside"])
  })

  it("closedby=closerequest ignores the dimmer;  closedby=none ignores Escape too", async () => {
    const { host, dialog } = await modal(`<ui-modal size="mini" closedby="closerequest" content="Body"></ui-modal>`)
    expect(host.closedBy).toBe("closerequest")
    await open(host)
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(dialog.open).toBe(true)
    host.open = false
    await settle()
    host.closedBy = "none"
    await open(host)
    expect(dialog.getAttribute("closedby")).toBe("none")
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(true)
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(dialog.open).toBe(true)
  })

  it('closable="false" (Fomantic\'s `closable: false`):  no icon, and Escape and the dimmer do nothing', async () => {
    const { host, dialog } = await modal(`<ui-modal size="mini" closable="false" content="Body"></ui-modal>`)
    await open(host)
    expect(dialog.querySelector("[part~=close]")).toBeNull()
    expect(dialog.getAttribute("closedby")).toBe("none")
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(true)
    await userEvent.click(document.body, { position: { x: 3, y: 3 } })
    await settle()
    expect(dialog.open).toBe(true)
  })

  it('closable="false" with an explicit `closedby`:  `closedby` wins for dismissal', async () => {
    const { host, dialog } = await modal(
      `<ui-modal closable="false" closedby="closerequest" content="Body"></ui-modal>`
    )
    await open(host)
    expect(dialog.getAttribute("closedby")).toBe("closerequest")
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(false)
  })

  it("`closable` present shows the icon and still dismisses by `closedby` (default any)", async () => {
    const { host, dialog } = await modal(`<ui-modal closable content="Body"></ui-modal>`)
    await open(host)
    expect(dialog.querySelector("[part~=close]")).not.toBeNull()
    expect(dialog.getAttribute("closedby")).toBe("any")
  })

  it("invoker commands:  `--toggle` opens a closed modal and closes an open one, as user actions", async () => {
    const { host, dialog, wrapper } = await modal(`<ui-modal id="m" content="Body"></ui-modal>`)
    wrapper.insertAdjacentHTML("afterbegin", `<button id="flip" commandfor="m" command="--toggle">Flip</button>`)
    const opens = record(host, "ui-open")
    const closes = record(host, "ui-close")
    const flip = wrapper.querySelector<HTMLButtonElement>("#flip")!
    flip.click()
    await settle()
    expect(dialog.open).toBe(true)
    expect(opens).toHaveLength(1)
    flip.click()
    await settle()
    expect(dialog.open).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["close"])
  })

  it("answers a plain `command` event (what the button's JS fallback dispatches)", async () => {
    const { host, dialog } = await modal(`<ui-modal id="m" content="Body"></ui-modal>`)
    send("--show")
    await settle()
    expect(dialog.open).toBe(true)
    send("--toggle")
    await settle()
    expect(dialog.open).toBe(false)
    send("--toggle")
    await settle()
    expect(dialog.open).toBe(true)
    send("--close")
    await settle()
    expect(dialog.open).toBe(false)

    /** Dispatch a plain cancelable `command` event carrying `command` at the DOM element. */
    function send(command: string) {
      const event = Object.assign(new Event("command", { cancelable: true }), { command })
      host.dispatchEvent(event)
    }
  })

  it("without native `closedby`, the overlay's outside click tells the dimmer from the dialog", async () => {
    const supports = UI.browser.supports
    const native = supports.dialogClosedBy
    supports.dialogClosedBy = false
    try {
      const { host, dialog } = await modal(`<ui-modal size="mini" content="Body"></ui-modal>`)
      const closes = record(host, "ui-close")
      await open(host)
      expect(dialog.hasAttribute("closedby")).toBe(false)
      await userEvent.click(dialog.querySelector(".content")!)
      await settle()
      expect(dialog.open).toBe(true)
      await userEvent.click(document.body, { position: { x: 3, y: 3 } })
      await settle()
      expect(dialog.open).toBe(false)
      expect(closes.map((detail) => detail.reason)).toEqual(["outside"])
    } finally {
      supports.dialogClosedBy = native
    }
  })

  it("the close icon closes it (reason `close`)", async () => {
    const { host, dialog } = await modal(`<ui-modal closable content="Body"></ui-modal>`)
    const closes = record(host, "ui-close")
    await open(host)
    await userEvent.click(dialog.querySelector("[part~=close]")!)
    await settle()
    expect(dialog.open).toBe(false)
    expect(closes.map((detail) => detail.reason)).toEqual(["close"])
  })

  it("removing it closes the dialog and releases the scroll lock", async () => {
    const { host, dialog } = await modal(`<ui-modal>x</ui-modal>`)
    await open(host)
    host.remove()
    await settle()
    expect(dialog.open).toBe(false)
    expect(document.documentElement.classList.contains("ui-scroll-locked")).toBe(false)
  })

  it("stacks:  a second modal opens on top, and Escape closes only the top one", async () => {
    const { wrapper } = await modal(
      `<ui-modal id="a"><button>A</button></ui-modal><ui-modal id="b"><button>B</button></ui-modal>`
    )
    const [a, b] = wrapper.querySelectorAll<Modal>("ui-modal")
    await open(a!)
    await open(b!)
    await userEvent.keyboard("{Escape}")
    await settle()
    expect([a!.open, b!.open]).toEqual([true, false])
    await userEvent.keyboard("{Escape}")
    await settle()
    expect([a!.open, b!.open]).toEqual([false, false])
  })
})

////////////////
// ## Actions
////////////////

describe("<ui-modal> actions", () => {
  /** A modal with deny / approve buttons in its actions. */
  const ACTIONS =
    `<ui-modal header="Sure?"><ui-actions><ui-button class="deny">No</ui-button>` +
    `<ui-button positive>Yes</ui-button></ui-actions></ui-modal>`

  it("approve:  a cancelable ui-approve naming the button, then closes (reason `approve`)", async () => {
    const { host, dialog } = await modal(ACTIONS)
    const approves = record<{ action: Element }>(host, "ui-approve")
    const closes = record(host, "ui-close")
    await open(host)
    await userEvent.click(host.querySelector("[positive]")!)
    await settle()
    expect(approves).toHaveLength(1)
    expect(approves[0]!.action).toBe(host.querySelector("[positive]"))
    expect(closes.map((detail) => detail.reason)).toEqual(["approve"])
    expect(dialog.open).toBe(false)
  })

  it("deny:  ui-deny, then closes;  a vetoed one keeps it open", async () => {
    const { host, dialog } = await modal(ACTIONS)
    const denies = record(host, "ui-deny")
    let veto = true
    host.addEventListener("ui-deny", (event) => veto && event.preventDefault())
    await open(host)
    await userEvent.click(host.querySelector(".deny")!)
    await settle()
    expect(denies).toHaveLength(1)
    expect(dialog.open).toBe(true)
    veto = false
    await userEvent.click(host.querySelector(".deny")!)
    await settle()
    expect(dialog.open).toBe(false)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-modal> accessibility", () => {
  it("is named by its header shorthand, a slotted <ui-header>, or the DOM element's aria-label", async () => {
    const { dialog: shorthand } = await modal(`<ui-modal header="Title">x</ui-modal>`)
    const id = shorthand.getAttribute("aria-labelledby")!
    expect(shorthand.querySelector(`#${id}`)!.textContent).toBe("Title")
    const { host, dialog } = await modal(`<ui-modal><ui-header>Slotted</ui-header></ui-modal>`)
    const reflected = dialog as unknown as { ariaLabelledByElements: Element[] | null }
    expect(reflected.ariaLabelledByElements).toEqual([host.querySelector("ui-header")])
    host.setAttribute("aria-label", "Named")
    await expect.poll(() => dialog.getAttribute("aria-label")).toBe("Named")
    expect(reflected.ariaLabelledByElements).toBeNull()
  })

  it("keyboard walkthrough:  Enter on the trigger opens, focus starts inside, Tab stays inside, Escape returns", async () => {
    const { host, dialog, wrapper } = await modal(
      `<ui-modal id="m" header="Walk" closable><ui-actions><ui-button class="deny">No</ui-button>` +
        `<ui-button class="approve">Yes</ui-button></ui-actions></ui-modal>`
    )
    wrapper.insertAdjacentHTML("afterbegin", `<button id="show" commandfor="m" command="--show">Show</button>`)
    const show = wrapper.querySelector<HTMLButtonElement>("#show")!
    show.focus()
    const shown = next(host, "ui-show")
    await userEvent.keyboard("{Enter}")
    await settle()
    await shown
    expect(dialog.open).toBe(true)
    const deny = host.querySelector(".deny")!
    expect(UI.focus.containsDeep(deny, UI.focus.activeElementDeep())).toBe(true)
    await Keys.tab()
    expect(UI.focus.containsDeep(host.querySelector(".approve")!, UI.focus.activeElementDeep())).toBe(true)
    await Keys.tab()
    expect(UI.focus.activeElementDeep()).toBe(dialog.querySelector("[part~=close]"))
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(show)
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s, with each modal open", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
    for (const host of root.querySelectorAll<Modal>("ui-modal")) {
      await open(host)
      if (host.hasAttribute("basic")) {
        // A basic modal has no box:  its light text sits on the dimmer, the dialog's `::backdrop`,
        // which axe ignores (it measures against the white page).  Check that pairing by hand instead.
        await expectAccessible(host, { rules: { "color-contrast": { enabled: false } } })
        const dialog = host.shadowRoot!.querySelector("dialog")!
        const backdrop = getComputedStyle(dialog, "::backdrop").backgroundColor
        const page = getComputedStyle(document.body).backgroundColor
        expect(A11y.contrast(getComputedStyle(dialog).color, [page, backdrop])).toBeGreaterThanOrEqual(4.5)
      } else {
        await expectAccessible(host)
      }
      host.open = false
      await settle()
    }
  })
})

////////////////
// ## `UI.modals`
////////////////

describe("UI.modals", () => {
  /** The dialog `UI.modals` put in the body. */
  async function current() {
    await expect.poll(() => document.querySelector<Modal>("body > ui-modal")?.open).toBe(true)
    const host = document.querySelector<Modal>("body > ui-modal")!
    await ElementFixture.settle(host)
    return host
  }

  it("confirm():  true on approve, false on deny or Escape;  removed once hidden", async () => {
    const approved = UI.modals.confirm({ title: "Delete?", message: "It can't be undone." })
    let host = await current()
    expect(host.getAttribute("header")).toBe("Delete?")
    expect(host.querySelector("p")!.textContent).toBe("It can't be undone.")
    expect([...host.querySelectorAll("ui-button")].map((button) => button.textContent)).toEqual(["Cancel", "OK"])
    host.querySelector<HTMLElement>(".approve")!.click()
    expect(await approved).toBe(true)
    expect(host.isConnected).toBe(false)
    const denied = UI.modals.confirm("Sure?")
    host = await current()
    host.querySelector<HTMLElement>(".cancel")!.click()
    expect(await denied).toBe(false)
    const escaped = UI.modals.confirm("Sure?")
    host = await current()
    await userEvent.keyboard("{Escape}")
    expect(await escaped).toBe(false)
  })

  it("confirm() focuses the least destructive choice, Cancel", async () => {
    const answer = UI.modals.confirm("Sure?")
    const host = await current()
    await expect
      .poll(() => UI.focus.containsDeep(host.querySelector(".cancel")!, UI.focus.activeElementDeep()))
      .toBe(true)
    await userEvent.keyboard("{Escape}")
    await answer
  })

  it("alert():  one OK button;  resolves when acknowledged", async () => {
    const done = UI.modals.alert({ message: "Saved", okText: "Got it" })
    const host = await current()
    expect([...host.querySelectorAll("ui-button")].map((button) => button.textContent)).toEqual(["Got it"])
    expect(host.getAttribute("aria-label")).toBe("Saved")
    host.querySelector<HTMLElement>(".approve")!.click()
    expect(await done).toBeUndefined()
  })

  it("prompt():  the typed text on OK (or Enter), undefined on Cancel", async () => {
    const typed = UI.modals.prompt({ message: "Your name", value: "Ann" })
    let host = await current()
    const input = host.querySelector("input")!
    expect(input.value).toBe("Ann")
    expect(input.labels![0]!.textContent).toBe("Your name")
    await expect.poll(() => document.activeElement).toBe(input)
    await userEvent.keyboard("{End}e{Enter}")
    expect(await typed).toBe("Anne")
    const cancelled = UI.modals.prompt("Your name")
    host = await current()
    host.querySelector<HTMLElement>(".cancel")!.click()
    expect(await cancelled).toBeUndefined()
  })

  it("uses the translated ok / cancel texts", async () => {
    UI.i18n.register("fr", { ok: "D'accord", cancel: "Annuler" })
    const locale = UI.i18n.locale
    UI.i18n.locale = "fr"
    try {
      const answer = UI.modals.confirm("Sûr ?")
      const host = await current()
      expect([...host.querySelectorAll("ui-button")].map((button) => button.textContent)).toEqual([
        "Annuler",
        "D'accord"
      ])
      host.querySelector<HTMLElement>(".cancel")!.click()
      await answer
    } finally {
      UI.i18n.locale = locale
    }
  })
})
