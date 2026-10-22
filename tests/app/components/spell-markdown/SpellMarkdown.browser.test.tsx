import { beforeAll, describe, expect, test } from "vite-plus/test"

import { UI } from "spell-ui/core"
import { ElementFixture } from "spell-kit/test-helpers/ElementFixture"
import type { DOMMarkdownElement } from "spell-ui/components/ui-markdown"

import "spell-app/app/components/spell-markdown"

/**
 * `<spell-markdown>`:  `<ui-markdown>` drawn by spell's own engine (`MDEngine`), in `ui-*` elements, plain and
 * `editable`;  its spell blocks coloured by `<spell-code>`'s language, which its barrel loads.
 */

beforeAll(async () => {
  await UI.load()
})

/** Markdown as an element, exact (`<script type="text/markdown">`). */
function md(text: string, attributes = ""): string {
  return `<spell-markdown ${attributes}><script type="text/markdown">${text}</script></spell-markdown>`
}

/** Render one `<spell-markdown>`, and wait for its render (or failure). */
async function markdown(html: string): Promise<DOMMarkdownElement> {
  const rendered = nextRender(document)
  const host = await ElementFixture.render<DOMMarkdownElement>(html)
  await rendered
  await ElementFixture.settle(host)
  return host
}

/** Resolves on the next `ui-render` or `ui-error` reaching `target`. */
function nextRender(target: EventTarget): Promise<void> {
  return new Promise<void>((resolve) => {
    target.addEventListener("ui-render", done)
    target.addEventListener("ui-error", done)

    /** Stop listening, and resolve. */
    function done() {
      target.removeEventListener("ui-render", done)
      target.removeEventListener("ui-error", done)
      resolve()
    }
  })
}

/** The article. */
function body(host: DOMMarkdownElement): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=body]")!
}

/** A table, a task list and an alert:  what spell's engine draws as `ui-*` elements. */
const RICH = "# Title\n\n- [x] done\n- [ ] todo\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n> [!TIP]\n> A tip."

describe("<spell-markdown>", () => {
  test("draws with spell's engine:  ui-* elements, heading ids, labelled task boxes, a table, an alert", async () => {
    const host = await markdown(md(RICH))
    expect(host.localName).toBe("spell-markdown")
    expect(body(host).querySelector("ui-header")!.id).toBe("title")
    expect(host.headings).toEqual([{ level: 1, text: "Title", id: "title" }])
    const boxes = body(host).querySelectorAll("ui-checkbox")
    expect([...boxes].map((box) => box.getAttribute("aria-label"))).toEqual(["done", "todo"])
    expect(body(host).querySelectorAll("ui-table td").length).toBe(2)
    expect(body(host).querySelector("ui-message")!.textContent).toContain("A tip.")
    // its tables' sheet, adopted into its shadow root
    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0)
  })

  test("`editable` previews with spell's engine too", async () => {
    const host = await ElementFixture.render<DOMMarkdownElement>(md("# Title\n\n| a |\n| - |\n| 1 |", "editable"))
    await ElementFixture.settle(host)
    const rendered = nextRender(host)
    host.shadowRoot!.querySelectorAll<HTMLButtonElement>("[part~=tab]")[1]!.click()
    await rendered
    await ElementFixture.settle(host)
    expect(body(host).querySelector("ui-header")!.id).toBe("title")
    expect(body(host).querySelector("ui-table")).not.toBeNull()
  })

  test("`sanitized` keeps spell's engine's ui-* elements, without their handlers", async () => {
    const host = await markdown(
      md('<b onclick="window.__md = 3">bold</b>\n\n<ui-label onclick="window.__md = 4">kept</ui-label>', "sanitized")
    )
    expect(body(host).querySelector("b")!.hasAttribute("onclick")).toBe(false)
    expect(body(host).querySelector("ui-label")!.hasAttribute("onclick")).toBe(false)
    expect(body(host).querySelector("ui-label")!.textContent).toBe("kept")
  })

  test("colours its spell blocks:  `<spell-code>`'s language, which its barrel registers", async () => {
    const host = await markdown(md("```spell\na pile is a list of cards\n```"))
    const block = body(host).querySelector("ui-code")!
    expect(block.getAttribute("language")).toBe("spell")
    await customElements.whenDefined("ui-code")
    await new Promise<void>((resolve) => {
      if (block.shadowRoot?.querySelector(".hljs-type")) return resolve()
      block.addEventListener("ui-highlight", () => resolve(), { once: true })
    })
    expect(block.shadowRoot!.querySelector(".hljs-type")!.textContent).toBe("pile")
  })
})
