import { describe, expect, it } from "vitest"

import { StaticSelectors } from "$/ui/server"

/** Shadow selectors => light-DOM selectors inside the component's `@scope` (`:scope` = its root). */
describe("StaticSelectors.rewrite()", () => {
  it.each([
    // [shadow selector, static selectors, host only]
    [":host", [":scope"], true],
    [":host(:state(fluid))", [':scope:is([data-state~="fluid"])'], true],
    [":host > .ui.button", [":scope:is(.ui.button)"], false],
    [":host(:state(active)) > .ui.button::after", [':scope:is([data-state~="active"]):is(.ui.button)::after'], false],
    [
      ":host(:state(in-card)) > .header > ::slotted(img)",
      [':scope:is([data-state~="in-card"]):is(.header) > img'],
      false
    ],
    [":host > :is(a[href], button):hover", [":scope:is(:is(a[href], button):hover)"], false],
    [":host(:not(.x)) .icon", [":scope:is(:not(.x)) .icon", ":scope:is(:not(.x)):is(.icon)"], false],
    [".ui.segment > slot", [".ui.segment > *:where(:scope, *)"], false],
    ["::slotted(:state(or))", [':scope > [data-state~="or"]'], false],
    [".ui.menu .item", [".ui.menu .item:where(:scope, *)"], false],
    [".ui.card::after", [".ui.card:where(:scope, *)::after"], false],
    // the minified `?inline` sheets spell pseudo-elements with one colon
    [
      ".ui.stacked:is(.segment, .segments):after",
      [".ui.stacked:is(.segment, .segments):where(:scope, *):after"],
      false
    ],
    [":host:before", [":scope:before"], false],
    [".ui.buttons > ::slotted(*)", [".ui.buttons > *:where(:scope, *)"], false]
  ])("%s", (shadow, selectors, hostOnly) => {
    expect(StaticSelectors.rewrite(shadow)).toEqual({ selectors, hostOnly })
  })
})
