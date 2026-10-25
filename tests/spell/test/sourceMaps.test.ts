import { describe, expect, test } from "vite-plus/test"

import { compiledFixture, compiledFixtureWithMap, fixtureProjectNames } from "spell-app/spaces/test"

/**
 * Source maps over every fixture project (epic `elemental-spell` P14):  compiled with its map, each project's code is
 * EXACTLY its code without one, for both javascript-family targets, so the map changes nothing that runs.
 * - The marks themselves:  spell-parser's `SourceMaps.test.ts`.
 */
describe("source maps change no compiled code", () => {
  for (const name of fixtureProjectNames()) {
    for (const target of ["js/solid", "ts/solid"]) {
      test(`${name} (${target})`, () => {
        const { code, map } = compiledFixtureWithMap(name, target)
        expect(code).toBe(compiledFixture(name, target))
        expect(map.mappings.replaceAll(";", "").length, "it maps some lines").toBeGreaterThan(0)
      })
    }
  }
})
