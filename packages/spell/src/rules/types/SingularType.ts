import { singularize } from "$/util"
import { P } from "$/parser"
import { types } from "./types.parser"
import { SpellType } from "./SpellType"

/**
 * `singular_type` rule:  possibly-unknown type identifier which MUST be singular -- fails on plural input.
 * - e.g. `thing`, not `things`
 */
export class SingularType extends SpellType {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match && typeof match.raw === "string" && match.raw === singularize(match.raw)) return match
    return undefined
  }
  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    const type = super.getAST(match)
    type.plurality = "singular"
    return type
  }
}
types.addRule(SingularType, {
  tests: [
    {
      tests: [
        { title: "singular, lower case", input: "thing", js: "Thing" },
        { title: "singular, upper case", input: "Thing", js: "Thing" },
        { title: "singular, multi-word, lower case", input: "bank-account", js: "Bank_Account" },
        { title: "singular, multi-word, mixed case", input: "Bank-account", js: "Bank_Account" },

        { title: "plural, lower case", input: "things", js: undefined },
        { title: "plural, upper case", input: "Things", js: undefined },
        { title: "plural, multi-word, lower case", input: "bank-accounts", js: undefined },
        { title: "plural, multi-word, mixed case", input: "Bank-accounts", js: undefined }
      ]
    }
  ]
})
