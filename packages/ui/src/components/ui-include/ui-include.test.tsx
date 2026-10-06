import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { UI, type SourceSaver } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"

import { UIInclude } from "./UIInclude"
import type { UIIncludeHost } from "./UIIncludeHost"

import "$/ui/components/ui-include"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-include/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Fixture files the test server serves. */
const DIR = "/test/fixtures/sources"

beforeAll(async () => {
  await UI.load()
})

afterEach(() => {
  UI.sources.saver = undefined
  UI.sources.forget()
  delete (window as { __includedScriptRan?: boolean }).__includedScriptRan
})

/** Render one include, wait for it to load. */
async function include(html: string): Promise<UIIncludeHost> {
  const host = await ElementFixture.render<UIIncludeHost>(html)
  await host.loaded.catch(() => undefined)
  await ElementFixture.tick()
  await ElementFixture.tick()
  return host
}

/** The shadow box's markup. */
function box(host: UIIncludeHost): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=content]")!
}

////////////////
// ## Loading
////////////////

describe("<ui-include> loading", () => {
  it("shows a fragment in its shadow root, and its placeholder until then", async () => {
    const host = await ElementFixture.render<UIIncludeHost>(
      `<ui-include source="${DIR}/part.html" load="visible" style="display:block;margin-top:300vh">Wait</ui-include>`
    )
    expect(host.shadowRoot!.querySelector("slot")).not.toBeNull()
    expect(box(host).childElementCount).toBe(0)
    host.scrollIntoView()
    await host.loaded
    await ElementFixture.tick()
    expect(box(host).querySelector("p.part")!.textContent).toBe("A part, with a label.")
    expect(host.shadowRoot!.querySelector("slot")).toBeNull()
    expect(host.contentRoot).toBe(box(host))
  })

  it("loads the families of the ui-* tags it brings", async () => {
    const host = await include(`<ui-include source="${DIR}/part.html"></ui-include>`)
    const label = box(host).querySelector("ui-label")!
    await customElements.whenDefined("ui-label")
    expect(label.matches(":defined")).toBe(true)
  })

  it("shows a page's <body>, not its <head>, and never runs its scripts", async () => {
    const host = await include(`<ui-include source="${DIR}/page.html"></ui-include>`)
    expect(box(host).querySelector("#intro h2")!.textContent).toBe("Intro")
    expect(box(host).querySelector("title, style")).toBeNull()
    expect((window as { __includedScriptRan?: boolean }).__includedScriptRan).toBeUndefined()
  })

  it("`select` shows only the first match;  no match is an error", async () => {
    const host = await include(`<ui-include source="${DIR}/page.html" select="#more"></ui-include>`)
    expect(box(host).children.length).toBe(1)
    expect(box(host).firstElementChild!.id).toBe("more")
    const missing = await include(`<ui-include source="${DIR}/page.html" select="#nope"></ui-include>`)
    expect(missing.matches(":state(error)")).toBe(true)
    expect(missing.shadowRoot!.querySelector("[part~=error]")!.textContent).toMatch(/Couldn't show/)
  })

  it("`page-styles` puts the markup in its light DOM", async () => {
    const host = await include(`<ui-include source="${DIR}/part.html" page-styles>Wait</ui-include>`)
    expect(host.querySelector(":scope > p.part")).not.toBeNull()
    expect(host.textContent).not.toContain("Wait")
    expect(box(host).hidden).toBe(true)
    expect(host.contentRoot).toBe(host)
  })

  it("`ui-insert` hands over the markup before it goes in, and may change it", async () => {
    const seen: string[] = []
    document.addEventListener("ui-insert", listener)
    try {
      const host = await include(`<ui-include source="${DIR}/part.html" page-styles></ui-include>`)
      expect(seen).toEqual(["A part, with a label."])
      expect(host.querySelector("p.part.seen")).not.toBeNull()
    } finally {
      document.removeEventListener("ui-insert", listener)
    }

    /** Record the part's text, check it's not in the page yet, and mark it. */
    function listener(event: Event) {
      const { fragment } = (event as CustomEvent<{ fragment: DocumentFragment }>).detail
      seen.push(fragment.querySelector("p.part")?.textContent ?? "")
      expect(fragment.querySelector("p.part")!.isConnected).toBe(false)
      fragment.querySelector("p.part")!.classList.add("seen")
    }
  })

  it("points relative URLs where they pointed in the included page", async () => {
    const host = await include(`<ui-include source="${DIR}/sub/rel.html"></ui-include>`)
    const [link, top, absolute] = box(host).querySelectorAll("a")
    const image = box(host).querySelector("img")!
    expect(link.href).toBe(new URL(`${DIR}/sub/target.html`, location.href).href)
    expect(image.src).toBe(new URL(`${DIR}/sub/pic.png`, location.href).href)
    expect(top.getAttribute("href")).toBe("#top")
    expect(absolute.getAttribute("href")).toBe("/abs.html")
    // edited, so `content` is rebuilt from the markup:  the URLs come back as written
    image.alt = "a picture"
    expect(host.content).toContain('<a href="target.html">link</a> <img src="pic.png" alt="a picture">')
    expect(host.content).not.toContain("data-ui-include-")
  })

  it("nests:  an include in an include loads, against the outer file's URL", async () => {
    const host = await include(`<ui-include source="${DIR}/nested.html"></ui-include>`)
    const inner = box(host).querySelector<UIIncludeHost>("ui-include")!
    await inner.loaded
    await ElementFixture.tick()
    expect(inner.shadowRoot!.querySelector("[part~=content] p.part")).not.toBeNull()
  })

  it("refuses to include itself", async () => {
    const host = await include(`<ui-include source="${DIR}/loop.html"></ui-include>`)
    const inner = box(host).querySelector<UIIncludeHost>("ui-include")!
    await inner.loaded.catch(() => undefined)
    await ElementFixture.tick()
    expect(inner.matches(":state(error)")).toBe(true)
    expect(inner.shadowRoot!.querySelector("[part~=content]")!.childElementCount).toBe(0)
  })

  it("shows an error for another site", async () => {
    const host = await include(`<ui-include source="https://example.com/"></ui-include>`)
    expect(host.shadowRoot!.querySelector("[part~=error]")!.textContent).toMatch(/only files from this site/)
  })
})

////////////////
// ## Content and save()
////////////////

describe("<ui-include> content and save()", () => {
  it("`content` is the file as loaded while untouched", async () => {
    const host = await include(`<ui-include source="${DIR}/page.html"></ui-include>`)
    const file = await (await fetch(`${DIR}/page.html`)).text()
    expect(host.content).toBe(file)
  })

  it("an edit in place is spliced into the file's <body>, byte-exact outside it", async () => {
    const host = await include(`<ui-include source="${DIR}/page.html"></ui-include>`)
    const file = await (await fetch(`${DIR}/page.html`)).text()
    box(host).querySelector("#intro h2")!.textContent = "Edited"
    const saved = host.content
    expect(saved).toContain("<h2>Edited</h2>")
    expect(saved.slice(0, file.indexOf("<body"))).toBe(file.slice(0, file.indexOf("<body")))
    expect(saved.slice(saved.indexOf("</body>"))).toBe(file.slice(file.indexOf("</body>")))
  })

  it("with `select`, saves only that element, by its id", async () => {
    const saver = vi.fn<SourceSaver>(async () => ({ etag: '"v2"' }))
    UI.sources.saver = saver
    const host = await include(`<ui-include source="${DIR}/page.html" select="#intro"></ui-include>`)
    box(host).querySelector("p")!.textContent = "Changed."
    expect(await host.save()).toBe(true)
    expect(saver.mock.calls[0][0]).toMatchObject({
      fragment: "intro"
    })
    const { text } = saver.mock.calls[0][0]
    expect(text).toMatch(/^<main id="intro">/)
    expect(text).toContain("<p>Changed.</p>")
    expect(text).not.toContain("More.")
  })

  it("`select` on an element without an id can't be saved", async () => {
    UI.sources.saver = vi.fn<SourceSaver>(async () => ({}))
    const host = await include(`<ui-include source="${DIR}/page.html" select="h2"></ui-include>`)
    const onError = vi.fn()
    host.addEventListener("ui-error", onError)
    expect(await host.save()).toBe(false)
    expect(onError.mock.calls[0][0].detail.kind).toBe("save")
  })

  it("setting `content` shows the new markup", async () => {
    const host = await include(`<ui-include source="${DIR}/part.html"></ui-include>`)
    host.content = "<p class='new'>New</p>"
    expect(host.content).toBe("<p class='new'>New</p>")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(box(host).querySelector("p.new")).not.toBeNull()
    expect(host.dirty).toBe(true)
  })
})

////////////////
// ## `UIInclude.spliceBody()`
////////////////

describe("UIInclude.spliceBody()", () => {
  it("replaces what's between <body> and </body>", () => {
    expect(UIInclude.spliceBody("<html><body class=x>old</body></html>", "new")).toBe(
      "<html><body class=x>new</body></html>"
    )
  })

  it("is the body alone for a fragment", () => {
    expect(UIInclude.spliceBody("<p>old</p>", "<p>new</p>")).toBe("<p>new</p>")
  })
})

////////////////
// ## Examples
////////////////

describe("<ui-include> examples", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await Promise.all(
      [...root.querySelectorAll<UIIncludeHost>("ui-include")].map((host) => host.loaded.catch(() => undefined))
    )
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
