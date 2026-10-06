import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"
import type { JSX } from "@solidjs/web"

import { UI, type SourceSaver } from "$/ui/runtime"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import * as UIT from "$/ui/components/components.types"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { SourceElement, type SourceHost, type UIElementClass, UIElement } from "$/ui/elements"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

/** Test-only source element:  shows its text in a `<pre part="text">`. */
class XSource extends SourceElement<typeof X_SOURCE> {
  protected renderContent(): JSX.Element {
    return <pre part="text">{this.contentText()}</pre>
  }
}

/** Vocabulary of `<ui-test-source>`:  the shared source pieces and one part. */
const X_SOURCE = {
  tag: "ui-test-source",
  noun: "source",
  attributes: [...UIT.SourceAttributes],
  events: [...UIT.SourceEvents],
  slots: [],
  parts: [...UIT.SourceParts, { name: "text", description: "The text." }],
  states: [...UIT.SourceStates],
  texts: [...UIT.SourceTexts]
} as const satisfies ComponentVocabulary

/** Fixture files the test server serves. */
const HELLO = "/test/fixtures/sources/hello.txt"
const OTHER = "/test/fixtures/sources/other.txt"

/**
 * How long a `load="visible"` element gets to NOT fetch while off screen:  a REAL wait, on purpose.
 * - It watches with an `IntersectionObserver`, which fake timers don't drive, and "no fetch yet" can't be polled for.
 */
const OFF_SCREEN_WAIT_MS = 100

beforeAll(async () => {
  Object.defineProperty(XSource.prototype, "vocabulary", { value: X_SOURCE })
  ;(XSource as unknown as UIElementClass & typeof UIElement).define("ui-test-source")
  await UI.load()
})

afterEach(() => {
  UI.sources.saver = undefined
  UI.sources.forget()
})

/** The shown text. */
function shown(host: Element): string {
  return host.shadowRoot!.querySelector("[part~=text]")!.textContent ?? ""
}

/** Render `html`, wait for its content to load. */
async function renderLoaded(html: string): Promise<SourceHost> {
  const host = await ElementFixture.render<SourceHost>(html)
  await host.loaded.catch(() => undefined)
  await ElementFixture.tick()
  return host
}

////////////////
// ## Text
////////////////

describe("SourceElement.dedent()", () => {
  it("drops the common indent and blank first / last lines", () => {
    expect(SourceElement.dedent("\n    a\n      b\n\n    c\n  ")).toBe("a\n  b\n\nc")
  })

  it("leaves unindented text alone", () => {
    expect(SourceElement.dedent("a\n  b")).toBe("a\n  b")
  })
})

describe("<ui-test-source> inline content", () => {
  it("shows the host's text, dedented", async () => {
    const host = await renderLoaded(`<ui-test-source>
        first
          second
      </ui-test-source>`)
    expect(shown(host)).toBe("first\n  second")
    expect(await host.loaded).toBe("first\n  second")
  })

  it("prefers a <script type=text/...> child's exact text", async () => {
    const host = await renderLoaded(
      `<ui-test-source>ignored<script type="text/plain">a < b && <c></script></ui-test-source>`
    )
    expect(shown(host)).toBe("a < b && <c>")
  })

  it("takes a <template> child's markup", async () => {
    const host = await renderLoaded(`<ui-test-source><template><b>bold</b></template></ui-test-source>`)
    expect(shown(host)).toBe("<b>bold</b>")
  })

  it("follows changes to the host's content", async () => {
    const host = await renderLoaded(`<ui-test-source>one</ui-test-source>`)
    host.textContent = "two"
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(shown(host)).toBe("two")
  })
})

////////////////
// ## Loading
////////////////

