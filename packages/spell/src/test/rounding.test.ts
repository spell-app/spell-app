import { execFileSync } from "child_process"
import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { PY } from "$/py"
import { SP } from "$/spell"
import { parseSpellProject } from "$/spell/test"

/**
 * spell's rounding, `round price up`, as each platform says it (epic `python-target` P24, Owen on Q29):
 * - javascript:  `Math.round()`, `Math.ceil()`, `Math.floor()`
 * - Python:  `math.floor(x + 0.5)`, `math.ceil()`, `math.floor()` -- NOT Python's `round()`, which rounds a half to
 *   the even number (`round(2.5)` is `2`):  javascript's `Math.round()` rounds a half up, `2.5` to `3`, `-2.5` to `-2`.
 * - The Python is RUN, and prints what javascript's `Math.*` give for the same numbers.
 */
const SOURCE = [
  "print round 2.5",
  "print round -2.5",
  "print round 2.4",
  "print round 3.5",
  "print round 2.1 up",
  "print round -2.1 up",
  "print round 2.9 down",
  "print round -2.9 down"
]

/** spell_core's uv project. */
const SPELL_CORE = resolve(import.meta.dirname, "../../../py/core")

/** `SOURCE`, one file of its own project, compiled by `writer`. */
function compiled(writer: P.ProgramWriter): string {
  const { scope, files } = parseSpellProject([{ path: "/Rounding.spell", contents: SOURCE.join("\n") }])
  const parts = files.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
  return SP.SpellProject.combineCompiled(parts, writer, SP.SpellProject.importHeaderFor(scope, writer), scope)
}

describe("rounding", () => {
  test("javascript says Math.round(), Math.ceil(), Math.floor()", () => {
    const code = compiled(P.JSWriter.instance)
    expect(code).toContain("Math.round(2.5)")
    expect(code).toContain("Math.ceil(2.1)")
    expect(code).toContain("Math.floor(2.9)")
  })

  test("Python says math.floor(x + 0.5), math.ceil(), math.floor(), and prints what javascript does", () => {
    const code = compiled(PY.PyWriter.instance)
    expect(code).toMatch(/^import math\n/)
    expect(code).toContain("math.floor(2.5 + 0.5)")
    expect(code).toContain("math.ceil(2.1)")
    const folder = mkdtempSync(join(tmpdir(), "spell-rounding-"))
    try {
      writeFileSync(join(folder, "rounding.py"), code)
      // through uv, in spell_core's project:  it prints a number through `core.console`
      const printed = execFileSync(
        "uv",
        ["run", "--quiet", "--project", SPELL_CORE, "python", join(folder, "rounding.py")],
        {
          encoding: "utf8"
        }
      )
      const javascript = [
        Math.round(2.5),
        Math.round(-2.5),
        Math.round(2.4),
        Math.round(3.5),
        Math.ceil(2.1),
        Math.ceil(-2.1),
        Math.floor(2.9),
        Math.floor(-2.9)
      ]
      expect(printed.trim().split("\n").map(Number)).toEqual(javascript)
    } finally {
      rmSync(folder, { recursive: true, force: true })
    }
  })
})
