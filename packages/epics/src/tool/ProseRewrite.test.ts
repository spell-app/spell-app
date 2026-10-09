/**
 * Tests of `ProseRewrite` as the tool's way in uses it (`plain()`, history left alone):  each old prose shape made
 * its element, by `ProseShapes`' rules.  As the converter's second pass:  `$/epics/convert` `Upgrader.test.ts`.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { ProseRewrite } from "./ProseRewrite"

/** `html` with every old shape rewritten, white space between tags squeezed. */
function rewritten(html: string): string {
  const { document } = parseHTML("<!doctype html><html><body><div></div></body></html>")
  const box = document.querySelector("div")!
  box.innerHTML = html
  ProseRewrite.plain(document as unknown as Document).rewrite(box as unknown as Element, { history: false })
  return box.innerHTML.replace(/>\s+</g, "><").trim()
}

describe("ProseRewrite.rewrite():  Net effect", () => {
  test("the label over its list, its option and `recommended` read wherever the label puts them", () => {
    expect(rewritten("<p><b>Net effect:</b></p><ul><li>one</li></ul>")).toBe(
      "<epic-net-effect><ul><li>one</li></ul></epic-net-effect>"
    )
    expect(rewritten("<p><b>Net effect (A, recommended):</b></p>\n<ol><li>one</li></ol>")).toBe(
      '<epic-net-effect option="A" recommended=""><ol><li>one</li></ol></epic-net-effect>'
    )
    expect(rewritten("<p><b>Net effect</b> (C):</p><ul><li>c</li></ul>")).toBe(
      '<epic-net-effect option="C"><ul><li>c</li></ul></epic-net-effect>'
    )
    expect(rewritten("<p><b>Net effect</b></p><ul><li>bare</li></ul>")).toBe(
      "<epic-net-effect><ul><li>bare</li></ul></epic-net-effect>"
    )
  })

  test("a sentence after a bare `Net effect:` label:  that sentence, markup kept, the label dropped", () => {
    expect(rewritten("<p><b>Net effect:</b> no <code>x</code> change.</p>")).toBe(
      "<epic-net-effect><p>no <code>x</code> change.</p></epic-net-effect>"
    )
  })

  test("worded otherwise, or with nothing to hold:  left as prose", () => {
    for (const html of [
      "<p><b>Net effect (once fixed):</b></p><ul><li>x</li></ul>",
      "<p><b>Net effect</b> (to decide)</p><ul><li>x</li></ul>",
      "<p><b>Net effect:</b></p><p>not a list</p>",
      "<p>So the <b>Net effect</b> is small.</p>",
      "<p><b>Net effect: none</b></p>",
      // a sentence after an option's label:  the proof's rules read only a bare label's (T23)
      "<p><b>Net effect</b> (A): no change.</p>"
    ])
      expect(rewritten(html)).toBe(html)
  })
})

describe("ProseRewrite.rewrite():  code, asides, notes", () => {
  test("a code accordion:  title, language, open, the code as a <pre>'s text", () => {
    const html =
      '<ui-accordion class="spell-code" styled open="0"><ui-title>design.ts · 2 lines</ui-title>' +
      '<ui-content><pre><code class="language-ts">const a = 1 &lt; 2\nconst b = 3</code></pre></ui-content></ui-accordion>'
    expect(rewritten(html)).toBe(
      '<epic-code title="design.ts · 2 lines" language="ts" open><pre>const a = 1 &lt; 2\nconst b = 3</pre></epic-code>'
    )
  })

  test("a code accordion holding two blocks, no code, or a `<ui-code>` (the proof can't see its script):  left", () => {
    for (const html of [
      '<ui-accordion class="spell-code"><ui-title>t</ui-title><ui-content><pre>a</pre><pre>b</pre></ui-content></ui-accordion>',
      '<ui-accordion class="spell-code"><ui-title>t</ui-title><ui-content><ul><li>a</li></ul></ui-content></ui-accordion>',
      '<ui-accordion class="spell-code"><ui-title>Card.spell</ui-title><ui-content><ui-code language="spell">' +
        '<script type="text/plain">a card is a thing</script></ui-code></ui-content></ui-accordion>'
    ])
      expect(rewritten(html)).toBe(html)
  })

  test("an aside:  `Aside:` off its title, its content in;  any other title kept as it is", () => {
    expect(
      rewritten(
        '<ui-accordion class="spell-aside" styled><ui-title>Aside: why not now</ui-title><ui-content><p>later</p></ui-content></ui-accordion>'
      )
    ).toBe('<epic-aside title="why not now"><p>later</p></epic-aside>')
    expect(
      rewritten(
        '<ui-accordion class="spell-aside" styled><ui-title>As first written</ui-title><ui-content><p>x</p></ui-content></ui-accordion>'
      )
    ).toBe('<epic-aside title="As first written"><p>x</p></epic-aside>')
  })

  test("an UPDATE / DONE message:  its state and title;  another word:  left", () => {
    expect(
      rewritten(
        '<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE"><p>changed</p></ui-message>'
      )
    ).toBe('<epic-note state="update"><p>changed</p></epic-note>')
    expect(
      rewritten(
        '<ui-message class="plan-update" state="success" header="DONE · option A, 2026-10-06"><p>done</p></ui-message>'
      )
    ).toBe('<epic-note state="done" title="option A, 2026-10-06"><p>done</p></epic-note>')
    const deferred = '<ui-message class="plan-update" header="DEFERRED"><p>x</p></ui-message>'
    expect(rewritten(deferred)).toBe(deferred)
    // a phase's bare UPDATE:  that phase's marker, gone when it's done
    expect(
      rewritten('<ui-message class="plan-update" header="UPDATE" data-phase="7"><p>what changed</p></ui-message>')
    ).toBe('<epic-update phase="7"><p>what changed</p></epic-update>')
  })

  test("an option grid:  its lettered cards as <epic-option>s, the chosen one on <epic-choices>", () => {
    expect(
      rewritten(
        '<ui-grid class="spell-pros-cons"><ui-column><ui-segment><ui-label attached>A · Keep it (recommended)</ui-label>' +
          "<p>a</p></ui-segment></ui-column><ui-column data-chosen><ui-segment><ui-label attached>B · Drop it</ui-label>" +
          "<p>b</p></ui-segment></ui-column></ui-grid>"
      )
    ).toBe(
      '<epic-choices chosen="B"><epic-option letter="A" title="Keep it" recommended=""><p>a</p></epic-option>' +
        '<epic-option letter="B" title="Drop it"><p>b</p></epic-option></epic-choices>'
    )
  })

  test("nested shapes all turn;  never inside code or an Original Discussion", () => {
    expect(
      rewritten(
        '<ui-accordion class="spell-aside"><ui-title>Aside: two</ui-title><ui-content>' +
          "<p><b>Net effect:</b></p><ul><li>x</li></ul>" +
          '<ui-accordion class="spell-code"><ui-title>a.ts</ui-title><ui-content><pre>a</pre></ui-content></ui-accordion>' +
          "</ui-content></ui-accordion>" +
          "<epic-original><epic-version><p><b>Net effect:</b></p><ul><li>old</li></ul></epic-version></epic-original>"
      )
    ).toBe(
      '<epic-aside title="two"><epic-net-effect><ul><li>x</li></ul></epic-net-effect>' +
        '<epic-code title="a.ts"><pre>a</pre></epic-code></epic-aside>' +
        "<epic-original><epic-version><p><b>Net effect:</b></p><ul><li>old</li></ul></epic-version></epic-original>"
    )
  })
})
