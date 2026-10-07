import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"
import { compiledFixture, fixtureProjectNames } from "$/spell/test"
import { CLI } from "$/cli"

/**
 * The CORE CONTRACT:  every fixture project, compiled for each target, run headless as `spell run` runs it, prints
 * the SAME thing, line for line -- and what it prints is pinned in `__snapshots__/contract/<Project>.out.txt`.
 * - So a target's core is right when it prints what the snapshot says:  `js/solid` and `ts/solid` share `@spell/core`
 *   today;  Python's core (a later epic) must print the same.  What a core must HAVE is `SC.SpellCore`
 *   (`packages/core/src/spellCore.types.ts`).
 * - The snapshot catches a broken core method, which both targets would share.
 * - In a FAKE PAGE (linkedom, `RunSpec.dom`):  `start the game` draws into it, and what it drew is printed last,
 *   so drawing is compared too.  `Math.random()` is seeded, so Solitaire deals the same cards every run.
 * - Changed on purpose:  `yarn vp test run src/contract.test.ts -u`, then read the diff.
 */
const TARGET_FILES: Record<string, string> = { "js/solid": ".mjs", "ts/solid": ".mts" }

/** What fixture `name` prints when its `target` code runs, as `spell run` would run it. */
async function printed(name: string, target: string): Promise<string> {
  const code = compiledFixture(name, target)
  const extension = TARGET_FILES[target]
  const { exitCode, output } = await CLI.runCode("run", name, code, { extension, capture: true, dom: true })
  expect(exitCode, `${name} on ${target} exited ${exitCode}:\n${output}`).toBe(CLI.EXIT.OK)
  return output
}

describe("the core contract:  every target prints the same", () => {
  test("every target has a file extension to run from", () => {
    expect(Object.keys(SP.TARGETS).sort()).toEqual(Object.keys(TARGET_FILES).sort())
  })

  for (const name of fixtureProjectNames()) {
    test(
      name,
      async () => {
        const [js, ts] = await Promise.all([printed(name, "js/solid"), printed(name, "ts/solid")])
        expect(ts.split("\n")).toEqual(js.split("\n"))
        await expect(js).toMatchFileSnapshot(resolve(import.meta.dirname, `__snapshots__/contract/${name}.out.txt`))
      },
      60_000
    )
  }
})
