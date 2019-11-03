//
//  # Rules for constants, variables, type names, etc
//
import { Match, Rule, Scope, Spell, Token, proto, snakeCase, typeCase, singularize, pluralize } from "../all"

import identifierBlacklist from "./identifier-blacklist"

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/

Spell.Rule.Constant = class constant extends Rule.Pattern {
  @proto pattern = WORD
  @proto blacklist = identifierBlacklist
  compile(scope, match) {
    const constant = match.constant || scope.constants(match.raw) || new Scope.Constant(match.raw)
    return constant.toString()
  }
}

export default new Spell.Parser({
  module: "constants",
  rules: [
    // A possibly-unknown constant.
    // `match.constant` will be the existing Scope.Constant if one already exists.
    {
      name: "constant",
      constructor: Spell.Rule.Constant,
      tests: [
        {
          tests: [
            { title: "single word", input: "red", output: "'red'" },
            { title: "multi-word", input: "orangish-red", output: "'orangish-red'" },
            { title: "blacklisted word", input: "if", output: undefined }
          ]
        }
      ]
    },

    // A known single-word constant.
    // Note that this is defined as an "expression".
    {
      name: "known_constant",
      alias: ["expression", "single_expression"],
      constructor: class known_constant extends Spell.Rule.Constant {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return
          match.constant = scope.constants(match.raw)
          if (match.constant) return match
        }
      },
      tests: [
        {
          compileAs: "known_constant", // TODO: to "expression"
          beforeEach(scope) {
            scope.constants.add("red")
            scope.constants.add({ name: "green", value: "#00FF00" })
          },
          tests: [
            { title: "known constant", input: "red", output: "'red'" },
            { title: "known constant w/specific value", input: "green", output: "#00FF00" },
            { title: "unknown constant", input: "missing", output: undefined }
          ]
        }
      ]
    },

    // Define a constant.
    // Mostly here for testing. ???
    // TODO: warn if already defined?
    {
      name: "define_constant",
      alias: "statement",
      syntax: "constant {constant} (is {value:expression})?",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results, groups }) {
        const name = groups.constant.raw
        const { value } = results
        const constant = scope.constants.add({ name, value })
        // TODO: could be defining this more than once...
        const statement = scope.addStatement(`const ${name} = ${constant.toString()}`)
        results.statements.push(statement)
      },
      tests: [
        {
          tests: [["constant red", "const red = 'red'"], ["constant black is 6", "const black = 6"]]
        }
      ]
    }
  ]
})
