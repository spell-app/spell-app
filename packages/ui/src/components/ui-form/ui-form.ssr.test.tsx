/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UICheckbox } from "$/ui/components/ui-checkbox/UICheckbox"
import { UIInput } from "$/ui/components/ui-input/UIInput"
import { UIField } from "$/ui/components/ui-form/UIField"
import { UIFields } from "$/ui/components/ui-form/UIFields"
import { UIForm } from "$/ui/components/ui-form/UIForm"

/**
 * `<ui-form>`, `<ui-fields>`, `<ui-field>` in a static server render (`$/ui/static`):  a slotted `<form>` merges
 * into the root, which becomes Fomantic's `<form class="ui form">`, and the controls submit natively.
 */
describe("ui-form (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIForm, UIFields, UIField, UIInput, UICheckbox)
  })

  it("merges the author's <form> into its root:  one <form class=\"ui … form\">, the author's attributes kept", () => {
    const html = StaticRender.fragment(
      `<ui-form state="error" size="large"><form action="/signup" method="post" class="signup">` +
        `<ui-field><label for="e">E-mail</label><ui-input id="e" name="email" value="a@b.c"></ui-input></ui-field>` +
        `</form></ui-form>`
    )
    const root = html.match(/^<form [^>]*>/)?.[0] ?? ""
    expect(root).toContain(`action="/signup"`)
    expect(root).toContain(`method="post"`)
    expect(root).toContain(`class="ui large error form signup"`)
    expect(root).toContain(`data-ui="form"`)
    expect(html.match(/<form\b/g)).toHaveLength(1)
    // the field is the form's own child now, so the form sheet's `@scope` reaches it
    expect(html).toMatch(/^<form [^>]*><div [^>]*class="field"/)
    expect(html).toMatch(/<input [^>]*name="email"/)
    expect(html).toMatch(/<input [^>]*value="a@b.c"/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })

  it("keeps a <div> root inside a form around it", () => {
    const html = StaticRender.fragment(`<form id="f"><ui-form><ui-field>x</ui-field></ui-form></form>`)
    expect(html).toMatch(/^<form id="f"><div [^>]*class="ui form"/)
    expect(html.match(/<form\b/g)).toHaveLength(1)
  })

  it("keeps a <div> root around more than a form", () => {
    const html = StaticRender.fragment(`<ui-form><p>Intro</p><form></form></ui-form>`)
    expect(html).toMatch(/^<div [^>]*class="ui form"[^>]*><p [^>]*>Intro<\/p><form/)
  })

  it("renders field rows and states:  equal width fields, a required error field", () => {
    const html = StaticRender.fragment(
      `<ui-form><form><ui-fields widths="equal"><ui-field required state="error">A</ui-field>` +
        `<ui-field disabled>B</ui-field></ui-fields></form></ui-form>`
    )
    expect(html).toMatch(/<div [^>]*class="equal width fields"/)
    expect(html).toMatch(/<div [^>]*class="error required field"[^>]*>A<\/div>/)
    expect(html).toMatch(/<div [^>]*class="disabled field"[^>]*inert/)
  })

  it("puts each control's name, value and checked state on its native control", () => {
    const html = StaticRender.fragment(
      `<ui-form><form><ui-input name="first" value="Ada"></ui-input>` +
        `<ui-checkbox name="terms" value="yes" selected>Agree</ui-checkbox></form></ui-form>`
    )
    const [text, box] = html.match(/<input [^>]*>/g) ?? []
    expect(text).toMatch(/name="first"/)
    expect(text).toMatch(/value="Ada"/)
    expect(box).toMatch(/type="checkbox"/)
    expect(box).toMatch(/name="terms"/)
    expect(box).toMatch(/value="yes"/)
    expect(box).toMatch(/ checked/)
  })
})
