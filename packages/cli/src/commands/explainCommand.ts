import chalk from "chalk"

import { SP } from "$/spell"
import { P } from "$/parser"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** Between the sections of the editor's hover -- see `SpellLanguageService.hover()`. */
const HOVER_RULE = "\n\n---\n\n"

/**
 * `spell explain <word>`:  what `word` means to spell.
 * - Rules:  each spell rule named `word`, or whose syntax starts with it, e.g. `repeat` -- its syntax, and an
 *   example from its tests.  As the editor's hover shows a rule.
 * - With `--in <project>`, also what that project declares named `word` (ignoring case, and spaces ~== `-` ~== `_`)
 *   -- the editor's hover over its declaration.
 * - `--json`:  what was found, as JSON.
 * - Returns the exit code:  `EXIT.ERRORS` if nothing was found.
 */
export async function explainCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.ExplainOptions
): Promise<number> {
  const [word = ""] = args
  const project = options.in ? await CLI.projectFor(session, options.in) : undefined
  const parser = project?.scope?.parser ?? SP.spellParser
  const rules = rulesFor(word, parser).map((rule) => ({
    rule: rule.name!,
    syntax: rule.toRulexSyntax(),
    example: LSP.SpellLanguageService.firstExample(rule)
  }))
  const declarations = project ? declarationsFor(session, word) : []

  if (options.json) session.out(JSON.stringify({ rules, declarations }, null, 2))
  else {
    const sections = [
      ...rules.map(({ rule, syntax, example }) =>
        [`${chalk.bold(rule)}  ${chalk.cyan(syntax)}`, ...(example ? [`e.g. ${example}`] : [])].join("\n")
      ),
      ...declarations.map(({ at, hover }) => {
        // code blocks:  their lines, without the fences
        const lines = CLI.markdownLines(hover).filter((line) => !line.startsWith("```"))
        return [chalk.dim(at), ...lines].join("\n")
      })
    ]
    if (sections.length) session.out(sections.join("\n\n"))
  }
  if (rules.length || declarations.length) return CLI.EXIT.OK
  session.err(
    `Nothing called '${word}'${project ? ` in spell or ${project.projectId}` : " in spell -- try --in <project>"}`
  )
  return CLI.EXIT.ERRORS
}

/**
 * Rules of `parser` that `word` names:  by name, e.g. `print`, or as the first word of their syntax,
 * e.g. `repeat` for each kind of loop.  Leaves out rules with no name.
 */
export function rulesFor(word: string, parser: P.Parser): P.Rule[] {
  const wanted = CLI.normalizedName(word)
  const found = new Set<P.Rule>()
  const visit = (rule: P.Rule | undefined) => {
    if (!rule || found.has(rule)) return
    if (rule instanceof P.Choice) rule.rules.forEach(visit)
    if (!rule.name) return
    const firstWord = /^[a-z][\w-]*/i.exec(rule.toRulexSyntax() ?? "")?.[0]
    if (CLI.normalizedName(rule.name) === wanted || (firstWord && CLI.normalizedName(firstWord) === wanted)) {
      found.add(rule)
    }
  }
  Object.values(parser.rules).forEach(visit)
  return [...found]
}

/**
 * What parsed projects declare named `word` -- each as `at` (`file:line`) and `hover`, the editor's hover markdown
 * over its name, less its first section:  the DECLARING statement's rule, e.g. `type`, which says nothing of it.
 */
function declarationsFor(session: CLI.CliSession, word: string): { name: string; at: string; hover: string }[] {
  const wanted = CLI.normalizedName(word)
  return session.service
    .workspaceSymbols(word)
    .filter((symbol) => CLI.normalizedName(symbol.name) === wanted)
    .flatMap(({ name, location }) => {
      const file = session.service.addresses.fileFor(location.uri)
      if (!file || !("range" in location)) return []
      const hover = session.service.hover(file, location.range.start)
      const value = hover && typeof hover.contents === "object" && "value" in hover.contents ? hover.contents.value : ""
      const sections = value.split(HOVER_RULE).slice(1)
      const at = `${session.relative(file.location.serverPath)}:${location.range.start.line + 1}`
      return sections.length ? [{ name, at, hover: sections.join("\n\n") }] : []
    })
}
