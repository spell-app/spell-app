import { beforeAll, describe, test, expect } from "vite-plus/test"

import { describeTypecheckError, typecheck, type TypecheckResult } from "$/spell/node/typecheck"
import { compiledFixture, fixturePath, fixtureProjectNames } from "$/spell/test"

/**
 * Every fixture project compiled as TypeScript (the `ts/solid` target, `P.TSWriter`), checked by `tsc` against
 * `@spell/core`'s own types -- see `typecheck()` -- what it reports, against
 * `projects/test/<Project>/<Project>.snapshot.tsc.txt`.
 * - So every place the typed output falls short shows, as a line of that file:  a change is a diff to read.
 *   Blessed with the fixtures:  `yarn test:fixtures:bless`.
 * - Each fixture's error count is printed on every run, e.g. `Solitaire:  35 tsc errors`:  on stderr, as Vitest
 *   hides a passing test's `console` output.
 * - Errors in `core`'s own files fail the test:  only the fixtures' may be listed.
 */
let result: TypecheckResult

beforeAll(() => {
  const files = Object.fromEntries(
    fixtureProjectNames().map((name) => [`${name}.ts`, compiledFixture(name, "ts/solid")])
  )
  result = typecheck(files)
}, 60_000)

describe("fixture projects as TypeScript, checked by tsc", () => {
  test("core's own files check clean", () => {
    expect(result.other).toEqual([])
  })

  test("FizzBuzz checks clean", () => {
    expect(result.errors["FizzBuzz.ts"]).toEqual([])
  })

  for (const name of fixtureProjectNames()) {
    test(name, async () => {
      const errors = result.errors[`${name}.ts`]!
      process.stderr.write(`${name}:  ${errors.length} tsc error${errors.length === 1 ? "" : "s"}\n`)
      const text = errors.map((error) => `${describeTypecheckError(error)}\n`).join("")
      await expect(text).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.tsc.txt`))
    })
  }
})
