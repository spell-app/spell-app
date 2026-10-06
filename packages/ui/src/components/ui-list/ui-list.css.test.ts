import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { listVocabulary } from "./ui-list.vocabulary.en"

import itemCSS from "$/ui/components/ui-item/ui-item.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"
import listCSS from "./ui-list.css?inline"
import listRaw from "./ui-list.css?raw"

/**
 * `ui-list.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM class-grammar examples, and -- what static markup can't show -- item hosts in their own shadow roots
 * styled by the list's inherited tokens.
 * - `ui-parts.css` is adopted too:  the examples' content blocks, headers and descriptions are static parts.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Fomantic's item padding, `@relative3px`, at 16px. */
const ITEM_PADDING = (3 / 14) * 16

/** Adopt what a page showing the static examples needs. */
function adopt() {
  Sheets.adopt([...foundationCSS, partsCSS, listCSS])
}

/** Render example `name`;  returns its root. */
function example(name: string): HTMLElement {
  adopt()
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The `index`th `.ui.list` in `root` whose `<h4>` says `title`. */
function listIn(root: Element, title: string, index = 0): HTMLElement {
  const section = [...root.querySelectorAll("section")].find(
    (element) => element.querySelector("h4")?.textContent === title
  )
  if (!section) throw new Error(`no section "${title}"`)
  return section.querySelectorAll<HTMLElement>(".ui.list")[index]!
}

/** Direct items of `list`. */
function itemsOf(list: Element): HTMLElement[] {
  return [...list.children].filter((child): child is HTMLElement => child.classList.contains("item"))
}

/** Computed style of `element`. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

////////////////
// ## Source
////////////////

describe("ui-list.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(listRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(listRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(listRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("list"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host-position item rules and the marker query", () => {
    for (const css of [listCSS, listRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-list):first-child) > .item"))).toBe(true)
      expect(selectors.some((selector) => selector.includes("::slotted(:state(in-list))"))).toBe(true)
      expect(css).toMatch(/@container style\(--_ui-list-marker: ?number\)/)
    }
  })

  it("pairs every item rule:  the element's host state and the static class grammar", () => {
    const selectors = Sheets.selectors(listCSS).filter((selector) => selector.includes(":host(:state(in-list)"))
    const staticForms = Sheets.selectors(listCSS).filter((selector) => selector.includes(".ui.list .list) >"))
    expect(selectors.length).toBeGreaterThan(15)
    expect(staticForms.length).toBeGreaterThan(15)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = listRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(listVocabulary))
      expect(Sheets.covers(css, phrase), `${listVocabulary.tag}: ${phrase}`).toBe(true)
  })

  it("declares every alias and switch it remaps on the root, default included", () => {
    const text = Sheets.withoutComments(listRaw)
    const root = text.slice(text.indexOf(".ui.list {"), text.indexOf("}", text.indexOf(".ui.list {")))
    const declared = new Set(root.match(/--_ui-list-[\w-]+(?=:)/g))
    const remapped = new Set(text.match(/--_ui-list-[\w-]+(?=:)/g))
    for (const token of remapped) expect(declared.has(token), token).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-list.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every list in %s", (path) => {
    adopt()
    const root = Fixture.render(EXAMPLES[path]!)
    const lists = root.querySelectorAll<HTMLElement>(".ui.list")
    expect(lists.length).toBeGreaterThan(0)
    for (const list of lists) {
      expect(["block", "inline-block"], list.outerHTML.slice(0, 80)).toContain(style(list).display)
      expect(style(list).listStyleType).toBe("none")
      for (const item of itemsOf(list)) {
        expect(["list-item", "inline-block"]).toContain(style(item).display)
        expect(item.getBoundingClientRect().height).toBeGreaterThan(0)
      }
    }
  })

  it("pads items but not the outer edges of the first and last", () => {
    const [first, middle, last] = itemsOf(listIn(example("types"), "List"))
    expect(parseFloat(style(first!).paddingTop)).toBe(0)
    expect(parseFloat(style(middle!).paddingTop)).toBeCloseTo(ITEM_PADDING, 1)
    expect(parseFloat(style(middle!).paddingBottom)).toBeCloseTo(ITEM_PADDING, 1)
    expect(parseFloat(style(last!).paddingBottom)).toBe(0)
  })

  it("draws an icon as a table cell beside its content", () => {
    const [item] = itemsOf(listIn(example("types"), "Icons"))
    const icon = item!.querySelector(".icon")!
    const content = item!.querySelector(".content")!
    expect(style(icon).display).toBe("table-cell")
    expect(style(content).display).toBe("table-cell")
    expect(icon.getBoundingClientRect().top).toBeCloseTo(content.getBoundingClientRect().top, 0)
    expect(content.getBoundingClientRect().left).toBeGreaterThan(icon.getBoundingClientRect().right - 1)
  })

  it("puts an avatar and its content on one line", () => {
    const [item] = itemsOf(listIn(example("content"), "Image"))
    const image = item!.querySelector("img")!
    const content = item!.querySelector(".content")!
    expect(style(image).display).toBe("inline-block")
    expect(image.getBoundingClientRect().width).toBe(32)
    expect(style(content).display).toBe("inline-block")
    expect(content.getBoundingClientRect().left).toBeGreaterThan(image.getBoundingClientRect().right - 1)
  })

  it("divides items with a rule between them;  celled draws one around every item", () => {
    const root = example("variations")
    const [first, second] = itemsOf(listIn(root, "Divided"))
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(second!).borderTopWidth).toBe("1px")
    expect(style(second!).borderTopStyle).toBe("solid")
    const celled = itemsOf(listIn(root, "Celled"))
    expect(style(celled[0]!).borderTopWidth).toBe("1px")
    expect(style(celled[2]!).borderBottomWidth).toBe("1px")
    expect(parseFloat(style(celled[0]!).paddingLeft)).toBe(8)
  })

  it("relaxes the padding between items;  very relaxed more", () => {
    const root = example("variations")
    const relaxed = parseFloat(style(itemsOf(listIn(root, "Relaxed"))[1]!).paddingTop)
    const very = parseFloat(style(itemsOf(listIn(root, "Very relaxed"))[1]!).paddingTop)
    expect(relaxed).toBeCloseTo((6 / 14) * 16, 1)
    expect(very).toBeCloseTo((12 / 14) * 16, 1)
  })

  it("lines horizontal items up in a row, with the whitespace between them swallowed", () => {
    const root = example("variations")
    const list = listIn(root, "Horizontal")
    expect(style(list).display).toBe("inline-block")
    expect(style(list).fontSize).toBe("0px")
    for (const item of itemsOf(list)) {
      expect(style(item).display).toBe("inline-block")
      expect(style(item).fontSize).toBe("16px")
    }
    expect(style(itemsOf(list)[0]!.querySelector(".content")!).verticalAlign).toBe("middle")
    const row = itemsOf(listIn(root, "Celled horizontal"))
    for (const item of row) expect(item.getBoundingClientRect().top).toBe(row[0]!.getBoundingClientRect().top)
    expect(style(row[0]!).borderLeftWidth).toBe("1px")
    expect(style(row[2]!).borderRightWidth).toBe("1px")
  })

  it("hangs a bullet before bulleted items, and hides the first in a horizontal row", () => {
    const root = example("types")
    const [item] = itemsOf(listIn(root, "Bulleted"))
    const bullet = style(item!, "::before")
    expect(bullet.content).toBe('"•"')
    expect(bullet.position).toBe("absolute")
    expect(parseFloat(bullet.marginLeft)).toBe(-20)
    const row = itemsOf(listIn(root, "Horizontal bulleted"))
    expect(style(row[0]!, "::before").display).toBe("none")
    expect(style(row[1]!, "::before").content).toBe('"•"')
  })

  it("numbers ordered items with counters, nested and suffixed, and shows an item's value instead", () => {
    const root = example("types")
    const list = listIn(root, "Ordered")
    expect(style(list).counterReset).toBe("ordered 0")
    const [item] = itemsOf(list)
    expect(style(item!, "::before").content).toBe('counters(ordered, ".") " "')
    expect(style(item!, "::before").counterIncrement).toBe("ordered 1")
    const sub = list.querySelector<HTMLElement>(".list")!
    expect(style(sub).counterReset).toBe("ordered 0")
    expect(parseFloat(style(itemsOf(sub)[0]!, "::before").marginLeft)).toBe(-32)
    expect(style(itemsOf(listIn(root, "Ordered, suffixed"))[0]!, "::before").content).toBe('counters(ordered, ".") "."')
    expect(style(itemsOf(listIn(root, "Ordered, with values"))[0]!, "::before").content).toBe('"*"')
  })

  it("indents a sub-list, with tighter child items;  inside a content block it starts at the edge", () => {
    const root = example("types")
    const bulleted = listIn(root, "Bulleted").querySelector<HTMLElement>(".list")!
    expect(parseFloat(style(bulleted).paddingTop)).toBe(12)
    expect(parseFloat(style(bulleted).paddingLeft)).toBe(20)
    expect(parseFloat(style(itemsOf(bulleted)[1]!).paddingTop)).toBeCloseTo((2 / 14) * 16, 1)
    const tree = listIn(root, "Nested").querySelector<HTMLElement>(".content > .list")!
    expect(parseFloat(style(tree).paddingLeft)).toBe(0)
  })

  it("gives a selection list's items padding and rounded corners;  fitted pulls them past the edges", () => {
    const root = example("variations")
    const [item] = itemsOf(listIn(root, "Selection"))
    expect(parseFloat(style(item!).paddingTop)).toBe(8)
    expect(parseFloat(style(item!).paddingLeft)).toBe(8)
    expect(style(item!).borderTopLeftRadius).toBe("8px")
    expect(style(item!).cursor).toBe("pointer")
    const fitted = itemsOf(listIn(root, "Fitted selection"))[0]!
    expect(parseFloat(style(fitted).marginLeft)).toBe(-8)
  })

  it("mutes a link list's items and marks the active one", () => {
    const [active, other] = itemsOf(listIn(example("types"), "Link"))
    expect(style(active!).color).not.toBe(style(other!).color)
  })

  it("takes a public token from a wrapper or the list itself (static markup)", () => {
    adopt()
    const root = Fixture.render(
      `<div style="--ui-list-item-padding-block: 10px"><div class="ui list">` +
        `<div class="item">A</div><div class="item">B</div><div class="item">C</div></div></div>` +
        `<div class="ui celled list" style="--ui-list-item-border-color: rgb(255, 0, 0)">` +
        `<div class="item">A</div></div>`
    )
    expect(style(root.querySelectorAll(".item")[1]!).paddingTop).toBe("10px")
    expect(style(root.nextElementSibling!.querySelector(".item")!).borderTopColor).toBe("rgb(255, 0, 0)")
  })

  it("inverts to the dark scheme", () => {
    const list = listIn(example("variations"), "Inverted")
    expect(style(list).colorScheme).toBe("dark")
    expect(style(list).getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(style(list.querySelector(".header")!).color).not.toBe(style(list.querySelector(".content")!).color)
  })

  it("scales by size;  medium is the default", () => {
    const root = example("variations")
    const section = [...root.querySelectorAll("section")].find(
      (element) => element.querySelector("h4")?.textContent === "Size"
    )!
    const sizes = [...section.querySelectorAll(".ui.list")].map((list) => parseFloat(style(itemsOf(list)[0]!).fontSize))
    expect([...sizes].sort((a, b) => a - b)).toEqual(sizes)
    expect(sizes[3]).toBe(16)
  })

  it("aligns every item's image and content", () => {
    const root = example("variations")
    const bottom = listIn(root, "Vertically aligned", 2)
    expect(style(bottom.querySelector("img")!).verticalAlign).toBe("bottom")
    expect(style(bottom.querySelector(".content")!).verticalAlign).toBe("bottom")
  })

  it("floats a list", () => {
    expect(style(listIn(example("variations"), "Floated")).float).toBe("right")
  })

  it("greys a disabled item", () => {
    const [disabled, other] = itemsOf(listIn(example("states"), "Disabled"))
    expect(style(disabled!).pointerEvents).toBe("none")
    expect(style(disabled!).color).not.toBe(style(other!).color)
  })
})

////////////////
// ## In shadow roots
////////////////

describe("ui-list.css in shadow roots", () => {
  it("styles item hosts by position and by the list's inherited tokens", () => {
    Sheets.adopt(foundationCSS)
    defineItem()
    const list = Sheets.host(`<ul class="ui list" part="list" role="list"><slot></slot></ul>`, [
      ...foundationCSS,
      listCSS
    ])
    list.innerHTML = `<test-list-item>One</test-list-item><test-list-item>Two</test-list-item><test-list-item>Three</test-list-item>`
    const root = Sheets.inner(list)
    const [first, second, last] = [...list.querySelectorAll("test-list-item")].map((host) => Sheets.inner(host))
    expect(style(list).display).toBe("contents")
    expect(style(list.querySelector("test-list-item")!).display).toBe("contents")
    expect(style(first!).display).toBe("list-item")
    expect(parseFloat(style(first!).paddingTop)).toBe(0)
    expect(parseFloat(style(second!).paddingTop)).toBeCloseTo(ITEM_PADDING, 1)
    expect(parseFloat(style(last!).paddingBottom)).toBe(0)
    root.className = "ui divided list"
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(second!).borderTopWidth).toBe("1px")
    root.className = "ui relaxed list"
    expect(parseFloat(style(second!).paddingTop)).toBeCloseTo((6 / 14) * 16, 1)
    root.className = "ui horizontal list"
    expect(style(second!).display).toBe("inline-block")
    expect(first!.getBoundingClientRect().top).toBe(last!.getBoundingClientRect().top)
    root.className = "ui bulleted list"
    expect(style(second!, "::before").content).toBe('"•"')
    root.className = "ui ordered list"
    expect(style(second!, "::before").content).toBe('counters(ordered, ".") " "')
    second!.setAttribute("data-value", "*")
    expect(style(second!, "::before").content).toBe('"*"')
  })

  it("lets a sub-list inherit the outer list's look, with child geometry", () => {
    Sheets.adopt(foundationCSS)
    defineItem()
    defineSubList()
    const list = Sheets.host(`<ul class="ui selection divided list" role="list"><slot></slot></ul>`, [
      ...foundationCSS,
      listCSS
    ])
    list.innerHTML = `<test-list-item>One</test-list-item><test-list-item>Two<test-sub-list><test-list-item>A</test-list-item><test-list-item>B</test-list-item></test-sub-list></test-list-item>`
    const sub = list.querySelector("test-sub-list")!
    const [childA, childB] = [...sub.querySelectorAll("test-list-item")].map((host) => Sheets.inner(host))
    expect(parseFloat(style(Sheets.inner(sub)).paddingTop)).toBe(12)
    // selection padding reaches the child items;  divided borders don't
    expect(parseFloat(style(childA!).paddingLeft)).toBe(8)
    expect(style(childB!).borderTopWidth).toBe("0px")
  })

  it("keeps a slotted icon a table cell beside the item's content, but not icons inside the content", () => {
    Sheets.adopt(foundationCSS)
    defineItem()
    const list = Sheets.host(`<ul class="ui list" role="list"><slot></slot></ul>`, [...foundationCSS, listCSS])
    list.innerHTML = `<test-list-item><span class="probe"></span><test-list-item class="part"></test-list-item></test-list-item>`
    const item = list.querySelector("test-list-item")!
    const probe = item.querySelector(".probe")!
    const part = item.querySelector(".part")!
    expect(style(probe).getPropertyValue("--_ui-icon-owner-display").trim()).toBe("table-cell")
    // a slotted part (`:state(in-list)`) resets the owner tokens for what's inside it
    expect(style(part).getPropertyValue("--_ui-icon-owner-display").trim()).toBe("")
  })
})

/**
 * Define `<test-list-item>`:  a stand-in `<ui-item>` in a list -- `:state(in-list)`, `<div class="item">` around
 * a slot, adopting `ui-item.css` + `ui-list.css`.
 * - Idempotent:  custom elements can only be defined once per page.
 */
function defineItem() {
  if (customElements.get("test-list-item")) return
  customElements.define(
    "test-list-item",
    class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return
        this.attachInternals().states.add("in-list")
        Sheets.attach(this, `<div class="item" part="item"><slot></slot></div>`, [...foundationCSS, itemCSS, listCSS])
      }
    }
  )
}

/** Define `<test-sub-list>`:  a stand-in nested `<ui-list>`, `<ul class="list">` with `:state(in-list)`. */
function defineSubList() {
  if (customElements.get("test-sub-list")) return
  customElements.define(
    "test-sub-list",
    class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return
        this.attachInternals().states.add("in-list")
        Sheets.attach(this, `<ul class="list" part="list" role="list"><slot></slot></ul>`, [...foundationCSS, listCSS])
      }
    }
  )
}
