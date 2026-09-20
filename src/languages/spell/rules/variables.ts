/**
 * Rules for variables -- single-word identifiers, known or unknown, singular or plural, with or without
 * a leading `the`.
 */
import { singularize, pluralize } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import "./match-fields.B"

/**
 * Single word variable name, known or unknown.
 * - NOTE: when compiling, we'll look for `scope.variables.get(varName)` -- if we find one, you can
 *   override what's output with `variable.output`.
 * - TODO: type based on scope variable type?
 * - TODO: higher precedence if variable is known?
 */
export class VariableIdentifier extends P.Pattern {
  static {
    // Alpha-numeric word, including dashes or underscores.
    Object.defineProperty(this.prototype, "pattern", { value: P.ALPHANUMERIC_WORD_WITH_DASHES, writable: true })
    Object.defineProperty(this.prototype, "blacklist", { value: identifierBlacklist, writable: true })
  }

  /** Map value by converting dashes and whitespace to underscores. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_").replace(/\s/g, "_") as T
  }

  /** Build `P.ASTVariableExpression`, resolving `match.value` against `scope.variables` if possible. */
  getAST(match: P.Match): P.ASTVariableExpression {
    // Get scope Variable, if there is one
    const variable = match.scope.variables?.get(match.value)
    // Allow variable to override name if it wants to (e.g. "it")
    const name = variable && variable.output ? variable.output : match.value
    return new P.ASTVariableExpression(match, { raw: match.raw, name, variable })
  }
}
SpellParser.Rules.VariableIdentifier = VariableIdentifier

/** Rule module for variable rules (`variable_identifier`, `variable`, `known_variable`, plurality variants). */
export const variables = new SpellParser({
  module: "variables",
  rules: [
    /**
     * Variable identifier with no adornments (no leading `the`, no known/unknown check).
     * - You won't generally use this directly -- use `variable` or `known_variable` instead.
     */
    {
      name: "variable_identifier",
      constructor: VariableIdentifier
    },

    /**
     * `VariableIdentifier` which may or may not be known, with optional `the` prefix, e.g. `the thing`.
     * - `match.variable` is set to the scope `ScopeVariable` if known, `null` if known absent.
     */
    {
      name: "variable",
      syntax: "the? {identifier:variable_identifier}",
      constructor: class variable extends P.Sequence {
        parse(scope: P.Scope, tokens: P.Token[]): P.Match<P.RulexGroups<"identifier">> | undefined {
          // `identifier` is a required, non-repeated group per our `syntax` above.
          const match = super.parse(scope, tokens) as P.Match<P.RulexGroups<"identifier">> | undefined
          if (!match) return undefined
          // Set `match.variable` to the scope variable, if there is one.
          match.variable = scope.variables?.get(match.groups.identifier!.value) || null
          return match
        }
        getAST(match: P.Match<P.RulexGroups<"identifier">>): P.ASTVariableExpression {
          return match.groups.identifier!.AST as P.ASTVariableExpression
        }
      },
      tests: [
        {
          tests: [
            { title: "single word", input: "thing", output: "thing" },
            { title: "single word with the", input: "the thing", output: "thing" },
            { title: "multi-word", input: "bank-account", output: "bank_account" },
            { title: "multi-word with the", input: "the bank-account", output: "bank_account" },
            { title: "blacklisted word", input: "if", output: undefined }
          ]
        }
      ]
    },

    /**
     * Single word variable which is already known by our scope, with optional `the` prefix -- fails if
     * unresolvable.
     * - Matched as an `expression`, unlike plain `variable`, precisely because it only succeeds when
     *   resolvable.
     */
    {
      name: "known_variable",
      alias: "expression",
      // NOTE: `match` returned is the `{variable_identifier}`, not this sequence.
      syntax: "the? {identifier:variable_identifier}",
      constructor: class known_variable extends P.Sequence {
        parse(scope: P.Scope, tokens: P.Token[]): P.Match<P.RulexGroups<"identifier">> | undefined {
          // `identifier` is a required, non-repeated group per our `syntax` above.
          const match = super.parse(scope, tokens) as P.Match<P.RulexGroups<"identifier">> | undefined
          if (!match) return undefined
          // Try to find the scope Variable associated with the identifier in canonical form
          match.variable = scope.variables?.get(match.groups.identifier!.value)
          if (!match.variable) return undefined
          return match
        }
        getAST(match: P.Match<P.RulexGroups<"identifier">>): P.ASTVariableExpression {
          return match.groups.identifier!.AST as P.ASTVariableExpression
        }
      },
      tests: [
        {
          compileAs: "known_variable", // TODO: "expression"
          beforeEach(scope: P.Scope) {
            // `Scope.variables` is typed narrowly (`IndexedList<ScopeVariable>`); the concrete `BlockScope`
            // accepts a plain name string too -- see report.
            const { variables } = scope as P.BlockScope
            variables.add("thing")
            variables.add("bank-account")
          },
          tests: [
            { title: "single word", input: "thing", output: "thing" },
            { title: "multi-word", input: "bank-account", output: "bank_account" },
            { title: "not defined", input: "nothing", output: undefined }
          ]
        }
      ]
    },

    /** Possibly-unknown variable identifier which MUST be singular, WITHOUT `the` -- fails on plural input. */
    {
      name: "singular_variable",
      constructor: class singular_variable extends VariableIdentifier {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (match && typeof match.raw === "string" && match.raw === singularize(match.raw)) return match
          return undefined
        }
        getAST(match: P.Match): P.ASTVariableExpression {
          const variable = super.getAST(match)
          variable.plurality = "singular"
          return variable
        }
      },
      tests: [
        {
          tests: [
            { title: "singular, single word", input: "thing", output: "thing" },
            { title: "singular, multi-word", input: "bank-account", output: "bank_account" },
            { title: "plural, single word", input: "things", output: undefined },
            { title: "plural, multi-word", input: "bank-accounts", output: undefined }
          ]
        }
      ]
    },

    /** Possibly-unknown variable identifier which MUST be plural, WITHOUT `the` -- fails on singular input. */
    {
      name: "plural_variable",
      constructor: class plural_variable extends VariableIdentifier {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (match && typeof match.raw === "string" && match.raw === pluralize(match.raw)) return match
          return undefined
        }
        getAST(match: P.Match): P.ASTVariableExpression {
          const variable = super.getAST(match)
          variable.plurality = "plural"
          return variable
        }
      },
      tests: [
        {
          tests: [
            { title: "plural, single word", input: "things", output: "things" },
            { title: "plural, multi-word", input: "bank-accounts", output: "bank_accounts" },
            { title: "singular, single word", input: "thing", output: undefined },
            { title: "singular, multi-word", input: "bank-account", output: undefined }
          ]
        }
      ]
    }
  ]
})
