/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIDropdown } from "$/ui/components/ui-dropdown/UIDropdown"

/**
 * `<ui-dropdown>` in a static server render (`$/ui/server`):  the combobox, the menu CLOSED but its rows rendered
 * from the `<ui-item>` children (their text is in the page), and the value as hidden inputs.
 */
describe("ui-dropdown (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIDropdown, UIItem)
  })

  it("renders every row in a closed popover menu, the chosen one active, the items dropped", () => {
    const html = StaticRender.fragment(
      `<ui-dropdown selection placeholder="Gender" value="f">` +
        `<ui-item value="m">Male</ui-item><ui-item value="f">Female</ui-item></ui-dropdown>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui selection dropdown"/)
    expect(html).toMatch(/<button [^>]*role="combobox"[^>]*aria-expanded="false"/)
    expect(html).toMatch(/<span [^>]*class="text"[^>]*>Female<\/span>/)
    const menu = html.match(/<div [^>]*role="listbox"[^>]*>/)?.[0] ?? ""
    expect(menu).toContain(`popover="manual"`)
    const rows = html.match(/<div [^>]*role="option"[^>]*>.*?<\/div>/g)!
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatch(/aria-selected="false"[^>]*><span class="text">Male<\/span>/)
    expect(rows[1]).toMatch(/class="item active"[^>]*aria-selected="true"[^>]*><span class="text">Female/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })

  it("renders headers and dividers in place", () => {
    const html = StaticRender.fragment(
      `<ui-dropdown text="File"><ui-item type="header">Recent</ui-item><ui-item>New</ui-item>` +
        `<ui-item type="divider"></ui-item><ui-item>Quit</ui-item></ui-dropdown>`
    )
    expect(html).toMatch(
      /<div class="header" role="presentation">Recent<\/div><div [^>]*role="option"[^>]*>.*New.*<\/div><hr class="divider"/
    )
  })

  it("submits its value without JS:  one hidden input per value, the combobox marked for the flattener", () => {
    const html = StaticRender.fragment(
      `<ui-dropdown multiple selection name="skills" value="css,html">` +
        `<ui-item value="css">CSS</ui-item><ui-item value="html">HTML</ui-item><ui-item value="js">JS</ui-item>` +
        `</ui-dropdown>`
    )
    expect(html.match(/<input [^>]*type="hidden"[^>]*>/g)).toEqual([
      `<input type="hidden" name="skills" value="css">`,
      `<input type="hidden" name="skills" value="html">`
    ])
    expect(html).toMatch(/<span class="ui label" part="label">CSS/)
    expect(html).toMatch(/<button [^>]*data-ui-control=""/)
  })

  it("renders an open dropdown's menu as a plain (non-popover) menu under its active root", () => {
    const html = StaticRender.fragment(`<ui-dropdown open text="Menu"><ui-item>One</ui-item></ui-dropdown>`)
    expect(html).toMatch(/^<div [^>]*class="ui active dropdown"/)
    expect(html.match(/<div [^>]*role="listbox"[^>]*>/)?.[0]).not.toContain("popover")
  })

  it("projects a rich item's markup into its row", () => {
    // NOTE: one element child:  text BESIDE it would be lost (the flattener's slot hand-over, see the seo plan)
    const html = StaticRender.fragment(
      `<ui-dropdown text="Pick"><ui-item value="a"><b>Bold</b></ui-item></ui-dropdown>`
    )
    expect(html).toMatch(/<div [^>]*role="option"[^>]*><b [^>]*>Bold<\/b><\/div>/)
  })
})
