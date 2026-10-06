/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UISlider } from "$/ui/components/ui-slider/UISlider"

/**
 * `<ui-slider>` in a static server render (`$/ui/static`):  the track and APG thumbs at their positions, and the
 * value as hidden inputs (no native control has two thumbs), so a no-JS form submits it.
 */
describe("ui-slider (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UISlider)
  })

  it("renders a thumb at its value, its ARIA values set, the host's ARIA name on it", () => {
    const html = StaticRender.fragment(`<ui-slider aria-label="Volume" name="volume" value="5" max="10"></ui-slider>`)
    expect(html).toMatch(/^<div [^>]*class="ui slider"[^>]*><div class="inner"/)
    const thumb = html.match(/<div [^>]*role="slider"[^>]*>/)?.[0] ?? ""
    for (const attribute of [
      `aria-valuemin="0"`,
      `aria-valuemax="10"`,
      `aria-valuenow="5"`,
      `style="--_slider-at:0.5"`,
      `aria-label="Volume"`
    ]) {
      expect(thumb).toContain(attribute)
    }
    expect(html).not.toContain("data-ui-control")
    expect(html).toContain(`<input type="hidden" name="volume" value="5">`)
  })

  it("renders a range:  two thumbs in a group, the group named by the host, two hidden inputs", () => {
    const html = StaticRender.fragment(`<ui-slider id="price" range name="price" value="5" end="15"></ui-slider>`)
    const group = html.match(/<div [^>]*class="inner"[^>]*>/)?.[0] ?? ""
    expect(group).toContain(`style="--_slider-from:0.25;--_slider-to:0.75"`)
    expect(group).toContain(`role="group"`)
    expect(group).toContain(`id="price"`)
    expect(html).not.toContain("data-ui-control")
    expect(html.match(/role="slider"/g)).toHaveLength(2)
    expect(html.match(/<input type="hidden"[^>]*>/g)).toEqual([
      `<input type="hidden" name="price" value="5">`,
      `<input type="hidden" name="price" value="15">`
    ])
  })

  it("renders labels and states, and nothing to submit without a name", () => {
    const html = StaticRender.fragment(`<ui-slider labeled disabled max="4" value="1"></ui-slider>`)
    expect(html).toMatch(/class="ui disabled labeled slider"/)
    expect(html).toMatch(/<ul class="auto labels" part="labels" aria-hidden="true">/)
    expect(html).toMatch(/aria-disabled="true"/)
    expect(html).not.toContain(`type="hidden"`)
    expect(html).not.toContain("<ui-")
  })
})
