import { execFileSync } from "child_process"
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { basename, join, resolve } from "path"

import environment from "$/spell/node/environment"
import { nodeBinary } from "$/spell/node/typecheck"

/**
 * `pyright` on compiled spell's Python (the `py` target):  what it says is wrong, by file (epic `python-target` P13).
 * - Checked against `spell_core`'s source (`packages/core/py`), Python 3.12, pyright's `basic` mode:  what VS Code's
 *   Python extension checks by default.
 * - `files`:  each module's file name, e.g. `solitaire.py` or `cards.py`, and its code.  Written to a temp folder,
 *   checked together, so one may import another (`from cards import Card`).
 * - Used by spell's `python.test.ts`, as `typecheck()` is for TypeScript.
 * - NODE-ONLY:  runs the workspace's `pyright` (an npm package:  no Python needed to check) in a child process.
 */
export function pyright(files: Record<string, string>): PyrightResult {
  const folder = mkdtempSync(join(tmpdir(), "spell-pyright-"))
  try {
    for (const [name, code] of Object.entries(files)) writeFileSync(join(folder, name), code)
    writeFileSync(join(folder, "pyrightconfig.json"), JSON.stringify(PYRIGHT_CONFIG, null, 2))
    const result: PyrightResult = { errors: Object.fromEntries(Object.keys(files).map((name) => [name, []])) }
    for (const diagnostic of runPyright(folder)) {
      const errors = result.errors[basename(diagnostic.file)]
      if (!errors || diagnostic.severity !== "error") continue
      errors.push({ line: diagnostic.range.start.line + 1, rule: diagnostic.rule ?? "", message: diagnostic.message })
    }
    return result
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/** What `pyright()` found:  each file's errors, by its name -- none:  `[]`. */
export type PyrightResult = { errors: Record<string, PyrightError[]> }

/** One pyright error:  1-based `line`, its `rule`, e.g. `reportAttributeAccessIssue`. */
export type PyrightError = { line: number; rule: string; message: string }

/** `"12 reportAttributeAccessIssue Cannot access attribute ..."`:  one line, as a snapshot holds it. */
export function describePyrightError({ line, rule, message }: PyrightError): string {
  return `${line} ${rule} ${message.split("\n")[0]}`
}

/** How the compiled Python is checked:  against `spell_core`'s source, Python 3.12, `basic`. */
const PYRIGHT_CONFIG = {
  pythonVersion: "3.12",
  typeCheckingMode: "basic",
  extraPaths: [resolve(environment.spellCoreDir, "..", "py")]
}

/** One of pyright's diagnostics, as `--outputjson` writes it. */
type Diagnostic = {
  file: string
  severity: "error" | "warning" | "information"
  message: string
  rule?: string
  range: { start: { line: number; character: number } }
}

/** `pyright --outputjson` in `folder`:  its diagnostics.  It exits non-zero when it finds errors:  that's fine here. */
function runPyright(folder: string): Diagnostic[] {
  const files = readdirSync(folder).filter((name) => name.endsWith(".py"))
  let output: string
  try {
    output = execFileSync(nodeBinary("pyright"), ["--outputjson", "--project", folder, ...files], {
      cwd: folder,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    })
  } catch (error) {
    output = String((error as { stdout?: string }).stdout ?? "")
  }
  return (JSON.parse(output) as { generalDiagnostics: Diagnostic[] }).generalDiagnostics
}
