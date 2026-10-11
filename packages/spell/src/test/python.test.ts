import { beforeAll, describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { describePyrightError, pyright, type PyrightResult } from "$/spell/node/pyright"
import { PYTHON_FIXTURES, compiledFixture, fixtureImports, fixturePath } from "$/spell/test"

/**
 * The fixtures compiled to Python (the `py` target, `P.PyWriter`), checked by pyright against `spell_core`'s source
 * -- see `pyright()` -- what it reports, against `projects/test/<Project>/<Project>.snapshot.pyright.txt`
 * (epic `python-target` P13).
 * - So every place the hinted Python falls short shows, as a line of that file:  a change is a diff to read.
 *   Blessed with the fixtures:  `yarn test:fixtures:bless`.
 * - Each fixture's error count is printed on every run, e.g. `Cards:  0 pyright errors`, on stderr.
 * - Each is checked as its own module, `cards.py`, beside the fixtures it imports.
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
