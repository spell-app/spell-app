import { describe, expect, it } from "vitest"

import { StaticPageStyles } from "$/ui/server"

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
    ["ui-segment:state(loading)", ['[data-ui="segment"][data-state~="loading"]']],
    ["main > ui-segment + ui-segment", ['main > [data-ui="segment"] + [data-ui="segment"]']],
    // tags of families the render doesn't know stay
    ["ui-tabs", ["ui-tabs"]],
    [".x", [".x"]]
  ])("%s", (selector, expected) => {
    expect(StaticPageStyles.selector(selector, tags)).toEqual(expected)
  })

  it("rewrites a whole sheet, keeping its at-rules", () => {
    expect(StaticPageStyles.rewrite("@media (width > 1px) { ui-card { color: red } }", tags)).toBe(
      '@media (width > 1px) { [data-ui="card"] { color: red } }'
    )
  })
})
