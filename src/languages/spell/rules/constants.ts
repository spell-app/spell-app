/**
 * Rules for constants -- e.g. `red`, `green`, either free-standing (possibly-unknown, quoted as a string
 * literal) or resolved against `scope.constants` (`known_constant`).
 */
import { NONE, proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"

/** What constant rules stash on their matches. */
type ConstantMatchData = {
  /** Existing `ScopeConstant` looked up in `scope.constants` while parsing, or `NONE` if scope doesn't know it. */
  scopeConstant?: P.ScopeConstant | typeof NONE
}

/**
 * Base pattern rule for matching a single-word constant identifier (alpha-numeric, dashes/underscores).
 * - Sets `match.data.scopeConstant` to the existing `ScopeConstant` looked up by `scope.constants`, if any --
 *   subclasses (e.g. `known_constant`) use this to require/reject a known constant.
 * - Other rules read it as `if (match.is(SpellConstant)) match.data.constant`.
 */
export class SpellConstant extends P.Pattern<never, ConstantMatchData> {
  // Alpha-numeric word, including dashes or underscores.
  @proto static pattern = P.ALPHANUMERIC_WORD_WITH_DASHES
  @proto static blacklist = identifierBlacklist

  /** Match, then look up (but don't require) `match.data.scopeConstant` from `scope.constants`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Remember scope constant, if there is one.
    match.data.scopeConstant = scope.constants?.get(match.value) ?? NONE
    return match
  }

  /** Build `P.ASTConstantExpression`, falling back to a fresh, unnamed `ScopeConstant` if unknown. */
  getAST(match: P.MatchFor<this>): P.ASTConstantExpression {
    // Constant found while parsing, else look again -- it may have been defined since.
    const known = match.data.scopeConstant === NONE ? undefined : match.data.scopeConstant
    const name: string = known ? known.name : match.value
    const scopeConst = known || match.scope.constants?.get(name)
    return new P.ASTConstantExpression(match, {
      name,
      output: (scopeConst || new P.ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }
}

/**
 * Possibly-unknown constant identifier.
 * - `match.data.scopeConstant` will be the existing `ScopeConstant` if one already exists.
 * - Compiles to a quoted string literal of its own name when unknown, e.g. `red` => `'red'`.
 */
export class constant extends SpellConstant {
  static tests: P.RuleTests = [
    {
      tests: [
        { title: "single word", input: "red", output: "'red'" },
        { title: "multi-word", input: "orangish-red", output: "'orangish-red'" },
        { title: "blacklisted word", input: "if", output: undefined }
      ]
    }
  ]
}

/**
 * Single-word constant that MUST already be known in `scope.constants` -- fails otherwise.
 * - Defined as an `expression`, unlike plain `constant`, precisely because it only matches when
 *   resolvable, so it can't spuriously eat an unrelated identifier.
 * - Compiles to the constant's own `output` if it set one, else a quoted string literal of its name.
 */
export class known_constant extends SpellConstant {
  @proto static alias = "expression"

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `SpellConstant.parse()` found the scope constant.
    if (match?.data.scopeConstant !== NONE) return match
    return undefined
  }

  static tests: P.RuleTests = [
    {
      compileAs: "known_constant", // TODO: to "expression"
      beforeEach(scope: P.Scope) {
        // `Scope.constants` is typed narrowly (`IndexedList<ScopeConstant>`); the concrete `RootScope`
        // accepts a plain name string or `ScopeConstantProps` too -- see report.
        const { constants } = scope as P.RootScope
        constants.add("red")
        constants.add({ name: "green", output: "#00FF00" })
      },
      tests: [
        { title: "known constant", input: "red", output: "'red'" },
        { title: "known constant w/specific value", input: "green", output: "#00FF00" },
        { title: "unknown constant", input: "missing", output: undefined }
      ]
    }
  ]
}

/** Rule module for constant rules (`constant`, `known_constant`). */
export const constants = new SpellParser({
  module: "constants",
  rules: [constant, known_constant]
})
