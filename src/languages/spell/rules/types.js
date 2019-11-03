//
//  # Rules for constants, variables, type names, etc
//
import { Match, Rule, Scope, Spell, Token, proto, snakeCase, typeCase, singularize, pluralize } from "../all.js"

import identifierBlacklist from "./identifier-blacklist.js"

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/

Spell.Rule.Type = class type extends Rule.Pattern {
  @proto pattern = WORD
  @proto datatype = "type"
  @proto blacklist = identifierBlacklist
  @proto valueMap = {
    object: "Object",
    Object: "Object",
    list: "List",
    List: "List",
    number: "number",
    Number: "number",
    integer: "number",
    Integer: "number",
    decimal: "number",
    Decimal: "number",
    text: "text",
    Text: "text",
    character: "character",
    Character: "character",
    boolean: "boolean",
    Boolean: "boolean",
    default: typeCase
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
          if (!match) return
          // Pick up existing type if defined.
          match.type = scope.types(match.raw)
          if (match.type) return match
        }
      },
      tests: [
        {
          beforeEach(scope) {
            scope.types.add({ name: "Thing" })
            scope.types.add({ name: "Bank-Account" })
          },
          tests: [
            { title: "known type, lower case", input: "thing", output: "Thing" },
            { title: "known type, upper case", input: "Thing", output: "Thing" },
            { title: "known, multi-word, lower case", input: "bank-account", output: "Bank_Account" },
            { title: "known, multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },
            { title: "known, multi-word, upper case", input: "Bank-Account", output: "Bank_Account" },
            { title: "unknown", input: "nothing", output: undefined },
            { title: "unknown. multi-word", input: "other-thing", output: undefined }
          ]
        }
      ]
    }
  ]
})
