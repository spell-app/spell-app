/**
 * Rules for type names -- e.g. `thing`, `bank-account`, singular or plural, possibly unknown, resolved
 * against `scope.types` when known.
 */
import { typeCase, instanceCase, singularize, pluralize } from "~/util"
import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import "./match-fields.B"

/**
 * Map raw matched type-name text to its canonical output name.
 * - Covers the built-in primitive types (`number`, `integer`, `text`, `character`, `boolean`) plus
 *   `object`/`list`, in both singular/plural and lower/upper case forms.
 * - `choice`/`choices` map to `boolean` -- spell treats a "choice" as a boolean under the hood.
 * - Anything not listed here falls through to `typeCase()` in `SpellType.mapValue()` instead.
 */
const TYPE_VALUE_MAP: Record<string, string> = {
  object: "Object",
  Object: "Object",
  list: "List",
  List: "List",
  number: "number",
  numbers: "number",
  Number: "number",
  Numbers: "number",
  integer: "integer",
  integers: "integer",
  Integer: "integer",
  Integers: "integer",
  // decimal: "number",
  // Decimal: "number",
  text: "text",
  Text: "text",
  character: "character",
  characters: "character",
  Character: "character",
  Characters: "character",
  boolean: "boolean",
  booleans: "boolean",
  Boolean: "boolean",
  Booleans: "boolean",
  choice: "boolean",
  choices: "boolean",
  Choice: "boolean",
  Choices: "boolean"
}

/**
 * Base pattern rule for matching a single type-name identifier (alpha-numeric, dashes/underscores),
 * singular or plural, known or unknown.
 * - Sets `match.type` to the existing `TypeScope` looked up by `scope.types`, if any.
 */
export class SpellType extends P.Pattern {
  static {
    // Alpha-numeric word, including dashes or underscores.
    Object.defineProperty(this.prototype, "pattern", { value: P.ALPHANUMERIC_WORD_WITH_DASHES, writable: true })
    Object.defineProperty(this.prototype, "datatype", { value: "type", writable: true })
    Object.defineProperty(this.prototype, "blacklist", { value: identifierBlacklist, writable: true })
    Object.defineProperty(this.prototype, "VALUE_MAP", { value: TYPE_VALUE_MAP, writable: true })
  }

  /** Lookup table for `isSimpleType()` -- the built-in primitive type names, in canonical instance case. */
  static SIMPLE_TYPES: Record<string, number> = {
    number: 1,
    integer: 1,
    text: 1,
    character: 1,
    boolean: 1,
    choice: 1
  }
  /** Is `typeName` one of the built-in primitive types (`number`, `text`, etc), as opposed to a user type? */
  static isSimpleType(typeName: string): boolean {
    const instanceName = instanceCase(typeName)
    return !!SpellType.SIMPLE_TYPES[instanceName]
  }

  /** Convert value to singular type case, e.g. `Thing` or `Bank_Account`. */
  mapValue<T = string>(value: string): T {
    if (value in this.VALUE_MAP) return this.VALUE_MAP[value]
    return typeCase(value) as T
  }

  /** Match, then look up `match.type` from `scope.types` by canonical, singular type name. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    // Pick up `type` scope based on canonical, singular type name
    match.type = scope.types?.get(match.value)
    // NOTE: `match.type?.name` is the class name
    //       `match.type?.instanceName` is the instance case name
    return match
  }

  /** Build `AST.TypeExpression` from `match.value` -- throws if the match somehow produced a non-string. */
  getAST(match: P.Match): AST.TypeExpression {
    const { value, raw } = match
    if (typeof value !== "string") throw new TypeError(`Expected a string value, got ${typeof value}`)
    return new AST.TypeExpression(match, { raw, name: value })
  }
}
SpellParser.Rules.Type = SpellType

/** Rule module for type-name rules (`type`, `singular_type`, `plural_type`, `known_type`). */
export const types = new SpellParser({
  module: "types",
  rules: [
    /** Possibly-unknown type identifier, singular or plural, e.g. `thing` or `things` => `Thing`. */
    {
      name: "type",
      constructor: SpellType,
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
    },

    /** Possibly-unknown type identifier which MUST be singular -- fails on plural input. */
    {
      name: "singular_type",
      constructor: class singular_type extends SpellType {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (match && typeof match.raw === "string" && match.raw === singularize(match.raw)) return match
          return undefined
        }
        getAST(match: P.Match): AST.TypeExpression {
          const type = super.getAST(match)
          type.plurality = "singular"
          return type
        }
      },
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
    },

    /**
     * Possibly-unknown type identifier which MUST be plural -- fails on singular input.
     * - NOTE: the output type name will be SINGULAR, e.g. `things` => `Thing`.
     */
    {
      name: "plural_type",
      constructor: class plural_type extends SpellType {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (match && typeof match.raw === "string" && match.raw === pluralize(match.raw)) return match
          return undefined
        }
        getAST(match: P.Match): AST.TypeExpression {
          const type = super.getAST(match)
          type.plurality = "plural"
          return type
        }
      },
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
    },

    /**
     * Known type identifier, NOT including built-in types like `Object`.
     * - `match.type` will be the existing `TypeScope`.
     */
    {
      name: "known_type",
      //      alias: "expression",
      constructor: class known_type extends SpellType {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          // Only return match if we picked up an existing `type` scope
          if (match && match.type) return match
          return undefined
        }
      },
      tests: [
        {
          beforeEach(scope: P.Scope) {
            // `Scope.types` is typed narrowly (`IndexedList<TypeScope>`); the concrete `RootScope` accepts
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
            { title: "unknown", input: "nothing", output: undefined },
            { title: "unknown. multi-word", input: "other-thing", output: undefined }
          ]
        }
      ]
    }
  ]
})
