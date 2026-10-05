/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIInput } from "$/ui/components/ui-input/UIInput"
import { UITextarea } from "$/ui/components/ui-input/UITextarea"

/**
 * `<ui-input>` / `<ui-textarea>` in a static server render (`$/ui/server`):  Fomantic's `div.ui.input` around the
 * native control, which carries what a no-JS form submits.
 */
describe("ui-input (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIInput, UITextarea)
  })

  it("renders the native input with its name, value and constraints, the host's id and ARIA names on it", () => {
    const html = StaticRender.fragment(
      `<ui-input id="mail" aria-describedby="hint" name="email" type="email" value="a@b.c" placeholder="E-mail" ` +
        `required fluid></ui-input>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui fluid input"[^>]*><input [^>]*><\/div>$/)
    const input = html.match(/<input [^>]*>/)?.[0] ?? ""
    for (const attribute of [
      `part="control"`,
      `type="email"`,
      `name="email"`,
      `value="a@b.c"`,
      `placeholder="E-mail"`,
      ` required`,
      `id="mail"`,
      `aria-describedby="hint"`
    ]) {
      expect(input).toContain(attribute)
    }
    // the flattener's mark, used and dropped:  the ids went to the control, not the root
    expect(html.match(/^<div [^>]*>/)?.[0]).not.toMatch(/ id=|aria-describedby/)
    expect(html).not.toContain("data-ui-control")
  })

  it("renders states:  disabled control, loading box with its icon box", () => {
    const html = StaticRender.fragment(`<ui-input disabled></ui-input><ui-input loading icon="search"></ui-input>`)
    expect(html).toMatch(/class="ui disabled input"[^>]*><input [^>]*disabled/)
    expect(html).toMatch(/data-state="loading"[^>]*class="ui loading input icon"/)
    expect(html).toMatch(/aria-busy="true"/)
    expect(html).toMatch(/<span class="icon" part="icon">/)
  })

  it("renders a labeled input:  the label box before the control", () => {
    const html = StaticRender.fragment(`<ui-input label="https://" placeholder="site"></ui-input>`)
    expect(html).toMatch(/class="ui labeled input"[^>]*><span class="ui label" part="label">https:\/\/<\/span><input /)
  })

  it("renders a textarea's value as its content", () => {
    const html = StaticRender.fragment(`<ui-textarea name="bio" value="Hi &lt;there&gt;" rows="3"></ui-textarea>`)
    expect(html).toMatch(/<textarea [^>]*name="bio"[^>]*>Hi &lt;there(&gt;|>)<\/textarea>/)
    expect(html).toMatch(/<textarea [^>]*rows="3"/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })
})
