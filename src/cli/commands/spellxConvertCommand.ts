import { writeFileSync } from "fs"

import { SP } from "spell-parser/spell"
import { SX } from "spell-parser/spellx"
import { CLI } from "spell-app/cli"

/**
 * `spell spellx convert [projects...]`:  write each `.spell` file as SPELLX, the same program in tags
 * (epic `elemental-spell` P12) -- `SX.SpellxWriter`.
 * - `Card.spell` => `Card.spellx` beside it;  `Carta.es.spell` => `Carta.es.spellx`, in Spanish spellx.
 * - What it converts:
 *   - a project:  each of its `.spell` files
 *   - a `.spell` file:  just that one
 *   - a `.spellx` file is left alone
 * - Lists each file it wrote, then a count on stderr.
 *   - `--dry-run`:  writes nothing, and prints each `.spellx` file instead, under a `// <path>` line.
 * - An existing `.spellx` beside it is written over.
 * - NOTE:  the `.spell` file stays.  A project holding both declares everything twice,
 *   so move one of them out before it compiles again.
 * - NEVER writes inside `spaces/@spell/test/`:  test projects stay frozen.  `--dry-run` may read them.
 * - Returns the exit code.
 */
export async function spellxConvertCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.SpellxConvertOptions
): Promise<number> {
  const files: SP.SpellFile[] = []
  for (const resolved of await session.projects(args)) {
    const project = resolved.kind === "file" ? resolved.file.project : resolved.project
    await session.parse(project)
    const spellFiles = project.spellFiles.filter((it) => it.location.isSpellFile && it.form === "spell")
    files.push(...(resolved.kind === "file" ? spellFiles.filter((it) => it.path === resolved.file.path) : spellFiles))
  }
  if (!options.dryRun) {
    const frozen = files.filter((file) => CLI.isTestProject(file.location.serverPath))
    if (frozen.length) {
      const names = frozen.map((file) => `  ${session.relative(file.location.serverPath)}`)
      throw new CLI.CliError([`Won't convert test projects -- they stay frozen:`, ...names].join("\n"))
    }
  }

  const written: string[] = []
  for (const file of new Set(files)) {
    const { match, scope, contents } = file
    if (!match || !scope || contents === undefined) continue
    const spellx = SX.SpellxWriter.write({ text: contents, match, scope })
    const path = spellxPathFor(file.location.serverPath)
    written.push(session.relative(path))
    if (options.dryRun) session.out(`// ${session.relative(path)}\n${spellx}`)
    else writeFileSync(path, spellx)
  }

  if (!options.dryRun) for (const path of written) session.out(path)
  const count = `${written.length} file${written.length === 1 ? "" : "s"}`
  session.err(options.dryRun ? `Would write ${count}` : `Wrote ${count}`)
  return CLI.EXIT.OK
}

/** Where `path`'s spellx goes:  `Card.spell` => `Card.spellx`, `Carta.es.spell` => `Carta.es.spellx`. */
export function spellxPathFor(path: string): string {
  return path.replace(/\.spell$/, ".spellx")
}
