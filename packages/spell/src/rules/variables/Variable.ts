import { NONE, type Plurality } from "$/util"
import { P } from "$/parser"
import { SpellIdentifier } from "./SpellIdentifier"
import { VARIABLE_SYNTAX, type IdentifierMatchData } from "./variables.shared"
import { variables } from "./variables.parser"

/**
 * `variable` rule:  `SpellIdentifier` which may or may not be known, with optional `the` prefix, e.g. `the thing`.
 * - `match.data.scopeVar` is set to the scope `ScopeVariable` if known, `NONE` if not.
 */
export class Variable extends P.Sequence<"identifier", VariableMatchData> {
  parse(scope: P.Scope, tokens: P.Token[]) {
    // `super.parse()` is typed for any rule -- we know it's ours.
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Remember scope variable for the identifier, if there is one.
    match.data.scopeVar = (match.groups.identifier.data as IdentifierMatchData).scopeVar ?? NONE
    return match
  }
  /** What the variable it named holds, if known -- see `P.ScopeVariable.datatype`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { scopeVar } = match.data
    return scopeVar === NONE ? undefined : scopeVar?.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTVariableExpression {
    // `the` adds nothing -- output is whatever the identifier outputs.
    return match.groups.identifier.AST as P.ASTVariableExpression
  }

  /**
   * Plurality of our identifier -- `the` adds nothing here either.
   * - Same signature as `SpellIdentifier.getPlurality()`, so callers needn't care which they've got.
   */
  getPlurality(match: P.MatchFor<this>): Plurality {
    const { identifier } = match.groups
    // Syntax guarantees this, but the type system can't know which rule `{identifier}` resolves to.
    if (!identifier.is(SpellIdentifier)) throw new TypeError(`Expected an identifier, got '${identifier.raw}'.`)
    return identifier.rule.getPlurality(identifier)
  }
}
variables.addRule(Variable, {
  syntax: VARIABLE_SYNTAX,
  tests: [
    {
      tests: [
        { title: "single word", input: "thing", js: "thing" },
        { title: "single word with the", input: "the thing", js: "thing" },
        { title: "multi-word", input: "bank-account", js: "bankAccount" },
        { title: "multi-word with the", input: "the bank-account", js: "bankAccount" },
        { title: "blacklisted word", input: "if", js: undefined }
      ]
    }
  ]
})

/** What `variable` / `known_variable` stash on their matches. */
type VariableMatchData = IdentifierMatchData
