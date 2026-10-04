import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/keys"

import { UI } from "$/ui/runtime"
import type { TransitionDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"
import type { TransitionHost } from "$/ui/components/ui-transition"

import "$/ui/components/ui-transition"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-button"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-transition/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A transition host with its properties. */
type Transition = TransitionHost & { visible: boolean; animation: string }

/** Render a transition (short animations unless `html` says otherwise);  returns the host and its box. */
async function transition(html: string) {
  const wrapper = await ElementFixture.render(`<div>${html}</div>`)
  const host = wrapper.querySelector<Transition>("ui-transition")!
  const box = host.shadowRoot!.querySelector<HTMLDivElement>("[part~=transition]")!
  return { wrapper, host, box }
}

/** Collect `detail`s of `name` events. */
function record(target: EventTarget, name: string) {
  const details: TransitionDetail[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<TransitionDetail>).detail))
  return details
}

/** Let the element catch up. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/** Pretend the user asked for reduced motion, until `afterEach`. */
function reduceMotion() {
  Object.defineProperty(UI.browser, "reducedMotion", { value: true, configurable: true })
}

beforeEach(async () => {
  await UI.load()
})

afterEach(() => {
  delete (UI.browser as { reducedMotion?: boolean }).reducedMotion
})

describe("<ui-transition> classes and first paint", () => {
  it.each([
    ["", "ui transition"],
    ["visible", "ui transition visible"],
    ['color="red" pulsating looping inline visible', "ui red inline looping pulsating transition visible"],
    ["inverted disabled", "ui disabled inverted transition"]
  ])("<ui-transition %s>", async (attributes, classes) => {
    const { box } = await transition(`<ui-transition ${attributes}>x</ui-transition>`)
    expect(box.className).toBe(classes)
  })

  it("starts hidden without `visible` (out of the page and the tree), shown with it;  never animates", async () => {
    const { wrapper } = await transition(
      `<ui-transition id="a"><button>A</button></ui-transition><ui-transition id="b" visible>B</ui-transition>`
    )
    const [a, b] = [...wrapper.querySelectorAll("ui-transition")].map((host) =>
      host.shadowRoot!.querySelector<HTMLElement>("[part~=transition]")!
    )
    expect(a!.hidden).toBe(true)
    expect(getComputedStyle(a!).display).toBe("none")
    expect(UI.focus.focusables(wrapper)).toHaveLength(0)
    expect(b!.hidden).toBe(false)
    expect(b!.hasAttribute("data-ui-animation")).toBe(false)
    expect((wrapper.querySelector("#b") as UIHost).matches(":state(visible)")).toBe(true)
  })
})

describe("<ui-transition> show / hide", () => {
  it("`visible` animates out then in through UI.transitions:  ui-hide, ui-show, ui-complete", async () => {
    const { host, box } = await transition(`<ui-transition animation="fade up" duration="40" visible>x</ui-transition>`)
    const hides = record(host, "ui-hide")
    const shows = record(host, "ui-show")
    const completes = record(host, "ui-complete")
    host.visible = false
    await settle()
    expect(box.getAttribute("data-ui-animation")).toBe("fade-up out")
    expect(box.style.getPropertyValue("--ui-animation-duration")).toBe("40ms")
    expect(host.matches(":state(animating)")).toBe(true)
    await expect.poll(() => hides.length).toBe(1)
    expect(box.hidden).toBe(true)
    expect(hides[0]).toEqual({ visible: false, animation: "fade up" })
    host.visible = true
    await settle()
    expect(box.hidden).toBe(false)
    expect(box.getAttribute("data-ui-animation")).toBe("fade-up in")
    await expect.poll(() => shows.length).toBe(1)
    expect(completes.map((detail) => detail.visible)).toEqual([false, true])
    expect(host.matches(":state(animating)")).toBe(false)
  })

  it("show() / hide() / toggle() resolve once animated, and reflect `visible`", async () => {
    const { host, box } = await transition(`<ui-transition animation="scale" duration="30">x</ui-transition>`)
    expect(await host.show()).toBe(true)
    expect(host.hasAttribute("visible")).toBe(true)
    expect(box.hidden).toBe(false)
    expect(await host.toggle()).toBe(true)
    expect(host.hasAttribute("visible")).toBe(false)
    expect(box.hidden).toBe(true)
    expect(await host.hide()).toBe(true)
  })

  it("maps Fomantic's names onto the catalogue:  horizontal flip, plain slide / swing", async () => {
    const { host, box } = await transition(
      `<ui-transition animation="horizontal flip" duration="30" visible>x</ui-transition>`
    )
    void host.hide()
    await settle()
    expect(box.getAttribute("data-ui-animation")).toBe("flip-horizontal out")
    await expect.poll(() => box.hidden).toBe(true)
    host.animation = "slide"
    await settle()
    void host.show()
    await settle()
    expect(box.getAttribute("data-ui-animation")).toBe("slide-down in")
  })

  it("an attention `animation` shows / hides at once", async () => {
    const { host, box } = await transition(`<ui-transition animation="shake" visible>x</ui-transition>`)
    expect(await host.hide()).toBe(true)
    expect(box.hidden).toBe(true)
    expect(box.hasAttribute("data-ui-animation")).toBe(false)
  })
})

