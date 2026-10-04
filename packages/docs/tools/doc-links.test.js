import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vite-plus/test"

import { checkText, linkText, resolve, targetFor } from "./doc-links.js"
import { DOCS, ROOT, TOOLS } from "./pages.js"

/** A page in `spell-docs/`, one folder down from `packages/docs`, as most pages are. */
const PAGE_DIR = join(DOCS, "spell-docs")

/** `body` linked as a page in `PAGE_DIR`. */
function link(body) {
  return linkText(`<html><head><title>t</title></head><body>${body}</body></html>`, PAGE_DIR)
}

/** Just the `<body>` of `link(body)`'s page. */
function linked(body) {
  return /<body>([\s\S]*)<\/body>/.exec(link(body).text)?.[1]
}

/** Run `node tools/doc-links.js args` from `packages/docs/content`. */
function cli(...args) {
  return spawnSync(process.execPath, [join(TOOLS, "doc-links.js"), ...args], { cwd: DOCS, encoding: "utf8" })
}

/** A page with `body`, written to a fresh temp folder:  its path. */
function tempPage(body) {
  const file = join(mkdtempSync(join(tmpdir(), "doc-links-")), "page.html")
  writeFileSync(file, `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>\n`)
  return file
}

describe("linkText:  adding links", () => {
  it("links a code span naming a real file, relative to the page, with its own target", () => {
    expect(linked("<p><code>packages/docs/tools/pages.js</code></p>")).toBe(
      '<p><a href="../../tools/pages.js" target="src-packages-docs-tools-pages-js">' +
        "<code>packages/docs/tools/pages.js</code></a></p>"
    )
  })

  it("resolves against the page's folder, the repo root, `packages/`, `#name/` aliases and bare file names", () => {
    expect(resolve("spell-docs.md", PAGE_DIR)).toBe(join(PAGE_DIR, "spell-docs.md"))
    expect(resolve("tsconfig.base.json")).toBe(join(ROOT, "tsconfig.base.json"))
    expect(resolve("docs/tools/pages.js")).toBe(join(TOOLS, "pages.js"))
    expect(resolve("#docs/../tools/pages.js")).toBe(join(TOOLS, "pages.js"))
    expect(resolve("doc-links.test.js")).toBe(join(TOOLS, "doc-links.test.js"))
    expect(resolve("packages/docs/tools/pages.js:12")).toBe(join(TOOLS, "pages.js"))
    expect(resolve("packages&#47;docs/tools/pages.js")).toBe(join(TOOLS, "pages.js"))
  })

  it("names special spans and solidjs.com pages, and leaves operators, words and unknown files alone", () => {
    expect(resolve("solidjs/solid")).toBe("https://github.com/solidjs/solid/tree/next")
    expect(resolve("solidjs.com/docs")).toBe("https://solidjs.com/docs")
    for (const text of ["/", "./", "..", "foo", "nope/missing.ts", "$/util/index.ts"])
      expect(resolve(text)).toBe(undefined)
  })

  it("links a folder with a trailing slash", () => {
    expect(linked("<code>packages/docs/tools</code>")).toBe(
      '<a href="../../tools/" target="src-packages-docs-tools"><code>packages/docs/tools</code></a>'
    )
    expect(linked("<code>packages/docs/content/spell-docs</code>")).toBe(
      '<a href="./" target="src-packages-docs-content-spell-docs"><code>packages/docs/content/spell-docs</code></a>'
    )
  })

  it("never links inside head, pre, script, style or an existing link", () => {
    const span = "<code>packages/docs/AGENTS.md</code>"
    const page = `<html><head><title>t</title>${span}</head><body><pre>${span}</pre><script>"${span}"</script><style>/*${span}*/</style></body></html>`
    expect(linkText(page, PAGE_DIR)).toEqual({ text: page, linked: 0, unresolved: [] })
    expect(linked(`<a href="#x">${span}</a>`)).toBe(`<a href="#x">${span}</a>`)
  })

  it("reports unresolved path-like spans, sorted, and leaves paths outside the repo as text", () => {
    const result = link("<code>zz/missing.ts</code> <code>nope.md</code> <code>word</code> <code>/etc/hosts</code>")
    expect(result.linked).toBe(0)
    expect(result.unresolved).toEqual(["/etc/hosts", "nope.md", "zz/missing.ts"])
  })
})

