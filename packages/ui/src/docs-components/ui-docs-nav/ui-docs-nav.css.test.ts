import { describe, expect, it } from "vitest"

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
  /** The contract's scroll box around a tall menu stand-in. */
  const MARKUP = `<div class="ui nav" part="nav"><div part="menu" style="height: 2000px">menu</div></div>`

  it("scrolls the menu inside the box, on the dark fill, at the height asked for", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    host.style.setProperty("--ui-docs-nav-height", "300px")
    const box = host.shadowRoot!.querySelector<HTMLElement>("[part~=nav]")!
    const style = getComputedStyle(box)
    expect(style.overflowY).toBe("auto")
    expect(style.colorScheme).toBe("dark")
    expect(box.getBoundingClientRect().height).toBe(300)
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)
  })

  it("grows with its menu when nothing sizes it", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, navCSS])
    const box = host.shadowRoot!.querySelector<HTMLElement>("[part~=nav]")!
    expect(box.getBoundingClientRect().height).toBe(2000)
  })
})
