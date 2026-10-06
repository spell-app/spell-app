/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UISearch } from "$/ui/components/ui-search/UISearch"

/**
 * `<ui-search>` in a static server render (`$/ui/static`):  the input (a combobox holding the query) and its icon box;
 * the results popover empty and closed -- searching needs JS.
 */
describe("ui-search (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UISearch)
  })

  it("renders the input with the query and its form name, the results closed", () => {
    const html = StaticRender.fragment(
      `<ui-search id="find" name="q" value="spell" placeholder="Search..."></ui-search>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui search"[^>]*><div class="ui icon input" part="input"><input /)
    const input = html.match(/<input [^>]*>/)?.[0] ?? ""
    for (const attribute of [
      `role="combobox"`,
      `name="q"`,
      `value="spell"`,
      `placeholder="Search..."`,
      `aria-expanded="false"`,
      `id="find"`
    ]) {
      expect(input).toContain(attribute)
    }
    // the flattener's mark, used and dropped:  the host's id went to the input, not the root
    expect(html.match(/^<div [^>]*>/)?.[0]).not.toContain(` id=`)
    expect(html).not.toContain("data-ui-control")
    expect(html).toMatch(/<div [^>]*class="results" popover="manual" part="results"><\/div>/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })

  it("renders states on the input box", () => {
    const html = StaticRender.fragment(`<ui-search loading disabled fluid></ui-search>`)
    expect(html).toMatch(/class="ui icon input loading fluid disabled"/)
    expect(html).toMatch(/<input [^>]*disabled/)
  })
})
