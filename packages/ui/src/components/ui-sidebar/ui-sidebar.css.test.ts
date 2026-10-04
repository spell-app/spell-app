import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { sidebarVocabulary } from "./ui-sidebar.vocabulary.en"

import menuCSS from "$/ui/components/ui-menu/ui-menu.css?inline"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import sidebarCSS from "./ui-sidebar.css?inline"
import sidebarRaw from "./ui-sidebar.css?raw"

/**
 * `ui-sidebar.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (Fomantic's class grammar, with its sibling rules), and the pusher tokens the elements use.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the sheets and render the example. */
function example(): HTMLElement {
  Sheets.adopt([...foundationCSS, segmentCSS, menuCSS, sidebarCSS])
  return Fixture.render(EXAMPLES["./examples/sidebar.html"]!)
}

/** The x / y translation of an element's computed transform. */
function translation(element: Element): [number, number] {
  const matrix = new DOMMatrix(getComputedStyle(element).transform)
  return [Math.round(matrix.m41), Math.round(matrix.m42)]
}

describe("ui-sidebar.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(sidebarRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(sidebarRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(sidebarRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("sidebar"))).toBe(true)
  })

  it("parses with replaceSync, keeping the pusher's dimmer and the element panels", () => {
    for (const css of [sidebarCSS, sidebarRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain(".pusher::after")
      expect(selectors).toContain(":host(:state(pushable))")
    }
    expect(sidebarCSS).toContain("@container style(--_ui-pusher-dimmed: 1)")
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = sidebarRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(sidebarVocabulary))
      expect(Sheets.covers(css, phrase), `${sidebarVocabulary.tag}: ${phrase}`).toBe(true)
    for (const spec of sidebarVocabulary.attributes) {
      if (spec.kind !== "valueOnly") continue
      for (const value of spec.values) expect(Sheets.covers(css, value), `${spec.name}: ${value}`).toBe(true)
    }
  })
})

describe("ui-sidebar.css examples", () => {
  it("a visible left sidebar:  inside its pushable, full height, and the pusher beside it", () => {
    const root = example()
    const [pushable] = root.querySelectorAll<HTMLElement>(".pushable")
    const sidebar = pushable!.querySelector<HTMLElement>(".sidebar")!
    const pusher = pushable!.querySelector<HTMLElement>(".pusher")!
    expect(getComputedStyle(sidebar).position).toBe("absolute")
    expect(getComputedStyle(sidebar).visibility).toBe("visible")
    expect(sidebar.offsetWidth).toBe(260)
    expect(sidebar.offsetHeight).toBe(pushable!.clientHeight)
    expect(getComputedStyle(pushable!).overflow).toBe("hidden")
    expect(translation(pusher)).toEqual([260, 0])
  })

  it("overlay never moves the pusher;  thin is 150px on the right", () => {
    const root = example()
    const pushable = root.querySelectorAll<HTMLElement>(".pushable")[1]!
    const sidebar = pushable.querySelector<HTMLElement>(".sidebar")!
    expect(sidebar.offsetWidth).toBe(150)
    expect(sidebar.getBoundingClientRect().right).toBeCloseTo(pushable.getBoundingClientRect().right - 1, 0)
    expect(translation(pushable.querySelector(".pusher")!)).toEqual([0, 0])
  })

  it("a dimmed pusher shows its dimmer;  a top sidebar is full width", () => {
    const root = example()
    const pushable = root.querySelectorAll<HTMLElement>(".pushable")[2]!
    const pusher = pushable.querySelector<HTMLElement>(".pusher")!
    expect(getComputedStyle(pusher, "::after").width).toBe(`${pusher.clientWidth}px`)
    expect(pushable.querySelector<HTMLElement>(".sidebar")!.offsetWidth).toBe(pushable.clientWidth)
  })

  it("a column width is that share of the viewport, and the pusher moves by it", () => {
    const root = example()
    const pushable = root.querySelectorAll<HTMLElement>(".pushable")[3]!
    const sidebar = pushable.querySelector<HTMLElement>(".sidebar")!
    // `%` of the containing block:  the viewport, or the pushable when it is one (a transform)
    expect(sidebar.getBoundingClientRect().width).toBeCloseTo(innerWidth / 4, -1)
    const pushed = Fixture.render(
      `<div class="pushable" style="height: 100px"><div class="ui left four wide visible sidebar"></div>` +
        `<div class="pusher"></div></div>`
    )
    expect(translation(pushed.querySelector(".pusher")!)[0]).toBeCloseTo(innerWidth / 4, -1)
  })

  it("hidden sidebars sit off their edge;  uncover ones under the pusher, in place", () => {
    Sheets.adopt([...foundationCSS, sidebarCSS])
    const root = Fixture.render(
      `<div class="pushable" style="height: 100px"><div class="ui left sidebar"></div>` +
        `<div class="ui right sidebar"></div><div class="ui left uncover sidebar"></div>` +
        `<div class="ui left slide along sidebar"></div><div class="pusher"></div></div>`
    )
    const [left, right, uncover, along] = root.querySelectorAll<HTMLElement>(".sidebar")
    expect(getComputedStyle(left!).visibility).toBe("hidden")
    expect(translation(left!)).toEqual([-260, 0])
    expect(translation(right!)).toEqual([260, 0])
    expect(translation(uncover!)).toEqual([0, 0])
    expect(Number(getComputedStyle(uncover!).zIndex)).toBeLessThan(2)
    expect(translation(along!)).toEqual([-130, 0])
  })
})

describe("pusher tokens", () => {
  it("move, shrink and dim the pusher", () => {
    Sheets.adopt([...foundationCSS, sidebarCSS])
    const root = Fixture.render(
      `<div class="pushable" style="--_ui-pusher-transform: scale(0.75); --_ui-pusher-origin: 75% 50%; ` +
        `--_ui-pusher-dimmed: 1; --ui-sidebar-duration: 0s"><div class="pusher" style="height: 50px"></div></div>`
    )
    const pusher = root.querySelector<HTMLElement>(".pusher")!
    expect(getComputedStyle(pusher).transform).toBe("matrix(0.75, 0, 0, 0.75, 0, 0)")
    expect(getComputedStyle(pusher).transformOrigin.startsWith(`${pusher.offsetWidth * 0.75}px`)).toBe(true)
    expect(getComputedStyle(pusher, "::after").opacity).toBe("1")
  })
})

describe("ui-sidebar.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, sidebarCSS])
    const root = Fixture.render(
      `<div style="--ui-sidebar-width: 222px"><div class="pushable"><div class="ui left sidebar">x</div><div class="pusher">y</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.sidebar")!).width).toBe("222px")
  })
})
