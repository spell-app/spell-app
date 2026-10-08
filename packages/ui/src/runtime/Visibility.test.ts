import { describe, expect, it, vi } from "vite-plus/test"

import { nextFrame } from "$/ui/util"
import { Fixture } from "$/ui/test/Fixture"
import { Visibility } from "./Visibility"
import type { VisibilityCalculations, VisibilityCallbacks } from "./runtime.types"

/** A 1x1 GIF, so image tests never touch the network. */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/**
 * How long, after a frame, the observers get to report a scroll:  a REAL wait, on purpose.
 * - `IntersectionObserver` delivers after the browser's next rendering update, and `Visibility` then coalesces its
 *   reports with a `setTimeout`:  fake timers drive neither, and "nothing fired" can't be polled for.
 */
const OBSERVER_SETTLE_MS = 30

/** Runs no animation. */
const visibility = new Visibility({ transitions: { animate: async () => true } })

////////////////
// ## Observing
////////////////

describe("Visibility.observe()", () => {
  it("checks at once:  a target below the fold is off screen", async () => {
    const { context, target } = frame()
    const calls: string[] = []
    const stop = visibility.observe(target, { context, ...recorder(calls) })
    await expect.poll(() => calls).toEqual(["onOffScreen"])
    stop()
  })

  it("fires Fomantic's callbacks as the target scrolls through, each once", async () => {
    const { context, target } = frame()
    const calls: string[] = []
    const updates: VisibilityCalculations[] = []
    const stop = visibility.observe(target, { context, ...recorder(calls), onUpdate: (c) => updates.push(c) })
    await expect.poll(() => calls.length).toBe(1)
    await scrollTo(context, 150)
    expect(calls.slice(1)).toEqual(["onOnScreen", "onTopVisible"])
    await scrollTo(context, 250)
    expect(calls.slice(3)).toEqual(["onBottomVisible"])
    await scrollTo(context, 350)
    expect(calls.slice(4)).toEqual(["onTopVisibleReverse", "onPassing", "onTopPassed"])
    expect(updates.at(-1)).toMatchObject({
      passing: true,
      pixelsPassed: expect.closeTo(50, 0),
      percentagePassed: expect.closeTo(0.5, 1),
      direction: "down"
    })
    await scrollTo(context, 500)
    expect(calls.slice(7)).toEqual(["onPassingReverse", "onBottomVisibleReverse", "onBottomPassed"])
    await scrollTo(context, 350)
    expect(updates.at(-1)!.direction).toBe("up")
    await scrollTo(context, 150)
    expect(calls.filter((name) => name === "onOnScreen")).toHaveLength(1)
    stop()
  })

  it("fires again each time with once: false", async () => {
    const { context, target } = frame()
    const onScreen: number[] = []
    const stop = visibility.observe(target, { context, once: false, onOnScreen: () => onScreen.push(1) })
    await scrollTo(context, 150)
    await scrollTo(context, 0)
    await scrollTo(context, 150)
    expect(onScreen).toHaveLength(2)
    stop()
  })

  it("moves the screen top down by offset", async () => {
    const { context, target } = frame()
    const passed: number[] = []
    const stop = visibility.observe(target, { context, offset: 60, onTopPassed: () => passed.push(1) })
    await scrollTo(context, 200)
    expect(passed).toHaveLength(0)
    await scrollTo(context, 250)
    expect(passed).toHaveLength(1)
    stop()
  })

  it("stops when disposed", async () => {
    const { context, target } = frame()
    const calls: string[] = []
    const stop = visibility.observe(target, { context, ...recorder(calls) })
    await expect.poll(() => calls.length).toBe(1)
    stop()
    await scrollTo(context, 150)
    expect(calls).toEqual(["onOffScreen"])
  })
})

