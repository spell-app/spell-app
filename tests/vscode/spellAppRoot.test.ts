import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { findSpellApp } from "spell-app/vscode/src/spellAppRoot.ts"

/**
 * Which spell-app checkout the VS Code extension runs (`findSpellApp()`), on made-up checkouts laid out like Owen's:
 * - `MAIN`, a kit's main checkout:  its spell-app's `.git` a folder
 * - `CONTENT`, the content repo every window shows, INSIDE the main checkout's kit
 * - `WORKTREE`, an epic's worktree of the kit:  its spell-app's `.git` a file, as git writes it
 */
describe("findSpellApp():  the window's checkout", () => {
  test("a worktree's window runs the worktree's, whatever order it lists its folders in (epic repo-split I71)", () => {
    // the worktree first, as since epic `epic-engine` P12
    expect(findSpellApp(places(WORKTREE, MAIN, CONTENT))).toEqual({
      root: join(WORKTREE, "spell-app"),
      reason: `window folder ${WORKTREE}, a worktree`
    })
    // the main checkout first, as before
    expect(findSpellApp(places(MAIN, WORKTREE, CONTENT))?.root).toBe(join(WORKTREE, "spell-app"))
  })

  test("a worktree's window without the main checkout runs the worktree's, not the one above the content repo", () => {
    expect(findSpellApp(places(WORKTREE, CONTENT))?.root).toBe(join(WORKTREE, "spell-app"))
  })

  test("the main window runs the main checkout's", () => {
    expect(findSpellApp(places(MAIN, CONTENT))).toEqual({
      root: join(MAIN, "spell-app"),
      reason: `window folder ${MAIN}`
    })
  })

  test("a folder inside a checkout leads to it, when no folder is or holds one", () => {
    expect(findSpellApp({ workspaceFolders: [join(MAIN, "spell-parser")], builtIn: "/nowhere" })?.root).toBe(
      join(MAIN, "spell-app")
    )
  })

  test("the setting wins over the window's folders", () => {
    const choice = findSpellApp({ ...places(WORKTREE, MAIN), configured: MAIN })
    expect(choice).toEqual({ root: join(MAIN, "spell-app"), reason: `setting \`spell.parserRoot\` (${MAIN})` })
  })

  test("no checkout in the window:  the one the extension was built in", () => {
    expect(findSpellApp(places(ELSEWHERE))).toEqual({
      root: join(MAIN, "spell-app"),
      reason: "the checkout the extension was built in"
    })
  })
})

////////////////
// ## Helpers
////////////////

const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "spell-app-root-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** A kit's main checkout, with spell-app in it. */
const MAIN = checkout("spell", { worktree: false })

/** The content repo, inside the main checkout's kit. */
const CONTENT = join(MAIN, "spell.epics")
mkdirSync(CONTENT)

/** An epic's worktree of the kit. */
const WORKTREE = checkout("spell.worktrees/epic", { worktree: true })

/** A folder in no checkout. */
const ELSEWHERE = join(TEMP, "elsewhere")
mkdirSync(ELSEWHERE)

/** A made-up kit at `path` (under `TEMP`), its spell-app and spell-parser inside it;  returns the kit's folder. */
function checkout(path: string, { worktree }: { worktree: boolean }): string {
  const kit = join(TEMP, path)
  const spellApp = join(kit, "spell-app")
  mkdirSync(spellApp, { recursive: true })
  mkdirSync(join(kit, "spell-parser"))
  writeFileSync(join(spellApp, "package.json"), `{ "name": "spell-app" }`)
  writeFileSync(join(kit, "spell-parser", "package.json"), `{ "name": "spell-parser" }`)
  if (worktree) writeFileSync(join(spellApp, ".git"), `gitdir: ${join(TEMP, "spell/spell-app/.git/worktrees/epic")}\n`)
  else mkdirSync(join(spellApp, ".git"))
  return kit
}

/** Where `findSpellApp()` looks:  the window's `folders`, in order;  built in the main checkout. */
function places(...folders: string[]) {
  return { workspaceFolders: folders, builtIn: join(MAIN, "spell-app") }
}
