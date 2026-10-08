import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { itemsVocabulary } from "./UIItems.en"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"
import imageCSS from "$/ui/components/ui-image/UIImage.css?inline"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"
import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"
import itemsCSS from "./UIItems.css?inline"
import itemsRaw from "./UIItems.css?raw"

/**
 * `UIItems.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of the
 * light-DOM class-grammar examples -- groups, items (`.ui.items > .item`), images and static parts (`in-item`).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt what a page showing the static examples needs. */
function adopt() {
  Sheets.adopt([...foundationCSS, imageCSS, buttonCSS, segmentCSS, itemsCSS, partsCSS])
}

/** Render example `name` inside a `width`-px wrapper;  returns its root. */
function example(name: string, width = 1000): HTMLElement {
  adopt()
  return Fixture.render(`<div style="width: ${width}px">${EXAMPLES[`./examples/${name}.html`]!}</div>`)
}

/** The items of the `index`th group in the section whose `<h4>` says `title`. */
function itemsIn(root: Element, title: string, index = 0): HTMLElement[] {
  const section = [...root.querySelectorAll("section")].find(
    (element) => element.querySelector("h4")?.textContent === title
  )
  if (!section) throw new Error(`no section "${title}"`)
  return [...section.querySelectorAll(".ui.items")[index]!.children] as HTMLElement[]
}

/** Computed style of `element`. */
function style(element: Element): CSSStyleDeclaration {
  return getComputedStyle(element)
}

////////////////
// ## Source
////////////////

describe("UIItems.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(itemsRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(itemsRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(itemsRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("items"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host-position item rules and the container queries", () => {
    for (const css of [itemsCSS, itemsRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(25)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-items):first-child) > .item"))).toBe(true)
      expect(css).toMatch(/@container \(width < 768px\)/)
      expect(css).toMatch(/@container style\(--_items-narrow: ?1\) and style\(--_items-stackable: ?1\)/)
    }
  })

  it("pairs every item rule:  the element's host state and the static class grammar", () => {
    const selectors = Sheets.selectors(itemsCSS)
    const element = selectors.filter((selector) => selector.includes(":host(:state(in-items)"))
    const statics = selectors.filter((selector) => selector.includes(".ui.items > .item"))
    expect(element.length).toBeGreaterThan(8)
    expect(statics.length).toBeGreaterThan(8)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = itemsRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(itemsVocabulary))
      expect(Sheets.covers(css, phrase), `${itemsVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIItems.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every item in %s", (path) => {
    adopt()
    const root = Fixture.render(`<div style="width: 1000px">${EXAMPLES[path]!}</div>`)
    const items = root.querySelectorAll<HTMLElement>(".ui.items > .item")
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(style(item).display).toBe("flex")
      expect(item.getBoundingClientRect().height).toBeGreaterThan(0)
    }
  })

  it("draws a 175px image beside the content, 1.5em apart;  items 1em apart", () => {
    const [first, second] = itemsIn(example("types"), "Items")
    const image = first!.querySelector(".image")!
    const content = first!.querySelector(".content")!
    expect(image.getBoundingClientRect().width).toBe(175)
    expect(style(content).paddingLeft).toBe("24px")
    expect(content.getBoundingClientRect().left).toBe(image.getBoundingClientRect().right)
    expect(style(first!).marginTop).toBe("0px")
    expect(style(second!).marginTop).toBe("16px")
    const header = content.querySelector(".header")!
    expect(style(header).fontWeight).toBe("700")
  })

  it("takes a public token from a wrapper or the group itself (static markup)", () => {
    adopt()
    const root = Fixture.render(
      `<div style="width: 1000px; --ui-items-item-spacing: 2em"><div class="ui items">` +
        `<div class="item"><div class="content">A</div></div><div class="item"><div class="content">B</div></div>` +
        `</div></div>`
    )
    expect(style(root.querySelectorAll(".item")[1]!).marginTop).toBe("32px")
    const group = Fixture.render(
      `<div style="width: 1000px"><div class="ui items" style="--ui-items-content-distance: 40px"><div class="item">` +
        `<div class="image"><img src="" alt=""></div><div class="content in-item">A</div></div></div></div>`
    )
    expect(style(group.querySelector(".content")!).paddingLeft).toBe("40px")
  })

  it("stacks items in a narrow group, not when unstackable", () => {
    const [item] = itemsIn(example("types", 500), "Items")
    expect(style(item!).flexDirection).toBe("column")
    expect(style(item!.querySelector(".content")!).paddingTop).toBe("24px")
    const [unstacked] = itemsIn(example("variations", 500), "Unstackable")
    expect(style(unstacked!).flexDirection).toBe("row")
    expect(unstacked!.querySelector(".image")!.getBoundingClientRect().width).toBe(125)
  })

  it("divides and relaxes", () => {
    const root = example("variations")
    const [first, second] = itemsIn(root, "Divided")
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(second!).borderTopWidth).toBe("1px")
    expect(style(second!).paddingTop).toBe("16px")
    expect(style(itemsIn(root, "Relaxed")[1]!).marginTop).toBe("24px")
    expect(style(itemsIn(root, "Very relaxed")[1]!).marginTop).toBe("32px")
  })

  it("aligns content, colours a link item's header on hover, fades a disabled item", () => {
    const [aligned] = itemsIn(example("variations"), "Vertical alignment")
    expect(style(aligned!.querySelector(".content")!).alignSelf).toBe("center")
    const [disabled] = itemsIn(example("states"), "Disabled item")
    expect(Number(style(disabled!).opacity)).toBeLessThan(1)
  })

  it("inverts:  the dark scheme", () => {
    const [item] = itemsIn(example("variations"), "Inverted")
    expect(style(item!.parentElement!).colorScheme).toBe("dark")
  })
})
