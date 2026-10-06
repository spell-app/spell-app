import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { page, userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { colorsCSS, foundationCSS, nativeCSS } from "$/ui/styles"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/Fixture"
import type { UIHost } from "$/ui/elements"
import { Sheets } from "$/ui/test/Sheets"

import "$/ui/components/ui-button"

import { popupVocabulary } from "./ui-popup.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import popupCSS from "./ui-popup.css?inline"
import popupRaw from "./ui-popup.css?raw"
import anchoredRaw from "./ui-popup.anchored.css?raw"

/**
 * `ui-popup.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the class grammar the shadow root uses), plus the CSS-only tooltip (`native.css`).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the popup sheets (and buttons, for the tooltip examples) and render example `name`. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, nativeCSS, buttonCSS, popupCSS, anchoredRaw])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** Computed style of the static popup in `root` whose text starts with `text`. */
function popupNamed(root: Element, text: string): HTMLElement {
  const found = [...root.querySelectorAll<HTMLElement>(".ui.popup")].find((each) =>
    each.textContent!.trim().startsWith(text)
  )
  if (!found) throw new Error(`no popup "${text}"`)
  return found
}

////////////////
// ## Source
////////////////

describe("ui-popup.css source", () => {
  it("never uses rem", () => {
    for (const css of [popupRaw, anchoredRaw]) expect(Sheets.withoutComments(css)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    for (const css of [popupRaw, anchoredRaw]) {
      expect(Sheets.withoutComments(css).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
    }
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(popupRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("popup"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host, popover and arrow rules", () => {
    for (const css of [popupCSS, popupRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors).toContain(":host(:not(:popover-open))")
      expect(selectors).toContain(".ui.top.left.popup::before")
    }
  })

  it("the anchored sheet parses in the browser (Lightning CSS can't), into the variations sublayer", () => {
    const sheet = Sheets.from([anchoredRaw])[0]!
    const layer = sheet.cssRules[0] as CSSLayerBlockRule
    expect(layer.name).toBe("ui.components.popup.variations")
    const queries = [...layer.cssRules].map((rule) => (rule as CSSContainerRule).conditionText)
    expect(queries).toEqual(["anchored(fallback: flip-block)", "anchored(fallback: flip-inline)"])
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = popupRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(popupVocabulary))
      expect(Sheets.covers(css, phrase), `${popupVocabulary.tag}: ${phrase}`).toBe(true)
  })

  it("covers every position word the element adds after the noun", () => {
    for (const position of ["top left", "top center", "top right", "bottom left", "bottom center", "bottom right"]) {
      expect(Sheets.covers(popupRaw, position), position).toBe(true)
    }
    expect(Sheets.covers(popupRaw, "left center")).toBe(true)
    expect(Sheets.covers(popupRaw, "right center")).toBe(true)
    for (const position of ["left top", "left bottom", "right top", "right bottom"])
      expect(popupRaw, position).toContain(`[class*="${position}"]`)
  })

  it("resolves the duration alias on STATIC popups too (no host to declare it)", () => {
    const popup = example("types").querySelector<HTMLElement>(".ui.popup")!
    expect(getComputedStyle(popup).getPropertyValue("--_ui-popup-duration").trim()).not.toBe("")
  })

  it("tells beside-and-aligned positions from above / below ones with the same words", () => {
    const root = example("variations")
    const above = root.querySelector<HTMLElement>(".ui.popup.top.left")!
    const beside = root.querySelector<HTMLElement>('.ui.popup[class*="left top"]')!
    expect(getComputedStyle(above).transformOrigin).not.toBe(getComputedStyle(beside).transformOrigin)
    expect(parseFloat(getComputedStyle(beside).marginRight)).toBeGreaterThan(0)
    expect(parseFloat(getComputedStyle(beside).marginBottom)).toBe(0)
    expect(parseFloat(getComputedStyle(beside, "::before").right)).toBeLessThan(0)
  })

  it("declares the owner tokens the header / content parts read, on every root", () => {
    expect(popupVocabulary.ownsParts).toEqual(["header", "content"])
    const text = Sheets.withoutComments(popupRaw)
    expect(text).toMatch(
      /\.ui\.popup \{[^}]*--_ui-popup-header-font-size: var\(--ui-popup-header-font-size, 1\.14285em\);/
    )
    expect(text).toMatch(/\.ui\.popup \{[^}]*--_ui-popup-header-distance: var\(--ui-popup-header-distance, 0\.5em\);/)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-popup.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every popup in %s", (path) => {
    Sheets.adopt([...foundationCSS, popupCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    for (const popup of root.querySelectorAll<HTMLElement>(".ui.popup")) {
      const style = getComputedStyle(popup)
      expect(style.display, popup.outerHTML.slice(0, 80)).toBe("block")
      expect(style.boxSizing).toBe("border-box")
      expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
      expect(parseFloat(style.paddingLeft)).toBeCloseTo(parseFloat(style.fontSize), 1)
    }
  })

  it("draws a plain popup:  surface, strong border, floating shadow, 250px maximum, a bold header", () => {
    const root = example("types")
    const popup = popupNamed(root, "User Rating")
    const style = getComputedStyle(popup)
    const probe = getComputedStyle(
      Fixture.render(`<span style="background: var(--ui-surface); color: var(--ui-border-color-strong)"></span>`)
    )
    expect(style.backgroundColor).toBe(probe.backgroundColor)
    expect(style.borderTopColor).toBe(probe.color)
    expect(style.boxShadow).not.toBe("none")
    expect(style.maxWidth).toBe("250px")
    const header = getComputedStyle(popup.querySelector(".header")!)
    expect(header.fontWeight).toBe("700")
    expect(parseFloat(header.fontSize)).toBeCloseTo(1.14285 * parseFloat(style.fontSize), 1)
    expect(getComputedStyle(popup.querySelector(".content")!).paddingTop).toBe(`${0.5 * parseFloat(style.fontSize)}px`)
  })

  it("puts the arrow on the edge that faces the target, and the gap on that side", () => {
    const root = example("variations")
    const size = (popup: HTMLElement) => parseFloat(getComputedStyle(popup).fontSize) * 0.71428
    for (const [name, edge] of [
      ["Top left", "bottom"],
      ["Top center", "bottom"],
      ["Bottom right", "top"],
      ["Left center", "right"],
      ["Right center", "left"]
    ] as const) {
      const popup = popupNamed(root, name)
      const box = popup.getBoundingClientRect()
      const arrow = getComputedStyle(popup, "::before")
      expect(arrow.transform, name).not.toBe("none")
      expect(parseFloat(arrow.width), name).toBeCloseTo(size(popup), 0)
      // the arrow straddles its edge:  its offset from that edge is negative
      expect(parseFloat(arrow[edge]), name).toBeLessThan(0)
      const margin = getComputedStyle(popup)[`margin${edge[0]!.toUpperCase()}${edge.slice(1)}` as "marginTop"]
      expect(parseFloat(margin), name).toBeCloseTo(size(popup), 0)
      expect(box.width).toBeGreaterThan(0)
    }
    // centred:  at 50%, pulled back by half its size
    const centred = popupNamed(root, "Top center")
    const arrow = getComputedStyle(centred, "::before")
    expect(parseFloat(arrow.left) + parseFloat(arrow.marginLeft)).toBeCloseTo(
      centred.clientWidth / 2 - size(centred) / 2 + 0.05 * parseFloat(getComputedStyle(centred).fontSize),
      0
    )
  })

  it("variations:  basic has no arrow;  wide / very wide / fixed / flowing widths (narrower on mobile)", async () => {
    await resize(1000)
    const root = example("variations")
    expect(getComputedStyle(popupNamed(root, "No pointing arrow"), "::before").display).toBe("none")
    expect(getComputedStyle(popupNamed(root, "A wide popup")).maxWidth).toBe("350px")
    expect(getComputedStyle(popupNamed(root, "A very wide popup")).maxWidth).toBe("550px")
    expect(getComputedStyle(popupNamed(root, "Always its full width")).width).toBe("250px")
    expect(getComputedStyle(popupNamed(root, "A flowing popup")).maxWidth).toBe("none")
    await page.viewport(500, 800)
    expect(getComputedStyle(popupNamed(root, "A very wide popup")).maxWidth).toBe("250px")
  })

  it("sizes by the size remap", () => {
    const root = example("variations")
    const medium = parseFloat(getComputedStyle(popupNamed(root, "Medium")).fontSize)
    expect(parseFloat(getComputedStyle(popupNamed(root, "Small")).fontSize)).toBeCloseTo(medium * 0.875, 1)
    expect(parseFloat(getComputedStyle(popupNamed(root, "Large")).fontSize)).toBeGreaterThan(medium)
  })

  it("colours:  a coloured popup fills box and arrow with the hue;  inverted takes the ink, or the light hue", () => {
    const root = example("variations")
    const probe = getComputedStyle(
      Fixture.render(
        `<span style="background: var(--ui-red); color: var(--ui-ink); outline-color: var(--ui-red-inverted)"></span>`
      )
    )
    const red = popupNamed(root, "Red")
    expect(getComputedStyle(red).backgroundColor).toBe(probe.backgroundColor)
    expect(getComputedStyle(red, "::before").backgroundColor).toBe(probe.backgroundColor)
    expect(getComputedStyle(red).borderTopColor).toBe(probe.backgroundColor)
    const inverted = getComputedStyle(popupNamed(root, "An inverted popup"))
    expect(inverted.backgroundColor).toBe(probe.color)
    expect(inverted.boxShadow).toBe("none")
    expect(getComputedStyle(popupNamed(root, "Red inverted")).backgroundColor).toBe(probe.outlineColor)
  })

  it("loading:  a spinner over faded content", () => {
    const root = example("states")
    const popup = root.querySelector<HTMLElement>(".ui.loading.popup")!
    expect(getComputedStyle(popup, "::after").animationName).toBe("ui-popup-spin")
    expect(getComputedStyle(popup.querySelector(".header")!).opacity).toBe("0.3")
    expect(getComputedStyle(popup).pointerEvents).toBe("none")
  })
})

////////////////
// ## `native.css` tooltip
////////////////

describe("native.css tooltip", () => {
  it("draws the bubble and arrow on hover-able elements, hidden until hovered", () => {
    const root = example("types")
    const button = root.querySelector<HTMLElement>("[data-tooltip]:not([data-position])")!
    const bubble = getComputedStyle(button, "::after")
    expect(bubble.content).toBe('"Add users to your feed"')
    expect(bubble.opacity).toBe("0")
    expect(getComputedStyle(button, "::before").opacity).toBe("0")
    expect(getComputedStyle(button).position).toBe("relative")
  })

  it("places the bubble by data-position", () => {
    const root = example("types")
    const below = root.querySelector<HTMLElement>('[data-position="bottom left"]')!
    expect(parseFloat(getComputedStyle(below, "::after").top)).toBeCloseTo(below.getBoundingClientRect().height, 0)
    const beside = root.querySelector<HTMLElement>('[data-position="right center"]')!
    expect(parseFloat(getComputedStyle(beside, "::after").left)).toBeCloseTo(beside.getBoundingClientRect().width, 0)
    const leftBottom = root.querySelector<HTMLElement>('[data-position="left bottom"]')!
    expect(parseFloat(getComputedStyle(leftBottom, "::after").right)).toBeCloseTo(
      leftBottom.getBoundingClientRect().width,
      0
    )
    expect(parseFloat(getComputedStyle(leftBottom, "::after").bottom)).toBe(0)
  })

  it("shows a data-variation=visible tooltip, inverted in the ink colour", () => {
    const root = example("types")
    const tip = root.querySelector<HTMLElement>("[data-inverted]")!
    expect(getComputedStyle(tip, "::after").opacity).toBe("1")
    const ink = getComputedStyle(Fixture.render(`<span style="background: var(--ui-ink)"></span>`)).backgroundColor
    expect(getComputedStyle(tip, "::after").backgroundColor).toBe(ink)
  })
})

////////////////
// ## `native.css` tooltip shown states
////////////////

describe("native.css tooltip shown states", () => {
  /** Scale factor of a computed `matrix(a, ...)` transform (`none` ~== 1). */
  function scaleOf(transform: string): number {
    return transform === "none" ? 1 : parseFloat(transform.replace(/^matrix\(/, ""))
  }

  it.each(["", "top center", "bottom left", "left center", "right top"])(
    "a data-variation=visible tooltip (position %j) is full size, not 80%%",
    (position) => {
      Sheets.adopt([...foundationCSS, nativeCSS, buttonCSS])
      const attributes = position ? `data-position="${position}"` : ""
      const button = Fixture.render(`<button data-tooltip="Hi" data-variation="visible" ${attributes}>x</button>`)
      expect(getComputedStyle(button, "::after").opacity).toBe("1")
      expect(scaleOf(getComputedStyle(button, "::after").transform)).toBe(1)
      // `::before` is the arrow, rotated 45deg:  cos(45deg) * scale
      expect(parseFloat(getComputedStyle(button, "::before").transform.replace(/^matrix\(/, ""))).toBeCloseTo(
        Math.cos(Math.PI / 4),
        3
      )
    }
  )

  it("shows on KEYBOARD focus of a focus-delegating <ui-button> host", async () => {
    Sheets.adopt([...foundationCSS, nativeCSS])
    const host = await ElementFixture.render<UIHost>(`<ui-button data-tooltip="Add users">Top center</ui-button>`)
    await ElementFixture.settle(host)
    expect(getComputedStyle(host, "::after").opacity).toBe("0")
    await Keys.tab()
    expect(document.activeElement, "focus landed on the host").toBe(host)
    expect(host.matches(":focus"), "host :focus").toBe(true)
    expect(host.shadowRoot!.querySelector(":focus-visible"), "inner :focus-visible").not.toBeNull()
    // the host itself is NOT `:focus-visible` (only the inner button is):  why `native.css` also reads `:focus-within`
    expect(host.matches(":focus-visible"), "host :focus-visible").toBe(false)
    await expect.poll(() => getComputedStyle(host, "::after").opacity).toBe("1")
  })

  it("a mouse-focused native <button> doesn't pin its tooltip open", async () => {
    Sheets.adopt([...foundationCSS, nativeCSS, buttonCSS])
    const button = Fixture.render(`<button data-tooltip="Hi">x</button>`)
    await userEvent.click(button)
    // Safari doesn't focus a button on click:  focus it (after the mouse, so it still isn't :focus-visible)
    button.focus()
    await userEvent.unhover(button)
    expect(document.activeElement).toBe(button)
    expect(button.matches(":focus-visible")).toBe(false)
    await expect.poll(() => getComputedStyle(button, "::after").opacity).toBe("0")
  })
})

/** Set the viewport to `width` for this test (Fomantic's breakpoints are the viewport's). */
async function resize(width: number) {
  const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
  await page.viewport(width, 800)
  onTestFinished(() => page.viewport(previousWidth, previousHeight))
}

////////////////
// ## Tokens
////////////////

describe("ui-popup.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, popupCSS])
    const root = Fixture.render(`<div style="--ui-popup-radius: 20px"><div class="ui visible popup">x</div></div>`)
    expect(getComputedStyle(root.querySelector(".ui.popup")!).borderTopLeftRadius).toBe("20px")
  })
})
