import { NONE, getPlurality, proto, type Plurality } from "$/util"
import { P } from "$/parser"
import { identifierBlacklist } from "$/spell/rules/identifier-blacklist"
import { type IdentifierMatchData } from "./variables.shared"

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
