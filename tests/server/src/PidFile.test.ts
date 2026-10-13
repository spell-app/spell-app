import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"

describe("newestChange()", () => {
  let folder: string

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), "newest-change-"))
  })

  afterEach(() => rmSync(folder, { recursive: true, force: true }))

  /** write `path` under the folder, last modified `seconds` after the epoch */
  function file(path: string, seconds: number) {
    const full = join(folder, path)
    mkdirSync(join(full, ".."), { recursive: true })
    writeFileSync(full, "")
    utimesSync(full, seconds, seconds)
  }

  it("the newest code file, all the way down;  0 for none or a missing folder", () => {
    expect(SRV.newestChange([folder, join(folder, "missing")])).toBe(0)
    file("a.ts", 100)
    file("page/deep/b.js", 300)
    file("c.mjs", 200)
    expect(SRV.newestChange([folder])).toBe(300_000)
  })

  it("skips what isn't the server's code:  other files, node_modules, _assets, dot folders", () => {
    file("a.ts", 100)
    file("notes.md", 900)
    file("node_modules/x/index.js", 900)
    file("_assets/spell-ui.js", 900)
    file(".cache/y.ts", 900)
    expect(SRV.newestChange([folder])).toBe(100_000)
  })
})
