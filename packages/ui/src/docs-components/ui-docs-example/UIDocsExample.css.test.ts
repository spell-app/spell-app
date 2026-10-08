import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/Sheets"

import exampleCSS from "./UIDocsExample.css?inline"
import exampleRaw from "./UIDocsExample.css?raw"

/**
 * `UIDocsExample.css`:  the sheet's source rules, and its layout on the shadow markup contract.
 * - The look is the widgets' own (`<ui-segment>`, `<ui-button>` ...), tested in their families;
 *   this sheet only lays them out, so a stand-in host with the contract's markup is enough.
 */
describe("UIDocsExample.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(exampleRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(exampleRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-example"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(exampleRaw).matchAll(/(--ui-docs-example-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("UIDocsExample.css layout", () => {
  /** The contract's markup in a shadow root, with the foundation and the sheet adopted. */
  const MARKUP =
    `<section class="ui example" part="example"><div class="heading"><span part="header">H</span>` +
    `<button part="toggle">c</button></div><div class="description" part="description">D</div></section>`

  it("puts the code button at the end of the header row, dimmed until hovered", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, exampleCSS])
    const shadow = host.shadowRoot!
    const heading = shadow.querySelector(".heading")!
    expect(getComputedStyle(heading).display).toBe("flex")
    const toggle = shadow.querySelector<HTMLElement>("[part~=toggle]")!
    expect(getComputedStyle(toggle).opacity).toBe("0.5")
    const header = shadow.querySelector("[part~=header]")!.getBoundingClientRect()
    expect(toggle.getBoundingClientRect().left).toBeGreaterThan(header.right)
  })

  it("takes a public token from outside", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, exampleCSS])
    host.style.setProperty("--ui-docs-example-toggle-opacity", "0.25")
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=toggle]")!).opacity).toBe("0.25")
  })
})
