import { NONE, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { identifierBlacklist } from "$/spell/rules/identifier-blacklist"

/**
 * Base pattern rule for matching a type name, singular or plural, known or unknown:
 * - one word (alpha-numeric, dashes / underscores), e.g. `card`, `bank-account`
 * - or SEVERAL words, if they're a name someone declared, e.g. `bank account(s)` after `a bank account is a thing`
 *   - only declared names, the longest first:  `a big card` stays a card, unless a `big card` was declared
 * - A type's short name names it too, compiled as the type's own name:
 *   `account` => `BankAccount`, after `a bank account aka account is a thing` -- see `P.TypeScope.aka`.
 * - Sets `match.data.scopeType` to the existing `TypeScope` looked up by `scope.types`, `NONE` if scope doesn't know it.
 * - Other rules read it as `if (match.is(SpellType)) match.data.scopeType`.
 */
export class SpellType extends P.Pattern<never, TypeMatchData> {
  /** Editors colour every type name as a type. */
  @proto static highlightAs?: P.HighlightKind = "type"

  /** Most words a type's name may have, e.g. 2 for `bank account`. */
  static MAX_NAME_WORDS = 4

  /** Every type rule matches the same thing: alpha-numeric word (dashes/underscores OK), not blacklisted. */
  constructor(props?: Partial<P.PatternProps>) {
    super({
      pattern: P.ALPHANUMERIC_WORD_WITH_DASHES,
      datatype: "type",
      blacklist: identifierBlacklist,
      ...props
    })
  }

  /**
   * Is `typeName` one of the built-in VALUE types (`number`, `text`, `choice` ...), as opposed to a class?
   * - So a method on one can't be an instance method -- see `P.isValueType()`.
   */
  static isSimpleType(typeName: string): boolean {
    return P.isValueType(SP.typeName(typeName))
  }

  /**
   * Name compiled code uses for the type written as `value`:
   *   its datatype (`SP.typeName()`), but a class in PascalCase.
   * - a value type in spell's words, e.g. `string` => `text`, `boolean` => `choice`, `numbers` => `number`
   * - a class, singular, e.g. `Thing`, `List` for `array`, `BankAccount`, `Drawable` for `drawable thing`
   *   -- see `P.classCase()`
   */
  mapValue<T = string>(value: string): T {
    const datatype = SP.typeName(value)
    return (P.isValueType(datatype) ? datatype : P.classCase(datatype)) as T
  }

  /**
   * Match a declared name of several words, else one word;
   * then look up `match.data.scopeType` from `scope.types` by canonical, singular type name.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const declared = this.parseDeclaredWords(scope, tokens)
    if (declared) return declared
    // `super.parse()` is typed for any rule -- we know it's ours.
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Pick up `type` scope based on canonical, singular type name
    const scopeType = scope.types?.get(match.value)
    // NOTE: `scopeType.name` is the class name
    //       `scopeType.instanceName` is the instance case name
    if (scopeType && SpellType.isShortName(scopeType, match.value))
      return this.typeMatch(scope, [tokens[0]!], scopeType)
    match.data.scopeType = scopeType ?? NONE
    return match
  }

  /**
   * The LONGEST run of 2 or more words from the first token which names a type in `scope`, if any, e.g. `bank accounts`.
   * - A name someone declared, or a short name:  never just any run of words -- see class docs.
   */
  private parseDeclaredWords(scope: P.Scope, tokens: P.Token[]): P.MatchFor<this> | undefined {
    const { types } = scope
    if (!types) return undefined
    let count = 0
    while (count < SpellType.MAX_NAME_WORDS && count < tokens.length && this.test(scope, tokens, count)) count++
    for (; count > 1; count--) {
      const words = tokens.slice(0, count)
      const scopeType = types.get(this.mapValue(SpellType.joined(words)))
      if (scopeType) return this.typeMatch(scope, words, scopeType)
    }
    return undefined
  }

  /**
   * Match of `words` naming `scopeType`.
   * - `value`:  how its words compile, e.g. `BankAccount` for `bank accounts`;
   *   for a short name, the type's own name.
   * - `raw`:  its words as written, e.g. `bank accounts`.
   */
  private typeMatch(scope: P.Scope, words: P.Token[], scopeType: P.TypeScope): P.MatchFor<this> {
    const written = this.mapValue(SpellType.joined(words))
    const match = new P.Match({
      rule: this,
      matched: words,
      raw: words.map((token) => token.value).join(" "),
      value: SpellType.isShortName(scopeType, written) ? scopeType.name : written,
      tokens: words,
      scope
    }) as P.MatchFor<this>
    match.data.scopeType = scopeType
    return match
  }

  /** `words` as one dashed name, e.g. `bank-accounts`:  how `typeCase()` reads a name of several words. */
  static joined(words: P.Token[]): string {
    return words.map((token) => token.value).join("-")
  }

  /** Is `value` (PascalCase) `scopeType`'s short name, not its own name? */
  static isShortName(scopeType: P.TypeScope, value: string): boolean {
    return scopeType.aka === value && scopeType.name !== value
  }

  /** Build `P.ASTTypeExpression` from `match.value` -- throws if the match somehow produced a non-string. */
  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    const { value, raw } = match
    if (typeof value !== "string") throw new TypeError(`Expected a string value, got ${typeof value}`)
    return new P.ASTTypeExpression(match, { raw, name: value })
  }
}

/** What type rules stash on their matches. */
type TypeMatchData = {
  /** Existing `TypeScope` looked up in `scope.types` while parsing, or `NONE` if scope doesn't know it. */
  scopeType?: P.TypeScope | typeof NONE
}

/**
 * `TypeScope` found by a `known_type` (or other `SpellType`) `match`.
 * - Use where syntax guarantees it, e.g. `{type:known_type}`.
 * - Throws otherwise, which means grammar and code disagree -- better than a confusing `undefined` later.
 */
export function getKnownType(match: P.Match): P.TypeScope {
  const scopeType = match.is(SpellType) ? match.data.scopeType : undefined
  if (!scopeType || scopeType === NONE) throw new TypeError(`Expected match for a known type, got '${match.raw}'.`)
  return scopeType
}
