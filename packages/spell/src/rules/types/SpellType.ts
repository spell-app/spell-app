import { NONE, proto, typeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { identifierBlacklist } from "$/spell/rules/identifier-blacklist"

/**
 * Base pattern rule for matching a single type-name identifier (alpha-numeric, dashes/underscores),
 * singular or plural, known or unknown.
 * - Sets `match.data.scopeType` to the existing `TypeScope` looked up by `scope.types`, `NONE` if scope doesn't know it.
 * - Other rules read it as `if (match.is(SpellType)) match.data.scopeType`.
 */
export class SpellType extends P.Pattern<never, TypeMatchData> {
  /** Editors colour every type name as a type. */
  @proto static highlightAs?: P.HighlightKind = "type"

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
   *   its datatype (`SP.typeName()`), but a class in Type_Case.
   * - a value type in spell's words, e.g. `string` => `text`, `boolean` => `choice`, `numbers` => `number`
   * - a class, singular, e.g. `Thing`, `List` for `array`, `Bank_Account`
   */
  mapValue<T = string>(value: string): T {
    const datatype = SP.typeName(value)
    return (P.isValueType(datatype) ? datatype : typeCase(datatype)) as T
  }

  /** Match, then look up `match.data.scopeType` from `scope.types` by canonical, singular type name. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    // `super.parse()` is typed for any rule -- we know it's ours.
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // Pick up `type` scope based on canonical, singular type name
    match.data.scopeType = scope.types?.get(match.value) ?? NONE
    // NOTE: `scopeType.name` is the class name
    //       `scopeType.instanceName` is the instance case name
    return match
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
