import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { cardVocabulary } from "./UICard.vocabulary.en"
import { cardsVocabulary } from "./UICards.vocabulary.en"

import iconCSS from "$/ui/components/ui-icon/UIIcon.css?inline"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"
import cardCSS from "./UICard.css?inline"
import cardRaw from "./UICard.css?raw"

/**
 * `UICard.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of the
 * light-DOM class-grammar examples -- cards, groups (`.ui.cards > .card`, no `ui`), images and static parts.
 * - `UIParts.css` is adopted too:  the examples' content blocks are static parts (`in-card`).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt what a page showing the static examples needs. */
function adopt() {
  Sheets.adopt([...foundationCSS, iconCSS, cardCSS, partsCSS])
}

/** Render example `name` inside a `width`-px wrapper;  returns its root. */
function example(name: string, width = 1000): HTMLElement {
  adopt()
  const wrapper = Fixture.render(`<div style="width: ${width}px"></div>`)
  wrapper.innerHTML = EXAMPLES[`./examples/${name}.html`]!
  return wrapper
}

/** The section whose `<h4>` says `title`. */
function sectionIn(root: Element, title: string): HTMLElement {
  const section = [...root.querySelectorAll("section")].find(
    (element) => element.querySelector("h4")?.textContent === title
  )
  if (!section) throw new Error(`no section "${title}"`)
  return section
}

/** Every card box in `root`:  `.ui.card`, and the ui-less cards of a group. */
function cardsIn(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(".ui.card, .ui.cards > .card")]
}

/** Computed style of `element`. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

////////////////
// ## Source
////////////////

describe("UICard.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(cardRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(cardRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(cardRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("card"))).toBe(true)
  })

  it("parses with replaceSync, keeping the group rules and container queries", () => {
    for (const css of [cardCSS, cardRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-cards)) > .ui.card"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:state(cards))"))).toBe(true)
      expect(css).toMatch(/@container ui-cards \(width < 768px\)/)
    }
  })

  it("pairs every card rule:  the ui card and a group's ui-less card", () => {
    const selectors = Sheets.selectors(cardCSS)
    expect(selectors.filter((selector) => selector.includes(".ui.cards > .card")).length).toBeGreaterThan(15)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = cardRaw + colorsCSS
    for (const vocabulary of [cardVocabulary, cardsVocabulary])
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UICard.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every card in %s", (path) => {
    adopt()
    const root = Fixture.render(`<div style="width: 1000px">${EXAMPLES[path]!}</div>`)
    const cards = cardsIn(root)
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(style(card).display, card.outerHTML.slice(0, 80)).toBe("flex")
      expect(card.getBoundingClientRect().height).toBeGreaterThan(0)
      expect(style(card).boxShadow).not.toBe("none")
    }
  })

  it("draws a 290px card with a border and shadow;  content padded, the first without a rule", () => {
    const [card] = cardsIn(sectionIn(example("types"), "Card"))
    expect(card!.getBoundingClientRect().width).toBe(290)
    const [content] = card!.querySelectorAll(".content")
    expect(style(content!).paddingTop).toBe("16px")
    expect(style(content!).borderTopWidth).toBe("1px")
    const image = card!.querySelector(".image")!
    expect(style(image).borderTopLeftRadius).not.toBe("0px")
    expect(image.querySelector("img")!.getBoundingClientRect().width).toBe(290)
    const [first] = cardsIn(sectionIn(example("content"), "Content block"))
    expect(style(first!.querySelector(".content")!).borderTopWidth).toBe("0px")
  })

  it("a card's header link and extra link carry no underline (Fomantic: colour and hover only)", () => {
    const [card] = cardsIn(sectionIn(example("types"), "Card"))
    expect(style(card!.querySelector("a.header")!).textDecorationLine).toBe("none")
    expect(style(card!.querySelector(".extra a")!).textDecorationLine).toBe("none")
  })

  it("lays out a group in a row with Fomantic's spacing", () => {
    const [a, b] = cardsIn(sectionIn(example("types"), "Cards")).map((card) => card.getBoundingClientRect())
    expect(a!.top).toBe(b!.top)
    expect(b!.left - a!.right).toBe(16)
  })

  it("sizes a group's cards by count, and doubles / stacks them in a narrow group", () => {
    const wide = cardsIn(sectionIn(example("groups"), "Column count")).map((card) => card.getBoundingClientRect())
    for (const box of wide) expect(box.width).toBeCloseTo((1000 + 32) / 3 - 32, 0)
    const narrow = cardsIn(sectionIn(example("groups", 600), "Doubling, stackable"))
    const boxes = narrow.map((card) => card.getBoundingClientRect())
    // stackable wins below 768px:  one card to a row
    expect(boxes[1]!.top).toBeGreaterThan(boxes[0]!.top)
    expect(boxes[0]!.width).toBeCloseTo(600, 0)
  })

  it("lays a horizontal card out in a row with a 150px image", () => {
    const [card] = cardsIn(sectionIn(example("types"), "Horizontal card"))
    expect(style(card!).flexDirection).toBe("row")
    expect(card!.querySelector(".image")!.getBoundingClientRect().width).toBe(150)
    expect(style(card!.querySelector(".content")!).borderTopWidth).toBe("0px")
  })

  it("colours a card's bottom line, tints a basic one, inverts one", () => {
    const root = example("variations")
    const [red] = cardsIn(sectionIn(root, "Colored"))
    expect(style(red!).boxShadow).not.toContain("rgba(0, 0, 0, 0) 0px 2px")
    const [plain, blue] = cardsIn(sectionIn(root, "Basic"))
    expect(style(plain!).boxShadow).not.toContain("1px 3px")
    expect(style(blue!).backgroundColor).not.toBe(style(plain!).backgroundColor)
    const [inverted] = cardsIn(sectionIn(root, "Inverted"))
    expect(style(inverted!).colorScheme).toBe("dark")
    expect(style(inverted!.querySelector(".header")!).color).not.toBe(style(plain!.querySelector(".header")!).color)
  })

  it("makes a fluid card full width and centres a centered one", () => {
    const root = example("variations")
    const [fluid] = cardsIn(sectionIn(root, "Fluid"))
    expect(fluid!.getBoundingClientRect().width).toBe(1000)
    const [centered] = cardsIn(sectionIn(root, "Centered"))
    expect(style(centered!).marginLeft).toBe(style(centered!).marginRight)
  })

  it("fades a disabled card and dims a loading one under a spinner", () => {
    const root = example("states")
    const [disabled] = cardsIn(sectionIn(root, "Disabled"))
    expect(Number(style(disabled!).opacity)).toBeLessThan(1)
    const [loading] = cardsIn(sectionIn(root, "Loading"))
    expect(style(loading!, "::before").position).toBe("absolute")
    expect(style(loading!, "::after").animationName).toBe("ui-card-spin")
  })
})
