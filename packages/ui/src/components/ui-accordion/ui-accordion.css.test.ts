import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { accordionVocabulary } from "./ui-accordion.vocabulary.en"

import accordionCSS from "./ui-accordion.css?inline"
import accordionRaw from "./ui-accordion.css?raw"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"

/**
 * `ui-accordion.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * class-grammar examples -- `<details>` panels, Fomantic's flat `.title` + `.content`, and a single
 * `details.ui.accordion`.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Foundation, the accordion, and the segment an inverted example sits in. */
function adopt() {
  Sheets.adopt([...foundationCSS, segmentCSS, accordionCSS])
}

/** Render example `name`. */
function example(name: string): HTMLElement {
  adopt()
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** Computed style of the first element matching `selector` under `root`. */
function style(root: Element, selector: string, pseudo?: string) {
  return getComputedStyle(root.querySelector(selector)!, pseudo)
}

////////////////
// ## Source
////////////////

describe("ui-accordion.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(accordionRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(accordionRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(accordionRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("accordion"))).toBe(true)
  })

  it("parses with replaceSync, keeping the three grammars and the animation", () => {
    for (const css of [accordionCSS, accordionRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.some((selector) => selector.includes(".accordion > details > .title"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(".accordion > .title"))).toBe(true)
      expect(selectors.some((selector) => selector.includes("details.accordion[open] > .title"))).toBe(true)
      expect(selectors.some((selector) => selector.includes("::details-content"))).toBe(true)
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(accordionVocabulary)) {
      expect(Sheets.covers(accordionRaw, phrase), phrase).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("ui-accordion.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every title in %s as a pointer row", (path) => {
    adopt()
    const root = Fixture.render(EXAMPLES[path]!)
    const titles = root.querySelectorAll<HTMLElement>(".accordion > .title, .accordion > details > .title")
    expect(titles.length).toBeGreaterThan(0)
    for (const title of titles) {
      expect(getComputedStyle(title).cursor).toBe("pointer")
      expect(getComputedStyle(title).display).toBe("flex")
      expect(getComputedStyle(title.querySelector(".dropdown.icon")!, "::before").width).toBe("6px")
    }
  })

  it("pads a plain accordion's titles and content;  no rule, no box", () => {
    const root = example("types")
    const plain = root.querySelector(".ui.accordion:not(.styled)")!
    expect(style(plain, ".title").paddingTop).toBe("8px")
    expect(style(plain, ".title").paddingLeft).toBe("0px")
    expect(style(plain, "details:not(:first-child) > .title").borderTopStyle).toBe("none")
    expect(style(plain, ".content").paddingBottom).toBe("16px")
    expect(style(plain, "details:last-child > .content").paddingBottom).toBe("0px")
    expect(getComputedStyle(plain).boxShadow).toBe("none")
  })

  it("draws the styled box:  bold unselected titles with rules, the open one selected, the arrow turned", () => {
    const root = example("types")
    const styled = root.querySelector<HTMLElement>(".ui.styled.accordion")!
    expect(getComputedStyle(styled).boxShadow).not.toBe("none")
    expect(parseFloat(getComputedStyle(styled).borderTopLeftRadius)).toBeGreaterThan(0)
    const [open, closed] = styled.querySelectorAll<HTMLElement>("details > .title")
    expect(getComputedStyle(open!).fontWeight).toBe("700")
    expect(getComputedStyle(open!).paddingLeft).toBe("16px")
    expect(getComputedStyle(open!).borderTopStyle).toBe("none")
    expect(getComputedStyle(closed!).borderTopWidth).toBe("1px")
    expect(getComputedStyle(open!).color).not.toBe(getComputedStyle(closed!).color)
    expect(getComputedStyle(open!.querySelector(".icon")!).transform).not.toBe("none")
    expect(getComputedStyle(closed!.querySelector(".icon")!).transform).toBe("none")
    expect(style(styled, "details:last-child > .content").paddingBottom).toBe("24px")
  })

  it("hides closed <details> content natively and the flat grammar's inactive content by class", () => {
    const root = example("content")
    const closed = root.querySelector<HTMLElement>("details:not([open]) > .content")!
    expect(closed.checkVisibility()).toBe(false)
    const flat = root.querySelector<HTMLElement>(".ui.accordion:not(details):has(> .title)")!
    const [active, hidden] = flat.querySelectorAll<HTMLElement>(":scope > .content")
    expect(getComputedStyle(active!).display).toBe("block")
    expect(getComputedStyle(hidden!).display).toBe("none")
    expect(getComputedStyle(flat.querySelector(".active.title > .icon")!).transform).not.toBe("none")
    const single = root.querySelector<HTMLElement>("details.ui.accordion")!
    expect(getComputedStyle(single.querySelector(".title > .icon")!).transform).not.toBe("none")
  })

  it("gives a nested accordion its parent's styled look and a top margin", () => {
    const root = example("content")
    const nested = root.querySelector<HTMLElement>(".ui.styled.accordion .accordion")!
    expect(getComputedStyle(nested).marginTop).toBe("16px")
    expect(style(nested, ".title").fontWeight).toBe("700")
    expect(getComputedStyle(nested).boxShadow).not.toBe("none")
  })

  it("resolves variations:  fluid, inverted, compact, very compact, basic styled, tree", () => {
    const root = example("variations")
    const fluid = root.querySelector<HTMLElement>(".ui.fluid.accordion")!
    expect(fluid.getBoundingClientRect().width).toBe(fluid.parentElement!.getBoundingClientRect().width)
    expect(getComputedStyle(root.querySelector(".ui.inverted.accordion")!).colorScheme).toBe("dark")
    expect(style(root, ".ui.compact.accordion:not(.styled) .title").paddingTop).toBe("4px")
    expect(style(root, '.ui[class*="very compact"].styled.accordion .title').paddingLeft).toBe("4px")
    const basic = root.querySelector<HTMLElement>(".ui.basic.styled.accordion")!
    expect(getComputedStyle(basic).boxShadow).toBe("none")
    expect(style(basic, "details:last-child > .title").borderTopStyle).toBe("none")
    const tree = root.querySelector<HTMLElement>(".ui.tree.accordion")!
    // (WebKit snaps lengths to 1/64 px)
    expect(parseFloat(style(tree, ".content").marginLeft)).toBeCloseTo(1.7 * 16, 1)
    expect(style(tree, ".content").paddingTop).toBe("0px")
    expect(style(tree, ".accordion").marginTop).toBe("0px")
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-accordion.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, accordionCSS])
    const root = Fixture.render(
      `<div style="--ui-accordion-title-padding: 20px 0"><div class="ui accordion"><div class="title">T</div><div class="content">C</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.accordion > .title")!).paddingTop).toBe("20px")
  })
})
