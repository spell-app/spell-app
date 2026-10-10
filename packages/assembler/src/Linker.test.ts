import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, test } from "vite-plus/test"

import { AS } from "$/assembler"

/** The checkout these tests run in:  its real files are what links resolve to. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

/** `packages/docs/tools`:  one of the folders bare file names are looked up in. */
const TOOLS = join(ROOT, "packages/docs/tools")

/** `epics/`:  plan docs. */
const EPICS = join(ROOT, "epics")

/** A page in `guides/spell-docs/`, two folders down from the root, as most pages are. */
const PAGE_DIR = join(ROOT, "guides", "spell-docs")

/** One linker for every test:  its bare-name index is built once. */
const LINKER = new AS.Linker(ROOT)

/** `body` linked as a page in `PAGE_DIR`. */
function link(body: string) {
  return LINKER.link(`<html><head><title>t</title></head><body>${body}</body></html>`, PAGE_DIR)
}

/** Just the `<body>` of `link(body)`'s page. */
function linked(body: string) {
  return /<body>([\s\S]*)<\/body>/.exec(link(body).text)?.[1]
}

////////////////
// ## Tests
////////////////

describe("Linker.link()", () => {
  test("links a code span naming a real file, relative to the page, with its own target", () => {
    expect(linked("<p><code>packages/docs/tools/pages.js</code></p>")).toBe(
      '<p><a href="../../packages/docs/tools/pages.js" target="src-packages-docs-tools-pages-js">' +
        "<code>packages/docs/tools/pages.js</code></a></p>"
    )
  })

  test("links a name with its path as its tooltip to that path, keeping the tooltip;  idempotent", () => {
    const span = '<code title="packages/docs/tools/pages.js:12">ROOT</code>'
    const result = link(`<p>From ${span}.</p>`)
    expect(/<body>([\s\S]*)<\/body>/.exec(result.text)?.[1]).toBe(
      `<p>From <a href="../../packages/docs/tools/pages.js" target="src-packages-docs-tools-pages-js">${span}</a>.</p>`
    )
    expect(LINKER.link(result.text, PAGE_DIR).text).toBe(result.text)
    // the title is the path:  a name that's no file, under a title that's missing, is reported by its title
    expect(link('<code title="zz/missing.ts">pages.js</code>')).toMatchObject({
      linked: 0,
      unresolved: ["zz/missing.ts"]
    })
  })

  test("links a folder with a trailing slash", () => {
    expect(linked("<code>packages/docs/tools</code>")).toBe(
      '<a href="../../packages/docs/tools/" target="src-packages-docs-tools"><code>packages/docs/tools</code></a>'
    )
    expect(linked("<code>guides/spell-docs</code>")).toBe(
      '<a href="./" target="src-guides-spell-docs"><code>guides/spell-docs</code></a>'
    )
  })

  test("NEVER links inside head, pre, script, style or an existing link", () => {
    const span = "<code>packages/docs/AGENTS.md</code>"
    const page = `<html><head><title>t</title>${span}</head><body><pre>${span}</pre><script>"${span}"</script><style>/*${span}*/</style></body></html>`
    expect(LINKER.link(page, PAGE_DIR)).toEqual({ text: page, linked: 0, unresolved: [] })
    expect(linked(`<a href="#x">${span}</a>`)).toBe(`<a href="#x">${span}</a>`)
  })

  test("reports unresolved path-like spans, sorted, and leaves paths outside the repo as text", () => {
    const result = link("<code>zz/missing.ts</code> <code>nope.md</code> <code>word</code> <code>/etc/hosts</code>")
    expect(result.linked).toBe(0)
    expect(result.unresolved).toEqual(["/etc/hosts", "nope.md", "zz/missing.ts"])
  })

  test("adds a target to a link without one, and leaves anchors and existing targets alone", () => {
    expect(
      linked('<a href="../index.html#links">i</a> <a href="#top">t</a> <a href="https://x.dev" target="x">x</a>')
    ).toBe(
      '<a href="../index.html#links" target="src-guides-index-html">i</a> <a href="#top">t</a> ' +
        '<a href="https://x.dev" target="x">x</a>'
    )
  })

  test("renames a plan doc's old target to the plan's name", () => {
    expect(linked('<a href="../epics/commands/commands.html#p7" target="src-old">plan</a>')).toBe(
      '<a href="../epics/commands/commands.html#p7" target="commands">plan</a>'
    )
  })

  test("is idempotent:  a second run changes nothing", () => {
    const first = link(
      '<code>packages/docs/AGENTS.md</code> <code>packages/docs/tools</code> <a href="../index.html">i</a> <code>zz/x.ts</code>'
    )
    expect(first.linked).toBe(2)
    const second = LINKER.link(first.text, PAGE_DIR)
    expect(second.text).toBe(first.text)
    expect(second.linked).toBe(0)
  })
})

