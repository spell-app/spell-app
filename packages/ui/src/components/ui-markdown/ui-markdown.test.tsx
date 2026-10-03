import { beforeAll, describe, expect, it, vi } from "vitest"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"

import { MarkdownEngine } from "./MarkdownEngine"
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

  it("sanitizes:  no scripts, no handlers, no javascript: links", async () => {
    // through `content`:  a `</script>` in the text would end an inline `<script type="text/markdown">`
    const host = await markdown(md("placeholder"))
    const rendered = nextRender(host)
    host.content =
      '<script>window.__md = 1</script>\n\n<img src="x" onerror="window.__md = 2">\n\n[x](javascript:alert(1))'
    await rendered
    expect(body(host).querySelector("script")).toBeNull()
    expect(body(host).querySelector("img")!.hasAttribute("onerror")).toBe(false)
    expect(body(host).querySelector("a")?.getAttribute("href") ?? "").not.toMatch(/javascript/)
    expect((window as { __md?: number }).__md).toBeUndefined()
  })

  it("`trusted` keeps raw HTML", async () => {
    const host = await markdown(md('<ui-label color="teal">kept</ui-label>', "trusted"))
    expect(body(host).querySelector("ui-label")!.textContent).toBe("kept")
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

describe("MarkdownEngine.slug()", () => {
  it.each([
    ["Getting started!", "getting-started"],
    ["  API:  `load()` & more ", "api--load--more"],
    ["Ünïcode wörds", "ünïcode-wörds"]
  ])("%s => %s", (text, slug) => {
    expect(MarkdownEngine.slug(text)).toBe(slug)
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
