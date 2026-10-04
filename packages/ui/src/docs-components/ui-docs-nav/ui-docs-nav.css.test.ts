import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/sheets"

import navCSS from "./ui-docs-nav.css?inline"
import navRaw from "./ui-docs-nav.css?raw"

/**
 * `ui-docs-nav.css`:  the sheet's source rules, and its layout on the shadow markup contract.
 * - The look is the widgets' own (`<ui-menu>`, `<ui-item>` ...), tested in their families;  this sheet only lays them
 *   out, so a stand-in host with the contract's markup is enough.
 */
describe("ui-docs-nav.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(navRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(navRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-nav"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(navRaw).matchAll(/(--ui-docs-nav-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("ui-docs-nav.css layout", () => {
  /** The contract's panel:  a header band over a list of one group and a tall rows stand-in. */
  const MARKUP = `
    <div class="ui nav" part="nav">
      <div class="masthead" part="header" style="height: 100px">header</div>
      <nav part="menu">
        <section class="group">
          <h2 class="heading"><button type="button" class="band" aria-expanded="true">Group</button></h2>
          <div class="fold open"><div class="folded"><ul class="rows" style="height: 2000px">
            <li class="row"><a class="item" href="#" aria-current="page">Row</a></li>
          </ul></div></div>
        </section>
      </nav>
    </div>`

  /** The stand-in host's shadow element matching `selector`. */
  function find(host: Element, selector: string): HTMLElement {
    return host.shadowRoot!.querySelector<HTMLElement>(selector)!
  }

  it("scrolls the list inside the panel, under the header band, at the height asked for", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    host.style.setProperty("--ui-docs-nav-height", "300px")
    const panel = find(host, "[part~=nav]")
    const list = find(host, "[part~=menu]")
    expect(panel.getBoundingClientRect().height).toBe(300)
    expect(getComputedStyle(list).overflowY).toBe("auto")
    expect(list.getBoundingClientRect().top).toBe(find(host, "[part~=header]").getBoundingClientRect().bottom)
    expect(list.getBoundingClientRect().bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom)
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
  })

  it("grows with its list when nothing sizes it", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    expect(find(host, "[part~=nav]").getBoundingClientRect().height).toBeGreaterThan(2100)
  })

  it("draws a card:  a border, a radius;  bands full width;  the current row filled", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    const panel = getComputedStyle(find(host, "[part~=nav]"))
    expect(panel.borderTopWidth).toBe("1px")
    expect(parseFloat(panel.borderTopLeftRadius)).toBeGreaterThan(0)
    const band = find(host, ".band")
    expect(band.getBoundingClientRect().width).toBe(find(host, "[part~=menu]").clientWidth)
    expect(getComputedStyle(band).textTransform).toBe("uppercase")
    expect(getComputedStyle(find(host, ".item")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("folds a shut group to nothing, hidden", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    const fold = find(host, ".fold")
    fold.classList.remove("open")
    fold.getAnimations().forEach((animation) => animation.finish())
    find(host, ".folded")
      .getAnimations()
      .forEach((animation) => animation.finish())
    expect(fold.getBoundingClientRect().height).toBe(0)
    expect(getComputedStyle(find(host, ".folded")).visibility).toBe("hidden")
  })
})
