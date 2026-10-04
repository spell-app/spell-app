/**
 * Does every spell rule print back as rulex the way it was written?  (Plan doc `markdown`, Q10.)
 * - Run from `packages/docs`:  `yarn tsx rulex/experiments/round-trip.mts [--all]`
 * - For each registered rule with a `syntax`:  `exact` when `toRulexSyntax()` is the syntax as written (runs of
 *   spaces collapsed);  `stable` when compiling the printed syntax prints the same again;  else `CHANGED`.
 * - `--all` lists every non-exact rule, not just the first 25.
 */
import { P } from "$/parser"
import { SP } from "$/spell"

import "$/parser/rulex"

const showAll = process.argv.includes("--all")
const parser = SP.spellParser
const counts = { exact: 0, stable: 0, changed: 0 }
const shown: string[] = []
for (const rule of allRules(parser.rules)) {
  if (!rule.syntax) continue
  const written = rule.syntax.trim().replace(/\s+/g, " ")
  let printed: string
  let again: string
  try {
    printed = P.Rule.compileSyntax(rule.syntax).toRulexSyntax()
    again = P.Rule.compileSyntax(printed).toRulexSyntax()
  } catch (error) {
    shown.push(`ERROR   ${written}\n        ${String(error).split("\n")[0]}`)
    counts.changed++
    continue
  }
  if (printed === written) counts.exact++
  else if (again === printed) {
    counts.stable++
    shown.push(`stable  ${written}\n     => ${printed}`)
  } else {
    counts.changed++
    shown.unshift(`CHANGED ${written}\n     => ${printed}\n     => ${again}`)
  }
}
console.log(counts)
console.log(shown.slice(0, showAll ? undefined : 25).join("\n"))

/** Every rule in `rules`, a `P.Group`'s members included. */
function* allRules(rules: P.RuleMap): Generator<P.Rule> {
  for (const rule of Object.values(rules)) {
    if (rule instanceof P.Group) yield* rule.rules
    else yield rule
  }
}
