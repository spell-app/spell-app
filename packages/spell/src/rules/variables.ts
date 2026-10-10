/**
 * Rules for variables -- single-word identifiers, known or unknown, singular or plural.
 * - NOTE the split, which the `_identifier` / `variable` suffixes are there to tell you:
 *   - `identifier` / `singular_identifier` / `plural_identifier` match a BARE word, no `the`.
 *   - `variable` / `known_variable` also allow a leading `the`, e.g. `the thing`.
 * - Only classes something OUTSIDE this file needs are exported (`SpellIdentifier` to subclass,
 *   `variable` to narrow with `match.is()`);  the rest are reached through `parser.rules` by name.
 */
import { NONE, getPlurality, proto, type Plurality } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"

/**
 * Rule module for variable rules (`identifier`, `variable`, `known_variable`, plurality variants).
 * - Each rule class below is followed by the `variables.addRule()` call which defines and registers it.
 */
export const variables = new SpellParser({ module: "variables" })

////////////////
// ## `SpellIdentifier` base class
//    e.g. "thing", "bank-account"
////////////////

/**
 * Single word variable name, known or unknown.
 * - Looks the word up in `scope.variables` WHILE PARSING, as `match.data.scopeVar` -- if found, you can override
 *   what's output with `variable.output`.  NOT when building the AST:  scope may have changed by then,
 *   e.g. `it` redefined by a later `get`.
 * - Its `datatype` is the scope variable's -- see `getDatatype()`.
 * - TODO: higher priority if variable is known?
 */
export class SpellIdentifier<MatchData extends P.AnyMatchData = P.AnyMatchData> extends P.Pattern<
  never,
  MatchData & IdentifierMatchData
> {
  /** Editors colour every identifier as a variable -- `SpellLanguageService` refines to `parameter` for arguments. */
  @proto static highlightAs?: P.HighlightKind = "variable"

  /** Every identifier rule matches the same thing:  alpha-numeric word (dashes / underscores OK), not blacklisted. */
  constructor(props?: Partial<P.PatternProps>) {
    super({ pattern: P.ALPHANUMERIC_WORD_WITH_DASHES, blacklist: identifierBlacklist, ...props })
  }

  /**
   * Plurality of the word `match`ed:  `"either"` for uncountable words like `sheep`.
   * - A METHOD rather than something stashed in `parse()`:  only worked out when someone asks,
   *   and subclasses which know better override it, e.g. `singular_identifier` always says `"singular"`.
   * - Ask from elsewhere as `if (match.is(SpellIdentifier)) match.rule.getPlurality(match)`.
   */
  getPlurality(match: P.MatchFor<this>): Plurality {
    return getPlurality(`${match.raw ?? match.value}`)
  }

  /** Map value by converting dashes and whitespace to underscores. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_").replace(/\s/g, "_") as T
  }

  /**
   * Build `P.ASTVariableExpression`, resolving `match.value` to the scope variable it named when parsed, if any.
   * - AST only knows singular / plural, so `"either"` goes out as `"singular"`.
   */
  /** Match a word, remembering the scope variable it names as `match.data.scopeVar` -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) match.data.scopeVar = scope.variables?.get(match.value) ?? NONE
    return match
  }

  /** What the variable it named holds, if known -- see `P.ScopeVariable.datatype`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { scopeVar } = match.data
    return scopeVar === NONE ? undefined : scopeVar?.datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTVariableExpression {
    // Scope variable it named when parsed, if any
    const { scopeVar } = match.data
    const variable = scopeVar === NONE ? undefined : scopeVar
    // Allow variable to override name if it wants to (e.g. "it")
    const name = variable && variable.output ? variable.output : match.value
    const plurality = this.getPlurality(match) === "plural" ? "plural" : "singular"
    return new P.ASTVariableExpression(match, { raw: match.raw, name, variable, plurality })
  }
}

////////////////
// ## `identifier` rule
//    e.g. "thing"
////////////////

/**
 * Variable identifier with no adornments (no leading `the`, no known/unknown check).
 * - You won't generally use this directly -- use `variable` or `known_variable` instead.
 */
class Identifier extends SpellIdentifier {}
variables.addRule(Identifier)

////////////////
// ## `singular_identifier` rule
//    e.g. "thing", not "things"
////////////////

/** Possibly-unknown variable identifier which MUST be singular, WITHOUT `the` -- fails on plural input. */
class SingularIdentifier extends SpellIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite plural will do -- uncountable words (`"either"`) match here AND in `plural_identifier`.
    if (!match || super.getPlurality(match) === "plural") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS singular as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "singular"
  }
}
variables.addRule(SingularIdentifier, {
  tests: [
    {
      tests: [
        { title: "singular, single word", input: "thing", js: "thing" },
        { title: "singular, multi-word", input: "bank-account", js: "bank_account", ts: "bankAccount" },
        { title: "uncountable, matches as singular too", input: "sheep", js: "sheep" },
        { title: "plural, single word", input: "things", js: undefined },
        { title: "plural, multi-word", input: "bank-accounts", js: undefined }
      ]
    }
  ]
})

////////////////
// ## `plural_identifier` rule
//    e.g. "things", not "thing"
////////////////

/** Possibly-unknown variable identifier which MUST be plural, WITHOUT `the` -- fails on singular input. */
class PluralIdentifier extends SpellIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite singular will do -- uncountable words (`"either"`) match here AND in `singular_identifier`.
    if (!match || super.getPlurality(match) === "singular") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS plural as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "plural"
  }
}
variables.addRule(PluralIdentifier, {
  tests: [
    {
      tests: [
        { title: "uncountable, matches as plural too", input: "sheep", js: "sheep" },
        { title: "plural, single word", input: "things", js: "things" },
        { title: "plural, multi-word", input: "bank-accounts", js: "bank_accounts", ts: "bankAccounts" },
        { title: "singular, single word", input: "thing", js: undefined },
        { title: "singular, multi-word", input: "bank-account", js: undefined }
      ]
    }
  ]
})

////////////////
// ## `variable` rule
//    e.g. "the thing"
////////////////

/** Syntax shared by `variable` and `known_variable`:  identifier with optional `the`, e.g. `the thing`. */
const VARIABLE_SYNTAX = "the? {identifier}"

/**
 * `SpellIdentifier` which may or may not be known, with optional `the` prefix, e.g. `the thing`.
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
        { title: "multi-word", input: "bank-account", js: "bank_account", ts: "bankAccount" },
        { title: "multi-word with the", input: "the bank-account", js: "bank_account", ts: "bankAccount" },
        { title: "blacklisted word", input: "if", js: undefined }
      ]
    }
  ]
})

/** What `variable` / `known_variable` stash on their matches. */
type VariableMatchData = IdentifierMatchData

////////////////
// ## `known_variable` rule
//    e.g. "the thing", if `thing` is in scope
////////////////

/**
 * Single word variable which is already known by our scope, with optional `the` prefix
 * -- unlike `singular_identifier`, this fails if unresolvable.
 * - Matched as an `expression`, unlike plain `variable`, because it only succeeds when resolvable.
 */
class KnownVariable extends Variable {
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

////////////////
// ## Shared types
////////////////

/** What every `SpellIdentifier` stashes on its match. */
type IdentifierMatchData = {
  /** Scope variable for the word, or `NONE` if we looked and scope doesn't know it. */
  scopeVar?: P.ScopeVariable | typeof NONE
}
