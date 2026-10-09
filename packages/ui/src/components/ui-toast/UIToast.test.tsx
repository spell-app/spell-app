import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { page, userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { ToastActionDetail, ToastCloseDetail, ToastShowDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"
import { Viewport } from "$/ui/test/Viewport"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-toast"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-toast/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A toast DOM element with its script API. */
type Toast = DOMElement & { close(): boolean }

/** Render one `<ui-toast>`;  returns it with its box and toast root. */
async function toast(html: string) {
  const host = await ElementFixture.render<Toast>(html)
  const box = host.shadowRoot!.querySelector<HTMLElement>("[part~=box]")!
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=toast]")!
  return { host, box, root }
}

/** Resolves with the next `name` event's detail. */
function next<T>(target: EventTarget, name: string) {
  return new Promise<T>((resolve) =>
    target.addEventListener(name, (event) => resolve((event as CustomEvent<T>).detail), { once: true })
  )
}

/** Collect `detail`s of `name` events. */
function record<T = ToastCloseDetail>(target: EventTarget, name: string) {
  const details: T[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<T>).detail))
  return details
}

/**
 * Fake the countdown's clock -- `setTimeout` and `performance.now()` -- for one test;  animations stay real.
 * - Move it with `vi.advanceTimersByTimeAsync(ms)`.
 */
function fakeClock() {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
  onTestFinished(() => void vi.useRealTimers())
}

/**
 * Let the box's entry / exit animation (1ms here) end, and its handlers run:  by then, a close that started has
 * hidden the toast.  For checks that something did NOT happen.
 */
async function animationsDone(host: Element) {
  await UI.transitions.whenTransitionEnds(host.shadowRoot!.querySelector("[part~=box]")!)
  await Viewport.frame()
  await ElementFixture.tick()
}

/** Part names of `root`'s children, in order. */
function partsOf(root: Element) {
  return [...root.children].map((child) => `${child.localName}.${child.getAttribute("part")}`)
}

/** `element`'s attributes, by name. */
function attributesOf(element: Element): Record<string, string> {
  return Object.fromEntries([...element.attributes].map(({ name, value }) => [name, value]))
}

/** A time no countdown here comes near. */
const LONG_AFTER = 60_000

beforeEach(async () => {
  await UI.load()
  // entry / exit animations in 1ms:  the box's alias reads the page's `::part` value
  Fixture.render(`<style>ui-toast::part(box) { --ui-toast-duration: 1ms }</style>`)
})

afterEach(() => {
  UI.overlays.closeAll("toast")
  for (const container of document.querySelectorAll(".ui.toast-container")) container.remove()
})

////////////////
// ## Rendering
////////////////

describe("<ui-toast> definition", () => {
  it("registers its texts with UI.i18n when DEFINED", () => {
    expect(UI.i18n.t("close")).toBe("Close")
    expect(UI.i18n.t("notifications")).toBe("Notifications")
  })
})

