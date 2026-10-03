import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { page } from "vite-plus/test/browser"

import { colorsCSS, foundationCSS } from "$/ui/styles"
import { itemVocabulary } from "$/ui/components/ui-item"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { menuVocabulary } from "./ui-menu.vocabulary.en"

import itemCSS from "$/ui/components/ui-item/ui-item.css?inline"
import menuCSS from "./ui-menu.css?inline"
import menuRaw from "./ui-menu.css?raw"

/**
 * `ui-menu.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * class-grammar examples, and -- the part static markup can't show -- item hosts in their own shadow roots reading
 * the menu root's owner tokens.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

describe("ui-menu.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(menuRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(menuRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(menuRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("menu"))).toBe(true)
  })

  it("parses with replaceSync, keeping element + static item selectors and the owner-token queries", () => {
    for (const css of [menuCSS, menuRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(100)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-menu)) > .item"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(".ui.menu .item"))).toBe(true)
      expect(css).toMatch(/@container style\(--_ui-menu-layout: ?vertical\)/)
      expect(css).toMatch(/@container style\(--_ui-menu-divider-side: ?left\)/)
    }
  })

  it("covers every class word the menu and item vocabularies can emit", () => {
    const css = menuRaw + colorsCSS
    for (const vocabulary of [menuVocabulary, itemVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary)) {
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
      }
    }
  })
})

describe("ui-menu.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every menu and item in %s", (path) => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const menus = root.querySelectorAll<HTMLElement>(".ui.menu")
    expect(menus.length).toBeGreaterThan(0)
    for (const menu of menus) {
      expect(["flex", "inline-flex", "block", "inline-block"]).toContain(getComputedStyle(menu).display)
      for (const item of menu.querySelectorAll<HTMLElement>(":scope > .item")) {
        expect(getComputedStyle(item).position, item.outerHTML.slice(0, 80)).toBe("relative")
        expect(getComputedStyle(item).lineHeight).not.toBe("normal")
      }
    }
  })

  it("lays a basic menu out as a row of padded items with end dividers", async () => {
    await resize(1000)
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const menu = root.querySelector<HTMLElement>(".ui.three.item.menu")!
    const [first, second, third] = menu.querySelectorAll<HTMLElement>(".item")
    expect(first!.getBoundingClientRect().top).toBe(third!.getBoundingClientRect().top)
    expect(first!.getBoundingClientRect().width).toBeCloseTo(menu.getBoundingClientRect().width / 3, -1)
    const before = getComputedStyle(second!, "::before")
    expect(before.width).toBe("1px")
    expect(getComputedStyle(third!, "::before").display).toBe("none")
    expect(getComputedStyle(first!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("stacks a vertical menu, hairlines between items, none above the first", () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const menu = root.querySelector<HTMLElement>(".ui.vertical.menu")!
    const [first, second] = menu.querySelectorAll<HTMLElement>(".item")
    expect(getComputedStyle(first!).display).toBe("block")
    expect(second!.getBoundingClientRect().top).toBeGreaterThan(first!.getBoundingClientRect().top)
    expect(getComputedStyle(first!, "::before").display).toBe("none")
    expect(getComputedStyle(second!, "::before").height).toBe("1px")
    expect(getComputedStyle(menu).width).toBe(`${15 * 16}px`)
  })

  it("gives a menu nested in a vertical menu its OWN only-item corners, not the outer vertical radius", () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(`
      <div class="ui vertical menu">
        <div class="item">Outer<div class="menu"><a class="item" id="sub">Sub only</a></div></div>
        <div class="item"><div class="ui menu"><a class="item" id="nested">Nested only</a></div></div>
      </div>`)
    const sub = root.querySelector<HTMLElement>("#sub")!
    const nested = root.querySelector<HTMLElement>("#nested")!
    // a sub-menu's items are square (Fomantic zeroes its corners);  a nested top-level menu rounds its first item
    expect(getComputedStyle(sub).borderRadius).toBe("0px")
    expect(getComputedStyle(nested).borderTopLeftRadius).toBe(getComputedStyle(nested).borderBottomLeftRadius)
    expect(getComputedStyle(nested).borderTopRightRadius).toBe("0px")
  })

  it("resolves type combinations into item looks:  secondary pointing, tabular, text, pagination", () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const underline = root.querySelector<HTMLElement>(".ui.secondary.pointing.menu .active.item")!
    expect(getComputedStyle(underline).borderBottomWidth).toBe("2px")
    expect(getComputedStyle(underline).fontWeight).toBe("700")
    const tab = root.querySelector<HTMLElement>(".ui.tabular.menu .active.item")!
    expect(getComputedStyle(tab).borderTopWidth).toBe("1px")
    expect(getComputedStyle(tab).marginBottom).toBe("-1px")
    const header = root.querySelector<HTMLElement>(".ui.text.menu .header.item")!
    expect(getComputedStyle(header).textTransform).toBe("uppercase")
    const pages = root.querySelector<HTMLElement>(".ui.pagination.menu")!
    expect(getComputedStyle(pages).display).toBe("inline-flex")
    expect(parseFloat(getComputedStyle(pages.querySelector(".item")!).minWidth)).toBe(48)
    const arrow = getComputedStyle(root.querySelector(".ui.pointing.menu:not(.secondary) .active.item")!, "::after")
    expect(arrow.display).toBe("block")
    expect(getComputedStyle(underline, "::after").display).toBe("none")
  })

  it("scales by size on Fomantic's flatter ladder;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.mini.menu")).toBeCloseTo(16 * Math.sqrt(0.625), 1)
    expect(size(".ui.huge.menu")).toBeCloseTo(16 * Math.sqrt(1.5), 1)
    expect(size(".ui.borderless.menu")).toBe(16)
  })

  it("inverts to the dark scheme;  an inverted coloured menu fills with its hue", () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const inverted = root.querySelector<HTMLElement>(".ui.inverted.menu")!
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    const green = root.querySelector<HTMLElement>(".ui.inverted.green.menu")!
    // the dark scheme's green, as an inverted segment's:  `--ui-green` is a `light-dark()` token
    const swatch = Fixture.render(`<span style="color-scheme: dark; background: var(--ui-green)"></span>`)
    expect(getComputedStyle(green).backgroundColor).toBe(getComputedStyle(swatch).backgroundColor)
  })

  it("stacks a stackable menu on mobile, not on a desktop", async () => {
    Sheets.adopt([...foundationCSS, menuCSS])
    await resize(1000)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const menu = root.querySelector<HTMLElement>(".ui.stackable.menu")!
    expect(getComputedStyle(menu).flexDirection).toBe("row")
    await page.viewport(500, 800)
    expect(getComputedStyle(menu).flexDirection).toBe("column")
    const item = menu.querySelector<HTMLElement>(".item")!
    expect(item.getBoundingClientRect().width).toBeCloseTo(menu.clientWidth, 0)
    expect(getComputedStyle(item, "::before").height).toBe("1px")
  })

  it("takes a public token from a wrapper or the menu itself (static markup)", () => {
    Sheets.adopt(sheets())
    const root = Fixture.render(
      `<div style="--ui-menu-item-padding: 20px"><div class="ui menu"><a class="item">A</a><a class="item">B</a>` +
        `</div></div><div class="ui menu" style="--ui-menu-radius: 10px"><a class="item">C</a><a class="item">D</a></div>`
    )
    expect(getComputedStyle(root.querySelector(".item")!).paddingTop).toBe("20px")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".item")!).borderTopLeftRadius).toBe("10px")
  })
})

describe("ui-menu.css in shadow roots", () => {
  it("styles item hosts by the menu root's tokens:  secondary padding, rounded active item, no dividers", () => {
    Sheets.adopt(foundationCSS)
    const menu = Sheets.host(`<nav class="ui secondary menu" part="menu"><slot></slot></nav>`, sheets())
    const items = ["Home", "Messages"].map((text, index) => {
      const item = document.createElement(STATED_HOST) as StatedHost
      item.internals.states.add("in-menu")
      item.textContent = text
      menu.append(item)
      const classes = index ? "item" : "active item"
      Sheets.attach(item, `<a class="${classes}" part="item" href="#h${index}"><slot></slot></a>`, [
        ...foundationCSS,
        itemCSS,
        menuCSS
      ])
      return item
    })
    const box = (host: Element) => host.shadowRoot!.querySelector<HTMLElement>(".item")!
    const active = getComputedStyle(box(items[0]!))
    expect(active.display).toBe("flex")
    expect(parseFloat(active.paddingTop)).toBeCloseTo(0.78571 * 16, 1)
    expect(parseFloat(active.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(active.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(box(items[1]!), "::before").display).toBe("none")
    expect(box(items[1]!).getBoundingClientRect().left).toBeGreaterThan(box(items[0]!).getBoundingClientRect().right)
  })

  it("puts a right sub-menu's dividers on the start edge, pushed to the end", async () => {
    await resize(1000)
    Sheets.adopt(foundationCSS)
    const menu = Sheets.host(`<nav class="ui menu" part="menu" style="width: 600px"><slot></slot></nav>`, sheets())
    const sub = document.createElement(STATED_HOST) as StatedHost
    sub.internals.states.add("in-menu")
    menu.append(sub)
    Sheets.attach(sub, `<div class="right menu" part="menu"><slot></slot></div>`, sheets())
    const item = document.createElement(STATED_HOST) as StatedHost
    item.internals.states.add("in-menu")
    item.textContent = "Help"
    sub.append(item)
    Sheets.attach(item, `<a class="item" part="item" href="#help"><slot></slot></a>`, [...sheets(), itemCSS])
    const box = item.shadowRoot!.querySelector<HTMLElement>(".item")!
    const before = getComputedStyle(box, "::before")
    expect(before.left).toBe("0px")
    expect(Math.round(box.getBoundingClientRect().right)).toBe(
      Math.round(Sheets.inner(menu).getBoundingClientRect().right) - 1
    )
  })
})

/** A host that can carry custom states, standing in for `<ui-item>` / a sub `<ui-menu>`. */
const STATED_HOST = "x-menu-css-host"

/** `STATED_HOST` instance. */
type StatedHost = HTMLElement & { internals: ElementInternals }

if (!customElements.get(STATED_HOST)) {
  customElements.define(
    STATED_HOST,
    class extends HTMLElement {
      readonly internals = this.attachInternals()
    }
  )
}

/** Foundation plus `ui-menu.css`, as a menu or item host adopts them. */
function sheets(): string[] {
  return [...foundationCSS, menuCSS]
}

/**
 * Resize the test iframe's viewport to `width` for this test.
 * - SIDE EFFECT:  restored when the test finishes.
 */
async function resize(width: number) {
  const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
  await page.viewport(width, 800)
  onTestFinished(() => page.viewport(previousWidth, previousHeight))
}
