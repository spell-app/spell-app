import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

/**
 * The page side (`spellPage.ts`, `spell-page.js`) is a Python app's page's `@spell/core`:
 * the program's drawing half imports from it what compiled javascript imports from the runtime (`spellRuntime.ts`).
 * - Read from the two files' `export { ... }` lists:  importing either sets up a page.
 * - drawable-thing added `css` to the runtime and not here, and a drawable program's page failed to load:
 *   "The requested module '@spell/core' does not provide an export named 'css'" (epic `python-target` P28).
 */
const RUNNER = resolve(import.meta.dirname, "../../../src/app/runner")

/** What only a runner, or compiled TypeScript, takes from the runtime:  never the drawing half of a Python app. */
const RUNNER_ONLY = ["appIsMounted", "unmountApp", "E", "SpellElement"]

/** The names in `file`'s last `export { ... }` list. */
function exportsOf(file: string): string[] {
  const lists = [...readFileSync(resolve(RUNNER, file), "utf8").matchAll(/^export \{([^}]*)\}/gm)]
  return lists
    .at(-1)![1]!
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
}

describe("the page side's @spell/core", () => {
  test("exports all compiled javascript imports from the runtime", () => {
    const page = new Set(exportsOf("spellPage.ts"))
    const missing = exportsOf("spellRuntime.ts").filter((name) => !RUNNER_ONLY.includes(name) && !page.has(name))
    expect(missing).toEqual([])
  })
})
