import { describe, test, expect, vi } from "vite-plus/test"

import { core } from "spell-lang/core"
import { runSpellFiles } from "spell-lang/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * The OUTLINE style (epic page `outline-spell`) on a whole project:  the frozen card library, `@spell/test/cards`.
 * - The style itself, line by line:  spell-lang's own `outline.test.ts`.
 */
describe("outline style", () => {
  test("the card library's cards, deck and piles pass their own tests (P5)", () => {
    const files = loadFixtureProject("cards")
    const lines: string[] = []
    const console = core.console as unknown as Record<string, (...args: unknown[]) => void>
    for (const method of ["log", "group", "groupCollapsed", "warn", "error", "info"].filter((it) => console[it])) {
      vi.spyOn(console, method).mockImplementation((...args) => void lines.push(args.join(" ")))
    }
    runSpellFiles(files)("")
    vi.restoreAllMocks()
    expect(lines.filter((line) => line.includes("❌"))).toEqual([])
    // a line for every check its five tests make (card setup, jokers, deck creation, deck with jokers, piles)
    expect(lines.filter((line) => line.includes("✅")).length).toBe(70)
  })
})
