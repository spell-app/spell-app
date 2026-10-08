import { writeFileSync } from "fs"
import { sep } from "path"
import type { TextEdit } from "vscode-languageserver"

import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell format [projects...]`:  tidy the whitespace of `.spell` files, as VS Code's "Format Document" does --
 * `SpellLanguageService.formatting()`, with `trimFinalNewlines` and `insertFinalNewline` on.
 * - A project:  each of its `.spell` files.  A `.spell` file:  just that one.
 * - Lists each file it changed -- or, with `--check`, each it WOULD change, writing nothing, and exits 1 if any.
 * - NEVER writes inside `projects/test/`:  test projects stay frozen.  `--check` may read them.
 * - Returns the exit code.
 */
export async function formatCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.FormatOptions
): Promise<number> {
  const files: SP.SpellFile[] = []
  for (const resolved of await session.projects(args)) {
    const project = resolved.kind === "file" ? resolved.file.project : resolved.project
    await session.parse(project)
    const spellFiles = project.spellFiles.filter((it) => it.location.extension === ".spell")
    files.push(...(resolved.kind === "file" ? spellFiles.filter((it) => it.path === resolved.file.path) : spellFiles))
  }
  if (!options.check) {
    const frozen = files.filter((file) => isTestProject(file.location.serverPath))
    if (frozen.length) {
      const names = frozen.map((file) => `  ${session.relative(file.location.serverPath)}`)
      throw new CLI.CliError([`Won't format test projects -- they stay frozen:`, ...names].join("\n"))
    }
  }

  const changed: string[] = []
  for (const file of new Set(files)) {
    const text = file.contents ?? ""
    const edits = session.service.formatting(file, {
      tabSize: 2,
      insertSpaces: false,
      trimFinalNewlines: true,
      insertFinalNewline: true
    })
    const formatted = applyEdits(text, edits)
    if (formatted === text) continue
    const path = file.location.serverPath
    changed.push(session.relative(path))
    if (!options.check) writeFileSync(path, formatted)
  }

  for (const path of changed) session.out(path)
  const count = `${changed.length} file${changed.length === 1 ? "" : "s"}`
  if (options.check) {
    session.err(changed.length ? `${count} would change` : "All formatted")
    return changed.length ? CLI.EXIT.ERRORS : CLI.EXIT.OK
  }
  session.err(changed.length ? `Formatted ${count}` : "All formatted already")
  return CLI.EXIT.OK
}

/** Is `path` inside a test project, `projects/test/...`? */
export function isTestProject(path: string): boolean {
  return path.startsWith(environment.testFilesRoot + sep)
}

/** `text` with `edits` made -- as an editor would, each against the ORIGINAL text. */
export function applyEdits(text: string, edits: TextEdit[]): string {
  const lineStarts = [0]
  for (let index = text.indexOf("\n"); index !== -1; index = text.indexOf("\n", index + 1)) lineStarts.push(index + 1)
  const offset = ({ line, character }: TextEdit["range"]["start"]) =>
    Math.min((lineStarts[line] ?? text.length) + character, text.length)
  const ordered = edits
    .map((edit) => ({ start: offset(edit.range.start), end: offset(edit.range.end), newText: edit.newText }))
    .sort((a, b) => b.start - a.start)
  let result = text
  for (const { start, end, newText } of ordered) result = result.slice(0, start) + newText + result.slice(end)
  return result
}
