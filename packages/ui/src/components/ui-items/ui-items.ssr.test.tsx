/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIItems } from "$/ui/components/ui-items/UIItems"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIHeader } from "$/ui/components/ui-parts/UIHeader"
import { UIMeta } from "$/ui/components/ui-parts/UIMeta"

/**
 * `<ui-items>` in the static server render (`$/ui/static`):  a `<ul>` of items whose `<div>` roots become the `<li>`s
 * (a link item's `<a>` is wrapped instead), content parts owned by their item (`in-item`).
 */
describe("ui-items, static", () => {
  beforeAll(() => {
    StaticRender.define(UIItems, UIItem, UIContent, UIHeader, UIMeta)
  })

  it("renders a <ul> of items:  <div> roots become the <li>s, the image shorthand an <img class=image>", () => {
    const html = StaticRender.fragment(
      `<ui-items divided><ui-item image="dog.png"><ui-content><ui-header>Cute Dog</ui-header>` +
        `<ui-meta>Description</ui-meta></ui-content></ui-item></ui-items>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<ul class="ui divided items" part="items" role="list" data-ui="items" data-state="items">` +
          `<li class="item in-items" part="item" data-ui="item" data-state="in-items" data-ui-slotted="">` +
          `<img class="image" part="image" src="dog.png" alt="">` +
          `<div class="content in-item" part="content" data-ui="content" data-state="in-item" data-ui-slotted="">` +
          `<div class="header in-item" part="header" data-ui="header" data-state="in-item" data-ui-slotted="">` +
          `Cute Dog</div>` +
          `<div class="meta in-item" part="meta" data-ui="meta" data-state="in-item" data-ui-slotted="">` +
          `Description</div></div></li></ul>`
      )
    )
  })

  it("wraps a link item's <a> in an <li data-ui-li>", () => {
    const html = StaticRender.fragment(`<ui-items><ui-item href="#camp">Camp</ui-item></ui-items>`)
    expect(sorted(html)).toBe(
      sorted(
        `<ul class="ui items" part="items" role="list" data-ui="items" data-state="items"><li data-ui-li="">` +
          `<a class="item in-items" part="item" href="#camp" data-ui="item" data-state="in-items" data-ui-slotted="">` +
          `Camp</a></li></ul>`
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
