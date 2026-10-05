/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIButton } from "$/ui/components/ui-button/UIButton"

/**
 * `<ui-button>` in a static server render (`$/ui/server`):  the inner `<button>` is the form's submitter, so a no-JS
 * form submits / resets with it as the element would (seo plan, I18).
 */
describe("ui-button (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIButton)
  })

  it("renders a submit button as a native submitter:  type, name, value, form attributes", () => {
    const html = StaticRender.fragment(
      `<ui-button type="submit" name="action" value="save" formaction="/save" formnovalidate primary>Save</ui-button>`
    )
    const button = html.match(/^<button [^>]*>/)?.[0] ?? ""
    for (const attribute of [
      `type="submit"`,
      `name="action"`,
      `value="save"`,
      `formaction="/save"`,
      ` formnovalidate`
    ]) {
      expect(button).toContain(attribute)
    }
    expect(html.match(/formaction=/g)).toHaveLength(1)
  })

  it("renders a reset button as type=reset, a plain one as type=button", () => {
    const html = StaticRender.fragment(`<ui-button type="reset">Clear</ui-button><ui-button>Plain</ui-button>`)
    expect([...html.matchAll(/<button [^>]*type="(\w+)"/g)].map((match) => match[1])).toEqual(["reset", "button"])
    expect(html).not.toContain("name=")
  })

  it("keeps an invoker's commandfor and command, as written, on the native button", () => {
    const html = StaticRender.fragment(`<ui-button commandfor="m1" command="--show">Open</ui-button>`)
    const button = html.match(/^<button [^>]*>/)?.[0] ?? ""
    expect(button).toContain(`commandfor="m1"`)
    expect(button).toContain(`command="--show"`)
    expect(button).toContain(`type="button"`)
  })

  it("hands the host's id to the inner button under a joined label (the root is the wrapper)", () => {
    const html = StaticRender.fragment(`<ui-button id="like" type="submit" name="like" label="12">Like</ui-button>`)
    expect(html).toMatch(/^<div [^>]*class="ui labeled button"/)
    const button = html.match(/<button [^>]*>/)?.[0] ?? ""
    for (const attribute of [`type="submit"`, `name="like"`, `id="like"`]) expect(button).toContain(attribute)
    expect(html.match(/ id=/g)).toHaveLength(1)
    expect(html).not.toContain("data-ui-control")
  })
})
