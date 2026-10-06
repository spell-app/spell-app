import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"

import type { UICodeHost } from "./UICodeHost"

import "$/ui/components/ui-code"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-code/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

beforeAll(async () => {
  await UI.load()
})

afterEach(() => {
  UI.sources.forget()
})

/** Render `html`, wait until each of its `count` `<ui-code>`s is coloured (or failed to be);  returns the first. */
async function code(html: string, count = 1): Promise<UICodeHost> {
  const finished = highlights(document, count)
  const host = await ElementFixture.render<UICodeHost>(html)
  await finished
  await ElementFixture.tick()
  return host
}

/** Wait for `host`'s next `ui-highlight` or `ui-error`, then flush. */
async function settled(host: UICodeHost) {
  await highlights(host)
  await ElementFixture.tick()
}

/**
 * Resolves once `count` `ui-highlight` / `ui-error` events have reached `target`.
 * - Listen BEFORE the change that colours:  an event that already went by never comes back (the test's timeout
 *   catches one that never comes).
 */
function highlights(target: EventTarget, count = 1): Promise<void> {
  let left = count
  return new Promise<void>((resolve) => {
    if (left <= 0) return resolve()
    target.addEventListener("ui-highlight", seen)
    target.addEventListener("ui-error", seen)

    /** One more colouring (or failure);  stops listening after the last. */
    function seen() {
      if (--left > 0) return
      target.removeEventListener("ui-highlight", seen)
      target.removeEventListener("ui-error", seen)
      resolve()
    }
  })
}

/** The `<code>`. */
function codeOf(host: UICodeHost): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=code]")!
}

/** The lines' text. */
function linesOf(host: UICodeHost): string[] {
  return [...codeOf(host).querySelectorAll(".line")].map((line) => line.textContent ?? "")
}

////////////////
// ## Behaviour
////////////////

