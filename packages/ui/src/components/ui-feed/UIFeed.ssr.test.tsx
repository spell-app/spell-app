/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIFeed } from "$/ui/components/ui-feed/UIFeed"
import { UIFeedEvent } from "$/ui/components/ui-feed/UIFeedEvent"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIDate } from "$/ui/components/ui-parts/UIDate"
import { UISummary } from "$/ui/components/ui-parts/UISummary"

/**
 * `<ui-feed>` in the static server render (`$/ui/static`):  a `<ul>` (`<ol>` when `ordered`) whose events' `<div>`
 * roots become the `<li>`s -- the events' `listitem` role is a `addElementEffect()`, applied once on the server.
 */
describe("<ui-feed> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIFeed, UIFeedEvent, UIContent, UISummary, UIDate)
  })

  it("renders an ordered feed:  an <ol> of <li> events, label boxes for the numbers, parts in-feed", () => {
    const html = StaticRender.fragment(
      `<ui-feed ordered color="blue"><ui-event label="A" color="red"><ui-content><ui-summary>Elliot` +
        `<ui-date>1 Hour Ago</ui-date></ui-summary></ui-content></ui-event>` +
        `<ui-event disabled><ui-content><ui-summary>Helen</ui-summary></ui-content></ui-event></ui-feed>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<ol class="ui blue ordered feed" part="feed" role="list" data-ui="feed">` +
          `<li class="red event ui-red in-feed" part="event" data-ui="event" data-state="in-feed" data-ui-slotted="">` +
          `<div class="label" part="label" data-text="A"></div>` +
          `<div class="content in-feed" part="content" data-ui="content" data-state="in-feed" data-ui-slotted="">` +
          `<div class="summary in-feed" part="summary" data-ui="summary" data-state="in-feed" data-ui-slotted="">` +
          `Elliot<time class="date in-feed" part="date" data-ui="date" data-state="in-feed" data-ui-slotted="">` +
          `1 Hour Ago</time></div></div></li>` +
          `<li class="disabled event in-feed" part="event" aria-disabled="true" data-ui="event" ` +
          `data-state="in-feed disabled" data-ui-slotted=""><div class="label" part="label"></div>` +
          `<div class="content in-feed" part="content" data-ui="content" data-state="in-feed" data-ui-slotted="">` +
          `<div class="summary in-feed" part="summary" data-ui="summary" data-state="in-feed" data-ui-slotted="">` +
          `Helen</div></div></li></ol>`
      )
    )
  })

  it("renders a plain feed as a <ul>;  an event without a label has no label box", () => {
    const html = StaticRender.fragment(`<ui-feed><ui-event><ui-content>Hi</ui-content></ui-event></ui-feed>`)
    expect(html).toMatch(/^<ul [^>]*class="ui feed"[^>]*><li [^>]*class="event in-feed"[^>]*><div [^>]*class="content/)
    expect(html).not.toContain(`class="label"`)
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
