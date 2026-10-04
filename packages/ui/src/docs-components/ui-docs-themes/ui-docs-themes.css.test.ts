import { describe, expect, it } from "vitest"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/sheets"

import themesCSS from "./ui-docs-themes.css?inline"
import themesRaw from "./ui-docs-themes.css?raw"

/**
 * `ui-docs-themes.css`:  the sheet's source rules, and its layout on the shadow markup contract.
 * - The look is the widgets' own (`<ui-dropdown>`, `<ui-buttons>`), tested in their families;  this sheet only lays
 *   them out, so a stand-in host with the contract's markup is enough.
 */
describe("ui-docs-themes.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(themesRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(themesRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-themes"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(themesRaw).matchAll(/(--ui-docs-themes-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("ui-docs-themes.css layout", () => {
  it("puts the controls in one row with a gap;  --ui-docs-themes-gap sets it", () => {
    const markup = `<div class="ui themes" part="controls"><span part="theme">T</span><span part="scheme">S</span></div>`
    const host = Sheets.host(markup, [...foundationCSS, themesCSS])
    const controls = host.shadowRoot!.querySelector<HTMLElement>("[part~=controls]")!
    expect(getComputedStyle(controls).display).toBe("inline-flex")
    expect(getComputedStyle(controls).columnGap).toBe("8px")
    host.style.setProperty("--ui-docs-themes-gap", "20px")
    expect(getComputedStyle(controls).columnGap).toBe("20px")
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=scheme]")!).flexShrink).toBe("0")
  })
})
