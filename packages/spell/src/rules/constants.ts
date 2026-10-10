/**
 * Rules for constants -- e.g. `red`, `green`, either free-standing (possibly-unknown, quoted as a string
 * literal) or resolved against `scope.constants` (`known_constant`).
 */
import { NONE, proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"

/**
 * Rule module for constant rules (`constant`, `known_constant`).
 * - Each rule class below is followed by the `constants.addRule()` call which defines and registers it.
 */
export const constants = new SpellParser({ module: "constants" })

////////////////
// ## `SpellConstant` base class
//    e.g. "red", "orangish-red"
////////////////

/**
 * Base pattern rule for matching a single-word constant identifier (alpha-numeric, dashes/underscores).
 * - Sets `match.data.scopeConstant` to the existing `ScopeConstant` looked up by `scope.constants`, if any --
 *   subclasses (e.g. `known_constant`) use this to require/reject a known constant.
 * - Other rules read it as `if (match.is(SpellConstant)) match.data.scopeConstant`.
 */
export class SpellConstant extends P.Pattern<never, ConstantMatchData> {
  /** Editors colour every constant as an enum member -- they're the values of enumerated properties. */
  @proto static highlightAs?: P.HighlightKind = "enumMember"

  /** Every constant rule matches the same thing:  alpha-numeric word (dashes / underscores OK), not blacklisted. */
  constructor(props?: Partial<P.PatternProps>) {
    super({ pattern: P.ALPHANUMERIC_WORD_WITH_DASHES, blacklist: identifierBlacklist, ...props })
  }

  /** Match, then look up (but don't require) `match.data.scopeConstant` from `scope.constants`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Remember scope constant, if there is one.
    match.data.scopeConstant = scope.constants?.get(match.value) ?? NONE
    return match
  }

  /**
   * Build `P.ASTConstantExpression`, falling back to a fresh, unnamed `ScopeConstant` if unknown.
   * - Uses ONLY the constant found while parsing -- NOT looked up again, as scope may have changed by now.
   *   A statement which declares a constant it also uses records it on that match, e.g. `property_value_either`.
   */
  getAST(match: P.MatchFor<this>): P.ASTConstantExpression {
    const scopeConst = match.data.scopeConstant === NONE ? undefined : match.data.scopeConstant
    const name: string = scopeConst ? scopeConst.name : match.value
    return new P.ASTConstantExpression(match, {
      name,
      output: (scopeConst || new P.ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }

  /**
   * SIDE EFFECT:  if `constant` is an unknown constant's match, declares it in the project's constants, by
   * `statement` -- and records it on the match, for `getAST()`.
   * - e.g. `red` in `the color of a card is red if ...`, or in `red if it is diamonds or hearts`:  later lines
   *   then know `red`, e.g. `expect the color of the card to be red`.
   * - Anything else, e.g. an expression's match:  nothing.  Call it from `mutateScope()`.
   */
  static declareValue(statement: P.Match, constant: P.Match | undefined) {
    if (!constant?.is(SpellConstant)) return
    const found = constant.data.scopeConstant
    if (found && found !== NONE) return
    const { scope } = statement
    const name = `${constant.raw}`
    const known = scope.constants?.get(name) ?? scope.constants?.add({ name, declaredBy: statement })[0]
    if (known) constant.data.scopeConstant = known
  }
}

/** What constant rules stash on their matches. */
type ConstantMatchData = {
  /** Existing `ScopeConstant` looked up in `scope.constants` while parsing, or `NONE` if scope doesn't know it. */
  scopeConstant?: P.ScopeConstant | typeof NONE
}

////////////////
// ## `constant` rule
//    e.g. "red"
////////////////

/**
 * Possibly-unknown constant identifier.
 * - `match.data.scopeConstant` will be the existing `ScopeConstant` if one already exists.
 * - Compiles to a quoted string literal of its own name when unknown, e.g. `red` => `'red'`.
 */
class constant extends SpellConstant {}
constants.addRule(constant, {
  tests: [
    {
      tests: [
        { title: "single word", input: "red", js: "'red'", ts: '"red"' },
        { title: "multi-word", input: "orangish-red", js: "'orangish-red'", ts: '"orangish-red"' },
        { title: "blacklisted word", input: "if", js: undefined }
      ]
    }
  ]
})

////////////////
// ## `known_constant` rule
//    e.g. "red", if `red` is in scope
////////////////

/**
 * Single-word constant that MUST already be known in `scope.constants` -- fails otherwise.
 * - Defined as an `expression`, unlike plain `constant`, precisely because it only matches when
 *   resolvable, so it can't spuriously eat an unrelated identifier.
 * - Compiles to the constant's own `output` if it set one, else a quoted string literal of its name.
 */
class known_constant extends SpellConstant {
  @proto static alias = "expression"

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `SpellConstant.parse()` found the scope constant.
    if (match?.data.scopeConstant !== NONE) return match
    return undefined
  }
}
constants.addRule(known_constant, {
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
        { title: "known constant", input: "red", js: "'red'", ts: '"red"' },
        { title: "known constant w/specific value", input: "green", js: "#00FF00" },
        { title: "unknown constant", input: "missing", js: undefined }
      ]
    }
  ]
})
