import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellIdentifier } from "$/spell/rules/variables"
import { methods } from "./methods.parser"
import type { MethodArgData } from "./methods.shared"

/**
 * `var_method_arg` rule:  untyped variable inside parens, e.g. `(message)` in `to notify (message): ...`.
 * - `method` prefixes the var name with `$` so it's distinguishable from a keyword bit in the generated
 *   method name, e.g. `notify_$message`.
 * - `syntax` always contributes `{callArgs:expression}` -- the call-site value is parsed as a plain
 *   expression.
 * - It says nothing of what it holds, so it asks (epic `output-targets`, Q24):  a warning,
 *   e.g. `Say what "digit" is, e.g. "(digit as text)"` -- see `typed_method_arg`.
 */
export class VarMethodArg extends SpellIdentifier<MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]
  @proto static highlightAs: P.HighlightKind = "parameter"

  /** Stash this arg's contribution (`method` / `syntax` / `arg`) in `match.data`, and ask for its type. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { data } = match
    data.variable = match
    data.method = `$${match.value}`
    data.syntax = "{callArgs:expression}"
    data.arg = new P.ASTVariableExpression(match, { name: match.value, type: "argument" })
    const words = match.raw ?? `${match.value}`
    const example = `(${words} as ${SP.SpellWarnings.exampleType(scope, words)})`
    SP.SpellWarnings.note(match, `Say what "${words}" is, e.g. "${example}"`)
    return match
  }
}
methods.addRule(VarMethodArg)
