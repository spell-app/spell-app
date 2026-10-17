import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import type { MethodSignature } from "./MethodSignature"
import { methods } from "./methods.parser"

/**
 * `quoted_method_signature` rule:  method signature surrounded by quotes.  A "good idea"???
 * - Re-parses the token's raw JSON string VALUE as a fresh `method_signature`, e.g. the `"nerds out with
 *   (another as a thing)"` in `a thing "nerds out with (another as a thing)" if`.
 * - `parse()` swizzles `tokens`/`matched` back onto the outer text-token match, so it behaves
 *   indistinguishably from a normal `method_signature` match to callers (e.g. `quoted_type_expression`).
 * - SIDE EFFECT: bails (`undefined`) if the recovered signature has no keyword, same rule as plain
 *   `method_signature`.
 * - Its parameters' warnings are noted again on it, about the quoted text -- see `SP.SpellWarnings.in()`.
 */
export class QuotedMethodSignature extends P.TokenType {
  @proto static tokenType = P.TextToken
  @proto static highlightAs: P.HighlightKind = "function"

  /**
   * Parse the token's text as JSON to get the raw signature string, then reparse THAT as
   * `method_signature`.
   * - SIDE EFFECT: swizzles the recovered match's `tokens`/`matched` to point at the outer quoted-text
   *   token, so it reads like a normal top-level match rather than a nested one.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    const signature =
      match && (scope.parse(JSON.parse(match.value), "method_signature") as P.MatchFor<MethodSignature> | undefined)
    if (!signature || !signature.data.foundKeyword) return undefined
    // its warnings are about words in the quotes, whose positions are the string's:  shown under the quotes
    for (const { message } of SP.SpellWarnings.in(signature)) SP.SpellWarnings.note(signature, message, match)
    // Swizzle tokens & matched to reflect the original match
    signature.tokens = match.tokens
    signature.matched = [match]
    return signature
  }
}
methods.addRule(QuotedMethodSignature)
