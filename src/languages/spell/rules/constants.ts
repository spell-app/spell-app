/**
 * Rules for constants -- e.g. `red`, `green`, either free-standing (possibly-unknown, quoted as a string
 * literal) or resolved against `scope.constants` (`known_constant`).
 */
import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import "./match-fields.B"

/**
 * Base pattern rule for matching a single-word constant identifier (alpha-numeric, dashes/underscores).
 * - Sets `match.constant` to the existing `ScopeConstant` looked up by `scope.constants`, if any --
 *   subclasses (e.g. `known_constant`) use this to require/reject a known constant.
 */
export class SpellConstant extends P.Pattern {
  static {
    Object.defineProperty(this.prototype, "name", { value: "constant", writable: true })
    // Alpha-numeric word, including dashes or underscores.
    Object.defineProperty(this.prototype, "pattern", { value: P.ALPHANUMERIC_WORD_WITH_DASHES, writable: true })
    Object.defineProperty(this.prototype, "blacklist", { value: identifierBlacklist, writable: true })
  }

  /** Match, then look up (but don't require) `match.constant` from `scope.constants`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    match.constant = scope.constants?.get(match.value)
    return match
  }

  /** Build `AST.ConstantExpression`, falling back to a fresh, unnamed `ScopeConstant` if unknown. */
  getAST(match: P.Match): AST.ConstantExpression {
    const name: string = match.constant ? match.constant.name : match.value
    const scopeConst = match.constant || match.scope.constants?.get(name)
    return new AST.ConstantExpression(match, {
      name,
      output: (scopeConst || new P.ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }
}
SpellParser.Rules.Constant = SpellConstant

/** Rule module for constant rules (`constant`, `known_constant`). */
export const constants = new SpellParser({
  module: "constants",
  rules: [
    /**
     * Possibly-unknown constant identifier.
     * - `match.constant` will be the existing `ScopeConstant` if one already exists.
     * - Compiles to a quoted string literal of its own name when unknown, e.g. `red` => `'red'`.
     */
    {
      name: "constant",
      constructor: class constant extends SpellConstant {},
      tests: [
        {
          tests: [
            { title: "single word", input: "red", output: "'red'" },
            { title: "multi-word", input: "orangish-red", output: "'orangish-red'" },
            { title: "blacklisted word", input: "if", output: undefined }
          ]
        }
      ]
    },

    /**
     * Single-word constant that MUST already be known in `scope.constants` -- fails otherwise.
     * - Defined as an `expression`, unlike plain `constant`, precisely because it only matches when
     *   resolvable, so it can't spuriously eat an unrelated identifier.
     * - Compiles to the constant's own `output` if it set one, else a quoted string literal of its name.
     */
    {
      name: "known_constant",
      alias: "expression",
      constructor: class known_constant extends SpellConstant {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (!match || !match.constant) return undefined
          return match
        }
      },
      tests: [
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
  ]
})
