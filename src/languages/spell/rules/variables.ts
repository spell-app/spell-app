/**
 * Rules for variables -- single-word identifiers, known or unknown, singular or plural, with or without
 * a leading `the`.
 */
import { NONE, getPlurality, proto, type Plurality } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"

/**
 * Single word variable name, known or unknown.
 * - NOTE: when compiling, we'll look for `scope.variables.get(varName)`
 *   -- if we find one, you can override what's output with `variable.output`.
 * - TODO: type based on scope variable type?
 * - TODO: higher precedence if variable is known?
 */
export class VariableIdentifier<MatchData extends P.AnyMatchData = P.AnyMatchData> extends P.Pattern<never, MatchData> {
  // Alpha-numeric word, including dashes or underscores.
  @proto static pattern = P.ALPHANUMERIC_WORD_WITH_DASHES
  @proto static blacklist = identifierBlacklist

  /**
   * Plurality of the word `match`ed:  `"either"` for uncountable words like `sheep`.
   * - A METHOD rather than something stashed in `parse()`:  only worked out when someone asks,
   *   and subclasses which know better override it, e.g. `singular_variable` always says `"singular"`.
   * - Ask from elsewhere as `if (match.is(VariableIdentifier)) match.rule.getPlurality(match)`.
   */
  getPlurality(match: P.MatchFor<this>): Plurality {
    return getPlurality(`${match.raw ?? match.value}`)
  }

  /** Map value by converting dashes and whitespace to underscores. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_").replace(/\s/g, "_") as T
  }

  /**
   * Build `P.ASTVariableExpression`, resolving `match.value` against `scope.variables` if possible.
   * - AST only knows singular / plural, so `"either"` goes out as `"singular"`.
   */
  getAST(match: P.MatchFor<this>): P.ASTVariableExpression {
    // Get scope Variable, if there is one
    const variable = match.scope.variables?.get(match.value)
    // Allow variable to override name if it wants to (e.g. "it")
    const name = variable && variable.output ? variable.output : match.value
    const plurality = this.getPlurality(match) === "plural" ? "plural" : "singular"
    return new P.ASTVariableExpression(match, { raw: match.raw, name, variable, plurality })
  }
}

/**
 * Variable identifier with no adornments (no leading `the`, no known/unknown check).
 * - You won't generally use this directly -- use `variable` or `known_variable` instead.
 */
export class variable_identifier extends VariableIdentifier {}

/** What `variable` / `known_variable` stash on their matches. */
type VariableMatchData = {
  /** Scope variable for the identifier, or `NONE` if we looked and scope doesn't know it. */
  scopeVar?: P.ScopeVariable | typeof NONE
}

/**
 * `VariableIdentifier` which may or may not be known, with optional `the` prefix, e.g. `the thing`.
 * - `match.data.scopeVar` is set to the scope `ScopeVariable` if known, `NONE` if not.
 */
export class variable extends P.Sequence<"identifier", VariableMatchData> {
  @proto static syntax = "the? {identifier:variable_identifier}"

  parse(scope: P.Scope, tokens: P.Token[]) {
    // `super.parse()` is typed for any rule -- we know it's ours.
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Remember scope variable for the identifier, if there is one.
    match.data.scopeVar = scope.variables?.get(match.groups.identifier.value) ?? NONE
    return match
  }
  getAST(match: P.MatchFor<this>): P.ASTVariableExpression {
    // `the` adds nothing -- output is whatever the identifier outputs.
    return match.groups.identifier.AST as P.ASTVariableExpression
  }

  static tests: P.RuleTests = [
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
}

/**
 * Single word variable which is already known by our scope, with optional `the` prefix
 * -- unlike `singular_variable`, this fails if unresolvable.
 * - Matched as an `expression`, unlike plain `variable`, because it only succeeds when resolvable.
 */
export class known_variable extends variable {
  @proto static alias = "expression"

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `variable.parse()` found the scope variable for the identifier.
    if (match?.data.scopeVar !== NONE) return match
    return undefined
  }

  static tests: P.RuleTests = [
    {
      compileAs: "known_variable", // TODO: "expression"
      beforeEach(scope: P.Scope) {
        // `Scope.variables` is typed narrowly (`IndexedList<ScopeVariable>`);
        // the concrete `BlockScope` accepts a plain name string too -- see report.
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
}

/** Possibly-unknown variable identifier which MUST be singular, WITHOUT `the` -- fails on plural input. */
export class singular_variable extends VariableIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite plural will do -- uncountable words (`"either"`) match here AND in `plural_variable`.
    if (!match || super.getPlurality(match) === "plural") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS singular as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "singular"
  }

  static tests: P.RuleTests = [
    {
      tests: [
        { title: "singular, single word", input: "thing", output: "thing" },
        { title: "singular, multi-word", input: "bank-account", output: "bank_account" },
        { title: "uncountable, matches as singular too", input: "sheep", output: "sheep" },
        { title: "plural, single word", input: "things", output: undefined },
        { title: "plural, multi-word", input: "bank-accounts", output: undefined }
      ]
    }
  ]
}

/** Possibly-unknown variable identifier which MUST be plural, WITHOUT `the` -- fails on singular input. */
export class plural_variable extends VariableIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite singular will do -- uncountable words (`"either"`) match here AND in `singular_variable`.
    if (!match || super.getPlurality(match) === "singular") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS plural as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "plural"
  }

  static tests: P.RuleTests = [
    {
      tests: [
        { title: "uncountable, matches as plural too", input: "sheep", output: "sheep" },
        { title: "plural, single word", input: "things", output: "things" },
        { title: "plural, multi-word", input: "bank-accounts", output: "bank_accounts" },
        { title: "singular, single word", input: "thing", output: undefined },
        { title: "singular, multi-word", input: "bank-account", output: undefined }
      ]
    }
  ]
}

/** Rule module for variable rules (`variable_identifier`, `variable`, `known_variable`, plurality variants). */
export const variables = new SpellParser({
  module: "variables",
  rules: [variable_identifier, variable, known_variable, singular_variable, plural_variable]
})
