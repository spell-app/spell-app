/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIEmoji } from "$/ui/components/ui-emoji/UIEmoji"

/**
 * `<ui-emoji>` in the static server render (`$/ui/server`, seo plan P3):  the render is synchronous, so the page's
 * names are loaded first (`UIEmoji.preload()`).
 */
describe("ui-emoji static render", () => {
  beforeAll(() => {
    StaticRender.define(UIEmoji)
  })

  it("draws nothing for a name not loaded yet", () => {
    const html = StaticRender.fragment(`<ui-emoji name="rocket"></ui-emoji>`)
    expect(sorted(html)).toBe(sorted(`<span data-ui="emoji" class="ui emoji" part="emoji"></span>`))
  })

  it("draws every name the page uses once preloaded, with its accessible name", async () => {
    const page =
      `<ui-emoji name="thumbs_up" label="Approved"></ui-emoji> <ui-emoji name='sparkles' label></ui-emoji> ` +
      `<ui-emoji size="large" name=":Face With Tears Of Joy:"></ui-emoji>`
    await UIEmoji.preload(page)
    const html = StaticRender.fragment(page)
    expect(sorted(html)).toBe(
      sorted(
        `<span data-ui="emoji" class="ui emoji" part="emoji" role="img" aria-label="Approved">👍</span> ` +
          `<span data-ui="emoji" class="ui emoji" part="emoji" aria-hidden="true">✨</span> ` +
          `<span data-ui="emoji" class="ui large emoji" part="emoji">😂</span>`
      )
    )
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
