//
//  # Rules for constants, variables, type names, etc
//
import { proto } from "~/util"
import { Rule, ScopeConstant } from "~/parser"
import { AST, SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/

SpellParser.Rule.Constant = class constant extends Rule.Pattern {
  @proto pattern = WORD
  @proto blacklist = identifierBlacklist

  parse(scope, tokens) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    match.constant = scope.constants.get(match.value)
    return match
  }

  getAST(match) {
    const name = match.constant ? match.constant.name : match.value
    const scopeConst = match.constant || match.scope.constants.get(name)
    return new AST.ConstantExpression(match, {
      name,
      output: (scopeConst || new ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }
}

export const constants = new SpellParser({
  module: "constants",
  rules: [
    // A possibly-unknown constant.
    // `match.constant` will be the existing ScopeConstant if one already exists.
    {
      name: "constant",
      constructor: "Constant",
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
      constructor: class known_constant extends SpellParser.Rule.Constant {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match || !match.constant) return undefined
          return match
        }
      },
      tests: [
        {
          compileAs: "known_constant", // TODO: to "expression"
          beforeEach(scope) {
            scope.constants.add("red")
            scope.constants.add({ name: "green", output: "#00FF00" })
          },
          tests: [
            { title: "known constant", input: "red", output: "'red'" },
            { title: "known constant w/specific value", input: "green", output: "#00FF00" },
            { title: "unknown constant", input: "missing", output: undefined }
          ]
        }
      ]
    }
  ]
})
