import { beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"

import { MarkdownEngine } from "./MarkdownEngine"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { MDEngine } from "./MDEngine"
import type { UIMarkdownHost } from "./UIMarkdownHost"

import "$/ui/components/ui-markdown"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-markdown/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The example README. */
const README = "/src/components/ui-markdown/examples/sources/readme.md"

beforeAll(async () => {
  await UI.load()
})

/** Render one `<ui-markdown>`, wait for its render (or failure). */
async function markdown(html: string): Promise<UIMarkdownHost> {
  const rendered = nextRender(document)
  const host = await ElementFixture.render<UIMarkdownHost>(html)
  await rendered
  await ElementFixture.tick()
  return host
}

/** Resolves on the next `ui-render` or `ui-error` reaching `target` (or after 2s). */
function nextRender(target: EventTarget): Promise<void> {
  return new Promise<void>((resolve) => {
    const done = () => {
      target.removeEventListener("ui-render", done)
      target.removeEventListener("ui-error", done)
      resolve()
    }
    target.addEventListener("ui-render", done)
    target.addEventListener("ui-error", done)
    setTimeout(done, 2000)
  })
}

/** The article. */
function body(host: UIMarkdownHost): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=body]")!
}

/** Markdown as an element, exact (`<script type="text/markdown">`). */
function md(text: string, attributes = ""): string {
  return `<ui-markdown ${attributes}><script type="text/markdown">${text}</script></ui-markdown>`
}

describe("<ui-markdown>", () => {
  it("renders GitHub markdown:  tables, task lists, strikethrough, autolinks", async () => {
    const host = await markdown(
      md("| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n- [ ] todo\n\n~~old~~ https://example.com")
    )
    expect(body(host).querySelectorAll("table td").length).toBe(2)
    const boxes = body(host).querySelectorAll<HTMLInputElement>("li > input[type=checkbox]")
    expect([...boxes].map((box) => box.checked)).toEqual([true, false])
    expect([...boxes].map((box) => box.getAttribute("aria-label"))).toEqual(["done", "todo"])
    expect(body(host).querySelector("del")!.textContent).toBe("old")
    expect(body(host).querySelector("a")!.getAttribute("href")).toBe("https://example.com")
  })

  it("gives headings GitHub's ids and lists them:  `headings`, `ui-render`", async () => {
    const onRender = vi.fn()
    document.addEventListener("ui-render", onRender)
    const host = await markdown(md("# Getting started!\n\n## Setup\n\n## Setup"))
    document.removeEventListener("ui-render", onRender)
    expect([...body(host).querySelectorAll("h1, h2")].map((heading) => heading.id)).toEqual([
      "getting-started",
      "setup",
      "setup-1"
    ])
    expect(host.headings).toEqual([
      { level: 1, text: "Getting started!", id: "getting-started" },
      { level: 2, text: "Setup", id: "setup" },
      { level: 2, text: "Setup", id: "setup-1" }
    ])
    expect(onRender.mock.calls.at(-1)![0].detail.headings).toHaveLength(3)
  })

  it("`heading-offset` shifts heading levels", async () => {
    const host = await markdown(md("# One\n\n###### Six", 'heading-offset="1"'))
    expect(body(host).querySelector("h2")!.textContent).toBe("One")
    expect(body(host).querySelector("h6")!.textContent).toBe("Six")
  })

  it("`sanitized` sanitizes:  no scripts, no handlers, no javascript: links", async () => {
    // through `content`:  a `</script>` in the text would end an inline `<script type="text/markdown">`
    const host = await markdown(md("placeholder", "sanitized"))
    const rendered = nextRender(host)
    host.content =
      '<script>window.__md = 1</script>\n\n<img src="x" onerror="window.__md = 2">\n\n[x](javascript:alert(1))'
    await rendered
    expect(body(host).querySelector("script")).toBeNull()
    expect(body(host).querySelector("img")!.hasAttribute("onerror")).toBe(false)
    expect(body(host).querySelector("a")?.getAttribute("href") ?? "").not.toMatch(/javascript/)
    expect((window as { __md?: number }).__md).toBeUndefined()
  })

  it("keeps raw HTML without `sanitized`, and never loads DOMPurify", async () => {
    const loadSanitizer = vi.spyOn(MarkdownRenderer, "loadSanitizer")
    try {
      const host = await markdown(md('<ui-label color="teal" data-x="1">kept</ui-label>'))
      expect(body(host).querySelector("ui-label")!.textContent).toBe("kept")
      expect(body(host).querySelector("ui-label")!.getAttribute("data-x")).toBe("1")
      expect(loadSanitizer).not.toHaveBeenCalled()
    } finally {
      loadSanitizer.mockRestore()
    }
  })

  it("turns code blocks into highlighted <ui-code>s", async () => {
    const host = await markdown(md("```ts\nconst a = 1\n```"))
    const code = body(host).querySelector("ui-code")!
    expect(code.getAttribute("language")).toBe("ts")
    expect(code.hasAttribute("copy")).toBe(true)
    expect(code.textContent).toBe("const a = 1")
  })

  it("loads a `source` file, its relative links resolved beside it", async () => {
    const host = await markdown(`<ui-markdown source="${README}"></ui-markdown>`)
    expect(body(host).querySelector("h1")!.textContent).toBe("Release notes")
    const changelog = body(host).querySelector<HTMLAnchorElement>("a[href$='changelog.md']")!
    expect(changelog.href).toBe(
      new URL("/src/components/ui-markdown/examples/sources/changelog.md", location.href).href
    )
    expect(body(host).querySelector("a[href='#elements']")).not.toBeNull()
  })

  it("follows a `#id` link to its heading inside the shadow root", async () => {
    const host = await markdown(`<ui-markdown source="${README}"></ui-markdown>`)
    const target = body(host).querySelector("#elements")!
    const scroll = vi.spyOn(target, "scrollIntoView").mockImplementation(() => {})
    body(host).querySelector<HTMLAnchorElement>("a[href='#elements']")!.click()
    expect(scroll).toHaveBeenCalled()
    expect(location.hash).toBe("#elements")
    history.replaceState(history.state, "", location.pathname + location.search)
  })

  it("re-renders new `content`", async () => {
    const host = await markdown(md("# One"))
    const rendered = nextRender(host)
    host.content = "# Two"
    await rendered
    expect(body(host).querySelector("h1")!.textContent).toBe("Two")
  })
})

