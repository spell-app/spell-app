/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIProgress } from "$/ui/components/ui-progress/UIProgress"

/** `<ui-progress>` in the static server render (`$/ui/static`, seo plan P3):  internals ARIA written out. */
describe("<ui-progress> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIProgress)
  })

  it("renders a named progressbar with its value, bar width and text", () => {
    const html = StaticRender.fragment(`<ui-progress value="3" total="4" bar-text="ratio">Uploading</ui-progress>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="progress" aria-label="Uploading" aria-valuetext="3 of 4" aria-valuenow="3" ` +
          `aria-valuemax="4" aria-valuemin="0" role="progressbar" class="ui progress" part="progress" ` +
          `data-percent="75"><div class="bar" part="bar" style="width:75%">` +
          `<div class="progress" part="bar-text">3 of 4</div></div>` +
          `<div class="label" part="label">Uploading</div></div>`
      )
    )
  })

  it("leaves the value out while indeterminate", () => {
    const html = StaticRender.fragment(`<ui-progress indeterminate label="Working"></ui-progress>`)
    expect(html).toContain(`role="progressbar"`)
    expect(html).not.toContain("aria-valuenow")
    expect(html).toContain(`data-state="indeterminate"`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