describe("Linker.resolve()", () => {
  test("resolves against the page's folder, the repo root, `packages/`, `#name/` aliases and bare file names", () => {
    expect(LINKER.resolve("spell-docs.md", PAGE_DIR)).toBe(join(PAGE_DIR, "spell-docs.md"))
    expect(LINKER.resolve("tsconfig.base.json")).toBe(join(ROOT, "tsconfig.base.json"))
    expect(LINKER.resolve("docs/tools/pages.js")).toBe(join(TOOLS, "pages.js"))
    expect(LINKER.resolve("#docs/../tools/pages.js")).toBe(join(TOOLS, "pages.js"))
    expect(LINKER.resolve("doc-links.test.js")).toBe(join(TOOLS, "doc-links.test.js"))
    expect(LINKER.resolve("packages/docs/tools/pages.js:12")).toBe(join(TOOLS, "pages.js"))
    expect(LINKER.resolve("packages&#47;docs/tools/pages.js")).toBe(join(TOOLS, "pages.js"))
  })

  test("names special spans and solidjs.com pages, and leaves operators, words and unknown files alone", () => {
    expect(LINKER.resolve("solidjs/solid")).toBe("https://github.com/solidjs/solid/tree/next")
    expect(LINKER.resolve("solidjs.com/docs")).toBe("https://solidjs.com/docs")
    for (const text of ["/", "./", "..", "foo", "nope/missing.ts", "$/util/index.ts"])
      expect(LINKER.resolve(text)).toBe(undefined)
  })
})

describe("Linker.targetFor()", () => {
  test("names URLs ext-<slug>, plan docs by name, everything else src-<repo-relative slug>, at most 80 characters", () => {
    expect(LINKER.targetFor("https://www.example.com/a/b?c=1")).toBe("ext-example-com-a-b-c-1")
    expect(LINKER.targetFor("http://example.com/")).toBe("ext-example-com")
    expect(LINKER.targetFor(join(EPICS, "commands/commands.html"))).toBe("commands")
    expect(LINKER.targetFor(join(EPICS, "commands/commands.plan.html"))).toBe("commands")
    expect(LINKER.targetFor(join(ROOT, "packages/docs/content/epics/commands/commands.plan.html"))).toBe("commands")
    expect(LINKER.targetFor(join(EPICS, "commands/notes.html"))).toBe("src-epics-commands-notes-html")
    expect(LINKER.targetFor(`https://example.com/${"x".repeat(100)}`)).toHaveLength(84)
  })
})

describe("Linker.check()", () => {
  test("passes linked pages, `_self` links and anything inside <pre>", () => {
    const page = link(
      '<code>packages/docs/AGENTS.md</code> <a href="../../pages/index.html" target="_self">i</a> <pre><a href="nope.html">x</a></pre>'
    ).text
    expect(LINKER.check(page, PAGE_DIR)).toEqual({ destinations: 1, problems: [] })
  })

  test("fails missing files, files outside the repo, links with no target, nested links", () => {
    const { problems } = LINKER.check(
      '<a href="nope.html" target="a">x</a> <a href="/etc/hosts" target="b">h</a> ' +
        '<a href="https://x.dev">x</a> <a href="https://y.dev" target="y"> <a href="https://z.dev" target="z">z</a></a>',
      PAGE_DIR
    )
    expect(problems).toEqual([
      "1 nested links",
      "missing:  nope.html",
      "outside repo:  /etc/hosts",
      "no target:  https://x.dev"
    ])
  })

  test("fails one destination with several targets, and one target with several destinations", () => {
    const { problems } = LINKER.check(
      '<a href="https://x.dev" target="a">1</a> <a href="https://x.dev" target="b">2</a> <a href="https://y.dev" target="b">3</a>',
      PAGE_DIR
    )
    expect(problems).toEqual([
      "several targets for https://x.dev:  a, b",
      "target b shared by https://x.dev, https://y.dev"
    ])
  })
})