describe("<ui-markdown skip-title>", () => {
  it("drops the leading `#` title, keeping the text and every other heading", async () => {
    const text = "\n# Spell Design System\n\nIntro.\n\n## Voice\n\n# Second title"
    const host = await markdown(md(text, "skip-title"))
    expect([...body(host).querySelectorAll("h1, h2")].map((heading) => heading.textContent)).toEqual([
      "Voice",
      "Second title"
    ])
    expect(body(host).firstElementChild!.textContent).toBe("Intro.")
    expect(host.headings.map(({ id }) => id)).toEqual(["voice", "second-title"])
    expect(host.content).toContain("# Spell Design System")
    expect(host.dirty).toBe(false)
  })

  it("drops a setext title too, but never a `##` heading or a leading paragraph", async () => {
    const setext = await markdown(md("Title\n=====\n\nBody", "skip-title"))
    expect(body(setext).querySelector("h1")).toBeNull()
    const second = await markdown(md("## Not a title\n\nBody", "skip-title"))
    expect(body(second).querySelector("h2")!.textContent).toBe("Not a title")
    const paragraph = await markdown(md("Body first\n\n# Title", "skip-title"))
    expect(body(paragraph).querySelector("h1")!.textContent).toBe("Title")
  })

  it("follows the attribute:  removing it shows the title again", async () => {
    const host = await markdown(md("# Title\n\nBody", "skip-title"))
    expect(body(host).querySelector("h1")).toBeNull()
    const rendered = nextRender(host)
    host.removeAttribute("skip-title")
    await rendered
    expect(body(host).querySelector("h1")!.textContent).toBe("Title")
  })
})

