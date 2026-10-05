import { describe, expect, it } from "vite-plus/test"

import { StaticSelectors } from "$/ui/server"

/** Shadow selectors => light-DOM selectors inside the component's `@scope` (`:scope` = its root). */
describe("StaticSelectors.rewrite()", () => {
  it.each([
    // [shadow selector, static selectors, host only]
    [":host", [":scope:where([data-ui])"], true],
    [":host(:state(fluid))", [':scope:where([data-ui]):is([data-state~="fluid"])'], true],
    [":host > .ui.button", [":scope:where([data-ui]):is(.ui.button)"], false],
    [
      ":host(:state(active)) > .ui.button::after",
      [':scope:where([data-ui]):is([data-state~="active"]):is(.ui.button)::after'],
      false
    ],
    [
      ":host(:state(in-card)) > .header > ::slotted(img)",
      [':scope:where([data-ui]):is([data-state~="in-card"]):is(.header) > img:not([data-ui]):where(:scope, *)'],
      false
    ],
    [":host > :is(a[href], button):hover", [":scope:where([data-ui]):is(:is(a[href], button):hover)"], false],
    [
      ":host(:not(.x)) .icon",
      [
        ":scope:where([data-ui]):is(:not(.x)) .icon:where(:scope, :not([data-ui-slotted]))",
        ":scope:where([data-ui]):is(:not(.x)):is(.icon)"
      ],
      false
    ],
    // the slot element:  the assigned nodes;  a rule ON it is boxless, like a host rule
    [".ui.segment > slot", [".ui.segment > [data-ui-slotted]:where(:scope, *)"], true],
    ["::slotted(:state(or))", [':scope > [data-state~="or"]:where(:scope, *)'], false],
    [".ui.menu .item", [".ui.menu .item:where(:scope, :not([data-ui-slotted]))"], false],
    [".ui.card::after", [".ui.card:where(:scope, :not([data-ui-slotted]))::after"], false],
    // the minified `?inline` sheets spell pseudo-elements with one colon
    [
      ".ui.stacked:is(.segment, .segments):after",
      [".ui.stacked:is(.segment, .segments):where(:scope, :not([data-ui-slotted])):after"],
      false
    ],
    [":host:before", [":scope:where([data-ui]):before"], false],
    [".ui.buttons > ::slotted(*)", [".ui.buttons > *:where(:scope, *)"], false],
    // a native type never matched a slotted COMPONENT, whose root may be one now
    [".ui.item > ::slotted(img)", [".ui.item > img:not([data-ui]):where(:scope, *)"], false],
    [".item > slot::slotted(.x)", [".item > .x:where(:scope, *)"], false],
    // a compound before ::slotted described the slot:  dropped
    [".icon > .box::slotted(svg)", [".icon > svg:not([data-ui]):where(:scope, *)"], false],
    // quoted parentheses don't unbalance anything
    ['.x[title="("] > .y', ['.x[title="("] > .y:where(:scope, :not([data-ui-slotted]))'], false]
  ])("%s", (shadow, selectors, hostOnly) => {
    const { selectors: actual, hostOnly: actualHostOnly } = StaticSelectors.rewrite(shadow)
    expect({ selectors: actual, hostOnly: actualHostOnly }).toEqual({ selectors, hostOnly })
  })
})
