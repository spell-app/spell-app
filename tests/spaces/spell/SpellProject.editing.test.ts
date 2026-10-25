import { describe, test, expect, beforeAll, afterEach, vi } from "vite-plus/test"

import { SP } from "spell-parser/spell"
import { installDiskFetch } from "spell-app/spaces/server/node/projects/disk-fetch"
import { fixtureProjectId } from "spell-app/spaces/test"

/**
 * `SpellProject` as an editor drives it:  which files it parses, and `updateText()` on each edit.
 * - Loads the Solitaire example from disk, but never saves:  edits stay in memory, and each test puts its
 *   text back.
 * - spaces' since epic `repo-split` C11 (spell-parser's `tests/spell/` before):  it loads projects through spaces'
 *   disk reader, which spell-parser's tests never import.
 */
describe("SpellProject editing", () => {
  const solitaire = fixtureProjectId("Solitaire")
  const project = new SP.SpellProject(solitaire)
  const game = new SP.SpellFile(`${solitaire}/Solitaire.spellx`)
  let gameText: string

  beforeAll(async () => {
    installDiskFetch()
    await project.parse()
    gameText = game.contents!
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await project.updateText(game, gameText)
  })

  test("`spellFiles` are its active spell imports (`.spell` or `.spellx`), in order -- and each `isActive`", () => {
    // its cards, deck and piles, then its game
    expect(project.spellFiles.map((file) => file.filePath)).toEqual([
      "/Card.spellx",
      "/Deck.spellx",
      "/Pile.spellx",
      "/Solitaire.spellx"
    ])
    expect(project.spellFiles.every((file) => file.isActive)).toBe(true)
    expect(new SP.SpellFile(`${solitaire}/NotImported.spell`).isActive).toBe(false)
  })

  test("`updateText()` takes the text, and returns the files whose parse changed", async () => {
    const before = game.match
    const changed = await project.updateText(game, `${gameText}\nprint 1`)
    expect(game.contents).toBe(`${gameText}\nprint 1`)
    expect(game.match).not.toBe(before)
    expect(changed).toContain(game)
    expect(await project.updateText(game, game.contents!)).toEqual([])
  })

  test("a file it doesn't parse just takes the text", async () => {
    const other = new SP.SpellFile(`${solitaire}/NotImported.spell`)
    expect(await project.updateText(other, "print 1")).toEqual([other])
    expect(other.contents).toBe("print 1")
    expect(other.match).toBeUndefined()
  })

  test("parses from scratch straight away if the incremental parse can't cope", async () => {
    project.incremental = undefined
    await project.updateText(game, `${gameText}\nprint 1`)
    expect(project.incremental).toBeDefined()
    for (const file of project.spellFiles) expect(file.match, file.path).toBeDefined()
  })

  test("a crash is left in `parseError`, NOT thrown -- and cleared by the next good parse", async () => {
    vi.spyOn(project, "parseImports").mockImplementationOnce(() => {
      throw new Error("boom")
    })
    project.incremental = undefined
    await expect(project.updateText(game, `${gameText}\nprint 1`)).resolves.toBeDefined()
    expect(project.parseError).toBe("boom")

    await project.updateText(game, `${gameText}\nprint 2`)
    expect(project.parseError).toBeUndefined()
  })
})