describe("targets", () => {
  it("names URLs ext-<slug>, plan docs by name, everything else src-<repo-relative slug>, at most 80 characters", () => {
    expect(targetFor("https://www.example.com/a/b?c=1")).toBe("ext-example-com-a-b-c-1")
    expect(targetFor("http://example.com/")).toBe("ext-example-com")
    expect(targetFor(join(DOCS, "epics/commands/commands.html"))).toBe("commands")
    expect(targetFor(join(DOCS, "epics/commands/commands.plan.html"))).toBe("commands")
    expect(targetFor(join(DOCS, "epics/commands/notes.html"))).toBe(
      "src-packages-docs-content-epics-commands-notes-html"
    )
    expect(targetFor(`https://example.com/${"x".repeat(100)}`)).toHaveLength(84)
  })

  it("adds a target to a link without one, and leaves anchors and existing targets alone", () => {
    expect(
      linked('<a href="../index.html#links">i</a> <a href="#top">t</a> <a href="https://x.dev" target="x">x</a>')
    ).toBe(
      '<a href="../index.html#links" target="src-packages-docs-content-index-html">i</a> <a href="#top">t</a> ' +
        '<a href="https://x.dev" target="x">x</a>'
    )
  })

  it("renames a plan doc's old target to the plan's name", () => {
    expect(linked('<a href="../epics/commands/commands.html#p7" target="src-old">plan</a>')).toBe(
      '<a href="../epics/commands/commands.html#p7" target="commands">plan</a>'
    )
  })
})

describe("idempotence", () => {
  it("a second run changes nothing", () => {
    const first = link(
      '<code>packages/docs/AGENTS.md</code> <code>packages/docs/tools</code> <a href="../index.html">i</a> <code>zz/x.ts</code>'
    )
    expect(first.linked).toBe(2)
    const second = linkText(first.text, PAGE_DIR)
    expect(second.text).toBe(first.text)
    expect(second.linked).toBe(0)
  })
})

describe("checkText", () => {
  it("passes linked pages, `_self` links and anything inside <pre>", () => {
    const page = link(
      '<code>packages/docs/AGENTS.md</code> <a href="../index.html" target="_self">i</a> <pre><a href="nope.html">x</a></pre>'
    ).text
    expect(checkText(page, PAGE_DIR)).toEqual({ destinations: 1, problems: [] })
  })

  it("fails missing files, files outside the repo, links with no target, nested links", () => {
    const { problems } = checkText(
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

  it("fails one destination with several targets, and one target with several destinations", () => {
    const { problems } = checkText(
      '<a href="https://x.dev" target="a">1</a> <a href="https://x.dev" target="b">2</a> <a href="https://y.dev" target="b">3</a>',
      PAGE_DIR
    )
    expect(problems).toEqual([
      "several targets for https://x.dev:  a, b",
      "target b shared by https://x.dev, https://y.dev"
    ])
  })
})

describe("command line", () => {
  it("--check prints a line per page and its problems, and exits 1 on any", () => {
    const good = tempPage('<a href="https://x.dev" target="x">x</a>')
    const bad = tempPage('<a href="https://x.dev">x</a>')
    const run = cli("--check", good, bad)
    expect(run.status).toBe(1)
    expect(run.stdout).toBe(
      "page.html:  1 destinations, 0 problems\npage.html:  0 destinations, 1 problems\n    no target:  https://x.dev\n"
    )
    expect(cli("--check", good).status).toBe(0)
  })

  it("links a page in place and says what it did", () => {
    const page = tempPage('<a href="https://x.dev">x</a> <code>zz/x.ts</code> <code>a, b/c.ts</code>')
    const run = cli(page)
    expect(run.status).toBe(0)
    expect(run.stdout).toBe("page.html:  linked 0 code spans, 2 unresolved path-like\n    a, b/c.ts\n    zz/x.ts\n")
    expect(readFileSync(page, "utf8")).toContain('<a href="https://x.dev" target="ext-x-dev">x</a>')
  })

  it("prints usage and exits 1 with no pages", () => {
    const run = cli("--check")
    expect(run.status).toBe(1)
    expect(run.stderr).toContain("usage")
  })
})
