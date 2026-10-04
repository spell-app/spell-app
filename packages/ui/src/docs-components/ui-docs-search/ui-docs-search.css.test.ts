import { describe, expect, it } from "vitest"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/sheets"

import searchCSS from "./ui-docs-search.css?inline"
import searchRaw from "./ui-docs-search.css?raw"

/**
 * `ui-docs-search.css`:  the sheet's source rules, and its look on the shadow markup contract (a stand-in host).
 */
describe("ui-docs-search.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(searchRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(searchRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-search"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(searchRaw).matchAll(/(--ui-docs-search-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("ui-docs-search.css look", () => {
  /** The contract's box:  the pill and a card with one group of two options, the second highlighted. */
  const MARKUP = `
    <div class="ui finder" part="search">
      <div class="field" part="field">
        <span class="glyph">?</span><input part="input" placeholder="Search"><span class="keys" part="keys"><kbd>K</kbd></span>
      </div>
      <div class="results" part="results" popover="manual">
        <div class="list" role="listbox">
          <div class="group" part="group" role="group" aria-label="g">
            <div class="label" part="label">Components</div>
            <a class="option" part="option" role="option" href="#a"><span class="text"><span class="title"><span class="name"><mark>O</mark>r</span></span></span></a>
            <a class="option active" part="option" role="option" href="#b"><span class="text"><span class="title"><span class="name">Button</span></span></span></a>
          </div>
        </div>
      </div>
    </div>`

  /** The stand-in host's shadow element matching `selector`. */
  function find(host: Element, selector: string): HTMLElement {
    return host.shadowRoot!.querySelector<HTMLElement>(selector)!
  }

  it("draws the brand's pill:  36px tall at 16px, fully round, a hairline", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, searchCSS])
    const field = find(host, ".field")
    expect(field.getBoundingClientRect().height).toBe(36)
    const style = getComputedStyle(field)
    expect(style.borderTopWidth).toBe("1px")
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(18)
  })

  it("hides the card until it opens, then floats it under the pill:  a soft card, mono eyebrows, the active row filled", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, searchCSS])
    const card = find(host, ".results")
    expect(card.getBoundingClientRect().height).toBe(0)
    card.showPopover()
    card.getAnimations().forEach((animation) => animation.finish())
    const field = find(host, ".field").getBoundingClientRect()
    const box = card.getBoundingClientRect()
    expect(box.top).toBeGreaterThan(field.bottom)
    if (matchMedia("(width < 40em)").matches) {
      // a phone:  the screen's width, less a 12px gutter each side
      expect(box.left).toBe(12)
      expect(box.width).toBe(document.documentElement.clientWidth - 24)
    } else {
      expect(Math.round(box.left)).toBe(Math.round(field.left))
      expect(box.width).toBeGreaterThanOrEqual(field.width)
    }
    const style = getComputedStyle(card)
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(12)
    expect(style.boxShadow).not.toBe("none")
    expect(getComputedStyle(find(host, ".label")).textTransform).toBe("uppercase")
    const [plain, active] = [...host.shadowRoot!.querySelectorAll<HTMLElement>(".option")]
    expect(getComputedStyle(active!).backgroundColor).not.toBe(getComputedStyle(plain!).backgroundColor)
    card.hidePopover()
  })
})
