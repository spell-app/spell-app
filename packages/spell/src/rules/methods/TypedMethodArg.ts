import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { methods } from "./methods.parser"
import type { MethodArgData } from "./methods.shared"

/**
 * `typed_method_arg` rule:  variable arg with explicit type,
 * e.g. `(thing as a card)` in `to show (thing as a card): ...`.
 * - `arg` keeps the ORIGINAL variable name (`thing`), not the type name -- contrast with
 *   `type_method_arg`, which has no variable and names the arg after the type instead.
 * - `arg.datatype` records what it holds, in spell's words (`Card`, `text`) -- its scope variable's `datatype`.
 * - `method`/`syntax` match `var_method_arg`'s (`$name` / `{callArgs:expression}`) -- the type only
 *   annotates the arg, it doesn't change the generated method name or call syntax.
 */
export class TypedMethodArg extends P.Sequence<"identifier|type", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { identifier, type } = match.groups
    // what it holds, in spell's words, e.g. `text` for `(x as a string)`
    const arg = new P.ASTVariableExpression(match, {
      name: identifier.value,
      type: "argument",
      datatype: SP.typeName(`${type.value}`)
    })
    match.data.variable = identifier
    match.data.type = type
    match.data.method = `$${identifier.value}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = arg
    return match
  }
}
methods.addRule(TypedMethodArg, {
  syntax: `{identifier} as (a|an)? {type}`
})
