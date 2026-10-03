/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIStatistic } from "$/ui/components/ui-statistic/UIStatistic"
import { UIStatistics } from "$/ui/components/ui-statistic/UIStatistics"
import { UIValue } from "$/ui/components/ui-parts/UIValue"

/** `<ui-statistic>` / `<ui-statistics>` in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-statistic static render", () => {
  beforeAll(() => {
    StaticRender.define(UIStatistic, UIStatistics, UIValue)
  })

  it("renders the value and label shorthands as owned parts", () => {
    const html = StaticRender.fragment(`<ui-statistic value="5,550" label="Downloads"></ui-statistic>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="statistic" data-state="statistic" class="ui statistic" part="statistic">` +
          `<div class="value in-statistic" part="value">5,550</div>` +
          `<div class="label in-statistic" part="label">Downloads</div></div>`
      )
    )
  })

  it("renders a group, and a slotted value part marked in-statistic", () => {
    const html = StaticRender.fragment(
      `<ui-statistics size="small"><ui-statistic label="Saves"><ui-value>22</ui-value></ui-statistic></ui-statistics>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui small statistics"/)
    expect(html).toMatch(/<div [^>]*class="value in-statistic"[^>]*>22<\/div>/)
    expect(html).toContain(`data-state="in-statistic"`)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
