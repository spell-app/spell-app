import { beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { UI } from "spell-ui/core"
import { ElementFixture } from "spell-kit/test-helpers/ElementFixture"
import type { DOMCodeElement } from "spell-ui/components/ui-code"
import { SpellLanguage } from "spell-app/app/components/spell-code"

/**
 * `<spell-code>`, and the `spell` language its family registers with the page's `UI.code`:
 * spell coloured by spell's own parser, in `<spell-code>` AND in any `<ui-code language="spell">`.
 * - The colours load lazily, from source (`SpellLanguage`):  the first test pays for spell's parser.
 */

beforeAll(async () => {
  await UI.load()
  // the barrel registers once the runtime is in;  do it now, so no test races it
  SpellLanguage.register()
})

/** A spell snippet with a heading, a type and a property. */
const PILES = `<script type="text/plain">
## Piles
a pile is a list of cards
the value of a pile is:
\treturn 0
</script>`

/** Render `html`, and wait until its first code element is coloured (or failed to be). */
async function code(html: string): Promise<DOMCodeElement> {
  const finished = highlighted(document)
  const host = await ElementFixture.render<DOMCodeElement>(html)
  await finished
  await ElementFixture.tick()
  return host
}

/** Resolves on the next `ui-highlight` or `ui-error` reaching `target`. */
function highlighted(target: EventTarget): Promise<Event> {
  return new Promise((resolve) => {
    target.addEventListener("ui-highlight", done)
    target.addEventListener("ui-error", done)

    /** Stop listening, and resolve. */
    function done(event: Event) {
      target.removeEventListener("ui-highlight", done)
      target.removeEventListener("ui-error", done)
      resolve(event)
    }
  })
}

/** The `<code>`. */
function codeOf(host: DOMCodeElement): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=code]")!
}

describe("<spell-code>", () => {
  test("colours spell by default, with spell's own parser:  a heading, a type, a property", async () => {
    const host = await code(`<spell-code>${PILES}</spell-code>`)
    expect(host.localName).toBe("spell-code")
    expect(codeOf(host).querySelector(".hljs-section")!.textContent).toBe("## Piles")
    expect(codeOf(host).querySelector(".hljs-type")!.textContent).toBe("pile")
    expect(codeOf(host).querySelector(".hljs-property")!.textContent).toBe("value")
    expect(codeOf(host).classList.contains("language-spell")).toBe(true)
  })

  test("is a `<ui-code>` in every way:  another `language`, `copy`, its accessible name", async () => {
    const host = await code(`<spell-code language="json" copy>{"a": 1}</spell-code>`)
    expect(codeOf(host).classList.contains("language-json")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=copy]")).not.toBeNull()
    expect(host.shadowRoot!.querySelector("[part~=pre]")!.getAttribute("aria-label")).toBe("json code")
  })

  test('its family\'s `spell` colours a plain `<ui-code language="spell">` too', async () => {
    const host = await code(`<ui-code language="spell">${PILES}</ui-code>`)
    expect(codeOf(host).querySelector(".hljs-type")!.textContent).toBe("pile")
  })

  test("`spell/es` colours Spanish, with Spanish's parser:  its keywords, its types", async () => {
    const PILAS = `<script type="text/plain">
una pila es una lista de cartas
el valor de una pila es:
\tdevolver 0
</script>`
    const host = await code(`<spell-code language="spell/es">${PILAS}</spell-code>`)
    const keywords = [...codeOf(host).querySelectorAll(".hljs-keyword")].map((it) => it.textContent)
    expect(keywords).toContain("devolver")
    expect(codeOf(host).querySelector(".hljs-type")!.textContent).toBe("pila")
  })

  test("`spell/<lang>` with no such translation stays plain, naming it in the ui-error", async () => {
    const onError = vi.fn()
    document.addEventListener("ui-error", onError)
    const host = await code(`<spell-code language="spell/xx">a pile is a list</spell-code>`)
    document.removeEventListener("ui-error", onError)
    expect(codeOf(host).textContent).toBe("a pile is a list")
    const { detail } = onError.mock.calls.at(-1)![0]
    expect(detail.kind).toBe("render")
    expect(String(detail.error)).toMatch(/"xx" translation/)
  })
})
