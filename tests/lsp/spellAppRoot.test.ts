import { describe, test, expect } from "vite-plus/test"
import { mkdirSync, mkdtempSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

// oxlint-disable-next-line spell/no-parent-import -- the extension is its own yarn project, installed nowhere:  no package name reaches it
import { findSpellApp } from "../../vscode/src/spellAppRoot"

/**
 * `findSpellApp()`:  whose language server the VS Code extension runs, for a window's folders.
 * - Here, beside the language server's tests:  the extension (`vscode/`) has no tests of its own.
 * - A temp layout like Owen's:  the kit's main checkout with the content repo inside it, and an epic's worktree.
 */
describe("findSpellApp()", () => {
  const home = mkdtempSync(join(tmpdir(), "spell-app-root-"))
  const kit = join(home, "spell")
  const epics = join(kit, "spell.epics")
  const worktree = join(home, "spell.worktrees/spanish")
  const builtIn = join(kit, "spell-app")
  for (const checkout of [kit, worktree]) packageAt(join(checkout, "spell-app"), "spell-app")
  mkdirSync(epics, { recursive: true })
  packageAt(join(kit, "spell-lang"), "spell-lang")

  test("a worktree's window -- the worktree, then the content repo inside the main checkout -- runs the worktree's", () => {
    expect(findSpellApp({ workspaceFolders: [worktree, epics], builtIn })?.root).toBe(join(worktree, "spell-app"))
  })

  test("a worktree's window from before, with the main checkout first, runs the worktree's", () => {
    expect(findSpellApp({ workspaceFolders: [kit, worktree, epics], builtIn })?.root).toBe(join(worktree, "spell-app"))
  })

  test("the main checkout's window runs main's", () => {
    expect(findSpellApp({ workspaceFolders: [kit, epics], builtIn })?.root).toBe(join(kit, "spell-app"))
  })

  test("a folder inside a checkout leads to it, when no folder is or holds one", () => {
    const project = join(kit, "spell-lang/some-project")
    mkdirSync(project, { recursive: true })
    expect(findSpellApp({ workspaceFolders: [project], builtIn: "/nowhere" })?.root).toBe(join(kit, "spell-app"))
  })

  test("the setting wins over the window's folders", () => {
    expect(findSpellApp({ configured: kit, workspaceFolders: [worktree], builtIn })?.root).toBe(join(kit, "spell-app"))
  })
})

/** Make `folder` with a `package.json` named `name`. */
function packageAt(folder: string, name: string) {
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, "package.json"), JSON.stringify({ name }))
}
