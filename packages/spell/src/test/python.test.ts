import { beforeAll, describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { describePyrightError, pyright, type PyrightResult } from "$/spell/node/pyright"
import { PYTHON_FIXTURES, compiledFixture, fixtureImports, fixturePath } from "$/spell/test"

/**
 * The Python fixtures' compiled Python (the `py` target, `P.PyWriter`), type-checked by pyright:  see `pyright()`.
 * - What pyright reports is a snapshot beside each fixture, one error a line:
 *   `projects/test/<Project>/<Project>.snapshot.pyright.txt`.
 *   So every place the type-hinted Python falls short shows there:  a change is a diff to read.
 * - Refresh it after a deliberate change:  `yarn test:fixtures:bless`.
 * - Each fixture's error count is printed on stderr on every run, e.g. `Cards:  0 pyright errors`.
 * - Each is checked as its own module, `cards.py`, beside the fixtures it imports.
 * - Epic `python-target` P13.
 */
let result: PyrightResult

/** Fixture `name`'s module file name, as another imports it:  `Cards` => `cards.py`. */
function moduleFile(name: string): string {
  return `${P.PyWriter.projectModule(`@spell/project/${name}`)}.py`
}

beforeAll(() => {
  const names = [...PYTHON_FIXTURES]
  const imported = names.flatMap((name) => Object.values(fixtureImports(name)))
  const files = Object.fromEntries(
    [...new Set([...names, ...imported])].map((name) => [moduleFile(name), compiledFixture(name, "py")])
  )
  result = pyright(files)
}, 120_000)

describe("fixture projects as Python, checked by pyright", () => {
  test("FizzBuzz checks clean", () => {
    expect(result.errors[moduleFile("FizzBuzz")]).toEqual([])
  })

  for (const name of PYTHON_FIXTURES) {
    test(name, async () => {
      const errors = result.errors[moduleFile(name)]!
      process.stderr.write(`${name}:  ${errors.length} pyright error${errors.length === 1 ? "" : "s"}\n`)
      const report = errors.map(describePyrightError).join("\n")
      await expect(report ? `${report}\n` : "").toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.pyright.txt`))
    })
  }
})
