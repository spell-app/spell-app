/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIEmbed } from "$/ui/components/ui-embed/UIEmbed"

/** `<ui-embed>` in the static server render (`$/ui/static`, seo plan P3):  nothing third-party loads. */
describe("<ui-embed> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIEmbed)
  })

  it("renders the play button over the placeholder, never the frame", () => {
    const html = StaticRender.fragment(
      `<ui-embed source="youtube" video-id="abc" placeholder="p.png" label="Intro" aspect-ratio="4:3"></ui-embed>`
    )
    // the play glyph is the icon packs' business:  only its box counts here
    expect(sorted(html.replace(/<svg.*?<\/svg>/gs, ""))).toBe(
      sorted(
        `<div data-ui="embed" class="ui embed 4:3" part="embed"><button type="button" class="play" part="play" ` +
          `aria-label="Play Intro"><img class="placeholder" part="placeholder" src="p.png" alt="">` +
          `<span class="icon" part="icon"></span></button></div>`
      )
    )
    expect(html).not.toContain("<iframe")
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
