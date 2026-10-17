import { describe, expect, test, vi } from "vite-plus/test"

import { SPACES } from "$/spaces"

/**
 * Spell's project groups are spaces' (`SPACES.PROJECT_GROUPS`), and spell's registry starts empty
 * (epic `people-and-orgs` P15).
 * - So every program that reads a spell path must load them first, or every address is "invalid".
 * - One test per ENTRY POINT:  each, loaded alone in a fresh module graph, registers them.
 * - The browser's entries (the editor, `<spell-app>`) load `$/spaces` / `$/spaces/models/projectGroups` the same way.
 */
const ENTRIES: Record<string, () => Promise<unknown>> = {
  "spaces' barrel ($/spaces)": () => import("$/spaces"),
  "spaces' groups alone (<spell-app>'s)": () => import("$/spaces/models/projectGroups"),
  "spaces' disk reader (tests, the language server)": () => import("$/spaces/server/node/projects/disk-fetch"),
  "spaces' routes (the page server, `yarn start:server`)": () => import("$/spaces/server/node/routes/api"),
  "the language server's workspace": () => import("$/lsp/SpellDiskWorkspace"),
  "the spell command's project finder": () => import("$/cli/resolveProject")
}

describe("spell's project groups", () => {
  test("are the five groups, each an address in its space", () => {
    expect(SPACES.PROJECT_GROUPS.map(({ path, space }) => [path, space])).toEqual([
      ["owen@spell", "owen@spell"],
      ["@spell/examples", "@spell"],
      ["@spell/guides", "@spell"],
      ["@spell/library", "@spell"],
      ["@spell/test", "@spell"]
    ])
  })

  test.each(Object.entries(ENTRIES))("are registered with spell by %s", async (_name, load) => {
    vi.resetModules()
    await load()
    const { SpellSetup } = await import("$/spell/SpellSetup")
    expect(Object.keys(SpellSetup.projectRoots)).toEqual(
      expect.arrayContaining(SPACES.PROJECT_GROUPS.map((it) => it.path))
    )
  })
})

describe("spaces' own names", () => {
  test("are known by spaces' list, never by the `__` alone (J52)", () => {
    for (const name of ["__me.json5", "__org.json5", "__project.json5", "__members", "__pack", "__parts", "__data"])
      expect(SPACES.isSpaceName(name), name).toBe(true)
    for (const name of ["__init__.py", "__snapshots__", "__pycache__", "__Class__.tsx.template", "__mine", "me.json5"])
      expect(SPACES.isSpaceName(name), name).toBe(false)
  })
})
