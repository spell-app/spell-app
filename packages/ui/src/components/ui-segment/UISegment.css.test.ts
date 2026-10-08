import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { segmentsVocabulary } from "./UISegments.vocabulary.en"
import { segmentVocabulary } from "./UISegment.vocabulary.en"

import segmentCSS from "./UISegment.css?inline"
import segmentRaw from "./UISegment.css?raw"

/**
 * `UISegment.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow roots will use), and what a segment hands its content.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UISegment.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(segmentRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(segmentRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(segmentRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("segment"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted group rules and inlining the breakpoints", () => {
    for (const css of [segmentCSS, segmentRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(80)
      expect(selectors.some((selector) => selector.includes(".ui.segments > ::slotted(:first-child)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:not(:first-child)) > .ui.segment"))).toBe(true)
    }
    expect(segmentCSS).not.toContain("--ui-tablet")
    expect(segmentCSS).toMatch(/width\s*>=\s*1920px|min-width:\s*1920px/)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = segmentRaw + colorsCSS
    for (const vocabulary of [segmentVocabulary, segmentsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UISegment.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every segment in %s", (path) => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const segments = root.querySelectorAll<HTMLElement>(".ui.segment")
    expect(segments.length).toBeGreaterThan(0)
    for (const segment of segments) {
      const style = getComputedStyle(segment)
      expect(style.position, segment.outerHTML.slice(0, 80)).toBe("relative")
      expect(style.boxSizing).toBe("border-box")
      expect(parseFloat(style.fontSize)).toBeGreaterThan(0)
    }
  })

  it("draws a plain segment as a bordered, rounded, lightly shadowed box", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const style = getComputedStyle(root.querySelector('.ui.segment[class="ui segment"]')!)
    expect(style.borderTopStyle).toBe("solid")
    expect(style.borderBottomWidth).toBe("1px")
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(style.boxShadow).toMatch(/px/)
    expect(parseFloat(style.paddingTop)).toBe(parseFloat(style.fontSize))
    const vertical = [...root.querySelectorAll<HTMLElement>(".ui.vertical.segment")]
    expect(getComputedStyle(vertical[1]!).marginTop).toBe("0px")
    expect(getComputedStyle(vertical[0]!).borderTopStyle).toBe("none")
    expect(getComputedStyle(vertical[1]!).borderTopStyle).toBe("solid")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(`<div style="--ui-segment-radius: 12px"><div class="ui segment">x</div></div>`)
    expect(getComputedStyle(root.querySelector(".ui.segment")!).borderTopLeftRadius).toBe("12px")
  })

  it("colours the top edge, and fills inverted ones in the dark scheme", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const colored = getComputedStyle(root.querySelector(".ui.red.segment:not(.inverted)")!)
    expect(colored.borderTopColor).toBe(getComputedStyle(red).color)
    expect(colored.boxShadow).toContain("inset")
    const inverted = root.querySelector<HTMLElement>(".ui.inverted.segment:not(.red, .teal, .secondary)")!
    const style = getComputedStyle(inverted)
    expect(style.colorScheme).toBe("dark")
    expect(style.getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(luminance(style.backgroundColor)).toBeLessThan(0.3)
    expect(luminance(style.color)).toBeGreaterThan(0.7)
    expect(luminance(getComputedStyle(inverted.querySelector("p:last-child")!).color)).toBeGreaterThan(0.5)
  })

  it("inverts the members of an inverted group (Fomantic: dark members), not segments nested in them", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(
      `<div class="ui inverted segments"><div class="ui segment" id="m"><div class="ui segment" id="n">N</div></div></div>`
    )
    const member = getComputedStyle(root.querySelector("#m")!)
    expect(member.colorScheme).toBe("dark")
    expect(member.getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(luminance(member.backgroundColor)).toBeLessThan(0.3)
    const nested = getComputedStyle(root.querySelector("#n")!)
    expect(nested.colorScheme).toBe("light")
    expect(luminance(nested.backgroundColor)).toBeGreaterThan(0.7)
  })

  it("resets a plain segment nested in an inverted one to the light scheme, Fomantic-style", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(
      `<div class="ui inverted segment"><div class="ui segment"><p>Plain again</p></div></div>`
    )
    const outer = getComputedStyle(root)
    expect(outer.colorScheme).toBe("dark")
    expect(outer.getPropertyValue("--ui-inverted").trim()).toBe("1")
    const inner = getComputedStyle(root.querySelector(".ui.segment")!)
    expect(inner.colorScheme).toBe("light")
    expect(inner.getPropertyValue("--ui-inverted").trim()).toBe("0")
  })

  it("collapses a group nested directly in another group to a divider line, no box of its own", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(`<div class="ui segments">
      <div class="ui segment"><p>Top</p></div>
      <div class="ui segments">
        <div class="ui segment"><p>Nested top</p></div>
        <div class="ui segment"><p>Nested bottom</p></div>
      </div>
    </div>`)
    expect(getComputedStyle(root.querySelector(".ui.segments > .ui.segments")!)).toMatchObject({
      marginTop: "0px",
      boxShadow: "rgba(0, 0, 0, 0) 0px 0px 0px 0px",
      borderBottomStyle: "none",
      borderTopStyle: "solid",
      borderTopLeftRadius: "0px"
    })
  })

  it("joins attached segments edge to edge", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [top, middle, bottom] = root.querySelectorAll<HTMLElement>(".ui.attached.segment:not(.seamless)")
    expect(parseFloat(getComputedStyle(top!).borderTopLeftRadius)).toBeGreaterThan(0)
    expect(getComputedStyle(top!).borderBottomLeftRadius).toBe("0px")
    expect(getComputedStyle(middle!).borderTopStyle).toBe("none")
    expect(parseFloat(getComputedStyle(bottom!).borderBottomRightRadius)).toBeGreaterThan(0)
    const parent = top!.parentElement!.getBoundingClientRect().width
    expect(top!.getBoundingClientRect().width).toBeCloseTo(parent + 2, 0)
    expect(middle!.getBoundingClientRect().top).toBeCloseTo(top!.getBoundingClientRect().bottom, 0)
  })

  it("groups segments into one box with hairlines, stacked or side by side", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const group = root.querySelector<HTMLElement>(".ui.segments")!
    expect(getComputedStyle(group).borderTopStyle).toBe("solid")
    const [first, second] = group.querySelectorAll<HTMLElement>(":scope > .segment")
    expect(getComputedStyle(first!).borderTopStyle).toBe("none")
    expect(parseFloat(getComputedStyle(first!).borderTopLeftRadius)).toBeGreaterThan(0)
    expect(getComputedStyle(second!).borderTopLeftRadius).toBe("0px")
    expect(getComputedStyle(second!).boxShadow).toContain("inset")
    expect(getComputedStyle(second!).marginTop).toBe("0px")
    const row = [...root.querySelectorAll<HTMLElement>(".ui.equal.width.horizontal.segments > .segment")]
    const widths = row.map((segment) => segment.getBoundingClientRect().width)
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1)
    expect(row[0]!.getBoundingClientRect().top).toBe(row[2]!.getBoundingClientRect().top)
    const nested = root.querySelector(".ui.tertiary.segment .ui.segments > .segment")!
    expect(getComputedStyle(nested).borderTopStyle).toBe("none")
  })

  it("dims disabled segments and spins loading ones", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.segment")!).opacity)).toBeCloseTo(0.45, 2)
    const loading = root.querySelector(".ui.loading.segment")!
    expect(getComputedStyle(loading, "::after").animationName).toBe("ui-segment-spin")
    expect(getComputedStyle(loading, "::before").position).toBe("absolute")
  })

  it("pads, fits, compacts, rounds, piles and scrolls", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const variations = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string) => getComputedStyle(variations.querySelector(selector)!)
    expect(parseFloat(style(".ui.padded.segment").paddingTop)).toBeCloseTo(
      1.5 * parseFloat(style(".ui.padded.segment").fontSize)
    )
    expect(parseFloat(style("[class*='very padded']").paddingTop)).toBeCloseTo(
      3 * parseFloat(style("[class*='very padded']").fontSize)
    )
    expect(style('.ui.fitted.segment[class="ui fitted segment"]').paddingTop).toBe("0px")
    expect(style(".ui.horizontally.fitted.segment").paddingLeft).toBe("0px")
    expect(style(".ui.horizontally.fitted.segment").paddingTop).not.toBe("0px")
    expect(style(".ui.compact.segment").display).toBe("table")
    expect(style(".ui.circular.segment").display).toBe("table-cell")
    expect(style(".ui.left.floated.segment").float).toBe("left")
    expect(style(".ui.center.aligned.segment").textAlign).toBe("center")
    expect(style(".ui.basic.segment").borderTopStyle).toBe("none")
    const veryShort = parseFloat(style("[class*='very short scrolling']").maxHeight)
    const short = parseFloat(style(".ui.resizable.scrolling.segment").height)
    expect(veryShort).toBeGreaterThan(0)
    expect(short).toBeGreaterThan(veryShort)
    expect(style(".ui.short.scrolling.resizable.segment").resize).toBe("vertical")
    const types = Fixture.render(EXAMPLES["./examples/types.html"]!)
    expect(getComputedStyle(types.querySelector(".ui.piled.segment")!, "::before").rotate).toMatch(/^-1\.2deg$/)
    expect(getComputedStyle(types.querySelector(".ui.piled.segment")!.parentElement!).zIndex).toBe("0")
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, segmentCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) =>
      size(`.ui.${name}.segment`)
    )
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.medium.segment")).toBe(size('.ui.segment[class="ui segment"]'))
  })
})

////////////////
// ## Shadow roots
////////////////

describe("UISegment.css in shadow roots", () => {
  it("spaces hosts by their position, and hands a group's corners to slotted segments", () => {
    Sheets.adopt(foundationCSS)
    const group = Sheets.host(`<div class="ui segments" part="group"><slot></slot></div>`, sheets())
    const children = ["One", "Two", "Three"].map((text) => {
      const child = document.createElement("span")
      Sheets.attach(child, `<div class="ui segment" part="segment">${text}<slot></slot></div>`, sheets())
      group.append(child)
      return Sheets.inner(child)
    })
    expect(getComputedStyle(group).display).toBe("contents")
    expect(parseFloat(getComputedStyle(children[0]!).borderTopLeftRadius)).toBeGreaterThan(0)
    expect(getComputedStyle(children[1]!).borderTopLeftRadius).toBe("0px")
    expect(getComputedStyle(children[1]!).borderTopStyle).toBe("none")
    expect(parseFloat(getComputedStyle(children[2]!).borderBottomRightRadius)).toBeGreaterThan(0)
    const loose = Fixture.render(`<div><span></span><span></span></div>`)
    const [a, b] = [...loose.children].map((host) => {
      Sheets.attach(host, `<div class="ui segment">x</div>`, sheets())
      return Sheets.inner(host)
    })
    expect(getComputedStyle(a!).marginTop).toBe("0px")
    expect(getComputedStyle(b!).marginTop).not.toBe("0px")
    expect(getComputedStyle(a!).marginBottom).not.toBe("0px")
  })

  it("collapses a group nested directly in another group's shadow root the same way", () => {
    Sheets.adopt(foundationCSS)
    // Outer `<ui-segments>`:  its shadow root's `.ui.segments` holds a `<slot>`.
    const outer = Sheets.host(`<div class="ui segments" part="group"><slot></slot></div>`, sheets())
    const first = document.createElement("span")
    Sheets.attach(first, `<div class="ui segment" part="segment"><slot></slot></div>`, sheets())
    outer.append(first)
    // A nested `<ui-segments>`, second child of the outer group:  a `display: contents` DOM element with its OWN
    // shadow root, standing in for the custom element (`::slotted(ui-segments)` matches it by TAG).
    const nestedHost = document.createElement("ui-segments")
    outer.append(nestedHost)
    Sheets.attach(nestedHost, `<div class="ui segments" part="group"><slot></slot></div>`, sheets())
    const nestedFirst = document.createElement("span")
    Sheets.attach(nestedFirst, `<div class="ui segment" part="segment"><slot></slot></div>`, sheets())
    Sheets.inner(nestedHost).append(nestedFirst)

    expect(getComputedStyle(Sheets.inner(nestedHost))).toMatchObject({
      marginTop: "0px",
      boxShadow: "rgba(0, 0, 0, 0) 0px 0px 0px 0px",
      borderBottomStyle: "none",
      // second child of the outer group (not the first):  keeps its divider line on top
      borderTopStyle: "solid",
      borderTopLeftRadius: "0px"
    })
  })

  it("hands inverted to its content, but not its colour, scale or group layout", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(`<div class="ui large red inverted segment" part="segment"><slot></slot></div>`, sheets())
    host.innerHTML = `<span class="probe">Inside</span>`
    const probe = getComputedStyle(host.querySelector(".probe")!)
    expect(probe.colorScheme).toBe("dark")
    expect(probe.getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(probe.getPropertyValue("--ui-color").trim()).toBe("")
    expect(probe.getPropertyValue("--ui-scale").trim()).toBe("")
    expect(parseFloat(probe.fontSize)).toBeGreaterThan(16)
  })
})

////////////////
// ## Helpers
////////////////

/** The foundation plus `UISegment.css`, as a `<ui-segment>` adopts them. */
function sheets(): string[] {
  return [...foundationCSS, segmentCSS]
}

/** Relative luminance (0..1) of a computed `rgb()` / `oklch()` colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}
