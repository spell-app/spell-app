import postcss from "postcss"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender, StaticSelectors, StaticStylesheet } from "$/ui/server"
import { UICard } from "$/ui/components/ui-card/UICard"
import { UICards } from "$/ui/components/ui-card/UICards"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIList } from "$/ui/components/ui-list/UIList"
import { UIMenu } from "$/ui/components/ui-menu/UIMenu"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIHeader } from "$/ui/components/ui-parts/UIHeader"
import { UISegment } from "$/ui/components/ui-segment/UISegment"

/** The static page's ONE stylesheet:  shadow selectors gone, every component sheet kept to its own `@scope`. */
describe("StaticStylesheet", () => {
  let css = ""

  beforeAll(() => {
    StaticRender.define(UISegment, UICards, UICard, UIContent, UIHeader, UIList, UIItem, UIMenu)
    css = StaticStylesheet.build(StaticRender.families.values())
  })

  it("starts with the page layer, before every ui layer", () => {
    expect(css.startsWith("@layer ui-slotted, page, ui;")).toBe(true)
  })

  it("leaves no shadow-only selector", () => {
    const selectors: string[] = []
    postcss.parse(css).walkRules((rule) => void selectors.push(...rule.selectors))
    const shadow = selectors.filter((selector) => /:host|::slotted|:state\(|(^|[\s>+~(,])slot(?![\w-])/.test(selector))
    expect(shadow).toEqual([])
  })

  it("wraps each component sheet in a scope from its root to other components' insides", () => {
    expect(css).toContain(
      `@scope (:is([data-ui="menu"], .ui.menu:not([data-ui]):is(:not([data-ui] *), [data-ui-slotted]:not([data-ui]), ` +
        `[data-ui-slotted]:not([data-ui]) *))) to ([data-ui-slotted]:not([data-ui]) > *, :scope [data-ui] > *)`
    )
    // `ui-parts.css` is shared:  one copy, scoped to every part that adopts it
    const parts = css.slice(css.indexOf("/* parts */"))
    expect(parts).toMatch(/^\/\* parts \*\/\n@layer [^{]+\{\s*@scope \(:is\(/)
    expect(parts.slice(0, 300)).toContain(`[data-ui="content"]`)
    expect(parts.slice(0, 300)).toContain(`[data-ui="header"]`)
  })

  it("keeps a sheet's layers outside its scope", () => {
    const menu = css.slice(css.indexOf("/* menu */"))
    expect(menu).toMatch(/@layer ui\.components\.menu\.[a-z]+ \{\s*@scope/)
  })

  it("moves a host-only rule to the first layer, without its display", () => {
    const css = StaticStylesheet.scope(
      "@layer ui.components.x { @media (width > 1px) { :host { display: block; --ui-x: 1 } .ui.x { color: red } } }",
      "[data-ui]"
    )
    expect(css).not.toContain("display")
    expect(css).toMatch(
      /@layer ui\.reset \{\s*@scope [^{]+\{\s*@media \(width > 1px\) \{\s*:scope:where\(\[data-ui\]\) \{ --ui-x: 1 \}/
    )
    expect(css).toMatch(/@layer ui\.components\.x \{\s*@scope [^{]+\{\s*@media \(width > 1px\) \{\s*\.ui\.x/)
  })

  it("orders sheets so a later-adopted sheet's layers come later, as in the shadow root", () => {
    expect(
      StaticStylesheet.ordered(
        ["list", "menu", "item"],
        [
          ["item", "list"],
          ["item", "menu"]
        ]
      )
    ).toEqual(["item", "list", "menu"])
    // a cycle keeps the given order
    expect(
      StaticStylesheet.ordered(
        ["a", "b"],
        [
          ["a", "b"],
          ["b", "a"]
        ]
      )
    ).toEqual(["a", "b"])
  })

  it("tests a wrapped item's position on its wrapper", () => {
    expect(StaticSelectors.rewrite(":host(:first-child) > .item").selectors).toEqual([
      ":scope:where([data-ui]):is(:is(:not([data-ui-li]) > *:first-child, [data-ui-li]:first-child > *)):is(.item)"
    ])
    expect(StaticSelectors.rewrite(".ui.list > .item:first-child", { listItems: true }).selectors).toEqual([
      ".ui.list > .item:first-child:where(:scope, :not([data-ui-slotted]))",
      ".ui.list > [data-ui-li]:first-child > .item:where(:scope, :not([data-ui-slotted]))"
    ])
  })

  it("moves a whole :not(position) onto the wrapper, never leaving an empty :not()", () => {
    expect(StaticSelectors.rewrite(".ui.feed > .event:not(:first-child)", { listItems: true }).selectors).toEqual([
      ".ui.feed > .event:not(:first-child):where(:scope, :not([data-ui-slotted]))",
      ".ui.feed > [data-ui-li]:not(:first-child) > .event:where(:scope, :not([data-ui-slotted]))"
    ])
    expect(
      StaticSelectors.rewrite(":is(.ui.card, .ui.cards > .card) > :is(.button, .buttons)", { listItems: true })
        .selectors.length
    ).toBeGreaterThan(1)
  })

  it("lets a list group's child combinators step over the item wrapper", () => {
    expect(StaticSelectors.rewrite(".ui.cards > .card > .image", { listItems: true }).selectors).toEqual([
      ".ui.cards > .card > .image:where(:scope, :not([data-ui-slotted]))",
      ".ui.cards > .card > [data-ui-li] > .image:where(:scope, :not([data-ui-slotted]))",
      ".ui.cards > [data-ui-li] > .card > .image:where(:scope, :not([data-ui-slotted]))",
      ".ui.cards > [data-ui-li] > .card > [data-ui-li] > .image:where(:scope, :not([data-ui-slotted]))"
    ])
  })
})
