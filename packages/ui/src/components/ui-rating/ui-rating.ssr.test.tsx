/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIRating } from "$/ui/components/ui-rating/UIRating"

/**
 * `<ui-rating>` in a static server render (`$/ui/server`):  a radio group of native radios, the value's radio
 * checked and named for the form, so a no-JS form submits it.
 */
describe("ui-rating (static render)", () => {
  beforeAll(() => {
    StaticRender.define(UIRating)
  })

  it("renders a radio group:  one radio per point, the value's checked, the points up to it active", () => {
    const html = StaticRender.fragment(`<ui-rating name="stars" value="2" max-rating="3" color="yellow"></ui-rating>`)
    expect(html).toMatch(/^<fieldset [^>]*class="ui yellow rating"[^>]*role="radiogroup"/)
    const labels = html.match(/<label class="[^"]*"/g)!
    expect(labels).toEqual([`<label class="active icon"`, `<label class="active icon"`, `<label class="icon"`])
    const radios = html.match(/<input [^>]*>/g)!
    expect(radios).toHaveLength(3)
    for (const radio of radios) expect(radio).toMatch(/type="radio"[^>]*name="stars"/)
    expect(radios.map((radio) => / checked/.test(radio))).toEqual([false, true, false])
    expect(radios[2]).toContain(`aria-label="3 of 3"`)
    expect(html).not.toContain("<ui-")
  })

  it("names its radios after the group when the host has no name", () => {
    const radios = StaticRender.fragment(`<ui-rating value="1"></ui-rating>`).match(/<input [^>]*>/g)!
    const names = new Set(radios.map((radio) => radio.match(/name="([^"]+)"/)?.[1]))
    expect(names.size).toBe(1)
    expect([...names][0]).toMatch(/^ui-rating-/)
  })

  it("renders a disabled rating as a disabled fieldset", () => {
    expect(StaticRender.fragment(`<ui-rating disabled value="1"></ui-rating>`)).toMatch(/^<fieldset [^>]*disabled/)
  })
})
