//
//  # Rules for constants, variables, type names, etc
//
import { AST, Rule, Spell, typeCase, singularize, pluralize } from "../all"
import identifierBlacklist from "./identifier-blacklist"

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/

Spell.Rule.Type = class type extends Rule.Pattern {
  pattern = WORD
  datatype = "type"
  blacklist = identifierBlacklist
  // TODO: review this with Ken
  VALUE_MAP = {
    object: "Object",
    Object: "Object",
    list: "List",
    List: "List",
    number: "number",
    Number: "number",
    integer: "integer",
    Integer: "integer",
    // decimal: "number",
    // Decimal: "number",
    text: "text",
    Text: "text",
    character: "character",
    Character: "character",
    boolean: "boolean",
    Boolean: "boolean",
    choice: "boolean",
    Choice: "boolean"
  }

  // Convert value to singular type case, e.g. `Thing` or `Bank_Account`
  mapValue(value) {
    if (value in this.VALUE_MAP) return this.VALUE_MAP[value]
    return typeCase(value)
  }

  parse(scope, tokens) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    // Pick up `type` scope based on canonical, singular type name
    match.type = scope.types(match.value)
    return match
  }

  toAST(match) {
    const { value, raw } = match
    return new AST.TypeExpression(match, { raw, name: value })
  }
}

export default new Spell.Parser({
  module: "types",
  rules: [
    // A possibly-unknown type identifier, singular or plural.
    {
      name: "type",
      constructor: Spell.Rule.Type,
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

    // Possibly unknown type which MUST be singular.
    {
      name: "singular_type",
      constructor: class singular_type extends Spell.Rule.Type {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (match && match.raw === singularize(match.raw)) return match
          return undefined
        }
        toAST(match) {
          const type = super.toAST(match)
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

    // Possibly unknown type which MUST be plural.
    // NOTE: the output type name will be SINGULAR!
    {
      name: "plural_type",
      constructor: class plural_type extends Spell.Rule.Type {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (match && match.raw === pluralize(match.raw)) return match
          return undefined
        }
        toAST(match) {
          const type = super.toAST(match)
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

    // A known type identifier, NOT including built-in types like 'Object'.
    // `match.type` will be the existing `Scope.Type`.
    {
      name: "known_type",
      //      alias: ["expression", "single_expression"],
      constructor: class known_type extends Spell.Rule.Type {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          // Only return match if we picked up an existing `type` scope
          if (match && match.type) return match
          return undefined
        }
      },
      tests: [
        {
          beforeEach(scope) {
            scope.types.add({ name: "Thing" })
            scope.types.add({ name: "Bank-Account" })
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
