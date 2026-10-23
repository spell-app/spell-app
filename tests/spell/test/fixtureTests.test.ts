import { describe, expect, test } from "vite-plus/test"

import * as SC from "spell-lang/core"
import { compiledFixture, fixtureLanguages, fixtureProjectNames } from "spell-app/spaces/test"

/**
 * A fixture with files in another language than English runs its own spell tests, and they all pass (epic `spanish`).
 * - So a Spanish program doesn't only compile:  `la carta es la reina de espadas` is true of the queen of spades.
 * - Each fixture compiled as `compiledFixture()` does, then run on the core, as a runner would.
 * - Every `esperar que ...` of every test must pass;  a failing one is listed with its test.
 */
describe("fixtures in other languages pass their own tests", () => {
  for (const name of fixtureProjectNames().filter((name) => fixtureLanguages(name).some((lang) => lang !== "en"))) {
    test(name, () => {
      expect(failedChecks(name)).toEqual([])
    })
  }
})

/** Each check of fixture `name`'s spell tests that failed:  `<test>:  <what it said>`. */
function failedChecks(name: string): string[] {
  const code = compiledFixture(name)
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n")
    .replace(/^export /gm, "")
  const core = SC.core as unknown as RunningCore
  const failed: string[] = []
  const endTest = core.endTest.bind(core)
  core.endTest = () => {
    const test = core.ACTIVE_TEST
    for (const line of test?.output ?? []) {
      if (Array.isArray(line) && line[0] === "❌") failed.push(`${String(test!.message)}:  ${line.slice(1).join(" ")}`)
    }
    endTest()
  }
  try {
    const imported = ["Thing", "List", "App", "Drawable", "DrawableList", "h", "positionOf", "spellPosition", "trigger"]
    // oxlint-disable-next-line no-implied-eval -- running compiled spell, as a runner does, is the test
    const run = new Function("core", ...imported, code)
    core.things.quietly(() => run(core, ...imported.map((key) => (SC as Record<string, unknown>)[key])))
  } finally {
    core.endTest = endTest
  }
  return failed
}

/** The core's test hooks this test reads. */
type RunningCore = {
  ACTIVE_TEST?: { message: unknown; output: unknown[] }
  endTest: () => void
  things: { quietly: (run: () => unknown) => unknown }
}
