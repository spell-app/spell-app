import { proto } from "$/util"
import { P } from "$/parser"
import { TypeMethodArg } from "./TypeMethodArg"
import { methods } from "./methods.parser"

/**
 * `bare_type_arg` rule:  a KNOWN type after `a` / `an`, with no parens, in a method's signature:
 * a parameter, as `(a card)` is.
 * - `to give a card to a pile` ~== `to give (a card) to (a pile)` => `Card.give_to_$pile(pile)`.
 * - "a card" is "any card", so it's what the method takes.
 * - A word that isn't a type stays words:  `to make a mess` => `make_a_mess()`.
 *   So does anything after `the`:  `to reset the stock pile`.
 * - Read by `method_signature` exactly as `type_method_arg` is -- see `buildSignatureData()`.
 * - NOT a `method_arg`:  only `method_signature` takes it, outside parens.
 */
export class BareTypeArg extends TypeMethodArg {
  @proto static alias = []
  /** Editors colour its type's word, `card`, as the parameter it names. */
  @proto static highlightAs: P.HighlightKind = "parameter"
}
methods.addRule(BareTypeArg, {
  syntax: `(a|an) {type:known_type}`
})
