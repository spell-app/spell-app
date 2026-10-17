import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import JSON5 from "json5"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { EpicConfig } from "$/epics/config/EpicConfig"
import { fakeMainCheckout, fakeWorktree } from "$/server/test/checkouts"

/** The repo's own config, as committed. */
const REPO_CONFIG = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..", EpicConfig.FILE)

/** A main checkout, a worktree in it, and one beside it, as git leaves them. */
const TOP = mkdtempSync(join(tmpdir(), "epic-config-"))
const MAIN = fakeMainCheckout(join(TOP, "repo"))
const INSIDE = fakeWorktree(MAIN, join(MAIN, ".claude", "worktrees", "seo"))
afterAll(() => rmSync(TOP, { recursive: true, force: true }))

/** Write `text` as `main`'s `.epic/config.json5`. */
function configFile(main: string, text: string): void {
  mkdirSync(join(main, ".epic"), { recursive: true })
  writeFileSync(join(main, EpicConfig.FILE), text)
}

describe("EpicConfig", () => {
  test("no file:  the defaults, today's spell-app layout, folders from the main checkout", () => {
    const config = new EpicConfig(MAIN)
    expect(config.settings).toEqual(EpicConfig.DEFAULTS)
    expect(config.values()).toEqual({
      contentFolder: join(TOP, "spell-app-dev"),
      baseBranch: "main",
      worktreesFolder: join(MAIN, ".claude", "worktrees"),
      installCommand: "yarn install",
      "windows.default": "spell-app",
      "windows.repoName": "spell-app",
      "windows.contentName": "spell-app-dev",
      linkSessionFolders: false
    })
    expect(config.worktreeFolder("seo")).toBe(INSIDE)
    expect(config.worktreesPattern).toBe(".claude/worktrees")
  })

  test("the repo's committed config holds the defaults, and reads as JSON5 reads it (`DataFile`'s reader)", () => {
    const text = readFileSync(REPO_CONFIG, "utf8")
    expect(EpicConfig.settingsFrom(text)).toEqual(EpicConfig.DEFAULTS)
    expect(EpicConfig.parse(text)).toEqual(JSON5.parse(text))
  })

  test("a worktree reads the MAIN checkout's file, from any folder in it", () => {
    const other = fakeMainCheckout(join(TOP, "other"))
    const beside = fakeWorktree(other, join(TOP, "other.worktrees", "vite"))
    configFile(other, '{ "baseBranch": "trunk", "worktreesFolder": "../other.worktrees" }')
    const config = EpicConfig.of(join(beside, "packages", "ui"))
    expect(config.main).toBe(other)
    expect(config.baseBranch).toBe("trunk")
    expect(config.worktreesFolder).toBe(join(TOP, "other.worktrees"))
    // outside the checkout:  no pattern inside it, and a path is a worktree's only under that folder
    expect(config.worktreesPattern).toBeUndefined()
    expect(config.worktreeNameOf(join(beside, "epics"))).toBe("vite")
    expect(config.worktreeNameOf("/elsewhere/.claude/worktrees/seo")).toBeUndefined()
  })

  test("a key left out keeps its default;  comments and trailing commas read;  an unknown key is skipped", () => {
    const main = fakeMainCheckout(join(TOP, "partial"))
    configFile(
      main,
      `// a comment
{
  /* the content repo */ "contentFolder": "../content//with-slashes",
  "windows": { "default": "whole", },
  "linkSessionFolders": true,
  "later": "a key from a newer checkout",
}
`
    )
    const config = new EpicConfig(main)
    expect(config.contentFolder).toBe(join(TOP, "content", "with-slashes"))
    expect(config.windows).toEqual({ ...EpicConfig.DEFAULTS.windows, default: "whole" })
    expect(config.linkSessionFolders).toBe(true)
    expect(config.baseBranch).toBe("main")
  })

  test("refuses, naming the file:  text that won't read, a value of the wrong kind, an empty name", () => {
    expect(() => EpicConfig.settingsFrom("{ nope", "x.json5")).toThrow(SyntaxError)
    expect(() => EpicConfig.settingsFrom("{ nope", "x.json5")).toThrow(/x\.json5 won't read/)
    expect(() => EpicConfig.settingsFrom('{ "baseBranch": 3 }', "x.json5")).toThrow(
      /x\.json5's "baseBranch" must be a string, not 3/
    )
    expect(() => EpicConfig.settingsFrom('{ "windows": { "default": " " } }', "x.json5")).toThrow(
      /"windows\.default" must be a string/
    )
    expect(() => EpicConfig.settingsFrom("[]", "x.json5")).toThrow(/must hold an object/)
  })
})

describe("EpicConfig.worktreeNameOf()", () => {
  const config = new EpicConfig(MAIN)

  test("the worktree a path is in;  `undefined` in the main checkout or outside", () => {
    expect(config.worktreeNameOf(INSIDE)).toBe("seo")
    expect(config.worktreeNameOf(join(INSIDE, "packages", "ui"))).toBe("seo")
    expect(config.worktreeNameOf(MAIN)).toBeUndefined()
    expect(config.worktreeNameOf(join(MAIN, ".claude", "worktrees"))).toBeUndefined()
    expect(config.worktreeNameOf(undefined)).toBeUndefined()
  })

  test("while the folder is inside the checkout:  the same folder of ANY checkout counts (a session's `cwd`)", () => {
    expect(config.worktreeNameOf("/repo/.claude/worktrees/other/packages/ui")).toBe("other")
    expect(config.worktreeNameOf("/repo/.claude/worktreesX/other")).toBeUndefined()
  })
})
