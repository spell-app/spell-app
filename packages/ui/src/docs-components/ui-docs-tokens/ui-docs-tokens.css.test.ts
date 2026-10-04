import { describe, expect, it } from "vitest"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/sheets"

import tokensCSS from "./ui-docs-tokens.css?inline"
import tokensRaw from "./ui-docs-tokens.css?raw"

/**
 * `ui-docs-tokens.css`:  the sheet's source rules, and its layout on the shadow markup contract.
 * - The look is the widgets' own (`<ui-table>`, `<ui-label>` ...), tested in their families;  this sheet only lays
 *   them out, so a stand-in host with the contract's markup is enough.
 */
describe("ui-docs-tokens.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(tokensRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(tokensRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-tokens"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(tokensRaw).matchAll(/(--ui-docs-tokens-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("ui-docs-tokens.css layout", () => {
  /** The contract's markup:  a section with a default cell (swatch + code). */
  const MARKUP =
    `<section class="ui tokens" part="tokens"><span class="default"><span part="swatch">s</span>` +
    `<code>light-dark(oklch(from var(--ui-ink-on-light) l c h / 0.87), oklch(from var(--ui-ink-on-dark) l c h / 0.9))</code>` +
    `</span></section>`

  it("stacks its blocks with a gap, and lays a swatch beside its default", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, tokensCSS])
    const shadow = host.shadowRoot!
    const section = shadow.querySelector<HTMLElement>(".tokens")!
    expect(getComputedStyle(section).flexDirection).toBe("column")
    const swatch = shadow.querySelector("[part~=swatch]")!.getBoundingClientRect()
    const code = shadow.querySelector("code")!.getBoundingClientRect()
    expect(code.left).toBeGreaterThan(swatch.right)
    expect(getComputedStyle(shadow.querySelector("code")!).overflowWrap).toBe("anywhere")
  })

  it("takes a public token from outside", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, tokensCSS])
    host.style.setProperty("--ui-docs-tokens-gap", "3px")
    expect(getComputedStyle(host.shadowRoot!.querySelector(".tokens")!).rowGap).toBe("3px")
  })
})
