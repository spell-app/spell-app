/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIInput } from "$/ui/components/ui-input/UIInput"
import { UIRating } from "$/ui/components/ui-rating/UIRating"
import { UISlider } from "$/ui/components/ui-slider/UISlider"

/**
 * `ControlLabels` in a static server render (`$/ui/server`):  the inner control's name is read once from the parsed
 * page (seo plan, T6) -- what a `<label for>` can't reach on the static page either (a slider thumb, a rating group).
 */
describe("ControlLabels (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIInput, UIRating, UISlider)
  })

  /** The first `<tag ...>` in `html` whose attributes match `pattern`. */
  function element(html: string, pattern: RegExp): string {
    return html.match(new RegExp(`<\\w+ [^>]*${pattern.source}[^>]*>`))?.[0] ?? ""
  }

  it("names the control from the page's <label for>, minus the host's own text", () => {
    const html = StaticRender.fragment(
      `<label for="volume">Volume <b>level</b></label><ui-slider id="volume" value="5" max="10"></ui-slider>`
    )
    expect(element(html, /role="slider"/)).toContain(`aria-label="Volume level"`)
  })

  it("joins several labels in document order", () => {
    const html = StaticRender.fragment(
      `<label for="mail">E-mail</label><ui-input id="mail"></ui-input><label for="mail">(work)</label>`
    )
    expect(element(html, /part="control"/)).toContain(`aria-label="E-mail (work)"`)
  })

  it("names the control from a wrapping <label>, skipping the text inside the host", () => {
    const html = StaticRender.fragment(`<label>Stars <ui-rating max="3"></ui-rating></label>`)
    expect(element(html, /role="radiogroup"/)).toContain(`aria-label="Stars"`)
  })

  it("prefers the host's aria-label, then aria-labelledby's text", () => {
    const html = StaticRender.fragment(
      `<span id="a">Alpha</span><span id="b">Beta</span><label for="s">Ignored</label>` +
        `<ui-slider id="s" aria-labelledby="a b"></ui-slider><ui-slider aria-label="Own"></ui-slider>`
    )
    const [first, second] = html.match(/<div [^>]*role="slider"[^>]*>/g)!
    expect(first).toContain(`aria-label="Alpha Beta"`)
    expect(second).toContain(`aria-label="Own"`)
  })

  it("leaves a control nothing names without a name", () => {
    const html = StaticRender.fragment(`<label for="other">Other</label><ui-slider id="s"></ui-slider>`)
    expect(element(html, /role="slider"/)).not.toContain("aria-label")
  })
})
