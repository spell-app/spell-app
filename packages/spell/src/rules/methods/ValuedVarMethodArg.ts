import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { methods } from "./methods.parser"
import type { MethodArgData } from "./methods.shared"

/**
 * `valued_var_method_arg` rule:  variable arg with a default value, e.g. `(message = "Really?")` in
 * `to notify (message = "Really?"): ...`.
 * - Accepts `=`, `is`, `of`, `as` or `set to` before the default expression -- all synonyms here for
 *   "defaults to".
 * - `method`/`syntax` are the same as `var_method_arg`'s (`$name` / `{callArgs:expression}`) -- the default
 *   value only affects the generated function parameter (`arg.default`), not the call syntax.
 */
export class ValuedVarMethodArg extends SpellStatement<"identifier|value", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { identifier, value } = match.groups
    match.data.variable = identifier
    match.data.method = `$${identifier.value}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = new P.ASTVariableExpression(match, {
      name: identifier.value,
      default: value.AST as P.ASTExpression,
      type: "argument"
    })
    return match
  }
}
methods.addRule(ValuedVarMethodArg, {
  syntax: `{identifier} (=|is|of|as|set to) {value:expression}`
})
