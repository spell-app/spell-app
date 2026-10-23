import { beforeAll, describe, test, expect } from "vite-plus/test"

import { describeTypecheckError, typecheck, type TypecheckResult } from "spell-lang/spell/node/typecheck"
import { SP } from "spell-lang/spell"
import { solidSample } from "spell-lang/spell/test"
import { compiledFixture, fixtureImports, fixtureProjectNames, snapshotPath } from "spell-app/spaces/test"

/**
 * Every fixture project compiled as TypeScript (the `ts/solid` target, `P.TSWriter`), checked by `tsc` against
 * `@spell/core`'s own types -- see `typecheck()` -- what it reports, against
 * `<Project>.snapshot.tsc.txt`, with its other snapshots (`snapshotPath()`).
 * - So every place the typed output falls short shows, as a line of that file:  a change is a diff to read.
 *   Blessed with the fixtures:  `yarn spell:test:fixtures:bless`.
 * - Each fixture's error count is printed on every run, e.g. `Solitaire:  35 tsc errors`:  on stderr, as Vitest
 *   hides a passing test's `console` output.
 * - Errors in `core`'s own files fail the test:  only the fixtures' may be listed.
 * - Checked with them, in the same `tsc` run:  `Cards.sample.tsx` (`solidSample()`), the Solid TypeScript the target
 *   writes, by hand -- JSX, `<ui-*>` tags and standard decorators must check clean -- and `MISTAKES`, which must not.
 * - Compiled spell's elements are checked against this app's types (`typecheck()`'s `APP_DIR`):
 *   why the test is spell-app's.
 */
let result: TypecheckResult

/** A file of JSX mistakes `tsc` must catch:  so JSX is checked as Solid's, not let through as `any`. */
const MISTAKES = `import { Show } from "solid-js"
export const count: number = <div class="count" />
export const shown = <Show when={true} fallbak={<i />}>{"yes"}</Show>
`

beforeAll(() => {
  const files = Object.fromEntries(
    fixtureProjectNames().map((name) => [`${name}.tsx`, compiledFixture(name, "ts/solid")])
  )
  // a fixture's imports are files checked beside it, another fixture's:  `@spell/test/cards` => `cards.tsx`
  const imports = fixtureProjectNames().flatMap((name) => Object.entries(fixtureImports(name)))
  const fileOf = (imported: string) => `${imported.split("/").at(-1)}.tsx`
  for (const [, imported] of imports) files[fileOf(imported)] ??= compiledFixture(imported, "ts/solid")
  const projects = Object.fromEntries(
    imports.map(([module, imported]) => [
      decodeURI(module.slice(SP.SPELL_PROJECT_MODULE.length)),
      `./${fileOf(imported)}`
    ])
  )
  result = typecheck({ ...files, "Cards.sample.tsx": solidSample(), "Mistakes.tsx": MISTAKES }, { projects })
}, 60_000)

describe("fixture projects as TypeScript, checked by tsc", () => {
  test("core's own files check clean", () => {
    expect(result.other).toEqual([])
  })

  test("hand-written Solid TypeScript checks clean:  JSX, a `<ui-*>` tag, `@prop`, `@drawn`, `@thing`", () => {
    expect(result.errors["Cards.sample.tsx"]).toEqual([])
  })

  test("JSX is Solid's:  a drawing isn't a number, and `<Show>` has no `fallbak`", () => {
    expect(result.errors["Mistakes.tsx"]!.map(({ line, code }) => `${line} ${code}`)).toEqual(["2 TS2322", "3 TS2769"])
  })

  test("FizzBuzz checks clean", () => {
    expect(result.errors["fizzbuzz.tsx"]).toEqual([])
  })

  for (const name of fixtureProjectNames()) {
    test(name, async () => {
      const errors = result.errors[`${name}.tsx`]!
      process.stderr.write(`${name}:  ${errors.length} tsc error${errors.length === 1 ? "" : "s"}\n`)
      const text = errors.map((error) => `${describeTypecheckError(error)}\n`).join("")
      await expect(text).toMatchFileSnapshot(snapshotPath(name, `${name}.snapshot.tsc.txt`))
    })
  }
})