describe("Visibility.observe() on an element with no box", () => {
  it("measures a `display: contents` element's first boxed child", async () => {
    const { context, target } = frame()
    target.style.display = "contents"
    target.innerHTML = `<span hidden></span><div style="height: 100px"></div>`
    const calls: string[] = []
    const stop = visibility.observe(target, { context, ...recorder(calls) })
    await expect.poll(() => calls).toEqual(["onOffScreen"])
    await scrollTo(context, 150)
    expect(calls).toEqual(["onOffScreen", "onOnScreen", "onTopVisible"])
    stop()
  })

  it("measures a `display: contents` shadow host's rendered box, not its light children", async () => {
    const { context, target } = frame()
    target.style.display = "contents"
    target.innerHTML = `<p style="height: 5px; margin: 0"></p>`
    const shadow = target.attachShadow({ mode: "open" })
    shadow.innerHTML = `<style></style><div style="height: 100px"><slot></slot></div>`
    const updates: VisibilityCalculations[] = []
    const stop = visibility.observe(target, { context, onUpdate: (calculations) => updates.push(calculations) })
    await scrollTo(context, 350)
    await expect.poll(() => updates.at(-1)?.pixelsPassed).toBe(50)
    stop()
  })

  it("warns once in dev when there's no box to measure", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const { context, target } = frame()
    target.style.display = "contents"
    const calls: string[] = []
    const stop = visibility.observe(target, { context, ...recorder(calls) })
    await expect.poll(() => warn.mock.calls.length).toBe(1)
    await scrollTo(context, 150)
    expect(calls).toEqual([])
    expect(warn).toHaveBeenCalledTimes(1)
    stop()
    warn.mockRestore()
  })
})

////////////////
// ## Lazy images
////////////////

describe("Visibility.lazyImage()", () => {
  it("sets data-src (and data-srcset) once on screen, then reports", async () => {
    const image = Fixture.render<HTMLImageElement>(
      `<img alt="Pixel" width="10" height="10" data-src="${PIXEL}" data-srcset="${PIXEL} 1x">`
    )
    const loaded: HTMLImageElement[] = []
    visibility.lazyImage(image, { onLoad: (img) => loaded.push(img) })
    await expect.poll(() => loaded).toEqual([image])
    expect(image.getAttribute("src")).toBe(PIXEL)
    expect(image.getAttribute("srcset")).toBe(`${PIXEL} 1x`)
  })

  it("waits while the image is off screen", async () => {
    const context = Fixture.render(
      `<div style="height: 100px; overflow: auto"><div style="height: 500px"></div>` +
        `<img alt="Pixel" width="10" height="10" data-src="${PIXEL}"></div>`
    )
    const image = context.querySelector("img")!
    const stop = visibility.lazyImage(image, { context })
    await observersSettle()
    expect(image.hasAttribute("src")).toBe(false)
    await scrollTo(context, 450)
    await expect.poll(() => image.getAttribute("src")).toBe(PIXEL)
    stop()
  })

  it("does nothing without data-src", () => {
    const image = Fixture.render<HTMLImageElement>(`<img alt="None">`)
    const stop = visibility.lazyImage(image)
    stop()
    expect(image.hasAttribute("src")).toBe(false)
  })
})

////////////////
// ## Helpers
////////////////

/**
 * A 200px scroll frame:  300px of space, a 100px target, 600px more.
 * - Returns the frame and the target.
 */
function frame() {
  const context = Fixture.render(
    `<div style="height: 200px; overflow: auto"><div style="height: 300px"></div>` +
      `<div id="target" style="height: 100px"></div><div style="height: 600px"></div></div>`
  )
  return { context, target: context.querySelector<HTMLElement>("#target")! }
}

/** Every callback, recording `name` into `calls`. */
function recorder(calls: string[]): VisibilityCallbacks {
  const names = [
    "onOnScreen",
    "onOffScreen",
    "onTopVisible",
    "onBottomVisible",
    "onTopPassed",
    "onBottomPassed",
    "onPassing",
    "onTopVisibleReverse",
    "onBottomVisibleReverse",
    "onTopPassedReverse",
    "onBottomPassedReverse",
    "onPassingReverse"
  ] as const
  return Object.fromEntries(names.map((name) => [name, () => calls.push(name)]))
}

/** Set `context`'s scroll and wait for the observers (and the coalesced check). */
async function scrollTo(context: HTMLElement, top: number) {
  context.scrollTop = top
  await observersSettle()
}

/** A frame, then `OBSERVER_SETTLE_MS`:  long enough for the observers to report and `Visibility` to check. */
async function observersSettle() {
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, OBSERVER_SETTLE_MS))
}
