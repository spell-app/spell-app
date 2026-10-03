/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { ServerRuntime, StaticRender } from "$/ui/server"
import { UIStep } from "$/ui/components/ui-step/UIStep"
import { UISteps } from "$/ui/components/ui-step/UISteps"

/**
 * `<ui-step>` / `<ui-steps>` in the static server render (`$/ui/server`, seo plan P3):  an `<ol>` of `<li>` steps,
 * as the class grammar writes it.
 */
describe("ui-step static render", () => {
  beforeAll(async () => {
    StaticRender.define(UIStep, UISteps)
    await ServerRuntime.icons()
  })

  it("renders an <ol> whose box steps ARE the <li>s, the selected one aria-current", () => {
    const html = StaticRender.fragment(
      `<ui-steps ordered><ui-step selected header="Billing" description="Enter"></ui-step></ui-steps>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<ol data-ui="steps" data-state="steps" class="ui ordered steps" part="steps" role="list">` +
          `<li data-ui-slotted="" data-ui="step" data-state="selected content" aria-current="step" part="step" ` +
          `class="active step"><div class="content in-step" part="content">` +
          `<div class="title in-step" part="title">Billing</div>` +
          `<div class="description in-step" part="description">Enter</div></div></li></ol>`
      )
    )
  })

  it("wraps a link step in an <li>", () => {
    const html = StaticRender.fragment(`<ui-steps><ui-step href="#c" disabled header="Confirm"></ui-step></ui-steps>`)
    expect(html).toMatch(/<li data-ui-li=""><a [^>]*class="disabled step"/)
    expect(html).toContain(`aria-disabled="true"`)
    expect(html).not.toContain(`href=`)
  })

  it("shows only the check on a completed step:  its icon is left out, as the hidden slot hid it", () => {
    const html = StaticRender.fragment(
      `<ui-steps><ui-step completed icon="truck" header="Shipping"></ui-step></ui-steps>`
    )
    const icon = html.match(/<span class="icon" part="icon">(.*?)<\/span>/s)?.[1] ?? ""
    expect(icon.match(/<svg/g)).toHaveLength(1)
    expect(html).not.toContain("<slot")
    expect(html).toContain(`<span class="ui-visually-hidden-force">Completed</span>`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
