import { describe, expect, test, vi } from "vite-plus/test"

import { SPACES } from "$/spaces"

/**
 * Spell's project groups are spaces' (`SPACES.PROJECT_GROUPS`):  spell's registry starts empty, and every program
 * that reads a spell path must load them first, or every address is "invalid" (epic `people-and-orgs` P15).
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
  test("are the five groups, each with a place", () => {
    expect(SPACES.PROJECT_GROUPS.map(({ path, place }) => [path, place])).toEqual([
      ["@user:projects", "owen@spell"],
      ["@system:examples", "@spell/examples"],
      ["@system:guides", "@spell/guides"],
      ["@system:library", "@spell/library"],
      ["@test:fixtures", "@spell/test"]
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
