/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UILoader } from "$/ui/components/ui-loader/UILoader"

/** `<ui-loader>` in the static server render (`$/ui/static`, seo plan P3):  internals ARIA written out. */
describe("<ui-loader> static render", () => {
  beforeAll(() => {
    StaticRender.define(UILoader)
  })

  it("renders a live status, named Loading… without text of its own", () => {
    const html = StaticRender.fragment(`<ui-loader active></ui-loader><ui-loader active>Saving</ui-loader>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="loader" aria-label="Loading…" aria-live="polite" role="status" data-state="active" ` +
          `class="ui active loader" part="loader"></div>` +
          `<div data-ui="loader" aria-live="polite" role="status" data-state="active" class="ui active loader" ` +
          `part="loader">Saving</div>`
      )
    )
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
