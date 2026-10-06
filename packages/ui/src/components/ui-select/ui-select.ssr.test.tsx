/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UISelect } from "$/ui/components/ui-select/UISelect"

/**
 * `<ui-select>` in a static server render (`$/ui/static`):  a real `<select>` with its `<option>`s, from `<ui-item>`
 * children and the `options` attribute (JSON), the chosen ones `selected`, so a no-JS form submits it.
 */
describe("ui-select (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UISelect, UIItem)
  })

  it("renders a named <select> with an option per item, the chosen one selected", () => {
    const html = StaticRender.fragment(
      `<ui-select name="fruit" value="banana" required>` +
        `<ui-item value="apple">Apple</ui-item><ui-item value="banana">Banana</ui-item></ui-select>`
    )
    expect(html).toMatch(/^<select [^>]*class="ui select"/)
    expect(html).toMatch(/^<select [^>]*name="fruit"/)
    expect(html).toMatch(/^<select [^>]*required/)
    const options = html.match(/<option [^>]*>.*?<\/option>/g)!
    expect(options).toHaveLength(2)
    expect(options[0]).toMatch(/value="apple"/)
    expect(options[0]).not.toMatch(/ selected/)
    expect(options[1]).toMatch(/value="banana"[^>]*selected[^>]*><span class="text">Banana<\/span>/)
    // the items are read as data:  none left in the page
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })

  it("selects the placeholder while nothing is chosen, disabled so a static form submits nothing for it", () => {
    const html = StaticRender.fragment(
      `<ui-select placeholder="Gender"><ui-item value="m">Male</ui-item><ui-item value="f">Female</ui-item></ui-select>`
    )
    expect(html).toMatch(/<option class="placeholder" part="placeholder" value="" selected disabled>Gender<\/option>/)
    expect(html.match(/ selected/g)).toHaveLength(1)
  })

  it("leaves the placeholder enabled once a value is chosen", () => {
    const html = StaticRender.fragment(
      `<ui-select placeholder="Gender" value="f"><ui-item value="m">Male</ui-item><ui-item value="f">Female</ui-item></ui-select>`
    )
    expect(html).toMatch(/<option class="placeholder" part="placeholder" value="">Gender<\/option>/)
  })

  it("groups options under header items, and takes options from the JSON attribute", () => {
    const html = StaticRender.fragment(
      `<ui-select options='[{"value":"x","text":"Extra"}]'>` +
        `<ui-item type="header">Fruit</ui-item><ui-item value="pear">Pear</ui-item></ui-select>`
    )
    expect(html).toMatch(/<optgroup label="Fruit" part="group"><option [^>]*value="pear"/)
    expect(html).toMatch(/<\/optgroup><option [^>]*value="x"[^>]*><span class="text">Extra<\/span>/)
  })

  it("renders a multiple select with every chosen value selected", () => {
    const html = StaticRender.fragment(
      `<ui-select multiple value="a,c" name="s"><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item>` +
        `<ui-item value="c">C</ui-item></ui-select>`
    )
    expect(html).toMatch(/^<select [^>]*multiple/)
    expect(html.match(/<option [^>]*selected/g)!.map((option) => option.match(/value="(\w)"/)![1])).toEqual(["a", "c"])
  })
})