describe("<ui-markdown> revealing a heading", () => {
  /** Spy on `id`'s `scrollIntoView`. */
  function scrollSpy(host: UIMarkdownHost, id: string) {
    return vi.spyOn(body(host).querySelector(`#${id}`)!, "scrollIntoView").mockImplementation(() => {})
  }

  /** Clear the address's hash. */
  function clearHash() {
    history.replaceState(history.state, "", location.pathname + location.search)
  }

  it("`reveal(id)` scrolls to the heading and puts it in the address;  `false` for an unknown id", async () => {
    const host = await markdown(md("# One\n\n## Two"))
    const scroll = scrollSpy(host, "two")
    try {
      expect(host.reveal("two")).toBe(true)
      expect(scroll).toHaveBeenCalled()
      expect(location.hash).toBe("#two")
      expect(host.reveal("missing")).toBe(false)
      expect(location.hash).toBe("#two")
    } finally {
      clearHash()
    }
  })

  it("honours the address's `#id` after its FIRST render", async () => {
    history.replaceState(history.state, "", "#later-heading")
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {})
    try {
      const host = await markdown(md("# One\n\n## Later heading"))
      expect(scroll.mock.contexts).toContain(body(host).querySelector("#later-heading"))
      scroll.mockClear()
      const rendered = nextRender(host)
      host.content = "# One\n\n## Later heading\n\nMore."
      await rendered
      expect(scroll).not.toHaveBeenCalled()
    } finally {
      scroll.mockRestore()
      clearHash()
    }
  })

  it("follows a `hashchange` naming one of its headings, but not one the page itself has", async () => {
    const host = await markdown(md("# One\n\n## Two"))
    const scroll = scrollSpy(host, "two")
    const page = document.createElement("div")
    page.id = "page-own"
    document.body.append(page)
    try {
      location.hash = "#two"
      await expect.poll(() => scroll.mock.calls.length).toBe(1)
      location.hash = "#page-own"
      await new Promise((resolve) => window.addEventListener("hashchange", resolve, { once: true }))
      expect(scroll).toHaveBeenCalledTimes(1)
    } finally {
      page.remove()
      clearHash()
    }
  })
})

