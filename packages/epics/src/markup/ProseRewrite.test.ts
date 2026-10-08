import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { ProseRewrite } from "$/epics/markup"

/** `html` in a `<div>` of a fresh linkedom document. */
function boxOf(html: string): Element {
  const { document } = parseHTML("<!doctype html><html><body><div></div></body></html>")
  const box = document.querySelector("div")!
  box.innerHTML = html
  return box
}

/** `html` with every old shape rewritten:  `[count, html]`, white space between tags squeezed. */
function rewritten(html: string): [number, string] {
  const box = boxOf(html)
  const count = ProseRewrite.rewrite(box)
  return [count, box.innerHTML.replace(/>\s+</g, "><").trim()]
}

describe("ProseRewrite.rewrite():  Net effect", () => {
  test("the label over its list, its option and `recommended` read wherever the label puts them", () => {
    expect(rewritten("<p><b>Net effect:</b></p><ul><li>one</li></ul>")).toEqual([
      1,
      "<epic-net-effect><ul><li>one</li></ul></epic-net-effect>"
    ])
    expect(rewritten("<p><b>Net effect (A, recommended):</b></p>\n<ol><li>one</li></ol>")).toEqual([
      1,
      '<epic-net-effect option="A" recommended=""><ol><li>one</li></ol></epic-net-effect>'
    ])
    expect(rewritten("<p><b>Net effect</b> (C):</p><ul><li>c</li></ul>")[1]).toBe(
      '<epic-net-effect option="C"><ul><li>c</li></ul></epic-net-effect>'
    )
    expect(rewritten("<p><b>Net effect</b></p><ul><li>bare</li></ul>")[1]).toBe(
      "<epic-net-effect><ul><li>bare</li></ul></epic-net-effect>"
    )
  })

  test("a sentence after the label:  that sentence, markup kept, the label dropped", () => {
    expect(rewritten("<p><b>Net effect</b> (A): no <code>x</code> change.</p>")[1]).toBe(
      '<epic-net-effect option="A"><p>no <code>x</code> change.</p></epic-net-effect>'
    )
  })

  test("worded otherwise, or with nothing to hold:  left as prose", () => {
    for (const html of [
      "<p><b>Net effect (once fixed):</b></p><ul><li>x</li></ul>",
      "<p><b>Net effect</b> (to decide)</p><ul><li>x</li></ul>",
      "<p><b>Net effect:</b></p><p>not a list</p>",
      "<p>So the <b>Net effect</b> is small.</p>",
      "<p><b>Net effect: none</b></p>"
    ])
      expect(rewritten(html)).toEqual([0, html])
  })
})

describe("ProseRewrite.rewrite():  code, asides, notes", () => {
  test("a code accordion:  title, language, open, the code as a <pre>'s text", () => {
    const html =
      '<ui-accordion class="spell-code" styled open="0"><ui-title>design.ts · 2 lines</ui-title>' +
      '<ui-content><pre><code class="language-ts">const a = 1 &lt; 2\nconst b = 3</code></pre></ui-content></ui-accordion>'
    expect(rewritten(html)).toEqual([
      1,
      '<epic-code title="design.ts · 2 lines" language="ts" open><pre>const a = 1 &lt; 2\nconst b = 3</pre></epic-code>'
    ])
  })

  test("a `<ui-code language>` around a script:  its text, dedented", () => {
    const html =
      '<ui-accordion class="spell-code" styled><ui-title>Card.spell</ui-title><ui-content>' +
      '<ui-code language="spell"><script type="text/plain">\n        a card is a thing\n          with a rank\n      </script></ui-code>' +
      "</ui-content></ui-accordion>"
    expect(rewritten(html)[1]).toBe(
      '<epic-code title="Card.spell" language="spell"><pre>a card is a thing\n  with a rank</pre></epic-code>'
    )
  })

  test("a code accordion holding two blocks, or no code:  left as it is", () => {
    const two =
      '<ui-accordion class="spell-code"><ui-title>t</ui-title><ui-content><pre>a</pre><pre>b</pre></ui-content></ui-accordion>'
    const list =
      '<ui-accordion class="spell-code"><ui-title>t</ui-title><ui-content><ul><li>a</li></ul></ui-content></ui-accordion>'
    expect(rewritten(two)[0]).toBe(0)
    expect(rewritten(list)[0]).toBe(0)
  })

  test("an aside:  `Aside:` off its title, its content in;  a title that isn't one's:  left", () => {
    expect(
      rewritten(
        '<ui-accordion class="spell-aside" styled><ui-title>Aside: why not now</ui-title><ui-content><p>later</p></ui-content></ui-accordion>'
      )[1]
    ).toBe('<epic-aside title="why not now"><p>later</p></epic-aside>')
    const kept =
      '<ui-accordion class="spell-aside" styled><ui-title>As first written</ui-title><ui-content><p>x</p></ui-content></ui-accordion>'
    expect(rewritten(kept)[0]).toBe(0)
  })

  test("an UPDATE / DONE message:  its state and title;  another word:  left", () => {
    expect(
      rewritten(
        '<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE"><p>changed</p></ui-message>'
      )[1]
    ).toBe('<epic-note state="update"><p>changed</p></epic-note>')
    expect(
      rewritten(
        '<ui-message class="plan-update" state="success" header="DONE · option A, 2026-10-06"><p>done</p></ui-message>'
      )[1]
    ).toBe('<epic-note state="done" title="option A, 2026-10-06"><p>done</p></epic-note>')
    expect(rewritten('<ui-message class="plan-update" header="DEFERRED"><p>x</p></ui-message>')[0]).toBe(0)
    // a phase's bare UPDATE:  that phase's marker, gone when it's done
    expect(
      rewritten('<ui-message class="plan-update" header="UPDATE" data-phase="7"><p>what changed</p></ui-message>')[1]
    ).toBe('<epic-update phase="7"><p>what changed</p></epic-update>')
  })

  test("nested shapes all turn;  never inside code or an Original Discussion", () => {
    const [count, html] = rewritten(
      '<ui-accordion class="spell-aside"><ui-title>Aside: two</ui-title><ui-content>' +
        "<p><b>Net effect:</b></p><ul><li>x</li></ul>" +
        '<ui-accordion class="spell-code"><ui-title>a.ts</ui-title><ui-content><pre>a</pre></ui-content></ui-accordion>' +
        "</ui-content></ui-accordion>" +
        "<epic-original><epic-version><p><b>Net effect:</b></p><ul><li>old</li></ul></epic-version></epic-original>"
    )
    expect(count).toBe(3)
    expect(html).toBe(
      '<epic-aside title="two"><epic-net-effect><ul><li>x</li></ul></epic-net-effect>' +
        '<epic-code title="a.ts"><pre>a</pre></epic-code></epic-aside>' +
        "<epic-original><epic-version><p><b>Net effect:</b></p><ul><li>old</li></ul></epic-version></epic-original>"
    )
  })
})
