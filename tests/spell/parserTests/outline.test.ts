import { describe, test, expect, vi } from "vite-plus/test"

import { core } from "spell-lang/core"
import { runSpellFiles } from "spell-lang/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * The OUTLINE style (epic page `outline-spell`) on a whole frozen project, `outline-solitaire`.
 * - The style itself, line by line:  spell-lang's own `outline.test.ts`.
 */
describe("outline style", () => {
  test("the outline Solitaire's cards pass their own tests, as today's cards do (P5)", () => {
    // its deck, card and piles -- not the game itself, which starts an app
    const files = loadFixtureProject("outline-solitaire").filter(({ path }) => !path.endsWith("Solitaire.spell"))
    const lines: string[] = []
    const console = core.console as unknown as Record<string, (...args: unknown[]) => void>
    for (const method of ["log", "group", "groupCollapsed", "warn", "error", "info"].filter((it) => console[it])) {
      vi.spyOn(console, method).mockImplementation((...args) => void lines.push(args.join(" ")))
    }
    runSpellFiles(files)("")
    vi.restoreAllMocks()
    expect(lines.filter((line) => line.includes("❌"))).toEqual([])
    // 29:  since its deck deals its cards as it's made (`- to create it:`), it checks 52 cards once, not twice
    expect(lines.filter((line) => line.includes("✅")).length).toBe(29)
  })
})
