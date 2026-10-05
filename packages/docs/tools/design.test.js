import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vite-plus/test"

import { changedFiles, hashTree, pullBoard } from "./design.js"
import { ROOT } from "./pages.js"

/** A small artboard, as Claude Design writes one. */
const BOARD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Pony</title>
<script src="./support.js"></script>
<script src="ds/spell/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
.mane{color:violet}
</style>
</helmet>
<ui-root>
<div style="padding: 32px">
<h1>{{title}}</h1>
<sc-if value="{{happy}}" hint-placeholder-val="{{ true }}"><ui-label color="violet">Happy</ui-label></sc-if>
<ui-button primary="" icon="horse" onClick="{{gallop}}">Clicked {{count}} times</ui-button>
</div>
</ui-root>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"title":{"editor":"text","default":"A pony"},"$preview":{"width":880,"height":600}}'>
class Component extends DCLogic { renderVals() { return { title: this.props.title ?? "A pony" } } }
</script>
</body>
</html>`

describe("pullBoard()", () => {
  const page = join(ROOT, "brand/pony.html")
  const { html, notes } = pullBoard(BOARD, page, { from: "https://claude.ai/artifact/x", board: "Main.dc.html" })

  it("keeps the ui-* markup and drops Claude Design's runtime", () => {
    expect(html).toContain('<ui-button primary="" icon="horse">')
    expect(html).not.toContain("support.js")
    expect(html).not.toContain("<x-dc>")
    expect(html).not.toContain("data-dc-script")
  })

  it("loads the one-file bundle and the site header for the page's depth", () => {
    expect(html).toContain('<script src="../packages/docs/tools/_assets/spell-ui.js"></script>')
    expect(html).toContain('<spell-site-header root=".."></spell-site-header>')
  })

  it("moves helmet styles into the head, minus body margin", () => {
    expect(html).toContain(".mane{color:violet}")
    expect(html).not.toContain("body{margin:0}")
  })

  it("fills holes from data-props defaults and notes the rest", () => {
    expect(html).toContain("<h1>A pony</h1>")
    expect(html).toContain("Clicked {{count}} times")
    expect(notes.some((note) => note.includes("{{count}}"))).toBe(true)
  })

  it("drops event holes and unwraps sc-if", () => {
    expect(html).not.toMatch(/onclick/i)
    expect(html).not.toContain("<sc-if")
    expect(html).toContain('<ui-label color="violet">Happy</ui-label>')
    expect(notes.some((note) => /onclick/i.test(note))).toBe(true)
  })

  it("says where it came from", () => {
    expect(html).toContain("pulled from Claude Design, https://claude.ai/artifact/x, board Main.dc.html")
    expect(html).toContain("<title>Pony</title>")
  })
})

describe("changedFiles()", () => {
  const root = mkdtempSync(join(tmpdir(), "design-"))
  mkdirSync(join(root, "project/components"), { recursive: true })
  writeFileSync(join(root, "project/README.md"), "# Spell")
  writeFileSync(join(root, "project/design-system.json"), "{}")
  writeFileSync(join(root, "project/components/bundle.js"), "var SpellUI={}")

  it("lists everything before the first push, the index last", () => {
    const { changed, removed } = changedFiles(root, {})
    expect(changed).toEqual(["project/components/bundle.js", "project/README.md", "project/design-system.json"])
    expect(removed).toEqual([])
  })

  it("lists only what changed since the push, and what went", () => {
    const state = { files: { ...hashTree(root), "project/old.md": "x" } }
    writeFileSync(join(root, "project/README.md"), "# Spell, again")
    const { changed, removed } = changedFiles(root, state)
    expect(changed).toEqual(["project/README.md"])
    expect(removed).toEqual(["project/old.md"])
  })
})
