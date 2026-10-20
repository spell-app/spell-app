import { MethodSignature } from "./MethodSignature"
import { methods } from "./methods.parser"

/**
 * `quoted_signature_words` rule:  a QUOTED phrase's words, where only `(...)` is a parameter
 * (epic page `outline-spell`, P26).
 * - e.g. `is a number card` in `- it "is a number card" if ...` is four words:  `isANumberCard`,
 *   where an unquoted `to ... a number ...` takes a number.
 * - `is the (rank) of (suits)` still takes two.
 * - See `quoted_method_signature`.
 */
export class QuotedSignatureWords extends MethodSignature {}
methods.addRule(QuotedSignatureWords, {
  syntax: `({method_keyword}|\\( {method_arg} \\))+`
})
