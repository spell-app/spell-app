import { beforeEach, describe, expect, it } from "vite-plus/test"

import { UI, type VisibilityCalculations } from "$/ui/runtime"
import { nextFrame } from "$/ui/util"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/Fixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-visibility"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-visibility/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A 1x1 GIF, so image tests never touch the network. */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/** The page's height, in px:  the element goes this far below the top. */
const BELOW = 2000

/**
 * A `<ui-visibility>` far below the fold of the PAGE (it measures against the viewport).
 * - Returns it;  scroll with `window.scrollTo()`.
 */
async function below(attributes = "", content = "<p style='height: 100px; margin: 0'>Content</p>") {
  const wrapper = await ElementFixture.render(
    `<div><div style="height: ${BELOW}px"></div><ui-visibility ${attributes}>${content}</ui-visibility>` +
      `<div style="height: ${BELOW}px"></div></div>`
  )
  return wrapper.querySelector<UIHost>("ui-visibility")!
}

/** Names of the `ui-*` visibility events `host` fires, in order. */
function record(host: EventTarget) {
  const names: string[] = []
  for (const name of [
    "ui-visible",
    "ui-hidden",
    "ui-top-visible",
    "ui-bottom-visible",
    "ui-top-passed",
    "ui-bottom-passed",
    "ui-passing"
  ]) {
    host.addEventListener(name, () => names.push(name))
  }
  return names
}

/** Scroll the page so `host`'s top is `offset` px below the viewport top, then let the observers report. */
async function scrollHostTo(host: Element, offset: number) {
  window.scrollTo(0, window.scrollY + host.getBoundingClientRect().top - offset)
  await observersSettle()
}

/** A frame, then `OBSERVER_SETTLE_MS`:  long enough for the observers to report and `Visibility` to check. */
async function observersSettle() {
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, OBSERVER_SETTLE_MS))
}

/**
 * How long, after a frame, the observers get to report a scroll:  a REAL wait, on purpose (as in
 * `src/runtime/Visibility.test.ts`).
 * - `IntersectionObserver` delivers after the browser's next rendering update, and `Visibility` then coalesces its
 *   reports with a `setTimeout`:  fake timers drive neither, and "nothing fired" can't be polled for.
 */
const OBSERVER_SETTLE_MS = 40

beforeEach(async () => {
  await UI.load()
  window.scrollTo(0, 0)
})

////////////////
// ## Rendering
////////////////

describe("<ui-visibility> markup", () => {
  it("is a block:  `ui visibility` around the slot", async () => {
    const host = await below()
    const root = host.shadowRoot!.querySelector("[part~=visibility]")!
    expect(root.className).toBe("ui visibility")
    expect([...root.children].map((child) => child.localName)).toEqual(["slot"])
    expect(getComputedStyle(host).display).toBe("block")
    expect(getComputedStyle(root).display).toBe("block")
  })
})

////////////////
// ## Events
////////////////

