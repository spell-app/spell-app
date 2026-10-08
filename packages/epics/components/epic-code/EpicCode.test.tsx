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
