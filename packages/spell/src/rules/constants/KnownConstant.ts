import { NONE, proto } from "$/util"
import { P } from "$/parser"
import { constants } from "./constants.parser"
import { SpellConstant } from "./SpellConstant"

/**
 * `known_constant` rule:  single-word constant that MUST already be known in `scope.constants` -- fails otherwise.
 * - Defined as an `expression`, unlike plain `constant`, precisely because it only matches when
 *   resolvable, so it can't spuriously eat an unrelated identifier.
 * - Compiles to the constant's own `output` if it set one, else a quoted string literal of its name.
 */
export class KnownConstant extends SpellConstant {
  @proto static alias = "expression"

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `SpellConstant.parse()` found the scope constant.
    if (match?.data.scopeConstant !== NONE) return match
    return undefined
  }
}
constants.addRule(KnownConstant, {
  tests: [
    {
      compileAs: "known_constant", // TODO: to "expression"
      beforeEach(scope: P.Scope) {
        // `Scope.constants` is typed narrowly (`ScopeList<ScopeConstant>`); the concrete `RootScope`
        // accepts a plain name string or `ScopeConstantProps` too -- see report.
        const { constants } = scope as P.RootScope
        constants.add("red")
        constants.add({ name: "green", output: "#00FF00" })
      },
      tests: [
        { title: "known constant", input: "red", js: '"red"' },
        { title: "known constant w/specific value", input: "green", js: "#00FF00" },
        { title: "unknown constant", input: "missing", js: undefined }
      ]
    }
  ]
})
