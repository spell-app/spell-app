/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UITransition } from "$/ui/components/ui-transition/UITransition"

/** `<ui-transition>` in the static server render (`$/ui/static`, seo plan P3):  first paint, no animation. */
describe("ui-transition static render", () => {
  beforeAll(() => {
    StaticRender.define(UITransition)
  })

  it("renders a box hidden unless visible", () => {
    const html = StaticRender.fragment(
      `<ui-transition animation="fade"><p>Hidden</p></ui-transition>` +
        `<ui-transition visible inline><p>Shown</p></ui-transition>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="transition" class="ui transition" part="transition" hidden=""><p data-ui-slotted="">Hidden</p>` +
          `</div><div data-ui="transition" data-state="visible" class="ui inline transition visible" ` +
          `part="transition"><p data-ui-slotted="">Shown</p></div>`
      )
    )
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front;  bare ones get `=""`. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? [])
      .map((each: string) => (each.includes("=") ? each : `${each}=""`))
      .sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
