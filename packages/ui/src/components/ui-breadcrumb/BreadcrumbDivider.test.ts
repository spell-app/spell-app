import { describe, expect, test } from "vite-plus/test"

import { BreadcrumbDivider } from "./BreadcrumbDivider"

/** A tiny icon, without the SVG namespace. */
const BARE_SVG = `<svg viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>`

////////////////
// ## BreadcrumbDivider.cssString()
////////////////

describe("BreadcrumbDivider.cssString()", () => {
  test('quotes text, escaping `\\`, `"` and line breaks', () => {
    expect(BreadcrumbDivider.cssString('a"b\\c')).toBe('"a\\"b\\\\c"')
    expect(BreadcrumbDivider.cssString("a\nb")).toBe('"a\\A b"')
  })

  test("escapes EVERY line break, `\\r\\n` as one", () => {
    expect(BreadcrumbDivider.cssString("a\r\nb\rc\nd")).toBe('"a\\A b\\A c\\A d"')
  })
})

////////////////
// ## BreadcrumbDivider.markupUrl()
////////////////

describe("BreadcrumbDivider.markupUrl()", () => {
  test("adds the SVG namespace a standalone image needs, and wraps the markup in a data `url()`", () => {
    const url = BreadcrumbDivider.markupUrl(BARE_SVG)
    expect(url.startsWith(`url("data:image/svg+xml,`)).toBe(true)
    expect(decoded(url)).toBe(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>`)
  })

  test("keeps markup that declares the namespace already as it is", () => {
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>`
    expect(decoded(BreadcrumbDivider.markupUrl(markup))).toBe(markup)
  })
})

////////////////
// ## BreadcrumbDivider.svgUrl()
////////////////

describe("BreadcrumbDivider.svgUrl()", () => {
  test("serializes a live `<svg>` with its namespace, leaving the element itself alone", () => {
    const host = document.createElement("div")
    host.innerHTML = BARE_SVG
    const svg = host.querySelector("svg")!
    const url = BreadcrumbDivider.svgUrl(svg)
    expect(decoded(url)).toContain(`xmlns="http://www.w3.org/2000/svg"`)
    expect(decoded(url)).toContain(`<path d="M0 0h1v1z"`)
    expect(svg.hasAttribute("xmlns")).toBe(false)
  })
})

/** The SVG text inside a data `url()`. */
function decoded(url: string): string {
  return decodeURIComponent(url.slice(`url("data:image/svg+xml,`.length, -`")`.length))
}
