import { readFileSync, readdirSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { PY } from "$/py"
import { SP } from "$/spell"
import { parseSpellProject } from "$/spell/test"

/**
 * Every name in today's spell that steps aside in Python (epic `python-target` P26):  a keyword, or a builtin a
 * variable would hide, written with PEP 8's trailing underscore (`class_`, `list_`, `position_`).
 * - Owen, on the durable doc:  "add all 'clashes in current spell' here so I can tell you what to do with them".
 * - Where they come from:
 *   - every spell project:  the `@spell` space's built-ins (examples, library, `packages/spaces/@spell/`) and the
 *     test projects (`tests/spaces/@spell/test/`), each compiled to Python
 *   - the core's own methods, `spellCore.declarations.json`, as Python names them
 * - Pinned in `pythonNameClashes.snapshot.json`, beside this:  a new clash is a diff to read.
 *   The durable doc's "PEP 8's names" table lists them for Owen to decide each.
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

/** Each project folder under `root`:  one with a `project.json`. */
function projectsIn(root: string): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, entry.name))
    .filter((dir) => {
      try {
        readFileSync(resolve(dir, SP.PROJECT_FILE))
        return true
      } catch {
        return false
      }
    })
}

/** The `.spell` files project `dir` imports, as `parseSpellProject()` takes them. */
function spellFilesOf(dir: string): Array<{ path: string; contents: string }> {
  const { imports } = JSON.parse(readFileSync(resolve(dir, SP.PROJECT_FILE), "utf8")) as {
    imports: Array<{ path: string; active?: boolean }>
  }
  return imports
    .filter(({ path, active }) => active !== false && path.endsWith(".spell"))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(dir, `.${path}`), "utf8") }))
}

describe("Python's name clashes in today's spell", () => {
  test("pinned:  every name that steps aside, and where", async () => {
    const repo = resolve(import.meta.dirname, "../../../..")
    const naming = new NotingNaming(P.Naming.PYTHON, P.Naming.PYTHON_CLASHES)
    const writer = new PY.PyWriter()
    writer.naming = naming
    const dirs = [
      ...projectsIn(resolve(repo, "packages/spaces/@spell/examples")),
      ...projectsIn(resolve(repo, "packages/spaces/@spell/library")),
      ...projectsIn(resolve(repo, "tests/spaces/@spell/test"))
    ]
    for (const dir of dirs) {
      // its place, e.g. `@spell/examples/Solitaire`
      naming.where = dir.slice(dir.lastIndexOf("@spell"))
      const { scope, files } = parseSpellProject(spellFilesOf(dir))
      const parts = files.map(({ match, compiled }) =>
        match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled
      )
      SP.SpellProject.combineCompiled(parts, writer, "", scope)
    }
    // the core's own methods, as Python names them
    naming.where = "the core's methods (spellCore.declarations.json)"
    const core = JSON.parse(
      readFileSync(resolve(import.meta.dirname, "../../../../packages/core/spellCore.declarations.json"), "utf8")
    ) as { statements: Array<{ kind: string; name: string }> }
    for (const { kind, name } of core.statements) if (kind === "method") naming.nameOf(name, "method")

    const clashes = [...naming.noted.values()].sort(
      (a, b) => a.spell.localeCompare(b.spell) || a.where.localeCompare(b.where)
    )
    await expect(`${JSON.stringify(clashes, null, 2)}\n`).toMatchFileSnapshot("pythonNameClashes.snapshot.json")
  }, 120_000)
})