describe("<ui-markdown editable>", () => {
  /** An editable `<ui-markdown>` holding `text`, on its Write tab (nothing rendered yet). */
  async function editable(text: string, attributes = ""): Promise<UIMarkdownHost> {
    const host = await ElementFixture.render<UIMarkdownHost>(md(text, `editable ${attributes}`))
    await ElementFixture.settle(host)
    return host
  }

  /** The tab buttons, the text box. */
  function tabs(host: UIMarkdownHost): HTMLButtonElement[] {
    return [...host.shadowRoot!.querySelectorAll<HTMLButtonElement>("[part~=tab]")]
  }

  function editor(host: UIMarkdownHost): HTMLTextAreaElement {
    return host.shadowRoot!.querySelector<HTMLTextAreaElement>("[part~=editor]")!
  }

  /** Show the preview;  resolves once it's rendered. */
  async function preview(host: UIMarkdownHost) {
    const rendered = nextRender(host)
    tabs(host)[1].click()
    await rendered
    await ElementFixture.settle(host)
  }

  /** Type `text` into the box, as the user would:  an `input` event. */
  async function type(host: UIMarkdownHost, text: string) {
    editor(host).value = text
    editor(host).dispatchEvent(new InputEvent("input", { bubbles: true }))
    await ElementFixture.settle(host)
  }

  it("opens on Write:  the text in a text box, the preview hidden and not rendered", async () => {
    const host = await editable("# Title")
    expect(tabs(host).map((tab) => [tab.textContent, tab.getAttribute("aria-selected")])).toEqual([
      ["Write", "true"],
      ["Preview", "false"]
    ])
    expect(editor(host).value).toBe("# Title")
    expect(editor(host).getAttribute("aria-label")).toBe("Markdown")
    expect(body(host).parentElement!.hidden).toBe(true)
    expect(body(host).childNodes.length).toBe(0)
  })

  it("previews with spell's engine:  ui-* elements, ids, labelled task boxes, a table", async () => {
    const host = await editable("# Title\n\n- [x] done\n- [ ] todo\n\n| a | b |\n| - | - |\n| 1 | 2 |")
    await preview(host)
    expect(body(host).parentElement!.hidden).toBe(false)
    expect(editor(host).closest("section")!.hidden).toBe(true)
    expect(body(host).querySelector("ui-header")!.id).toBe("title")
    expect(host.headings).toEqual([{ level: 1, text: "Title", id: "title" }])
    const boxes = body(host).querySelectorAll("ui-checkbox")
    expect([...boxes].map((box) => box.getAttribute("aria-label"))).toEqual(["done", "todo"])
    expect(body(host).querySelectorAll("ui-table td").length).toBe(2)
  })

  it("each edit is `ui-change` and dirty;  the preview swaps only the changed blocks", async () => {
    const host = await editable("# Title\n\nfirst\n\nlast")
    await preview(host)
    const [title, , last] = body(host).childNodes
    tabs(host)[0].click()
    const onChange = vi.fn()
    host.addEventListener("ui-change", onChange)
    await type(host, "# Title\n\nchanged\n\nlast")
    expect(onChange.mock.calls.at(-1)![0].detail.content).toBe("# Title\n\nchanged\n\nlast")
    expect(host.matches(":state(dirty)")).toBe(true)
    await preview(host)
    expect(body(host).textContent).toContain("changed")
    expect(body(host).childNodes[0]).toBe(title)
    expect(body(host).lastChild).toBe(last)
  })

  it("arrow keys, Home and End move between the tabs", async () => {
    const host = await editable("text")
    const press = async (key: string) => {
      tabs(host)[0].parentElement!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
      await ElementFixture.settle(host)
    }
    await press("ArrowRight")
    expect(tabs(host)[1].getAttribute("aria-selected")).toBe("true")
    expect(host.shadowRoot!.activeElement).toBe(tabs(host)[1])
    await press("ArrowRight")
    expect(tabs(host)[0].getAttribute("aria-selected")).toBe("true")
    await press("End")
    expect(tabs(host)[1].getAttribute("aria-selected")).toBe("true")
    await press("Home")
    expect(tabs(host)[0].getAttribute("aria-selected")).toBe("true")
  })

  it("`sanitized` sanitizes spell's engine's output too, keeping ui-* elements", async () => {
    const host = await editable("placeholder", "sanitized")
    await type(host, '<b onclick="window.__md = 3">bold</b>\n\n<ui-label onclick="window.__md = 4">kept</ui-label>')
    await preview(host)
    expect(body(host).querySelector("b")!.hasAttribute("onclick")).toBe(false)
    expect(body(host).querySelector("ui-label")!.hasAttribute("onclick")).toBe(false)
    expect(body(host).querySelector("ui-label")!.textContent).toBe("kept")
  })

  it("axe passes on both tabs", async () => {
    const host = await editable("# Title\n\n- [ ] todo\n\n| a | b |\n| - | - |\n| 1 | 2 |")
    await expectAccessible(host)
    await preview(host)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await ElementFixture.settle(host)
    await expectAccessible(host)
  })
})

describe("MarkdownEngine.slug()", () => {
  it.each([
    ["Getting started!", "getting-started"],
    ["  API:  `load()` & more ", "api--load--more"],
    ["Ünïcode wörds", "ünïcode-wörds"]
  ])("%s => %s", (text, slug) => {
    expect(MarkdownEngine.slug(text)).toBe(slug)
  })
})

describe("MDEngine (md.bundle.js)", () => {
  // the bundle decodes with the browser's <textarea>, not `entities`' table (`gen-markdown.ts`, I6)
  it("decodes entities as the spec does:  whole references only, unknown ones kept", () => {
    const { html } = MDEngine.instance.render("&notit; &amp; &semi; &#0; &NotEqualTilde; &Afr; &nope; &copy", {
      breaks: false,
      headingOffset: 0,
      sanitized: false
    })
    expect(html).toContain("&amp;notit; &amp; ; � ≂̸ \u{1D504} &amp;nope; &amp;copy")
  })
})

describe("<ui-markdown> examples", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const rendered = nextRender(document)
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await rendered
    await new Promise((resolve) => setTimeout(resolve, 300))
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