describe("<ui-code> behaviour", () => {
  it("colours its own text in the asked-for language, a span per line", async () => {
    const host = await code(`<ui-code language="ts"><script type="text/plain">
      const x = "a < b"
      // done
    </script></ui-code>`)
    expect(linesOf(host)).toEqual(['const x = "a < b"', "// done"])
    expect(codeOf(host).querySelector(".hljs-keyword")!.textContent).toBe("const")
    expect(codeOf(host).querySelector(".hljs-string")!.textContent).toBe('"a < b"')
    expect(codeOf(host).classList.contains("language-typescript")).toBe(true)
  })

  it("guesses the language when none is given:  `detectedLanguage`, `ui-highlight`", async () => {
    const onHighlight = vi.fn()
    document.addEventListener("ui-highlight", onHighlight)
    const host = await code(`<ui-code><script type="text/plain">
      {"name": "spell", "version": 2, "private": true}
    </script></ui-code>`)
    document.removeEventListener("ui-highlight", onHighlight)
    expect(host.detectedLanguage).toBe("json")
    expect(onHighlight.mock.calls.at(-1)![0].detail).toEqual({ language: "json", detected: true })
  })

  it("`text` shows plain, escaped text", async () => {
    const host = await code(`<ui-code language="text"><script type="text/plain"><b>not bold</b></script></ui-code>`)
    expect(linesOf(host)).toEqual(["<b>not bold</b>"])
    expect(codeOf(host).querySelector("b, [class^=hljs-]")).toBeNull()
  })

  it("loads a language outside the detect set by name", async () => {
    const host = await code(`<ui-code language="rust">fn main() {}</ui-code>`)
    expect(codeOf(host).querySelector(".hljs-keyword")!.textContent).toBe("fn")
  })

  it("an unknown language stays plain, with a `render` ui-error and no message", async () => {
    const onError = vi.fn()
    document.addEventListener("ui-error", onError)
    const host = await code(`<ui-code language="klingon">Qapla'</ui-code>`)
    document.removeEventListener("ui-error", onError)
    expect(linesOf(host)).toEqual(["Qapla'"])
    expect(onError.mock.calls.at(-1)![0].detail.kind).toBe("render")
    expect(host.shadowRoot!.querySelector("[part~=error]")).toBeNull()
  })

  it("loads a `source` file", async () => {
    const host = await code(`<ui-code source="/test/fixtures/sources/hello.txt" language="text"></ui-code>`)
    expect(linesOf(host)).toEqual(["Hello, source!"])
  })

  it("numbers lines from `start`, as CSS counters", async () => {
    const host = await code(`<ui-code language="text" line-numbers start="7">a\nb</ui-code>`)
    const box = host.shadowRoot!.querySelector("[part~=box]")!
    expect(box.className).toContain("numbered")
    const pre = host.shadowRoot!.querySelector<HTMLElement>("[part~=pre]")!
    expect(pre.style.counterReset).toBe("line 6")
    expect(getComputedStyle(pre).counterReset).toBe("line 6")
    const line = codeOf(host).querySelector(".line")!
    expect(getComputedStyle(line).counterIncrement).toBe("line 1")
    expect(getComputedStyle(line, "::before").content).toBe("counter(line)")
  })

  it("uses a language registered with `UI.code`, even one registered later", async () => {
    const host = await code(`<ui-code language="shout">HELLO quiet</ui-code>`)
    expect(codeOf(host).querySelector("[class^=hljs-]")).toBeNull()
    UI.code.register("shout", {
      highlight: (text) =>
        [...text.matchAll(/[A-Z]+/g)].map((m) => ({ start: m.index!, end: m.index! + m[0].length, kind: "keyword" }))
    })
    await settled(host)
    expect(codeOf(host).querySelector(".hljs-keyword")!.textContent).toBe("HELLO")
  })

  it("colours spell with spell's own parser (the pre-compiled bundle)", async () => {
    const host = await code(`<ui-code language="spell"><script type="text/plain">
      ## Piles
      a pile is a list of cards
      the value of a pile is:
      \treturn 0
    </script></ui-code>`)
    expect(codeOf(host).querySelector(".hljs-section")!.textContent).toBe("## Piles")
    expect(codeOf(host).querySelector(".hljs-type")!.textContent).toBe("pile")
    expect(codeOf(host).querySelector(".hljs-property")!.textContent).toBe("value")
    expect(codeOf(host).classList.contains("language-spell")).toBe(true)
  })

  it("`spell/<lang>` with no such translation stays plain, naming it in the ui-error", async () => {
    const onError = vi.fn()
    document.addEventListener("ui-error", onError)
    const host = await code(`<ui-code language="spell/xx">a pile is a list</ui-code>`)
    document.removeEventListener("ui-error", onError)
    expect(linesOf(host)).toEqual(["a pile is a list"])
    const { detail } = onError.mock.calls.at(-1)![0]
    expect(detail.kind).toBe("render")
    expect(String(detail.error)).toMatch(/"xx" translation/)
  })

  it("copies the code", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const host = await code(`<ui-code language="text" copy>copy me</ui-code>`)
    const onCopy = vi.fn()
    host.addEventListener("ui-copy", onCopy)
    host.shadowRoot!.querySelector<HTMLButtonElement>("[part~=copy]")!.click()
    await vi.waitFor(() => expect(onCopy).toHaveBeenCalled())
    expect(writeText).toHaveBeenCalledWith("copy me")
    await ElementFixture.tick()
    expect(host.matches(":state(copied)")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=copy]")!.textContent).toBe("Copied")
    writeText.mockRestore()
  })

  it("shows new `content` coloured", async () => {
    const host = await code(`<ui-code language="ts">let a = 1</ui-code>`)
    host.content = "return b"
    await settled(host)
    expect(linesOf(host)).toEqual(["return b"])
    expect(codeOf(host).querySelector(".hljs-keyword")!.textContent).toBe("return")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-code> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const html = EXAMPLES[path]!
    const root = await code(html, html.match(/<ui-code\b/g)?.length ?? 0)
    await expectAccessible(root)
  })
})