describe("<ui-transition> transition()", () => {
  it("runs an attention animation in place:  visibility unchanged, ui-complete only", async () => {
    const { host, box } = await transition(`<ui-transition duration="30" visible>x</ui-transition>`)
    const completes = record(host, "ui-complete")
    const hides = record(host, "ui-hide")
    const done = host.transition("tada")
    await settle()
    expect(box.getAttribute("data-ui-animation")).toBe("tada static")
    expect(await done).toBe(true)
    expect(box.hidden).toBe(false)
    expect(completes).toEqual([{ visible: true, animation: "tada" }])
    expect(hides).toHaveLength(0)
  })

  it("an appear / disappear animation toggles, in either spelling", async () => {
    const { host, box } = await transition(`<ui-transition duration="30" visible>x</ui-transition>`)
    expect(await host.transition("fade-down")).toBe(true)
    expect(box.hidden).toBe(true)
    expect(await host.transition("vertical flip")).toBe(true)
    expect(box.hidden).toBe(false)
  })

  it("an unknown animation warns and resolves false", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { host } = await transition(`<ui-transition visible>x</ui-transition>`)
    expect(await host.transition("wobble")).toBe(false)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe("<ui-transition> queue", () => {
  it("queues:  hide then show run one after the other", async () => {
    const { host, box } = await transition(`<ui-transition duration="30" visible>x</ui-transition>`)
    const order: string[] = []
    host.addEventListener("ui-hide", () => order.push("hide"))
    host.addEventListener("ui-show", () => order.push("show"))
    const hidden = host.hide()
    const shown = host.show()
    expect(await hidden).toBe(true)
    expect(await shown).toBe(true)
    expect(order).toEqual(["hide", "show"])
    expect(box.hidden).toBe(false)
  })

  it("drops the same animation twice in a row, unless allow-repeats", async () => {
    const { host } = await transition(`<ui-transition duration="30" visible>x</ui-transition>`)
    const completes = record(host, "ui-complete")
    await Promise.all([host.transition("shake"), host.transition("shake")])
    expect(completes).toHaveLength(1)
    host.setAttribute("allow-repeats", "")
    await settle()
    await Promise.all([host.transition("shake"), host.transition("shake")])
    expect(completes).toHaveLength(3)
  })

  it("`interrupt` stops the running animation:  it resolves false and fires nothing", async () => {
    const { host, box } = await transition(`<ui-transition duration="500" interrupt visible>x</ui-transition>`)
    const hides = record(host, "ui-hide")
    const hidden = host.hide()
    await settle()
    host.setAttribute("duration", "30")
    const shown = host.show()
    expect(await hidden).toBe(false)
    expect(await shown).toBe(true)
    expect(hides).toHaveLength(0)
    expect(box.hidden).toBe(false)
  })
})

describe("<ui-transition> reduced motion, commands, accessibility", () => {
  it("reduced motion:  the end state at once, events still fire", async () => {
    reduceMotion()
    const { host, box } = await transition(`<ui-transition animation="fly left" visible>x</ui-transition>`)
    const hides = record(host, "ui-hide")
    expect(await host.hide()).toBe(true)
    expect(box.hidden).toBe(true)
    expect(box.hasAttribute("data-ui-animation")).toBe(false)
    expect(hides).toHaveLength(1)
  })

  it("invoker commands:  --toggle, --show, --close, --transition", async () => {
    const { host, box, wrapper } = await transition(
      `<button commandfor="t" command="--toggle">Toggle</button>` +
        `<button commandfor="t" command="--transition">Run</button>` +
        `<ui-transition id="t" duration="30" visible>x</ui-transition>`
    )
    const completes = record(host, "ui-complete")
    await userEvent.click(wrapper.querySelector("[command='--toggle']")!)
    await expect.poll(() => box.hidden).toBe(true)
    expect(host.visible).toBe(false)
    await userEvent.click(wrapper.querySelector("[command='--toggle']")!)
    await expect.poll(() => completes.length).toBe(2)
    await userEvent.click(wrapper.querySelector("[command='--transition']")!)
    await expect.poll(() => completes.length).toBe(3)
    expect(box.hidden).toBe(true)
  })

  it("hidden content can't be reached with Tab;  shown, it can", async () => {
    const { host, wrapper } = await transition(
      `<button id="before">Before</button><ui-transition duration="30"><button id="inside">In</button></ui-transition>`
    )
    wrapper.querySelector<HTMLButtonElement>("#before")!.focus()
    await Keys.tab()
    expect(document.activeElement?.id).not.toBe("inside")
    await host.show()
    wrapper.querySelector<HTMLButtonElement>("#before")!.focus()
    await Keys.tab()
    expect(document.activeElement?.id).toBe("inside")
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
