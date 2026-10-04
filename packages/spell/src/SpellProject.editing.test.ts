import { describe, test, expect, beforeAll, afterEach, vi } from "vite-plus/test"

import { SP } from "$/spell"
import { installDiskFetch } from "$/spell/node/disk-fetch"
import { fixtureProjectId } from "$/spell/test"

/**
 * `SpellProject` as an editor drives it:  which files it parses, and `updateText()` on each edit.
 * - Loads the frozen Solitaire fixture from disk, but never saves:  edits stay in memory, and each test puts its
 *   text back.
 */
describe("SpellProject editing", () => {
  const solitaire = fixtureProjectId("Solitaire")
  const project = new SP.SpellProject(solitaire)
  const card = new SP.SpellFile(`${solitaire}/Card.spell`)
  let cardText: string

  beforeAll(async () => {
    installDiskFetch()
    await project.parse()
    cardText = card.contents!
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await project.updateText(card, cardText)
  })

  test("`spellFiles` are its active `.spell` imports, in order -- and each `isActive`", () => {
    expect(project.spellFiles.map((file) => file.filePath)).toEqual([
      "/Card.spell",
      "/Deck.spell",
      "/Pile.spell",
      "/Solitaire.spell"
    ])
    expect(project.spellFiles.every((file) => file.isActive)).toBe(true)
    expect(new SP.SpellFile(`${solitaire}/NotImported.spell`).isActive).toBe(false)
  })

  test("`updateText()` takes the text, and returns the files whose parse changed", async () => {
    const before = card.match
    const changed = await project.updateText(card, `${cardText}\nprint 1`)
    expect(card.contents).toBe(`${cardText}\nprint 1`)
    expect(card.match).not.toBe(before)
    expect(changed).toContain(card)
    expect(await project.updateText(card, card.contents!)).toEqual([])
  })

  test("a file it doesn't parse just takes the text", async () => {
    const other = new SP.SpellFile(`${solitaire}/NotImported.spell`)
    expect(await project.updateText(other, "print 1")).toEqual([other])
    expect(other.contents).toBe("print 1")
    expect(other.match).toBeUndefined()
  })

  test("parses from scratch straight away if the incremental parse can't cope", async () => {
    project.incremental = undefined
    await project.updateText(card, `${cardText}\nprint 1`)
    expect(project.incremental).toBeDefined()
    for (const file of project.spellFiles) expect(file.match, file.path).toBeDefined()
  })

  test("a crash is left in `parseError`, NOT thrown -- and cleared by the next good parse", async () => {
    vi.spyOn(project, "parseImports").mockImplementationOnce(() => {
      throw new Error("boom")
    })
    project.incremental = undefined
    await expect(project.updateText(card, `${cardText}\nprint 1`)).resolves.toBeDefined()
    expect(project.parseError).toBe("boom")

    await project.updateText(card, `${cardText}\nprint 2`)
    expect(project.parseError).toBeUndefined()
  })
})
