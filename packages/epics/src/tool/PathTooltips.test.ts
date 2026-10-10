/**
 * Tests of `PathTooltips`:  a name and its file's path, handed to the tool as HTML, made the name with its path as
 * its tooltip (epic `airplane`, Owen's "plain text, plain paths");  and what it leaves alone.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { IncomingHtml } from "./IncomingHtml"
import { PathTooltips } from "./PathTooltips"

/** `html` rewritten, with what `rewrite()` said it did. */
function rewritten(html: string): { html: string; done: string[] } {
  const { document } = parseHTML("<!doctype html><html><body><div></div></body></html>")
  const box = document.querySelector("div")!
  box.innerHTML = html
  const done = PathTooltips.rewrite(box as unknown as Element)
  return { html: box.innerHTML, done }
}

describe("PathTooltips.rewrite():  what it rewrites", () => {
  test("Owen's example:  a name, a comma, its file's path and line", () => {
    expect(
      rewritten("<p>Built: <code>buildTsx()</code>, <code>packages/spell/src/node/buildTsx.ts:40</code></p>")
    ).toEqual({
      html: '<p>Built: <code title="packages/spell/src/node/buildTsx.ts:40">buildTsx()</code></p>',
      done: ["buildTsx() <- packages/spell/src/node/buildTsx.ts:40"]
    })
  })

  test("a path alone in brackets after a name, whoever's file it is", () => {
    expect(
      rewritten("<p>Marks go through <code>setMark()</code> (<code>packages/epics/src/tool/ReviewInbox.ts</code>).</p>")
        .html
    ).toBe('<p>Marks go through <code title="packages/epics/src/tool/ReviewInbox.ts">setMark()</code>.</p>')
  })

  test("a bare path, after a comma or in brackets", () => {
    expect(rewritten("<p><code>buildTsx()</code>, packages/spell/src/node/buildTsx.ts, then more.</p>").html).toBe(
      '<p><code title="packages/spell/src/node/buildTsx.ts">buildTsx()</code>, then more.</p>'
    )
    expect(rewritten("<p><code>setMark()</code> (tool/ReviewInbox.ts:12) writes it.</p>").html).toBe(
      '<p><code title="tool/ReviewInbox.ts:12">setMark()</code> writes it.</p>'
    )
  })

  test("a linked path:  the link moves onto the name", () => {
    const html =
      '<p><code>EpicItem</code> (<a href="../../packages/epics/components/epic-item/EpicItem.tsx" target="src-x">' +
      "<code>packages/epics/components/epic-item/EpicItem.tsx</code></a>) draws it.</p>"
    expect(rewritten(html).html).toBe(
      '<p><a href="../../packages/epics/components/epic-item/EpicItem.tsx" target="src-x">' +
        '<code title="packages/epics/components/epic-item/EpicItem.tsx">EpicItem</code></a> draws it.</p>'
    )
  })

  test("the comma form's name may be the file's, its folder's, or a tag's", () => {
    for (const [name, path] of [
      ["&lt;epic-item&gt;", "components/epic-item/EpicItem.tsx"],
      ["EpicItem", "components/epic-item/index.ts"],
      ["ReviewInbox.setMark()", "tool/ReviewInbox.ts"]
    ])
      expect(rewritten(`<p><code>${name}</code>, <code>${path}</code></p>`).done).toHaveLength(1)
  })
})

describe("PathTooltips.rewrite():  what it leaves", () => {
  test.each([
    ["a comma form whose name isn't the file's", "<p><code>setMark()</code>, <code>tool/ReviewInbox.ts</code></p>"],
    ["a list before", "<p><code>a.ts</code>, <code>Fuss</code>, <code>tools/fuss.ts</code></p>"],
    ["a list after", "<p><code>Fuss</code>, <code>tools/fuss.ts</code>, <code>tools/x.ts</code></p>"],
    ["a folder", "<p><code>Fuss</code> (<code>packages/docs/tools/</code>)</p>"],
    ["a file alone", "<p><code>Fuss</code> (<code>fuss.ts</code>)</p>"],
    ["more in the brackets", "<p><code>Fuss</code> (<code>tools/fuss.ts</code>:  the checker)</p>"],
    ["other wording", "<p><code>Fuss</code> in <code>tools/fuss.ts</code></p>"],
    ["a name that's a path", "<p><code>tools/a.ts</code>, <code>tools/a.ts</code></p>"],
    ["a name with a title", '<p><code title="x">Fuss</code> (<code>tools/fuss.ts</code>)</p>'],
    ["a name in a link", '<p><a href="#x"><code>Fuss</code></a> (<code>tools/fuss.ts</code>)</p>'],
    ["code", "<pre><code>Fuss</code> (<code>tools/fuss.ts</code>)</pre>"],
    ["history", "<epic-original><p><code>Fuss</code> (<code>tools/fuss.ts</code>)</p></epic-original>"]
  ])("%s", (_, html) => {
    expect(rewritten(html)).toEqual({ html, done: [] })
  })
})

describe("IncomingHtml.nodes()", () => {
  test("rewrites names and paths on the tool's way in", () => {
    const { document } = parseHTML("<!doctype html><html><body></body></html>")
    const nodes = IncomingHtml.nodes(
      document as unknown as Document,
      "<p>Built: <code>buildTsx()</code>, <code>packages/spell/src/node/buildTsx.ts</code></p>"
    )
    expect((nodes[0] as Element).outerHTML).toBe(
      '<p>Built: <code title="packages/spell/src/node/buildTsx.ts">buildTsx()</code></p>'
    )
  })
})
