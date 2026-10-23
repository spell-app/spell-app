import { describe, expect, test } from "vite-plus/test"

import { SP } from "spell-parser/spell"
import { compiledFixture, fixtureLanguages, fixtureProjectNames } from "spell-app/spaces/test"
import { CLI } from "spell-app/cli"

/**
 * A test project with files in another language than English runs its own spell tests, and they all pass
 * (epic `spanish`).
 * - So a Spanish program doesn't only compile:  `la carta es la reina de espadas` is true of the queen of spades.
 * - Each compiled as `compiledFixture()` does, then run as `spell run` runs it:  in a fake page, so a game that draws
 *   (Solitario) deals and draws too (epic `spanish` P21:  it was `cartas`, the cards alone, before).
 * - Every `esperar que ...` of every test must pass;  a failing one is listed, as it printed.
 */
describe("fixtures in other languages pass their own tests", () => {
  for (const name of fixtureProjectNames().filter((name) => fixtureLanguages(name).some((lang) => lang !== "en"))) {
    test(
      name,
      async () => {
        expect(await failedChecks(name)).toEqual([])
      },
      60_000
    )
  }
})

/** Each check of test project `name`'s spell tests that failed, as it printed:  a line starting `❌`. */
async function failedChecks(name: string): Promise<string[]> {
  const { exitCode, output, stdout } = await CLI.runCode("run", name, compiledFixture(name), {
    extension: ".mjs",
    capture: true,
    dom: true,
    seed: 1,
    messages: SP.SpellWords.messagesFor(fixtureLanguages(name)[0]!),
    pauses: false
  })
  expect(exitCode, `${name} exited ${exitCode}:\n${output}`).toBe(CLI.EXIT.OK)
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(FAILED))
}

/** How a failed check's line starts, in every language. */
const FAILED = "❌"