describe("<ui-toast> classes", () => {
  it.each([
    ["", "ui compact toast"],
    ['type="success"', "ui success compact toast"],
    ['type="neutral"', "ui neutral compact toast"],
    ['color="teal" inverted', "ui teal inverted compact toast"],
    ['compact="false"', "ui toast"],
    ['type="error" compact="no"', "ui error toast"]
  ])("<ui-toast %s>", async (attributes, classes) => {
    const { root, box } = await toast(`<ui-toast ${attributes} message="Hi"></ui-toast>`)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
    expect(box.classList.contains("toast-box")).toBe(true)
  })

  it.each([
    ["", "ui actions compact toast"],
    ['actions="basic"', "ui compact toast"],
    ['actions="basic left"', "ui actions compact toast"],
    ['actions="vertical"', "ui vertical actions compact toast"],
    ['actions="attached"', "ui attached top compact toast"],
    ['actions="attached top"', "ui attached bottom compact toast"],
    ['actions="vertical attached"', "ui vertical attached compact toast"]
  ])("adds Fomantic's layout words for slotted actions:  %s", async (attributes, classes) => {
    const { root } = await toast(
      `<ui-toast ${attributes} message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`
    )
    expect(root.className).toBe(classes)
  })

  it("ignores action words with no actions slotted, and unknown words", async () => {
    const { root } = await toast(`<ui-toast actions="vertical sideways" message="Hi"></ui-toast>`)
    expect(root.className).toBe("ui compact toast")
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-toast> tokens from outside", () => {
  /** The toast's top-left radius. */
  function radius(root: Element): string {
    return getComputedStyle(root).borderTopLeftRadius
  }

  it("takes a token set on the DOM element", async () => {
    const { root } = await toast(`<ui-toast style="--ui-toast-radius: 20px" message="Hi"></ui-toast>`)
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-toast-radius: 20px"><ui-toast message="Hi"></ui-toast></section>`
    )
    expect(radius(wrapper.querySelector("ui-toast")!.shadowRoot!.querySelector("[part~=toast]")!)).toBe("20px")
  })

  it("takes a token set through `::part(box)`", async () => {
    Fixture.render(`<style>.themed::part(box) { --ui-toast-radius: 20px }</style>`)
    const { root } = await toast(`<ui-toast class="themed" message="Hi"></ui-toast>`)
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-toast-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-toast-radius")
    })
    const { root } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    expect(radius(root)).toBe("20px")
  })

  it("`compact` (the default) follows the width token (off phones)", async () => {
    // Render first, THEN resize:  WebKit keeps a shared adopted sheet's media results stale when no element using it
    // is alive at the resize (see PAPERCUTS), so the toast must already be in the page
    const { root } = await toast(`<ui-toast style="--ui-toast-width: 200px" message="Hi"></ui-toast>`)
    const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
    await page.viewport(1000, 800)
    onTestFinished(() => page.viewport(previousWidth, previousHeight))
    await expect.poll(() => getComputedStyle(root).width).toBe("200px")
  })
})

////////////////
// ## Content
////////////////

