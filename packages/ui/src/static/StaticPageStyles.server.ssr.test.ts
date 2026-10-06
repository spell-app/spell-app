import { describe, expect, it } from "vite-plus/test"

import { REACH, StaticPageStyles } from "$/ui/static"

/** A page's own selectors, rewritten for the flattened output. */
describe("StaticPageStyles.selector()", () => {
  const tags = new Map([
    ["ui-segment", "segment"],
    ["ui-card", "card"]
  ])

  it.each([
    ["#circular-segment::part(segment)", ['#circular-segment[part~="segment"]', '#circular-segment [part~="segment"]']],
    [
      "ui-card::part(header):hover",
      ['[data-ui="card"][part~="header"]:hover', '[data-ui="card"] [part~="header"]:hover']
    ],
    ["ui-segment:state(loading)", [`[data-ui="segment"][data-state~="loading"]${REACH}`]],
    ["main > ui-segment + ui-segment", [`main > [data-ui="segment"] + [data-ui="segment"]${REACH}`]],
    // tags of families the render doesn't know stay
    ["ui-tabs", [`ui-tabs${REACH}`]],
    [".x", [`.x${REACH}`]],
    // page CSS never reached a component's own markup:  every subject keeps to what the light DOM held
    ["h2::before", [`h2${REACH}::before`]]
  ])("%s", (selector, expected) => {
    expect(StaticPageStyles.selector(selector, tags)).toEqual(expected)
  })

  it("rewrites a whole sheet, keeping its at-rules", () => {
    expect(StaticPageStyles.rewrite("@media (width > 1px) { ui-card { color: red } }", tags)).toBe(
      `@media (width > 1px) { [data-ui="card"]${REACH} { color: red } }`
    )
  })
})
