/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIComment } from "$/ui/components/ui-comment/UIComment"
import { UIComments } from "$/ui/components/ui-comment/UIComments"
import { UIAuthor } from "$/ui/components/ui-parts/UIAuthor"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIDescription } from "$/ui/components/ui-parts/UIDescription"

/**
 * `<ui-comments>` in the static server render (`$/ui/server`):  `<article>` comments in a `ui comments` box, a nested
 * `<ui-comments>` as the thread (`comments`, no `ui`), the `reply` slot in its own box.
 */
describe("ui-comment, static", () => {
  beforeAll(() => {
    StaticRender.define(UIComments, UIComment, UIContent, UIAuthor, UIDescription)
  })

  it("renders comments, a thread of replies and a reply box", () => {
    const html = StaticRender.fragment(
      `<ui-comments threaded><ui-comment><ui-content><ui-author href="#matt">Matt</ui-author>` +
        `<ui-description>Nice</ui-description></ui-content>` +
        `<ui-comments><ui-comment collapsed><ui-content><ui-author>Jenny</ui-author></ui-content></ui-comment>` +
        `</ui-comments><form slot="reply"><textarea></textarea></form></ui-comment></ui-comments>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="ui threaded comments" part="comments" data-ui="comments">` +
          `<article class="comment in-comments" part="comment" data-ui="comment" data-state="in-comments" ` +
          `data-ui-slotted="">` +
          `<div class="content in-comment" part="content" data-ui="content" data-state="in-comment" ` +
          `data-ui-slotted="">` +
          `<a class="author in-comment" part="author" href="#matt" data-ui="author" data-state="in-comment" ` +
          `data-ui-slotted="">Matt</a>` +
          `<div class="description in-comment" part="description" data-ui="description" data-state="in-comment" ` +
          `data-ui-slotted="">Nice</div></div>` +
          `<div class="comments in-comment" part="comments" data-ui="comments" data-state="in-comment" ` +
          `data-ui-slotted="">` +
          `<article class="collapsed comment in-comments" part="comment" data-ui="comment" ` +
          `data-state="in-comments collapsed" data-ui-slotted="">` +
          `<div class="content in-comment" part="content" data-ui="content" data-state="in-comment" ` +
          `data-ui-slotted="">` +
          `<span class="author in-comment" part="author" data-ui="author" data-state="in-comment" ` +
          `data-ui-slotted="">Jenny</span></div></article></div>` +
          `<div class="reply" part="reply"><form data-ui-slotted=""><textarea></textarea></form></div>` +
          `</article></div>`
      )
    )
  })

  it("marks a disabled comment aria-disabled", () => {
    const html = StaticRender.fragment(`<ui-comments><ui-comment disabled>Gone</ui-comment></ui-comments>`)
    expect(html).toMatch(/<article [^>]*aria-disabled="true"/)
    expect(html).toMatch(/<article [^>]*class="disabled comment in-comments"/)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