describe("<ui-toast> content", () => {
  it("renders in contract order:  icon, content (header, message, slot), close", async () => {
    const { root, box } = await toast(
      `<ui-toast icon="bell" header="Title" message="Body" closable display-time="0">More</ui-toast>`
    )
    expect(partsOf(box)).toEqual(["div.toast"])
    expect(partsOf(root)).toEqual(["span.icon", "div.content", "button.close"])
    const content = root.querySelector("[part~=content]")!
    expect(partsOf(content)).toEqual(["div.header", "div.message", "slot.null"])
    expect(content.querySelector(".header")!.textContent).toBe("Title")
    expect(content.querySelector(".message")!.textContent).toBe("Body")
    await expect.poll(() => root.querySelector("[part~=icon] svg")).not.toBeNull()
    const close = root.querySelector("button")!
    expect(close.type).toBe("button")
    expect(close.className).toBe("close icon")
    expect(close.getAttribute("aria-label")).toBe("Close")
  })

  it("is a polite status, an alert for errors", async () => {
    const { root } = await toast(`<ui-toast message="Saved"></ui-toast>`)
    expect(root.getAttribute("role")).toBe("status")
    const { root: error } = await toast(`<ui-toast type="error" message="Failed"></ui-toast>`)
    expect(error.getAttribute("role")).toBe("alert")
  })

  it("shows the type's own icon for a bare `icon`, none without", async () => {
    const { root } = await toast(`<ui-toast type="success" icon message="Done"></ui-toast>`)
    await expect.poll(() => root.querySelector("[part~=icon] svg")).not.toBeNull()
    const { root: plain } = await toast(`<ui-toast type="success" message="Done"></ui-toast>`)
    expect(plain.querySelector("[part~=icon]")).toBeNull()
  })

  it('takes `icon="true"` / `"yes"` (what frameworks render for a bare `icon`) as the type\'s icon;  `"false"` as none', async () => {
    const asked: string[] = []
    const { icons } = await UI.load()
    const get = icons.get.bind(icons)
    icons.get = (name) => (asked.push(name), get(name))
    onTestFinished(() => void (icons.get = get))
    const { host, root } = await toast(`<ui-toast type="success" icon="true" message="Done"></ui-toast>`)
    await expect.poll(() => root.querySelector("[part~=icon] svg")).not.toBeNull()
    expect((host as DOMElement & { icon?: string }).icon).toBe("")
    const { root: yes } = await toast(`<ui-toast type="info" icon="yes" message="Info"></ui-toast>`)
    await expect.poll(() => yes.querySelector("[part~=icon] svg")).not.toBeNull()
    const { root: off } = await toast(`<ui-toast type="info" icon="false" message="Info"></ui-toast>`)
    expect(off.querySelector("[part~=icon]")).toBeNull()
    expect(asked).not.toContain("true")
    expect(asked).not.toContain("yes")
  })

  it("fills the toast from its type:  the colour and its contrast-picked text", async () => {
    const { root } = await toast(`<ui-toast type="info" message="Info"></ui-toast>`)
    const probe = Fixture.render(
      `<span class="ui info" style="background: var(--ui-color); color: var(--ui-color-on)">x</span>`
    )
    expect(getComputedStyle(root).backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
    expect(getComputedStyle(root).color).toBe(getComputedStyle(probe).color)
    const { root: neutral } = await toast(`<ui-toast message="Plain"></ui-toast>`)
    const surface = Fixture.render(`<span style="background: var(--ui-surface)">x</span>`)
    expect(getComputedStyle(neutral).backgroundColor).toBe(getComputedStyle(surface).backgroundColor)
  })

  it("puts slotted actions inside the toast, attached ones outside it", async () => {
    const { root, box } = await toast(`<ui-toast message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`)
    expect(root.querySelector<HTMLSlotElement>("[part~=actions] slot")!.name).toBe("actions")
    expect(box.querySelectorAll("slot[name=actions]")).toHaveLength(1)
    const { box: attached } = await toast(
      `<ui-toast actions="attached" message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`
    )
    expect(partsOf(attached)).toEqual(["div.toast", "div.actions"])
    expect(attached.querySelector(":scope > [part~=actions]")!.className).toBe("ui buttons attached actions")
    const { box: top } = await toast(
      `<ui-toast actions="attached top" message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`
    )
    expect(partsOf(top)).toEqual(["div.actions", "div.toast"])
    const { box: vertical } = await toast(
      `<ui-toast actions="vertical attached" message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`
    )
    const wrapper = vertical.firstElementChild!
    expect(wrapper.className).toBe("vertical attached compact")
    expect(partsOf(wrapper)).toEqual(["div.toast", "div.actions"])
  })

  it("renders the progress bar only with a display time", async () => {
    const { box } = await toast(`<ui-toast progress="top" message="Hi"></ui-toast>`)
    expect(box.querySelector("[part~=progress]")).toBeNull()
    const { box: timed } = await toast(`<ui-toast progress="top" display-time="5000" message="Hi"></ui-toast>`)
    expect(partsOf(timed)).toEqual(["div.progress", "div.toast"])
    const bar = timed.querySelector<HTMLElement>("[part~=bar]")!
    expect(timed.querySelector("[part~=progress]")!.className).toBe("ui attached active progress top")
    await expect.poll(() => bar.className).toBe("bar down progressing")
    expect(bar.style.animationDuration).toBe("5000ms")
    expect(bar.dataset.uiMotion).toBe("essential")
    const { box: bottom } = await toast(
      `<ui-toast progress="bottom" progress-up type="success" display-time="5000" message="Hi"></ui-toast>`
    )
    expect(partsOf(bottom)).toEqual(["div.toast", "div.progress"])
    await expect.poll(() => bottom.querySelector("[part~=bar]")!.className).toBe("bar up progressing")
  })
})

describe("<ui-toast> actions bar", () => {
  /** Render a toast with actions inside a `scheme` wrapper;  returns the toast root and its action bar. */
  async function withActions(scheme: "ui-light" | "ui-dark") {
    const wrapper = await ElementFixture.render(
      `<div class="${scheme}"><ui-toast header="Delete?" message="Really?">` +
        `<button slot="actions">Yes</button><button slot="actions">No</button></ui-toast></div>`
    )
    const root = wrapper.querySelector("ui-toast")!.shadowRoot!.querySelector<HTMLElement>("[part~=toast]")!
    return { root, bar: root.querySelector<HTMLElement>("[part~=actions]")! }
  }

  /** OKLCH lightness of a computed `oklch(...)` colour. */
  function lightness(color: string): number {
    return Number(/oklch\(([\d.]+)/.exec(color)?.[1])
  }

  it.each(["ui-light", "ui-dark"] as const)(
    "%s:  the bar ends at the toast's edges, not past its corners",
    async (scheme) => {
      const { root, bar } = await withActions(scheme)
      const outer = root.getBoundingClientRect()
      const inner = bar.getBoundingClientRect()
      expect(inner.bottom).toBeLessThanOrEqual(outer.bottom + 0.5)
      expect(inner.right).toBeLessThanOrEqual(outer.right + 0.5)
    }
  )

  it("dark:  the bar shades the toast instead of washing it grey", async () => {
    const { bar } = await withActions("ui-dark")
    expect(lightness(getComputedStyle(bar).backgroundColor)).toBeLessThan(0.5)
  })
})

////////////////
// ## Life and closing
////////////////

describe("<ui-toast> life", () => {
  // `pause-on-hover="false"` on the timer tests:  on CI (Linux) they never time out, perhaps because the test
  // pointer rests where toasts appear -- see `agents/SUSPECTED-BUGS.md`.  Hover pausing has its own tests, below.
  it("fires ui-show, then closes itself after display-time:  ui-close (timeout), hidden, ui-hide", async () => {
    const host = Fixture.render<Toast>(`<ui-toast display-time="80" pause-on-hover="false" message="Bye"></ui-toast>`)
    const shown = next<ToastShowDetail>(host, "ui-show")
    const closes = record(host, "ui-close")
    const hidden = next<ToastCloseDetail>(host, "ui-hide")
    expect((await shown).displayTime).toBe(80)
    expect(host.hidden).toBe(false)
    expect((await hidden).reason).toBe("timeout")
    expect(closes.map(({ reason }) => reason)).toEqual(["timeout"])
    expect(host.hidden).toBe(true)
    expect(host.isConnected).toBe(true)
  })

  it("stays without a display time", async () => {
    fakeClock()
    const { host } = await toast(`<ui-toast message="Stay"></ui-toast>`)
    await vi.advanceTimersByTimeAsync(LONG_AFTER)
    await animationsDone(host)
    expect(host.hidden).toBe(false)
  })

  it("stays when a handler cancels ui-close", async () => {
    fakeClock()
    const host = Fixture.render<Toast>(`<ui-toast display-time="40" pause-on-hover="false" message="Stay"></ui-toast>`)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    const closes = record(host, "ui-close")
    await host.ready
    await vi.advanceTimersByTimeAsync(40)
    await expect.poll(() => closes.length).toBe(1)
    await vi.advanceTimersByTimeAsync(LONG_AFTER)
    await animationsDone(host)
    expect(host.hidden).toBe(false)
  })

  it("`auto` display time reads the text:  at least a second", async () => {
    const { host } = await toast(`<ui-toast display-time="auto" message="Short"></ui-toast>`)
    const time = (host.component as unknown as { displayDuration: number }).displayDuration
    expect(time).toBe(1000)
    const words = Array.from({ length: 60 }, () => "word").join(" ")
    const { host: long } = await toast(`<ui-toast display-time="auto" message="${words}"></ui-toast>`)
    expect((long.component as unknown as { displayDuration: number }).displayDuration).toBe(30_000)
  })

  it("`auto` display time counts the message, NEVER the slotted actions' labels", async () => {
    const words = Array.from({ length: 60 }, () => "word").join(" ")
    const { host } = await toast(
      `<ui-toast display-time="auto" message="Short"><button slot="actions">${words}</button></ui-toast>`
    )
    expect((host.component as unknown as { displayDuration: number }).displayDuration).toBe(1000)
  })

  it("closes from script:  host.close(), reason dismiss", async () => {
    const { host } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    const hidden = next<ToastCloseDetail>(host, "ui-hide")
    expect(host.close()).toBe(true)
    expect((await hidden).reason).toBe("dismiss")
    expect(host.close()).toBe(false)
  })

  it("closes with every toast on UI.overlays.closeAll('toast')", async () => {
    const { host } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    const hidden = next<ToastCloseDetail>(host, "ui-hide")
    UI.overlays.closeAll("toast")
    expect((await hidden).reason).toBe("close-all")
  })

  it("never takes focus", async () => {
    const button = Fixture.render<HTMLButtonElement>(`<button>Keep me</button>`)
    button.focus()
    const { host } = await toast(`<ui-toast closable message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`)
    await animationsDone(host)
    expect(document.activeElement).toBe(button)
  })
})

describe("<ui-toast> pausing", () => {
  it("pauses while the pointer is over it, and resumes after", async () => {
    fakeClock()
    const host = Fixture.render<Toast>(`<ui-toast display-time="120" progress="bottom" message="Hover"></ui-toast>`)
    await next(host, "ui-show")
    host.dispatchEvent(new PointerEvent("pointerenter"))
    host.dispatchEvent(new PointerEvent("pointermove", { movementX: 2 }))
    await ElementFixture.tick()
    expect(host.matches(":state(paused)")).toBe(true)
    const bar = host.shadowRoot!.querySelector<HTMLElement>("[part~=bar]")!
    expect(getComputedStyle(bar).animationPlayState).toBe("paused")
    await vi.advanceTimersByTimeAsync(200)
    expect(host.hidden).toBe(false)
    host.dispatchEvent(new PointerEvent("pointerleave"))
    await vi.advanceTimersByTimeAsync(120)
    await expect.poll(() => host.hidden, { timeout: 1000 }).toBe(true)
  })

  it("a toast appearing under a resting pointer (pointerenter, no move) still closes", async () => {
    const host = Fixture.render<Toast>(`<ui-toast display-time="60" message="Rest"></ui-toast>`)
    host.dispatchEvent(new PointerEvent("pointerenter"))
    host.dispatchEvent(new PointerEvent("pointermove", { movementX: 0, movementY: 0 }))
    await expect.poll(() => host.hidden, { timeout: 1000 }).toBe(true)
  })

  it("doesn't pause on hover with pause-on-hover=false", async () => {
    const host = Fixture.render<Toast>(`<ui-toast display-time="60" pause-on-hover="false" message="Go"></ui-toast>`)
    await next(host, "ui-show")
    host.dispatchEvent(new PointerEvent("pointerenter"))
    host.dispatchEvent(new PointerEvent("pointermove", { movementX: 2 }))
    await expect.poll(() => host.hidden, { timeout: 1000 }).toBe(true)
  })

  it("pauses while focus is inside, whatever pause-on-hover says", async () => {
    fakeClock()
    const host = Fixture.render<Toast>(
      `<ui-toast display-time="100" pause-on-hover="false" closable message="Focus"></ui-toast>`
    )
    await next(host, "ui-show")
    host.shadowRoot!.querySelector<HTMLButtonElement>("[part~=close]")!.focus()
    await ElementFixture.tick()
    expect(host.matches(":state(paused)")).toBe(true)
    await vi.advanceTimersByTimeAsync(180)
    expect(host.hidden).toBe(false)
    // the DEEP active element:  `document.activeElement` is the DOM element,
    // and Firefox's `blur()` on a shadow host does nothing
    ;(UI.focus.activeElementDeep() as HTMLElement).blur()
    await vi.advanceTimersByTimeAsync(100)
    await expect.poll(() => host.hidden, { timeout: 1000 }).toBe(true)
  })
})

describe("<ui-toast> closing", () => {
  it("closes from the close icon:  reason close", async () => {
    const { host, root } = await toast(`<ui-toast closable message="Hi"></ui-toast>`)
    const closes = record(host, "ui-close")
    await userEvent.click(root.querySelector("[part~=close]")!)
    expect(closes.map(({ reason }) => reason)).toEqual(["close"])
    await expect.poll(() => host.hidden).toBe(true)
  })

  it("closes on a click (close-on-click), not with a close icon, actions or controls", async () => {
    const { host, root } = await toast(`<ui-toast message="Click me"></ui-toast>`)
    const closes = record(host, "ui-close")
    await userEvent.click(root)
    expect(closes.map(({ reason }) => reason)).toEqual(["click"])
    for (const html of [
      `<ui-toast closable message="Hi"></ui-toast>`,
      `<ui-toast close-on-click="false" message="Hi"></ui-toast>`,
      `<ui-toast message="Hi"><input aria-label="Name"></ui-toast>`
    ]) {
      const { host: other, root: otherRoot } = await toast(html)
      const otherCloses = record(other, "ui-close")
      await userEvent.click(otherRoot.querySelector(".message")!)
      expect(otherCloses, html).toEqual([])
    }
  })

  it("marks an unclickable box", async () => {
    const { box } = await toast(`<ui-toast closable message="Hi"></ui-toast>`)
    expect(box.className).toBe("floating toast-box compact unclickable")
    const { box: clickable } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    expect(clickable.className).toBe("floating toast-box compact")
  })

  it("approves:  a cancelable ui-approve, then closes (reason approve)", async () => {
    const { host } = await toast(
      `<ui-toast message="Sure?"><ui-button slot="actions" positive>Yes</ui-button><ui-button slot="actions" class="deny">No</ui-button></ui-toast>`
    )
    const approves = record<ToastActionDetail>(host, "ui-approve")
    const closes = record(host, "ui-close")
    await userEvent.click(host.querySelector("[positive]")!)
    expect(approves).toHaveLength(1)
    expect(approves[0]!.action).toBe(host.querySelector("[positive]"))
    expect(closes.map(({ reason }) => reason)).toEqual(["approve"])
  })

  it("stays when ui-deny is cancelled", async () => {
    const { host } = await toast(
      `<ui-toast message="Sure?"><ui-button slot="actions" negative>No</ui-button></ui-toast>`
    )
    host.addEventListener("ui-deny", (event) => event.preventDefault())
    const closes = record(host, "ui-close")
    await userEvent.click(host.querySelector("[negative]")!)
    expect(closes).toEqual([])
  })

  it("closes on any other action, unless its click was prevented", async () => {
    const { host } = await toast(
      `<ui-toast message="Hi"><ui-button slot="actions" id="keep">Keep</ui-button><ui-button slot="actions" id="go">Go</ui-button></ui-toast>`
    )
    host.querySelector("#keep")!.addEventListener("click", (event) => event.preventDefault())
    const closes = record(host, "ui-close")
    await userEvent.click(host.querySelector("#keep")!)
    expect(closes).toEqual([])
    await userEvent.click(host.querySelector("#go")!)
    expect(closes.map(({ reason }) => reason)).toEqual(["action"])
  })
})

describe("<ui-toast> keyboard", () => {
  it("reaches the close icon with Tab and closes with Enter", async () => {
    const { host } = await toast(`<ui-toast closable message="Hi"></ui-toast>`)
    const before = Fixture.render<HTMLButtonElement>(`<button>Before</button>`)
    host.before(before)
    before.focus()
    await Keys.tab()
    expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector("[part~=close]"))
    const closes = record(host, "ui-close")
    await userEvent.keyboard("{Enter}")
    expect(closes.map(({ reason }) => reason)).toEqual(["close"])
  })

  it("closes on Escape while focus is inside", async () => {
    const { host } = await toast(`<ui-toast message="Hi"><ui-button slot="actions">Ok</ui-button></ui-toast>`)
    const closes = record(host, "ui-close")
    host.querySelector<HTMLElement>("ui-button")!.focus()
    await userEvent.keyboard("{Escape}")
    expect(closes.map(({ reason }) => reason)).toEqual(["escape"])
  })

  it("ignores Escape pressed elsewhere", async () => {
    const { host } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    const closes = record(host, "ui-close")
    const input = Fixture.render<HTMLInputElement>(`<input aria-label="Elsewhere">`)
    input.focus()
    await userEvent.keyboard("{Escape}")
    expect(closes).toEqual([])
  })
})

////////////////
// ## UI.toast()
////////////////

describe("UI.toast()", () => {
  it("builds a <ui-toast> in a top-right container:  a region popover in the top layer", async () => {
    const handle = UI.toast({ title: "Saved", message: "All good", class: "success", displayTime: 0 })
    const element = handle.element as Toast
    await element.ready
    await ElementFixture.settle(element)
    expect(element.localName).toBe("ui-toast")
    expect(element.id).toBe(handle.id)
    expect(element.getAttribute("header")).toBe("Saved")
    expect(element.getAttribute("message")).toBe("All good")
    expect(element.getAttribute("type")).toBe("success")
    const container = element.parentElement!
    expect(container.className).toBe("ui top right toast-container")
    expect(container.getAttribute("role")).toBe("region")
    expect(container.getAttribute("aria-label")).toBe("Notifications")
    expect(container.matches(":popover-open")).toBe(true)
    expect(getComputedStyle(container).position).toBe("fixed")
    const box = container.getBoundingClientRect()
    expect(window.innerWidth - box.right).toBeCloseTo(12, 0)
  })

  it("defaults to 3 seconds, and resolves `closed` once the toast is gone (removed)", async () => {
    const handle = UI.toast({ message: "Hi" })
    expect(handle.element!.getAttribute("display-time")).toBe("3000")
    UI.toasts.dismiss(handle.id)
    await (handle.element as Toast).ready
    UI.toasts.dismiss(handle.id)
    await handle.closed
    expect(handle.element!.isConnected).toBe(false)
    expect(document.querySelector(".ui.toast-container")).toBeNull()
  })

  it("closes on its own after displayTime", async () => {
    const handle = UI.toast({ message: "Quick", displayTime: 50 })
    await handle.closed
    expect(handle.element!.isConnected).toBe(false)
  })

  it("maps options to attributes", async () => {
    const handle = UI.toast({
      message: "Hi",
      class: "inverted blue",
      showIcon: true,
      showProgress: "top",
      progressUp: true,
      pauseOnHover: false,
      closeIcon: true,
      closeOnClick: false,
      compact: false,
      displayTime: "auto"
    })
    expect(attributesOf(handle.element!)).toMatchObject({
      color: "blue",
      inverted: expect.any(String),
      icon: "",
      progress: "top",
      "progress-up": expect.any(String),
      "pause-on-hover": "false",
      closable: expect.any(String),
      "close-on-click": "false",
      compact: "false",
      "display-time": "auto"
    })
  })

  it("keeps every `class` word on the host, so the page can theme ONE toast", async () => {
    const style = Fixture.render(
      `<style>ui-toast.ready { --ui-toast-background: rgb(255, 0, 0); --ui-toast-font-size: 14px }</style>`
    )
    onTestFinished(() => style.remove())
    const handle = UI.toast({ message: "Your app is ready.", class: "ready success", displayTime: 0 })
    const other = UI.toast({ message: "Plain", displayTime: 0 })
    onTestFinished(() => {
      UI.toasts.dismiss(handle.id)
      UI.toasts.dismiss(other.id)
    })
    const element = handle.element as Toast
    await element.ready
    await ElementFixture.settle(element)
    expect(element.className).toBe("ready success")
    expect(element.getAttribute("type")).toBe("success")
    expect(other.element!.className).toBe("")
    await (other.element as Toast).ready
    await ElementFixture.settle(other.element!)
    const box = (toast: Element) => toast.shadowRoot!.querySelector<HTMLElement>("[part~=box]")!
    expect(getComputedStyle(box(element)).fontSize).toBe("14px")
    expect(getComputedStyle(box(other.element!)).fontSize).not.toBe("14px")
  })

  it("puts each position in its own container, and stacks newest on top when asked", async () => {
    const a = UI.toast({ message: "A", position: "bottom left", displayTime: 0 })
    const b = UI.toast({ message: "B", position: "bottom left", displayTime: 0, newestOnTop: true })
    const c = UI.toast({ message: "C", position: "top center", displayTime: 0 })
    expect(a.element!.parentElement).toBe(b.element!.parentElement)
    expect(a.element!.parentElement!.className).toBe("ui bottom left toast-container")
    expect([...a.element!.parentElement!.children]).toEqual([b.element, a.element])
    expect(c.element!.parentElement!.className).toBe("ui top center toast-container")
  })

  it("replaces a toast with the same id", async () => {
    const first = UI.toast({ id: "same", message: "One", displayTime: 0 })
    const second = UI.toast({ id: "same", message: "Two", displayTime: 0 })
    await first.closed
    expect(first.element!.isConnected).toBe(false)
    expect(document.getElementById("same")).toBe(second.element)
  })

  it("builds actions as slotted <ui-button>s;  click() returning false keeps the toast", async () => {
    const clicks: string[] = []
    const handle = UI.toast({
      message: "Undo?",
      displayTime: 0,
      actions: [
        { text: "Keep", class: "green basic", click: () => (clicks.push("keep"), false) },
        { text: "Yes", class: "positive", click: () => void clicks.push("yes") }
      ]
    })
    const element = handle.element as Toast
    await element.ready
    const [keep, yes] = element.querySelectorAll<HTMLElement>("ui-button[slot=actions]")
    expect(keep!.getAttribute("color")).toBe("green")
    expect(keep!.hasAttribute("basic")).toBe(true)
    expect(yes!.hasAttribute("positive")).toBe(true)
    expect(yes!.className).toBe("positive")
    await ElementFixture.settle(element)
    await userEvent.click(keep!)
    expect(element.hidden).toBe(false)
    const approved = next<ToastActionDetail>(element, "ui-approve")
    await userEvent.click(yes!)
    expect((await approved).action).toBe(yes)
    expect(clicks).toEqual(["keep", "yes"])
    await handle.closed
  })

  it("wraps attached actions in a <ui-buttons>", async () => {
    const handle = UI.toast({ message: "Hi", actions: [{ text: "A" }, { text: "B" }], classActions: "attached" })
    const group = handle.element!.querySelector(":scope > [slot=actions]")!
    expect(group.localName).toBe("ui-buttons")
    expect(group.hasAttribute("fluid")).toBe(true)
    expect(group.children).toHaveLength(2)
    expect(handle.element!.getAttribute("actions")).toBe("attached")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-toast> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })

  it("axe passes on a UI.toast() container", async () => {
    const handle = UI.toast({ title: "Saved", message: "All good", closeIcon: true, displayTime: 0 })
    await (handle.element as Toast).ready
    await ElementFixture.settle(handle.element!)
    await expectAccessible(handle.element!.parentElement!)
  })
})

////////////////
// ## Invoker commands
////////////////

describe("<ui-toast> invoker commands", () => {
  const NATIVE = "commandForElement" in HTMLButtonElement.prototype

  /** Dispatch a plain `command` event, what the button's JS fallback dispatches. */
  function send(host: Element, command: string) {
    host.dispatchEvent(Object.assign(new Event("command", { cancelable: true }), { command }))
  }

  it.skipIf(!NATIVE)("a native `--close` button dismisses it:  reason `close`, then hidden", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-toast id="t" message="Hi"></ui-toast><button id="x" commandfor="t" command="--close">Dismiss</button></div>`
    )
    const host = wrapper.querySelector<Toast>("ui-toast")!
    await host.ready
    const closes = record(host, "ui-close")
    const hidden = next<ToastCloseDetail>(host, "ui-hide")
    wrapper.querySelector<HTMLButtonElement>("#x")!.click()
    expect((await hidden).reason).toBe("close")
    expect(closes.map((detail) => detail.reason)).toEqual(["close"])
    expect(host.hidden).toBe(true)
  })

  it("a vetoed ui-close keeps it", async () => {
    const { host } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    send(host, "--close")
    await animationsDone(host)
    expect(host.hidden).toBe(false)
  })

  it("`--show` and `--toggle` do nothing:  a closed toast stays closed", async () => {
    const { host } = await toast(`<ui-toast message="Hi"></ui-toast>`)
    const closes = record(host, "ui-close")
    send(host, "--toggle")
    send(host, "--show")
    await animationsDone(host)
    expect(closes).toHaveLength(0)
    expect(host.hidden).toBe(false)
    const hidden = next<ToastCloseDetail>(host, "ui-hide")
    send(host, "--close")
    await hidden
    send(host, "--show")
    send(host, "--toggle")
    await animationsDone(host)
    expect(host.hidden).toBe(true)
  })

  it("the `Invoker.run()` fallback of a <ui-button> (no native invokers) dismisses it", async () => {
    await UI.load()
    const supports = UI.browser.supports
    const was = supports.invokers
    supports.invokers = false
    try {
      await import("$/ui/components/ui-button")
      const wrapper = await ElementFixture.render<HTMLElement>(
        `<div><ui-toast id="t" message="Hi"></ui-toast><ui-button id="x" commandfor="t" command="--close">Dismiss</ui-button></div>`
      )
      const host = wrapper.querySelector<Toast>("ui-toast")!
      await host.ready
      const hidden = next<ToastCloseDetail>(host, "ui-hide")
      wrapper.querySelector<HTMLElement>("#x")!.shadowRoot!.querySelector<HTMLButtonElement>("button")!.click()
      expect((await hidden).reason).toBe("close")
    } finally {
      supports.invokers = was
    }
  })
})
