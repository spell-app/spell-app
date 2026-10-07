import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vite-plus/test"

import { PACKAGE, TOOLS } from "./pages.js"

// The rules themselves (what links, which target, what `--check` finds) are tested where they live:
// `packages/assembler/src/Linker.test.ts`.  These run the command line, under plain `node` as `update.js` does.

/** Run `node tools/doc-links.js args` from `packages/docs`. */
function cli(...args) {
  return spawnSync(process.execPath, [join(TOOLS, "doc-links.js"), ...args], { cwd: PACKAGE, encoding: "utf8" })
}

/** A page with `body`, written to a fresh temp folder:  its path. */
function tempPage(body) {
  const file = join(mkdtempSync(join(tmpdir(), "doc-links-")), "page.html")
  writeFileSync(file, `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>\n`)
  return file
}

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
