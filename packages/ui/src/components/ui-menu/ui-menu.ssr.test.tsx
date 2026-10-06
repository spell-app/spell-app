/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIMenu } from "$/ui/components/ui-menu/UIMenu"

/**
 * `<ui-menu>` in the static server render (`$/ui/static`):  a `<nav>` landmark of link items, a sub-menu as
 * `<div class="right menu">`, and the `interactive` menubar with `menuitem` buttons.
 */
describe("ui-menu, static", () => {
  beforeAll(() => {
    StaticRender.define(UIMenu, UIItem)
  })

  it("renders a navigation menu:  links, the selected one aria-current, a sub-menu", () => {
    const html = StaticRender.fragment(
      `<ui-menu aria-label="Site" pointing><ui-item href="#home" selected>Home</ui-item>` +
        `<ui-item href="#news">News</ui-item>` +
        `<ui-menu position="right"><ui-item href="#out">Logout</ui-item></ui-menu></ui-menu>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<nav class="ui pointing menu" part="menu" aria-label="Site" data-ui="menu">` +
          `<a class="active item in-menu" part="item" href="#home" aria-current="page" data-ui="item" ` +
          `data-state="in-menu selected" data-ui-slotted="">Home</a>` +
          `<a class="item in-menu" part="item" href="#news" data-ui="item" data-state="in-menu" ` +
          `data-ui-slotted="">News</a>` +
          `<div class="right menu in-menu" part="menu" data-ui="menu" data-state="in-menu" data-ui-slotted="">` +
          `<a class="item in-menu" part="item" href="#out" data-ui="item" data-state="in-menu" ` +
          `data-ui-slotted="">Logout</a></div></nav>`
      )
    )
  })

  it("renders an interactive menu as a menubar of menuitem buttons;  items aren't list items", () => {
    const html = StaticRender.fragment(
      `<ui-menu interactive vertical aria-label="Actions"><ui-item>Cut</ui-item>` +
        `<ui-item disabled>Copy</ui-item></ui-menu>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="ui vertical menu" part="menu" role="menubar" aria-orientation="vertical" ` +
          `aria-label="Actions" data-ui="menu" data-state="interactive vertical">` +
          `<button class="item in-menu" part="item" type="button" role="menuitem" data-ui="item" ` +
          `data-state="in-menu" data-ui-slotted="">Cut</button>` +
          `<button class="disabled item in-menu" part="item" type="button" role="menuitem" aria-disabled="true" ` +
          `data-ui="item" data-state="in-menu disabled" data-ui-slotted="">Copy</button></div>`
      )
    )
    expect(html).not.toContain("<li")
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
