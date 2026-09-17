//
//  # Rules for constants, variables, type names, etc
//
import { Pattern } from "~/parser/rule/Pattern"
import { ScopeConstant } from "~/parser"
import type { Match } from "~/parser/Match"
import type { Scope } from "~/parser/scope/Scope"
import type { RootScope } from "~/parser/scope/RootScope"
import type { Token } from "~/parser/tokenizer/Tokens"
import { AST, SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"
import { ALPHANUMERIC_WORD_WITH_DASHES } from "~/parser/types"
import "./match-fields.B"

export class SpellConstant extends Pattern {
  static {
    Object.defineProperty(this.prototype, "name", { value: "constant", writable: true })
    // Alpha-numeric word, including dashes or underscores.
    Object.defineProperty(this.prototype, "pattern", { value: ALPHANUMERIC_WORD_WITH_DASHES, writable: true })
    Object.defineProperty(this.prototype, "blacklist", { value: identifierBlacklist, writable: true })
  }

  parse(scope: Scope, tokens: Token[]) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    match.constant = scope.constants?.get(match.value)
    return match
  }

  getAST(match: Match): AST.ConstantExpression {
    const name: string = match.constant ? match.constant.name : match.value
    const scopeConst = match.constant || match.scope.constants?.get(name)
    return new AST.ConstantExpression(match, {
      name,
      output: (scopeConst || new ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }
}
SpellParser.Rules.Constant = SpellConstant

export const constants = new SpellParser({
  module: "constants",
  rules: [
    // A possibly-unknown constant.
    // `match.constant` will be the existing ScopeConstant if one already exists.
    {
      name: "constant",
      constructor: class constant extends SpellConstant {},
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
      alias: "expression",
      constructor: class known_constant extends SpellConstant {
        parse(scope: Scope, tokens: Token[]) {
          const match = super.parse(scope, tokens)
          if (!match || !match.constant) return undefined
          return match
        }
      },
      tests: [
        {
          compileAs: "known_constant", // TODO: to "expression"
          beforeEach(scope: Scope) {
            // `Scope.constants` is typed narrowly (`IndexedList<ScopeConstant>`); the concrete `RootScope`
            // accepts a plain name string or `ScopeConstantProps` too -- see report.
            const { constants } = scope as RootScope
            constants.add("red")
            constants.add({ name: "green", output: "#00FF00" })
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
