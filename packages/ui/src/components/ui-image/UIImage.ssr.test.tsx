/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIImage } from "$/ui/components/ui-image/UIImage"
import { UIImages } from "$/ui/components/ui-image/UIImages"

/** `<ui-image>` / `<ui-images>` in the static server render (`$/ui/static`, seo plan P3). */
describe("<ui-image> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIImage, UIImages)
  })

  it("renders an image as the <img> itself, and a linked one as Fomantic's <a> wrapper", () => {
    const html = StaticRender.fragment(
      `<ui-image src="a.png" alt="A" size="small"></ui-image><ui-image href="#x" src="a.png" alt="Link"></ui-image>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<img data-ui="image" class="ui small image" part="image" src="a.png" alt="A">` +
          `<a data-ui="image" class="ui image" part="image" href="#x"><img part="img" src="a.png" alt="Link"></a>`
      )
    )
  })

  it("renders a group around its images", () => {
    const html = StaticRender.fragment(`<ui-images size="tiny"><ui-image src="a.png" alt=""></ui-image></ui-images>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="images" class="ui tiny images" part="group">` +
          `<img data-ui-slotted="" data-ui="image" class="ui image" part="image" src="a.png" alt=""></div>`
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
