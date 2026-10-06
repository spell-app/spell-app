import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/Sheets"

import itemCSS from "./ui-item.css?inline"
import itemRaw from "./ui-item.css?raw"

/**
 * `ui-item.css` on its own:  the generic item's host rules and resets.  The item LOOK is its owner's (`ui-list.css`,
 * `ui-menu.css`), tested there.
 */

describe("ui-item.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(itemRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(itemRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("item"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host and media rules", () => {
    for (const css of [itemCSS, itemRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain(":host")
      expect(selectors.some((selector) => selector.includes(".item:has("))).toBe(true)
    }
  })
})

describe("ui-item.css in a shadow root", () => {
  it("is display: contents;  a button box looks like its owner's item, and media flags the token", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(
      `<button class="item" part="item" type="button"><span class="icon" part="icon"></span><slot></slot></button>`,
      [...foundationCSS, itemCSS]
    )
    expect(getComputedStyle(host).display).toBe("contents")
    const box = Sheets.inner(host)
    const style = getComputedStyle(box)
    expect(style).toMatchObject({ backgroundColor: "rgba(0, 0, 0, 0)", borderTopWidth: "0px", cursor: "pointer" })
    expect(style.getPropertyValue("--_ui-item-media").trim()).toBe("1")
  })
})