describe("<ui-visibility> events", () => {
  it("reports off screen at once, then on screen as it scrolls in, with Fomantic's calculations", async () => {
    const host = await below()
    const names = record(host)
    const details: VisibilityCalculations[] = []
    host.addEventListener("ui-visible", (event) => details.push((event as CustomEvent).detail))
    await expect.poll(() => names).toEqual(["ui-hidden"])
    expect(host.matches(":state(visible)")).toBe(false)
    await scrollHostTo(host, 200)
    expect(names.slice(1)).toEqual(["ui-visible", "ui-top-visible", "ui-bottom-visible"])
    expect(details[0]!.onScreen).toBe(true)
    expect(host.matches(":state(visible)")).toBe(true)
    await scrollHostTo(host, -50)
    expect(names.slice(4)).toEqual(["ui-passing", "ui-top-passed"])
    await scrollHostTo(host, -500)
    expect(names.slice(6)).toEqual(["ui-bottom-passed"])
    expect(host.matches(":state(visible)")).toBe(false)
  })

  it("fires once by default, each time with once=false", async () => {
    const host = await below()
    const again = await below(`once="false"`)
    const first = record(host)
    const second = record(again)
    await scrollHostTo(host, 200)
    await scrollHostTo(host, -500)
    await scrollHostTo(host, 200)
    await scrollHostTo(again, 200)
    await scrollHostTo(again, -500)
    await scrollHostTo(again, 200)
    expect(first.filter((name) => name === "ui-visible")).toHaveLength(1)
    expect(second.filter((name) => name === "ui-visible")).toHaveLength(2)
  })

  it("counts the screen top from `offset`", async () => {
    const host = await below(`offset="100"`)
    const names = record(host)
    await scrollHostTo(host, 150)
    expect(names).not.toContain("ui-top-passed")
    await scrollHostTo(host, 90)
    expect(names).toContain("ui-top-passed")
  })

  it("stops reporting once removed", async () => {
    const host = await below()
    const names = record(host)
    await expect.poll(() => names.length).toBe(1)
    const parent = host.parentElement!
    host.remove()
    await ElementFixture.tick()
    parent.append(host)
    host.remove()
    await observersSettle()
    expect(names).toEqual(["ui-hidden"])
  })
})

describe("UI.observeVisibility() on a `display: contents` host", () => {
  it("measures a <ui-segment>'s rendered box, even when observed before it renders", async () => {
    const wrapper = Fixture.render(
      `<div><div style="height: ${BELOW}px"></div><ui-segment><p style="height: 100px">Content</p></ui-segment>` +
        `<div style="height: ${BELOW}px"></div></div>`
    )
    const segment = wrapper.querySelector<UIHost>("ui-segment")!
    const seen: boolean[] = []
    const onUpdate = (calculations: VisibilityCalculations) => seen.push(calculations.onScreen)
    const stop = UI.observeVisibility(segment, { once: false, onUpdate })
    await segment.ready
    await expect.poll(() => seen).toEqual([false])
    await scrollHostTo(segment.querySelector("p")!, 90)
    await expect.poll(() => seen.at(-1)).toBe(true)
    stop()
  })
})

////////////////
// ## Images
////////////////

describe("<ui-visibility type=image>", () => {
  it("marks the box `image`", async () => {
    const host = await below(`type="image"`)
    expect(host.shadowRoot!.querySelector("[part~=visibility]")!.className).toBe("ui visibility image")
  })

  it("loads each <img data-src> once on screen, then fires ui-load", async () => {
    const host = await below(
      `type="image" transition="none"`,
      `<img alt="A" width="10" height="10" data-src="${PIXEL}"><img alt="B" width="10" height="10" data-src="${PIXEL}">`
    )
    const loaded: HTMLImageElement[] = []
    host.addEventListener("ui-load", (event) => loaded.push((event as CustomEvent).detail.image))
    const images = [...host.querySelectorAll("img")]
    await observersSettle()
    expect(images.map((image) => image.hasAttribute("src"))).toEqual([false, false])
    await scrollHostTo(host, 100)
    await expect.poll(() => loaded.length).toBe(2)
    expect(images.map((image) => image.getAttribute("src"))).toEqual([PIXEL, PIXEL])
  })

  it("picks up images added later", async () => {
    const host = await below(`type="image" transition="none"`, `<p style="height: 20px; margin: 0">x</p>`)
    await scrollHostTo(host, 100)
    const image = document.createElement("img")
    image.alt = "Later"
    image.setAttribute("data-src", PIXEL)
    host.append(image)
    await expect.poll(() => image.getAttribute("src")).toBe(PIXEL)
  })

  it("leaves images alone without type=image", async () => {
    const host = await below("", `<img alt="A" width="10" height="10" data-src="${PIXEL}">`)
    await scrollHostTo(host, 100)
    expect(host.querySelector("img")!.hasAttribute("src")).toBe(false)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-visibility> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
