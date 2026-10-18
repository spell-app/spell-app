import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

// the page's own Spell UI, which draws the code:  the docs bundle defines it on a real page
import "$/ui/components/ui-code"
import "$/epics/components/epic-code"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)!
}

/** A code block as a doc holds it:  the code in a `<pre>`, `<` escaped. */
const CODE = `<epic-code title="design.ts · 2 lines" language="ts"><pre>
const tag = "&lt;epic-code&gt;"
export default tag</pre></epic-code>`

describe("<epic-code>", () => {
  test("FOLDED, headed by its title;  its <pre>'s text drawn by a highlighted <ui-code>, never slotted;  passes axe", async () => {
    const host = await ElementFixture.render(CODE)
    await ElementFixture.settle()
    const code = part(host, "code")
    expect({
      heading: part(host, "heading").textContent,
      expanded: part(host, "toggle").getAttribute("aria-expanded"),
      hidden: part(host, "body").getAttribute("hidden"),
      language: code.getAttribute("language"),
      code: code.textContent,
      slotted: host.querySelector("pre")!.assignedSlot
    }).toEqual({
      heading: "design.ts · 2 lines",
      expanded: "false",
      hidden: "until-found",
      language: "ts",
      // the newline right after `<pre>` is the parser's, never the code's
      code: 'const tag = "<epic-code>"\nexport default tag',
      slotted: null
    })
    expect(host.matches(":state(open)")).toBe(false)
    await expectAccessible(host)
  })

  test("a click unfolds it and folds it again;  `open` starts it open;  no title reads `Code`", async () => {
    const host = await ElementFixture.render(`<epic-code open><pre>x = 1</pre></epic-code>`)
    expect([part(host, "heading").textContent, host.matches(":state(open)"), part(host, "body").hidden]).toEqual([
      "Code",
      true,
      false
    ])
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "body").getAttribute("hidden")]).toEqual([false, "until-found"])
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect(part(host, "toggle").getAttribute("aria-expanded")).toBe("true")
  })

  test("follows its children:  a live update's new code is drawn", async () => {
    const host = await ElementFixture.render(`<epic-code open><pre>before</pre></epic-code>`)
    host.querySelector("pre")!.textContent = "after"
    await new Promise(requestAnimationFrame)
    await ElementFixture.tick()
    expect(part(host, "code").textContent).toBe("after")
  })

  test("a long line scrolls INSIDE the code in the side bar's ~320px:  the page never widens;  readable in the DARK scheme", async () => {
    const line = `const longest = "${"x".repeat(200)}"`
    const wrap = await ElementFixture.render(
      `<div style="width: 320px; color-scheme: dark; background: #1b1c1d"><epic-code open title="wide.ts"><pre>${line}</pre></epic-code></div>`
    )
    await ElementFixture.settle()
    const host = wrap.querySelector("epic-code")!
    expect(host.getBoundingClientRect().width).toBeLessThanOrEqual(320)
    expect(wrap.scrollWidth).toBeLessThanOrEqual(320)
    await expectAccessible(host)
  })
})

// epic `epic-workflow` P25:  the page's own buttons in the title row, where the docs runtime puts the bullhorn too
describe("<epic-code> actions slot", () => {
  // P25:  the page's own buttons in the heading's row, where the docs runtime puts the bullhorn
  test('`slot="actions"`:  in the heading\'s row, before nothing of its own;  never folds it, never part of the code', async () => {
    const host = await ElementFixture.render(
      `<epic-code title="x.ts"><pre>const x = 1</pre><button slot="actions" aria-label="Run">Run</button></epic-code>`
    )
    const button = host.querySelector<HTMLElement>("button[slot=actions]")!
    expect(button.assignedSlot?.getAttribute("name")).toBe("actions")
    expect(part(host, "toggle").getBoundingClientRect().right).toBeLessThanOrEqual(
      button.getBoundingClientRect().left + 0.5
    )
    button.click()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(false)
    // no `<pre>`:  its text is the code, but never a slotted button's
    const bare = await ElementFixture.render(`<epic-code>const y = 2<button slot="actions">Run</button></epic-code>`)
    expect((bare as unknown as { component: { code: string } }).component.code).toBe("const y = 2")
  })
})

// epic `epic-workflow` P25, J183 (Owen, 2026-10-18:  "ellipsis when collapsed, wrap when expanded")

describe("<epic-code> heading, folded and open", () => {
  test("folded:  ONE line cut with …, its title the tooltip;  open:  it wraps", async () => {
    const wrap = await ElementFixture.render(
      `<div style="width: 320px"><epic-code title="A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"><pre>const x = 1</pre></epic-code></div>`
    )
    const host = wrap.querySelector("epic-code")!
    const heading = part(host, "heading")
    const lineHeight = parseFloat(getComputedStyle(heading).lineHeight)
    expect([heading.getBoundingClientRect().height < lineHeight * 1.5, heading.title]).toEqual([
      true,
      "A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"
    ])
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect([heading.getBoundingClientRect().height > lineHeight * 1.5, heading.hasAttribute("title")]).toEqual([
      true,
      false
    ])
  })
})
