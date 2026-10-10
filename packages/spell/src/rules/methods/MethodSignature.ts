import { P } from "$/parser"
import { SpellType } from "$/spell/rules/types"
import { BareTypeArg } from "./BareTypeArg"
import { MethodKeyword } from "./MethodKeyword"
import { methods } from "./methods.parser"
import type { MethodArgData, MethodSignatureData } from "./methods.shared"

/**
 * `method_signature` rule:  a full method signature, alternating keywords and args,
 * e.g. `foo the (bar as a thing)`, `give a card to a pile`.
 * - `({bare_type_arg}|{method_keyword}|\({method_arg}\))+`:
 *   keywords and args can appear in ANY order/mix, any number of times.
 * - The syntax requires at least one repetition, but see `parse()` for the additional keyword requirement.
 * - `a card` is an arg if `card` is a KNOWN type (`bare_type_arg`, the longer match), else two keywords.
 * - `parse()` walks the repeated items and assembles `methodBits`/`syntaxBits` (joined into
 *   `methodName`/`syntax` by `MethodDefinition.computeSignature()`), `args`, `types` (candidate
 *   instance-method receivers), `extraVars` and `props` into `match.data` -- see `MethodSignatureData`.
 */
export class MethodSignature extends P.Repeat<never, MethodSignatureData> {
  /** Build `match.data`, then reject the match entirely if no keyword was found -- arg-only signatures
   *  (e.g. `to (foo)`) are invalid. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    this.buildSignatureData(match)
    // forget it if we didn't find at least one keyword
    return match.data.foundKeyword ? match : undefined
  }

  /**
   * Flatten each matched `method_arg`/`method_keyword`/`bare_type_arg` item's `data` into `match.data`.
   * - A `method_keyword` or `bare_type_arg` item holds its own data;
   *   a parenthesized `method_arg` matched 3 things (`(`, arg, `)`), so its data lives on `item.matched[1]` instead.
   * - Told apart by RULE, not length:  `a card` is 2 tokens, like a keyword pair.
   * - SIDE EFFECT: records `data.types` and their positions (`argIndex`/`methodIndex`/`syntaxIndex`)
   *   so `MethodDefinition.processSignature()` can later splice a promoted type back out of
   *   `args`/`methodBits`/`syntaxBits`.
   */
  buildSignatureData(match: P.MatchFor<this>): void {
    const data = match.data
    data.items = match.items.map(
      (item) =>
        (item.is(MethodKeyword) || item.is(BareTypeArg)
          ? item.data
          : (item.matched[1] as P.Match).data) as MethodArgData
    )
    // calculated as we run through the keywords
    data.startsWithKeyword = false // `true` if first item is a keyword.
    data.foundKeyword = false // `true` if we found at least one keyword.  arg-only signatures are invalid!
    data.methodBits = [] // method signature bits.  Converted to `methodName` string by `MethodDefinition.computeSignature()`.
    data.syntaxBits = [] // rule syntax bits.  Converted to string by `MethodDefinition.computeSignature()`.
    data.types = [] // types we found, as `{ name, varName, isSimple, argIndex, methodIndex, syntaxIndex }`
    data.args = [] // method arguments, as `P.ASTVariableExpression`s
    data.argMatches = [] // each argument's item, e.g. `(a card)` or `a card` -- for editors
    data.extraVars = [] // random extra vars we should enable (e.g. aliases for `this`)
    // calculated elsewhere
    data.props = undefined // array of P.ASTVariableExpression for `with_props_arg`
    data.methodName = undefined // full methodName from `methodBits` array, set elsewhere
    data.syntax = undefined // full method syntax, set elsewhere
    data.instanceType = undefined // type to add instance method to, set elsewhere

    // Set up the method signature and rule syntax
    // We'll get one of the following combos: keyword, type, variable, variable + type
    data.items.forEach(({ method, syntax, arg, props, keyword, type /* , variable */ }, index) => {
      // TODO: HOW to know if we should sequester type???

      // arg-only methods are not allowed
      if (keyword) {
        data.foundKeyword = true
        if (index === 0) data.startsWithKeyword = true
      }

      const varName = arg?.name

      // Convert to an instance method???
      if (type) {
        // `type` is always a `SpellType`/`Pattern` match, which always sets `.raw`.
        const typeRaw = type.raw!
        data.types.push({
          name: typeRaw,
          varName,
          isSimple: SpellType.isSimpleType(typeRaw),
          argIndex: data.args.length,
          methodIndex: data.methodBits.length,
          syntaxIndex: data.syntaxBits.length
        })
      }

      if (method) data.methodBits.push(method)
      if (syntax) data.syntaxBits.push(syntax)
      if (arg) {
        data.args.push(arg)
        // NOT a `(with ...)` clause:  its call takes it as an optional extra
        if (!props) data.argMatches.push(match.items[index]!)
      }

      // Recognize prop names in the method
      if (props) {
        data.props = props
        data.extraVars.push(...props.map((prop) => prop.name))
      }
    })
  }
}
methods.addRule(MethodSignature, {
  syntax: `({bare_type_arg}|{method_keyword}|\\( {method_arg} \\))+`
})
