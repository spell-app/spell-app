import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/Sheets"

import apiCSS from "./UIDocsApi.css?inline"
import apiRaw from "./UIDocsApi.css?raw"

/**
 * `UIDocsApi.css`:  the sheet's source rules, and its layout on the shadow markup contract.
 * - The look is the widgets' own (`<ui-table>`, `<ui-header>`, `<ui-label>` ...), tested in their families;
 *   this sheet only lays them out (plus inline code), so a stand-in host with the contract's markup is enough.
 */
describe("UIDocsApi.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(apiRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(apiRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-api"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(apiRaw).matchAll(/(--ui-docs-api-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("UIDocsApi.css layout", () => {
  /** The contract's markup:  two tag blocks, a title, a row header with a note, inline code. */
  const MARKUP =
    `<section class="ui api" part="api"><section class="tag" part="tag"><span part="header">H</span>` +
    `<span part="title">Attributes</span><table><tbody><tr><th scope="row"><code>size</code>` +
    `<small class="ui-caption">alias <code>s</code></small></th></tr></tbody></table></section>` +
    `<section class="tag" part="tag"><span part="header">H2</span></section></section>`

  it("spaces tag blocks apart, puts notes on their own line, and draws inline code", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, apiCSS])
    const shadow = host.shadowRoot!
    const [first, second] = shadow.querySelectorAll(".tag")
    expect(getComputedStyle(first!).marginBlockStart).toBe("0px")
    expect(parseFloat(getComputedStyle(second!).marginBlockStart)).toBeGreaterThan(0)
    expect(getComputedStyle(shadow.querySelector("small")!).display).toBe("block")
    const code = getComputedStyle(shadow.querySelector("th > code")!)
    expect(code.whiteSpace).toBe("nowrap")
    expect(parseFloat(code.paddingInlineStart)).toBeGreaterThan(0)
  })

  it("takes a public token from outside", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, apiCSS])
    host.style.setProperty("--ui-docs-api-tag-gap", "7px")
    expect(getComputedStyle(host.shadowRoot!.querySelectorAll(".tag")[1]!).marginBlockStart).toBe("7px")
  })
})
