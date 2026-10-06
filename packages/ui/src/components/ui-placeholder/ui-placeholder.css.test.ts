import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { placeholderHeaderVocabulary } from "./ui-placeholder-header.vocabulary.en"
import { placeholderImageVocabulary } from "./ui-placeholder-image.vocabulary.en"
import { placeholderLineVocabulary } from "./ui-placeholder-line.vocabulary.en"
import { placeholderParagraphVocabulary } from "./ui-placeholder-paragraph.vocabulary.en"
import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"

import placeholderCSS from "./ui-placeholder.css?inline"
import placeholderRaw from "./ui-placeholder.css?raw"

/**
 * `ui-placeholder.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow roots will use), and real nested shadow hosts whose
 * spacing and line lengths are decided by HOST position.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Every vocabulary the sheet serves. */
const VOCABULARIES = [
  placeholderVocabulary,
  placeholderHeaderVocabulary,
  placeholderParagraphVocabulary,
  placeholderLineVocabulary,
  placeholderImageVocabulary
]

/** Shapes that paint the shimmer, in static markup. */
const SHAPES = ".ui.placeholder .line, .ui.placeholder .image:not(.header)"

////////////////
// ## Source
////////////////

describe("ui-placeholder.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(placeholderRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(placeholderRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(placeholderRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("placeholder"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host-position rules and its own keyframes", () => {
    for (const css of [placeholderCSS, placeholderRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(20)
      expect(selectors.some((selector) => selector.includes(":host(:nth-child(2)) > .line"))).toBe(true)
      expect(selectors.some((selector) => selector.includes("of :state(placeholder)"))).toBe(true)
      const sheet = Sheets.from([css])[0]!
      const keyframes = [...sheet.cssRules].filter((rule) => rule instanceof CSSKeyframesRule)
      expect(keyframes.map((rule) => (rule as CSSKeyframesRule).name)).toEqual(["ui-placeholder-shimmer"])
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = placeholderRaw + colorsCSS
    for (const vocabulary of VOCABULARIES) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
      expect(Sheets.covers(placeholderRaw, vocabulary.noun), vocabulary.noun).toBe(true)
    }
    // `length` is `kind: "valueOnly"` (value alone), which `classPhrases` skips.
    for (const length of placeholderLineVocabulary.attributes[0].values)
      expect(Sheets.covers(placeholderRaw, length), length).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-placeholder.css examples", () => {
  it.each(Object.keys(EXAMPLES))("paints every shape in %s with the shared, fixed shimmer", (path) => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const shapes = root.querySelectorAll<HTMLElement>(SHAPES)
    expect(shapes.length).toBeGreaterThan(0)
    for (const shape of shapes) {
      const label = shape.outerHTML.slice(0, 80)
      expect(getComputedStyle(shape), label).toMatchObject({
        animationName: "ui-placeholder-shimmer",
        animationIterationCount: "infinite",
        backgroundAttachment: "fixed",
        backgroundImage: expect.stringContaining("linear-gradient")
      })
      const rect = shape.getBoundingClientRect()
      expect(rect.width, label).toBeGreaterThan(0)
      expect(rect.height, label).toBeGreaterThan(0)
    }
    for (const placeholder of root.querySelectorAll(".ui.placeholder"))
      expect(getComputedStyle(placeholder).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    for (const header of root.querySelectorAll(".ui.placeholder .image.header"))
      expect(getComputedStyle(header, "::before").animationName).toBe("ui-placeholder-shimmer")
  })

  it("spaces lines and blocks, none before the first, and varies line lengths by position", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES["./examples/content.html"]!)
    const [lines, , , paragraphs] = root.querySelectorAll<HTMLElement>(".ui.placeholder")
    const bars = [...lines!.querySelectorAll<HTMLElement>(".line")]
    const width = lines!.getBoundingClientRect().width
    expect(getComputedStyle(lines!).maxWidth).toBe("480px")
    expect(bars.map((bar) => Math.round((bar.getBoundingClientRect().width / width) * 100))).toEqual([
      100, 50, 90, 65, 35
    ])
    expect(getComputedStyle(bars[0]!).marginTop).toBe("0px")
    const gap = parseFloat(getComputedStyle(bars[1]!).marginTop)
    expect(gap).toBeCloseTo((16 * 12) / 14, 1)
    expect(bars[1]!.getBoundingClientRect().top - bars[0]!.getBoundingClientRect().bottom).toBeCloseTo(gap, 1)
    expect(bars[0]!.getBoundingClientRect().height).toBeCloseTo(8, 1)
    const [first, second] = paragraphs!.querySelectorAll<HTMLElement>(".paragraph")
    expect(getComputedStyle(first!).marginTop).toBe("0px")
    expect(parseFloat(getComputedStyle(second!).marginTop)).toBeCloseTo((16 * 20) / 14, 1)
  })

  it("draws headers with taller, shorter lines, and an image header's square beside them", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES["./examples/content.html"]!)
    const [header, imageHeader] = root.querySelectorAll<HTMLElement>(".ui.placeholder .header")
    const [one, two] = header!.querySelectorAll<HTMLElement>(".line")
    const width = header!.getBoundingClientRect().width
    expect(one!.getBoundingClientRect().height).toBeCloseTo((16 * 9) / 14, 1)
    expect(one!.getBoundingClientRect().width / width).toBeCloseTo(0.8, 2)
    expect(two!.getBoundingClientRect().width / width).toBeCloseTo(0.4, 2)
    const square = getComputedStyle(imageHeader!, "::before")
    expect(square.position).toBe("absolute")
    expect(parseFloat(square.width)).toBeCloseTo(48, 0)
    expect(imageHeader!.getBoundingClientRect().height).toBeGreaterThanOrEqual(48)
    const line = imageHeader!.querySelector<HTMLElement>(".line")!
    expect(line.getBoundingClientRect().left - imageHeader!.getBoundingClientRect().left).toBeCloseTo(58, 0)
  })

  it("sizes images by height or by aspect", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES["./examples/content.html"]!)
    const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect()
    expect(rect('.ui.placeholder .image[class="image"]').height).toBeCloseTo(100, 0)
    expect(rect(".square.image").height).toBeCloseTo(rect(".square.image").width, 0)
    expect(rect(".rectangular.image").height).toBeCloseTo(rect(".rectangular.image").width * 0.75, 0)
  })

  it("sets line lengths explicitly, and lets fluid placeholders fill their container", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [lengths, fluid] = root.querySelectorAll<HTMLElement>(".ui.placeholder")
    const width = lengths!.getBoundingClientRect().width
    const percents = [...lengths!.querySelectorAll(".line")].map((line) =>
      Math.round((line.getBoundingClientRect().width / width) * 100)
    )
    expect(percents).toEqual([100, 90, 65, 50, 35, 20])
    expect(getComputedStyle(fluid!).maxWidth).toBe("none")
    expect(fluid!.getBoundingClientRect().width).toBeCloseTo(fluid!.parentElement!.getBoundingClientRect().width, 0)
  })

  it("spaces consecutive placeholders apart", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const section = [...root.querySelectorAll("section")].at(-1)!
    const [first, second, third] = section.querySelectorAll<HTMLElement>(".ui.placeholder")
    expect(getComputedStyle(first!).marginTop).toBe("0px")
    expect(getComputedStyle(second!).marginTop).toBe("32px")
    expect(getComputedStyle(third!).marginTop).toBe("32px")
  })

  it("inverts into the dark scheme, and the shapes' ink follows", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(
      `<div><div class="ui placeholder"><div class="line"></div></div>` +
        `<div class="ui inverted placeholder"><div class="line"></div></div></div>`
    )
    const [plain, inverted] = root.querySelectorAll<HTMLElement>(".ui.placeholder")
    expect(getComputedStyle(inverted!).colorScheme).toBe("dark")
    expect(getComputedStyle(inverted!).getPropertyValue("--ui-inverted").trim()).toBe("1")
    const image = (placeholder: HTMLElement) => getComputedStyle(placeholder.querySelector(".line")!).backgroundImage
    expect(image(inverted!)).not.toBe(image(plain!))
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-placeholder.css tokens", () => {
  it("takes a public token from a wrapper, the placeholder or a shape (static markup)", () => {
    Sheets.adopt([...foundationCSS, placeholderCSS])
    const root = Fixture.render(
      `<div style="--ui-placeholder-max-width: 200px"><div class="ui placeholder"><div class="line"></div></div></div>` +
        `<div class="ui placeholder" style="--ui-placeholder-radius: 7px"><div class="line"></div>` +
        `<div class="line" style="--ui-placeholder-radius: 3px"></div></div>`
    )
    expect(getComputedStyle(root.firstElementChild!).maxWidth).toBe("200px")
    const [plain, own] = root.nextElementSibling!.children
    expect(getComputedStyle(plain!).borderTopLeftRadius).toBe("7px")
    expect(getComputedStyle(own!).borderTopLeftRadius).toBe("3px")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("ui-placeholder.css in shadow roots", () => {
  it("decides line spacing, lengths and block spacing by HOST position, through nested shadow roots", () => {
    Sheets.adopt(foundationCSS)
    const placeholder = shapeHost(PLACEHOLDER_TAG, `<div class="ui placeholder" part="placeholder"><slot></slot></div>`)
    Fixture.render(`<div style="width: 600px"></div>`).append(placeholder)
    const header = shapeHost("span", `<div class="image header" part="header"><slot></slot></div>`)
    const paragraph = shapeHost("span", `<div class="paragraph" part="paragraph"><slot></slot></div>`)
    placeholder.append(header, paragraph)
    const headerLines = [line(), line()]
    header.append(...headerLines)
    const paragraphLines = [line(), line(), line(), line("short")]
    paragraph.append(...paragraphLines)

    expect(getComputedStyle(placeholder).display).toBe("contents")
    expect(getComputedStyle(paragraphLines[0]!).display).toBe("contents")
    const root = Sheets.inner(placeholder)
    expect(root.getBoundingClientRect().width).toBeCloseTo(480, 0)

    const bars = paragraphLines.map((host) => Sheets.inner(host))
    expect(getComputedStyle(bars[0]!).marginTop).toBe("0px")
    expect(parseFloat(getComputedStyle(bars[1]!).marginTop)).toBeCloseTo((16 * 12) / 14, 1)
    expect(getComputedStyle(bars[0]!).animationName).toBe("ui-placeholder-shimmer")
    expect(getComputedStyle(bars[0]!).backgroundAttachment).toBe("fixed")
    const width = Sheets.inner(paragraph).getBoundingClientRect().width
    expect(bars.map((bar) => Math.round((bar.getBoundingClientRect().width / width) * 100))).toEqual([100, 50, 90, 35])

    const headerBars = headerLines.map((host) => Sheets.inner(host))
    expect(headerBars[0]!.getBoundingClientRect().height).toBeCloseTo((16 * 9) / 14, 1)
    expect(bars[0]!.getBoundingClientRect().height).toBeCloseTo(8, 1)
    expect(getComputedStyle(headerBars[0]!).marginTop).toBe("0px")
    expect(getComputedStyle(headerBars[1]!).marginTop).not.toBe("0px")
    const headerRoot = Sheets.inner(header)
    expect(getComputedStyle(headerRoot, "::before").animationName).toBe("ui-placeholder-shimmer")
    expect(getComputedStyle(headerRoot).marginTop).toBe("0px")
    expect(parseFloat(getComputedStyle(Sheets.inner(paragraph)).marginTop)).toBeCloseTo((16 * 20) / 14, 1)
  })

  it("hands the dark scheme to its shapes, and spaces consecutive placeholder hosts by their state", () => {
    Sheets.adopt(foundationCSS)
    const box = Fixture.render(`<div><p>Before</p></div>`)
    const [first, second] = [0, 1].map(() => {
      const host = shapeHost(PLACEHOLDER_TAG, `<div class="ui inverted placeholder"><slot></slot></div>`)
      host.append(line())
      box.append(host)
      return host
    })
    expect(getComputedStyle(Sheets.inner(first!)).marginTop).toBe("0px")
    expect(getComputedStyle(Sheets.inner(second!)).marginTop).toBe("32px")
    const bar = Sheets.inner(first!.firstElementChild!)
    expect(getComputedStyle(bar).colorScheme).toBe("dark")
  })
})

/** Tag of a test-only element standing in for `<ui-placeholder>`:  it sets `:state(placeholder)`, as the element MUST. */
const PLACEHOLDER_TAG = "test-placeholder-host"

if (!customElements.get(PLACEHOLDER_TAG)) {
  customElements.define(
    PLACEHOLDER_TAG,
    class extends HTMLElement {
      constructor() {
        super()
        this.attachInternals().states.add("placeholder")
      }
    }
  )
}

/** A detached `tag` host whose shadow root adopts the placeholder sheets and holds `html`. */
function shapeHost(tag: string, html: string): HTMLElement {
  const host = document.createElement(tag)
  Sheets.attach(host, html, sheets())
  return host
}

/** A `<ui-placeholder-line>` stand-in, with an optional length class. */
function line(length?: string): HTMLElement {
  const classes = length ? `${length} line` : "line"
  return shapeHost("span", `<div class="${classes}" part="line"></div>`)
}

/** Foundation plus `ui-placeholder.css`, as every placeholder host adopts them. */
function sheets(): string[] {
  return [...foundationCSS, placeholderCSS]
}
