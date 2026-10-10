import { pluralize } from "$/util"
import { P } from "$/parser"
import { types } from "./types.parser"
import { SpellType } from "./SpellType"

/**
 * `plural_type` rule:  possibly-unknown type identifier which MUST be plural -- fails on singular input.
 * - e.g. `things`, not `thing`
 * - NOTE: the output type name will be SINGULAR, e.g. `things` => `Thing`.
 */
export class PluralType extends SpellType {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match && typeof match.raw === "string" && match.raw === pluralize(match.raw)) return match
    return undefined
  }
  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    const type = super.getAST(match)
    type.plurality = "plural"
    return type
  }
}
types.addRule(PluralType, {
  tests: [
    {
      tests: [
        { title: "plural, lower case", input: "things", js: "Thing" },
        { title: "plural, upper case", input: "Things", js: "Thing" },
        { title: "plural, multi-word, lower case", input: "bank-accounts", js: "Bank_Account" },
        { title: "plural, multi-word, mixed case", input: "Bank-accounts", js: "Bank_Account" },

        { title: "singular, lower case", input: "thing", js: undefined },
        { title: "singular, upper case", input: "Thing", js: undefined },
        { title: "singular, multi-word, lower case", input: "bank-account", js: undefined },
        { title: "singular, multi-word, mixed case", input: "Bank-account", js: undefined }
      ]
    }
  ]
})
