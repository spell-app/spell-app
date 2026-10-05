/**
 * Rules for type names -- e.g. `thing`, `bank-account`, singular or plural, possibly unknown, resolved
 * against `scope.types` when known.
 */
import { NONE, proto, typeCase, singularize, pluralize } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"

/**
 * Rule module for type-name rules (`type`, `singular_type`, `plural_type`, `known_type`).
 */
export const types = new SpellParser({ module: "types" })

////////////////
// ## `SpellType` base class
//    e.g. "thing", resolved against `scope.types` when known
////////////////

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

////////////////
// ## `type` rule
//    e.g. "thing" => "Thing"
////////////////

/** Possibly-unknown type identifier, singular or plural, e.g. `thing` or `things` => `Thing`. */
class type extends SpellType {}
types.addRule(type, {
  tests: [
    {
      tests: [
        { title: "lower case", input: "thing", output: "Thing" },
        { title: "upper case", input: "Thing", output: "Thing" },
        { title: "multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title: "multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },
        { title: "multi-word, upper case", input: "Bank-Account", output: "Bank_Account" },
        { title: "blacklisted word", input: "if", output: undefined }
      ]
    }
  ]
})

////////////////
// ## `singular_type` rule
//    e.g. "thing", not "things"
////////////////

/** Possibly-unknown type identifier which MUST be singular -- fails on plural input. */
class singular_type extends SpellType {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match && typeof match.raw === "string" && match.raw === singularize(match.raw)) return match
    return undefined
  }
  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    const type = super.getAST(match)
    type.plurality = "singular"
    return type
  }
}
types.addRule(singular_type, {
  tests: [
    {
      tests: [
        { title: "singular, lower case", input: "thing", output: "Thing" },
        { title: "singular, upper case", input: "Thing", output: "Thing" },
        { title: "singular, multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title: "singular, multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },

        { title: "plural, lower case", input: "things", output: undefined },
        { title: "plural, upper case", input: "Things", output: undefined },
        { title: "plural, multi-word, lower case", input: "bank-accounts", output: undefined },
        { title: "plural, multi-word, mixed case", input: "Bank-accounts", output: undefined }
      ]
    }
  ]
})

////////////////
// ## `plural_type` rule
//    e.g. "things", not "thing"
////////////////

/**
 * Possibly-unknown type identifier which MUST be plural -- fails on singular input.
 * - NOTE: the output type name will be SINGULAR, e.g. `things` => `Thing`.
 */
class plural_type extends SpellType {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match && typeof match.raw === "string" && match.raw === pluralize(match.raw)) return match
    return undefined
  }
  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    const type = super.getAST(match)
    type.plurality = "plural"
    return type
  }
}
types.addRule(plural_type, {
  tests: [
    {
      tests: [
        { title: "plural, lower case", input: "things", output: "Thing" },
        { title: "plural, upper case", input: "Things", output: "Thing" },
        { title: "plural, multi-word, lower case", input: "bank-accounts", output: "Bank_Account" },
        { title: "plural, multi-word, mixed case", input: "Bank-accounts", output: "Bank_Account" },

        { title: "singular, lower case", input: "thing", output: undefined },
        { title: "singular, upper case", input: "Thing", output: undefined },
        { title: "singular, multi-word, lower case", input: "bank-account", output: undefined },
        { title: "singular, multi-word, mixed case", input: "Bank-account", output: undefined }
      ]
    }
  ]
})

////////////////
// ## `known_type` rule
//    e.g. "thing", if `Thing` is a known type
////////////////

/**
 * Known type identifier, NOT including built-in types like `Object`.
 * - `match.data.scopeType` will be the existing `TypeScope`.
 */
class known_type extends SpellType {
  // alias: "expression",
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Succeed only if `SpellType.parse()` found the scope type.
    // NOTE: also covers no match at all -- `undefined !== NONE`, and we return the `undefined` match.
    if (match?.data.scopeType !== NONE) return match
    return undefined
  }
}
types.addRule(known_type, {
  tests: [
    {
      beforeEach(scope: P.Scope) {
        // `Scope.types` is typed narrowly (`ScopeList<TypeScope>`); the concrete `RootScope` accepts
        // plain `TypeScopeProps` too -- see report.
        const { types } = scope as P.RootScope
        types.add({ name: "Thing" })
        types.add({ name: "Bank-Account" })
      },
      tests: [
        { title: "singular, known type, lower case", input: "thing", output: "Thing" },
        { title: "singular, known type, upper case", input: "Thing", output: "Thing" },
        { title: "singular, known, multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title: "singular, known, multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },
        { title: "singular, known, multi-word, upper case", input: "Bank-Account", output: "Bank_Account" },
        { title: "plural, known type, lower case", input: "thing", output: "Thing" },
        { title: "plural, known type, upper case", input: "Thing", output: "Thing" },
        { title: "plural, known, multi-word, lower case", input: "bank-accounts", output: "Bank_Account" },
        { title: "plural, known, multi-word, mixed case", input: "Bank-accounts", output: "Bank_Account" },
        { title: "plural, known, multi-word, upper case", input: "Bank-Accounts", output: "Bank_Account" },
        { title: "unknown", input: "widget", output: undefined },
        { title: "unknown. multi-word", input: "other-thing", output: undefined }
      ]
    }
  ]
})
