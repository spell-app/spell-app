import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { PY } from "spell-lang/py"
import { SP } from "spell-lang/spell"
import { parseSpellProject } from "spell-lang/spell/test"
import environment from "spell-app/spaces/server/node/environment"
import { fixtureImportScope, fixtureProjectId, fixtureProjectNames, loadFixtureProject } from "spell-app/spaces/test"

/**
 * Every name in today's spell that steps aside in Python (epic `python-target` P26):
 * a keyword, or a builtin a variable would hide,
 * written with PEP 8's trailing underscore (`class_`, `list_`, `position_`).
 * - Owen, on the epic's guide:  "add all 'clashes in current spell' here so I can tell you what to do with them".
 * - Where they come from:
 *   - every frozen test project (`spaces/@spell/test/`), each compiled to Python
 *     - NOT the `@spell` space's built-ins (examples, library):  they get edited, which would move this snapshot
 *   - the core's own methods, `core.declarations.json5`, as Python names them
 * - Pinned in `pythonNameClashes.snapshot.json5`, beside this:  a new clash is a diff to read.
 * - The guide's "PEP 8's names" table lists them for Owen to decide each.
 */

/** One clash:  spell's name, what Python writes, its kind, and where. */
type Clash = { spell: string; python: string; kind: P.NameKind; where: string }

/** A `Naming` that notes each name it makes step aside, into `noted`. */
class NotingNaming extends P.Naming {
  where = ""
  readonly noted = new Map<string, Clash>()
  nameOf(name: string, kind: P.NameKind): string {
    const written = super.nameOf(name, kind)
    if (written !== new P.Naming(this.map).nameOf(name, kind)) {
      const key = `${name}|${kind}|${this.where}`
      if (!this.noted.has(key)) this.noted.set(key, { spell: name, python: written, kind, where: this.where })
    }
    return written
  }
}

describe("Python's name clashes in today's spell", () => {
  test("pinned:  every name that steps aside, and where", async () => {
    const naming = new NotingNaming(P.Naming.PYTHON, P.Naming.PYTHON_CLASHES)
    const writer = new PY.PyWriter()
    writer.naming = naming
    for (const name of fixtureProjectNames()) {
      // its place, e.g. `@spell/test/solitaire`
      naming.where = fixtureProjectId(name)
      // as it compiles:  against what it imports, e.g. the card library
      const { scope, files } = parseSpellProject(loadFixtureProject(name), { parentScope: fixtureImportScope(name) })
      const parts = files.map(({ match, compiled }) =>
        match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled
      )
      SP.SpellProject.combineCompiled(parts, writer, "", scope)
    }
    // the core's own methods, as Python names them
    naming.where = "the core's methods (core.declarations.json5)"
    const core = JSON.parse(readFileSync(resolve(environment.coreDir, "core.declarations.json5"), "utf8")) as {
      statements: Array<{ kind: string; name: string }>
    }
    for (const { kind, name } of core.statements) if (kind === "method") naming.nameOf(name, "method")

    const clashes = [...naming.noted.values()].sort(
      (a, b) => a.spell.localeCompare(b.spell) || a.where.localeCompare(b.where)
    )
    await expect(`${JSON.stringify(clashes, null, 2)}\n`).toMatchFileSnapshot("pythonNameClashes.snapshot.json5")
  }, 120_000)
})