describe("<ui-test-source source>", () => {
  it("loads the file:  `ui-load`, `loaded`, the text shown", async () => {
    const onLoad = vi.fn()
    document.addEventListener("ui-load", onLoad)
    const host = await renderLoaded(`<ui-test-source source="${HELLO}">inline</ui-test-source>`)
    document.removeEventListener("ui-load", onLoad)
    expect(shown(host)).toBe("Hello, source!\n")
    expect(await host.loaded).toBe("Hello, source!\n")
    expect(onLoad.mock.calls.at(-1)![0].detail).toEqual({ source: HELLO, content: "Hello, source!\n" })
  })

  it("loads the new file when `source` changes", async () => {
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    host.setAttribute("source", OTHER)
    await ElementFixture.tick()
    await host.loaded
    await ElementFixture.tick()
    expect(shown(host)).toBe("Another file.\n")
  })

  it("shows an error for another origin, without fetching", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const host = await renderLoaded(`<ui-test-source source="https://example.com/x.txt"></ui-test-source>`)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
    expect(host.matches(":state(error)")).toBe(true)
    const message = host.shadowRoot!.querySelector("ui-message[part~=error]")!
    expect(message.getAttribute("state")).toBe("error")
    expect(message.textContent).toMatch(/only files from this site/)
    await expect(host.loaded).rejects.toMatchObject({ kind: "cross-origin" })
  })

  it("shows an error for a missing file;  a cancelled `ui-error` shows none", async () => {
    const host = await renderLoaded(`<ui-test-source source="/test/fixtures/sources/missing.txt"></ui-test-source>`)
    expect(host.shadowRoot!.querySelector("[part~=error]")!.textContent).toMatch(/Couldn't load/)
    const cancel = (event: Event) => event.preventDefault()
    document.addEventListener("ui-error", cancel)
    const quiet = await renderLoaded(
      `<ui-test-source source="/test/fixtures/sources/missing-too.txt"></ui-test-source>`
    )
    document.removeEventListener("ui-error", cancel)
    expect(quiet.matches(":state(error)")).toBe(true)
    expect(quiet.shadowRoot!.querySelector("[part~=error]")).toBeNull()
  })

  it('`load="idle"` still loads, a little later', async () => {
    const host = await renderLoaded(`<ui-test-source source="${HELLO}" load="idle"></ui-test-source>`)
    expect(await host.loaded).toBe("Hello, source!\n")
  })

  it('`load="visible"` waits until scrolled into view', async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const host = await ElementFixture.render<SourceHost>(
      `<div><div style="height: 300vh"></div><ui-test-source style="display: block" source="${OTHER}" load="visible"></ui-test-source></div>`
    ).then((wrapper) => wrapper.querySelector<SourceHost>("ui-test-source")!)
    await new Promise((resolve) => setTimeout(resolve, OFF_SCREEN_WAIT_MS))
    expect(fetchSpy).not.toHaveBeenCalled()
    host.scrollIntoView()
    expect(await host.loaded).toBe("Another file.\n")
    fetchSpy.mockRestore()
  })
})

////////////////
// ## Editing and saving
////////////////

describe("<ui-test-source> content / save() / reload()", () => {
  it("`content` shows other text, `dirty` until saved, with `ui-change`", async () => {
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    const onChange = vi.fn()
    host.addEventListener("ui-change", onChange)
    host.content = "edited"
    expect(host.content).toBe("edited")
    expect(host.dirty).toBe(true)
    await ElementFixture.tick()
    expect(shown(host)).toBe("edited")
    expect(host.matches(":state(dirty)")).toBe(true)
    expect(onChange.mock.calls[0][0].detail).toEqual({ content: "edited" })
  })

  it("keeps a `content` set before the first render", async () => {
    const host = document.createElement("ui-test-source") as SourceHost
    host.content = "early"
    document.body.append(host)
    await host.ready
    await ElementFixture.tick()
    expect(shown(host)).toBe("early")
    host.remove()
  })

  it("saves through the page's saver:  `ui-saved`, the new `etag`, not `dirty`", async () => {
    const saver = vi.fn<SourceSaver>(async () => ({ etag: '"v2"' }))
    UI.sources.saver = saver
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    const onSaved = vi.fn()
    host.addEventListener("ui-saved", onSaved)
    expect(await host.save("saved text")).toBe(true)
    expect(saver.mock.calls[0][0]).toMatchObject({ url: new URL(HELLO, location.href).href, text: "saved text" })
    expect(host.etag).toBe('"v2"')
    expect(host.dirty).toBe(false)
    expect(onSaved.mock.calls[0][0].detail).toEqual({ source: HELLO, etag: '"v2"' })
  })

  it("a cancelled `ui-save` leaves the saving to the listener", async () => {
    const saver = vi.fn<SourceSaver>(async () => ({}))
    UI.sources.saver = saver
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    host.addEventListener("ui-save", (event) => event.preventDefault())
    expect(await host.save("mine")).toBe(false)
    expect(saver).not.toHaveBeenCalled()
  })

  it("no saver:  `ui-error` with `no-saver`, the content kept, no message", async () => {
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    const onError = vi.fn()
    host.addEventListener("ui-error", onError)
    expect(await host.save("unsaved")).toBe(false)
    expect(onError.mock.calls[0][0].detail.kind).toBe("no-saver")
    await ElementFixture.tick()
    expect(shown(host)).toBe("unsaved")
    expect(host.shadowRoot!.querySelector("[part~=error]")).toBeNull()
  })

  it("inline content saves to nowhere:  `ui-saved`, `true`", async () => {
    const host = await renderLoaded(`<ui-test-source>inline</ui-test-source>`)
    expect(await host.save("changed")).toBe(true)
    expect(host.dirty).toBe(false)
  })

  it("`reload()` drops edits and fetches again", async () => {
    const host = await renderLoaded(`<ui-test-source source="${HELLO}"></ui-test-source>`)
    host.content = "edited"
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    expect(await host.reload()).toBe("Hello, source!\n")
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    fetchSpy.mockRestore()
    await ElementFixture.tick()
    expect(shown(host)).toBe("Hello, source!\n")
    expect(host.dirty).toBe(false)
  })
})
