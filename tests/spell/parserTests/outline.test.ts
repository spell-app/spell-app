import { describe, test, expect, vi } from "vite-plus/test"

import { core } from "spell-parser/core"
import { runSpellFiles } from "spell-parser/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * The OUTLINE style (epic page `outline-spell`) on whole files:  the Solitaire example's cards, deck and piles
 * (not its game, `Solitaire.spell`, which starts an app).
 * - The style itself, line by line:  spell-parser's own `outline.test.ts`.
 */
describe("outline style", () => {
  test("Solitaire's cards, deck and piles pass their own tests (P5)", () => {
    const files = loadFixtureProject("Solitaire").filter(({ path }) => path !== "/Solitaire.spell")
    const lines: string[] = []
    const console = core.console as unknown as Record<string, (...args: unknown[]) => void>
    for (const method of ["log", "group", "groupCollapsed", "warn", "error", "info"].filter((it) => console[it])) {
      vi.spyOn(console, method).mockImplementation((...args) => void lines.push(args.join(" ")))
    }
    runSpellFiles(files)("")
    vi.restoreAllMocks()
    expect(lines.filter((line) => line.includes("❌"))).toEqual([])
    // a line for every check its five tests make (card setup, jokers, deck creation, deck with jokers, piles)
    expect(lines.filter((line) => line.includes("✅")).length).toBe(69)
  })
})
