/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UICheckbox } from "$/ui/components/ui-checkbox/UICheckbox"
import { UIRadio } from "$/ui/components/ui-checkbox/UIRadio"

/**
 * `<ui-checkbox>` / `<ui-radio>` in a static server render (`$/ui/static`):  Fomantic's markup -- the native input
 * and its `<label for>` -- with the chosen state and form fields on the input, so a no-JS form submits it.
 */
describe("<ui-checkbox> static render", () => {
  beforeAll(() => {
    StaticRender.define(UICheckbox, UIRadio)
  })

  it("renders a chosen checkbox:  checked input with its name and value, its label tied to it", () => {
    const html = StaticRender.fragment(`<ui-checkbox name="terms" value="yes" selected>Agree</ui-checkbox>`)
    expect(html).toMatch(/^<div [^>]*class="ui checkbox"[^>]*><input [^>]*><label [^>]*>Agree<\/label><\/div>$/)
    expect(html).toContain(`data-state="selected"`)
    const input = html.match(/<input [^>]*>/)?.[0] ?? ""
    for (const attribute of [`type="checkbox"`, `name="terms"`, `value="yes"`, ` checked`]) {
      expect(input).toContain(attribute)
    }
    // the flattener's mark, used and dropped
    expect(html).not.toContain("data-ui-control")
    const id = input.match(/ id="([^"]+)"/)?.[1]
    expect(html).toContain(`<label for="${id}" part="label">`)
  })

  it("takes `checked` (the alias) as chosen, and leaves an unchosen one unchecked", () => {
    const [chosen, unchosen] = StaticRender.fragment(
      `<ui-checkbox checked>A</ui-checkbox><ui-checkbox>B</ui-checkbox>`
    ).match(/<input [^>]*>/g)!
    expect(chosen).toMatch(/ checked/)
    expect(unchosen).not.toMatch(/ checked/)
  })

  it("gives the input the host's id, so its own label and a page <label for> both name it", () => {
    const html = StaticRender.fragment(`<ui-checkbox id="news">News</ui-checkbox>`)
    expect(html).toMatch(/<input id="news" /)
    expect(html).toContain(`<label for="news" part="label">`)
  })

  it("renders toggles as switches, and disabled / read-only states", () => {
    const html = StaticRender.fragment(
      `<ui-checkbox type="toggle" disabled selected>T</ui-checkbox><ui-checkbox readonly>R</ui-checkbox>`
    )
    expect(html).toMatch(/class="ui toggle disabled checkbox"[^>]*><input [^>]*role="switch"[^>]*disabled/)
    expect(html).toMatch(/class="ui read-only checkbox"[^>]*><input [^>]*aria-readonly="true"/)
  })

  it("renders a radio group:  one name, the chosen radio checked", () => {
    const html = StaticRender.fragment(
      `<ui-radio name="size" value="s">S</ui-radio><ui-radio name="size" value="m" selected>M</ui-radio>`
    )
    const [small, medium] = html.match(/<input [^>]*>/g)!
    expect(small).toMatch(/type="radio"[^>]*name="size"[^>]*value="s"/)
    expect(small).not.toMatch(/ checked/)
    expect(medium).toMatch(/name="size"[^>]*value="m"[^>]*checked/)
    expect(html).toMatch(/class="ui radio checkbox"/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })
})
