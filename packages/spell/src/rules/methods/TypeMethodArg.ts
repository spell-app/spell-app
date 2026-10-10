import { instanceCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { methods } from "./methods.parser"
import type { MethodArgData } from "./methods.shared"

/**
 * `type_method_arg` rule:  bare type name inside parens, e.g. `(a card)` in `to create (a card): ...`.
 * - `method` bit uses the raw matched text (`type.raw`); `arg.name` uses `instanceCase(type.value)` --
 *   see the existing `TODO` on `method` below.
 * - When this is the FIRST type found in a `to`/`animation` signature, `MethodSignature`'s
 *   `parse()` records it in `types`, and `MethodDefinition.processSignature()` later promotes
 *   it to an instance-method receiver (`thisArg`) rather than a call argument.
 */
export class TypeMethodArg extends P.Sequence<"type", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type } = match.groups
    match.data.type = type
    // TODO: instanceCase(type.value) ???
    match.data.method = `$${type.raw}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = new P.ASTVariableExpression(match, {
      name: instanceCase(type.value),
      type: "argument",
      // what it holds, e.g. `Card` for `(a card)`
      datatype: SP.typeName(`${type.value}`)
    })
    return match
  }
}
methods.addRule(TypeMethodArg, {
  syntax: `(a|an) {type}`
})
