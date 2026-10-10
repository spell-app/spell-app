import { NONE, proto } from "$/util"
import { P } from "$/parser"
import { Variable } from "./Variable"
import { VARIABLE_SYNTAX } from "./variables.shared"
import { variables } from "./variables.parser"

/**
 * `known_variable` rule:  single word variable which is already known by our scope, with optional `the` prefix
 * -- unlike `singular_identifier`, this fails if unresolvable.
 * - Matched as an `expression`, unlike plain `variable`, because it only succeeds when resolvable.
 */
export class KnownVariable extends Variable {
  @proto static alias = "expression"

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `Variable.parse()` found the scope variable for the identifier.
    if (match?.data.scopeVar !== NONE) return match
    return undefined
  }
}
variables.addRule(KnownVariable, {
  syntax: VARIABLE_SYNTAX,
  tests: [
    {
      compileAs: "known_variable", // TODO: "expression"
      beforeEach(scope: P.Scope) {
        // `Scope.variables` is typed narrowly (`ScopeList<ScopeVariable>`);
        // the concrete `BlockScope` accepts a plain name string too -- see report.
        const { variables } = scope as P.BlockScope
        variables.add("thing")
        variables.add("bank-account")
      },
      tests: [
        { title: "single word", input: "thing", js: "thing" },
        { title: "multi-word", input: "bank-account", js: "bank_account", ts: "bankAccount" },
        { title: "not defined", input: "nothing", js: undefined }
      ]
    }
  ]
})
