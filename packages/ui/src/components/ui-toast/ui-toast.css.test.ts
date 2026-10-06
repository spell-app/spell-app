import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { toastVocabulary } from "./ui-toast.vocabulary.en"

import toastCSS from "./ui-toast.css?inline"
import toastRaw from "./ui-toast.css?raw"
import containerCSS from "./ui-toast.container.css?inline"
import containerRaw from "./ui-toast.container.css?raw"

/**
 * `ui-toast.css` (and the page sheet `ui-toast.container.css`) on their own, before any element exists:  the sheets'
 * source rules and the computed styles of the light-DOM examples -- the same class grammar the shadow root uses.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

////////////////
// ## Source
////////////////

describe("ui-toast.css source", () => {
  it("never uses rem, nor !important", () => {
    for (const css of [toastRaw, containerRaw]) {
      expect(Sheets.withoutComments(css)).not.toMatch(/\d(\.\d+)?rem\b/)
      expect(Sheets.withoutComments(css)).not.toMatch(/!important/)
    }
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(toastRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("toast"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted action rules and the paused state", () => {
    const selectors = Sheets.selectors(toastCSS)
    expect(selectors.length).toBeGreaterThan(40)
    expect(selectors.some((selector) => selector.includes("::slotted("))).toBe(true)
    expect(selectors.some((selector) => selector.includes(":host(:state(paused))"))).toBe(true)
  })

  it("covers every class word the vocabulary and the element emit", () => {
    const css = toastRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(toastVocabulary))
      expect(Sheets.covers(css, phrase), `${toastVocabulary.tag}: ${phrase}`).toBe(true)
    for (const word of ["neutral", "vertical", "actions", "attached", "compact", "unclickable", "progressing"])
      expect(Sheets.covers(toastRaw, word), word).toBe(true)
  })

  it("puts the container rules in the components layer", () => {
    expect(Sheets.withoutComments(containerRaw).trim().startsWith("@layer ui.components {")).toBe(true)
    expect(Sheets.selectors(containerCSS).some((selector) => selector.includes(".ui.centered.toast-container"))).toBe(
      true
    )
  })
})

////////////////
// ## Examples
////////////////

describe("ui-toast.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every toast in %s", (path) => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const toasts = root.querySelectorAll<HTMLElement>(".ui.toast")
    expect(toasts.length).toBeGreaterThan(0)
    for (const toast of toasts) {
      const style = getComputedStyle(toast)
      expect(style.position).toBe("relative")
      expect(style.boxSizing).toBe("border-box")
      expect(parseFloat(style.paddingLeft)).toBeCloseTo(parseFloat(style.fontSize), 0)
      expect(parseFloat(style.borderTopRightRadius) + parseFloat(style.borderBottomLeftRadius)).toBeGreaterThan(0)
    }
  })

  it("draws a floating box at Fomantic's compact width (as wide as it may be on phones)", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const box = root.querySelector<HTMLElement>(".toast-box.compact")!
    const style = getComputedStyle(box)
    const width = box.getBoundingClientRect().width
    if (matchMedia("(max-width: 420px)").matches) {
      expect(width).toBeGreaterThanOrEqual(280)
      expect(width).toBeLessThanOrEqual(window.innerWidth)
    } else expect(width).toBe(350)
    expect(style.boxShadow).toMatch(/\d+px/)
    expect(style.borderTopWidth).toBe("1px")
    const wide = Fixture.render(EXAMPLES["./examples/variations.html"]!).querySelector<HTMLElement>(
      ".toast-box:not(.compact)"
    )!
    expect(wide.getBoundingClientRect().width).toBeLessThan(350)
  })

  it("fills types and colours from their remap, neutral from the surface", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const probe = (classes: string) =>
      getComputedStyle(
        Fixture.render(
          `<span class="${classes}" style="background: var(--ui-color); color: var(--ui-color-on)"></span>`
        )
      )
    for (const type of ["info", "success", "warning", "error"]) {
      const style = getComputedStyle(root.querySelector(`.ui.${type}.toast`)!)
      expect(style.backgroundColor, type).toBe(probe(`ui ${type}`).backgroundColor)
      expect(style.color, type).toBe(probe(`ui ${type}`).color)
    }
    const surface = getComputedStyle(Fixture.render(`<span style="background: var(--ui-surface)"></span>`))
    expect(getComputedStyle(root.querySelector('.ui.toast[class="ui toast"]')!).backgroundColor).toBe(
      surface.backgroundColor
    )
  })

  it("turns inverted toasts dark", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const inverted = getComputedStyle(root.querySelector('.ui.inverted.toast[class="ui inverted toast compact"]')!)
    expect(inverted.colorScheme).toBe("dark")
    expect(luminance(inverted.backgroundColor)).toBeLessThan(0.3)
    expect(luminance(inverted.color)).toBeGreaterThan(0.6)
  })

  it("places the icon beside the content and the close icon top right", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const info = root.querySelector<HTMLElement>(".ui.info.toast")!
    const icon = info.querySelector<HTMLElement>(":scope > .icon")!
    const content = info.querySelector<HTMLElement>(":scope > .content")!
    expect(getComputedStyle(icon).position).toBe("absolute")
    expect(parseFloat(getComputedStyle(content).paddingLeft)).toBeCloseTo(
      3 * parseFloat(getComputedStyle(info).fontSize),
      0
    )
    const close = root.querySelector<HTMLElement>(".ui.toast > .close.icon")!
    const toast = close.parentElement!.getBoundingClientRect()
    const box = close.getBoundingClientRect()
    expect(getComputedStyle(close).position).toBe("absolute")
    expect(toast.right - box.right).toBeLessThan(8)
    expect(box.top - toast.top).toBeLessThan(8)
    expect(getComputedStyle(close).opacity).toBe("0.7")
  })

  it("lays actions out:  a bar below, none when basic, a column when vertical, joined when attached", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const bar = getComputedStyle(root.querySelector(".ui.toast > .actions:not(.basic, .vertical)")!)
    expect(bar).toMatchObject({ textAlign: "right", borderTopWidth: "1px", marginLeft: `-${bar.fontSize}` })
    const basic = getComputedStyle(root.querySelector(".ui.toast > .basic.actions")!)
    expect(basic.borderTopStyle).toBe("none")
    const vertical = root.querySelector<HTMLElement>(".ui.vertical.toast")!
    expect(getComputedStyle(vertical).display).toBe("flex")
    expect(getComputedStyle(vertical.querySelector(".vertical.actions")!).flexDirection).toBe("column")
    const attached = root.querySelector<HTMLElement>(".toast-box > .attached.actions")!
    expect(getComputedStyle(attached).display).toBe("flex")
    const toast = getComputedStyle(root.querySelector(".ui.attached.top.toast")!)
    expect(toast.borderBottomLeftRadius).toBe("0px")
    expect(parseFloat(toast.borderTopLeftRadius)).toBeGreaterThan(0)
  })

  it("draws the progress bar as a thin coloured track on the box's edge", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const track = root.querySelector<HTMLElement>(".ui.attached.progress.top")!
    const height = track.getBoundingClientRect().height
    expect(height).toBeGreaterThan(2)
    expect(height).toBeLessThan(5)
    const bar = getComputedStyle(track.querySelector(".bar")!)
    expect(bar.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(track.querySelector(".bar")!.getBoundingClientRect().width).toBe(track.getBoundingClientRect().width)
    const up = root.querySelector<HTMLElement>(".ui.attached.progress.bottom .up.bar")!
    expect(up.getBoundingClientRect().width).toBe(0)
  })
})

////////////////
// ## Containers
////////////////

describe("ui-toast.container.css", () => {
  it("pins a container to its corner, over the page, undoing the popover box", () => {
    Sheets.adopt([...foundationCSS, containerCSS])
    const container = Fixture.render(
      `<div class="ui bottom left toast-container" popover="manual"><div style="width: 100px; height: 40px"></div></div>`
    )
    container.showPopover()
    expect(getComputedStyle(container)).toMatchObject({
      position: "fixed",
      backgroundColor: "rgba(0, 0, 0, 0)",
      borderTopWidth: "0px"
    })
    const box = container.getBoundingClientRect()
    expect(box.left).toBeCloseTo(12, 0)
    expect(window.innerHeight - box.bottom).toBeCloseTo(12, 0)
    container.hidePopover()
  })

  it("centres `top center` and `centered` containers", () => {
    Sheets.adopt([...foundationCSS, containerCSS])
    for (const position of ["top center", "centered"]) {
      const container = Fixture.render(
        `<div class="ui ${position} toast-container" popover="manual"><div style="width: 100px; height: 40px"></div></div>`
      )
      container.showPopover()
      const box = container.getBoundingClientRect()
      expect(box.left + box.width / 2, position).toBeCloseTo(window.innerWidth / 2, 0)
      container.hidePopover()
    }
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-toast.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, toastCSS])
    const root = Fixture.render(
      `<div style="--ui-toast-radius: 20px"><div class="floating toast-box"><div class="ui toast"><div class="content">x</div></div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.toast")!).borderTopLeftRadius).toBe("20px")
  })
})

////////////////
// ## Helpers
////////////////

/** Relative luminance (0..1) of a computed colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}
