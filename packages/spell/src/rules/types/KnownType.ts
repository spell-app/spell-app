import { NONE } from "$/util"
import { P } from "$/parser"
import { types } from "./types.parser"
import { SpellType } from "./SpellType"

/**
 * `known_type` rule:  known type identifier, NOT including built-in types like `Object`.
 * - e.g. `thing`, if `Thing` is a known type
 * - `match.data.scopeType` will be the existing `TypeScope`.
 */
export class KnownType extends SpellType {
  // alias: "expression",
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `SpellType.parse()` found the scope type.
    // NOTE: also covers no match at all -- `undefined !== NONE`, and we return the `undefined` match.
    if (match?.data.scopeType !== NONE) return match
    return undefined
  }
}
types.addRule(KnownType, {
  tests: [
    {
      beforeEach(scope: P.Scope) {
        // `Scope.types` is typed narrowly (`ScopeList<TypeScope>`); the concrete `RootScope` accepts
        // plain `TypeScopeProps` too -- see report.
        const { types } = scope as P.RootScope
        types.add({ name: "Thing" })
        types.add({ name: "Bank-Account" })
      },
      tests: [
        { title: "singular, known type, lower case", input: "thing", js: "Thing" },
        { title: "singular, known type, upper case", input: "Thing", js: "Thing" },
        { title: "singular, known, multi-word, lower case", input: "bank-account", js: "Bank_Account" },
        { title: "singular, known, multi-word, mixed case", input: "Bank-account", js: "Bank_Account" },
        { title: "singular, known, multi-word, upper case", input: "Bank-Account", js: "Bank_Account" },
        { title: "plural, known type, lower case", input: "thing", js: "Thing" },
        { title: "plural, known type, upper case", input: "Thing", js: "Thing" },
        { title: "plural, known, multi-word, lower case", input: "bank-accounts", js: "Bank_Account" },
        { title: "plural, known, multi-word, mixed case", input: "Bank-accounts", js: "Bank_Account" },
        { title: "plural, known, multi-word, upper case", input: "Bank-Accounts", js: "Bank_Account" },
        { title: "unknown", input: "widget", js: undefined },
        { title: "unknown. multi-word", input: "other-thing", js: undefined }
      ]
    }
  ]
})
